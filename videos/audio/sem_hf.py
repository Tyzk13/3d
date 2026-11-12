"""Caminho de áudio que não depende de modelos do huggingface (Kokoro/Whisper).

- voz-guia: narra o roteiro com a voz Piper pt-BR (offline, baixada do GitHub) para prévias e para medir o
  ritmo; os tempos das palavras vêm das pausas da própria fala.
- narração gravada (ex.: ElevenLabs) sem Whisper: casa o áudio com o roteiro frase a frase, comparando o som
  da gravação com a voz-guia (alinhamento acústico) e cortando nas pausas.

uso:
  python audio/sem_hf.py guia <historia>               -> out/<historia>/narr.wav + timing.json (voz-guia)
  python audio/sem_hf.py externa <historia> <arquivo>  -> idem, com a narração gravada
Precisa de: piper-tts, numpy, soundfile, scipy; librosa (opcional, melhora a sincronia da narração gravada).
"""
import sys, os, re, json, logging
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import alinhamento as al  # noqa: E402

logging.getLogger('piper').setLevel(logging.ERROR)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.environ.get('MODELOS', os.path.join(ROOT, 'modelos'))
PIPER = os.path.join(MODELS, 'piper', 'pt-br-edresson-low.onnx')
SR_NARR = 24000        # o que trilha.py espera em narr.wav
SR_AL = al.SR          # 44.1 kHz usado no alinhamento

_voz = None


def tts(texto, speed=1.0):
    """Voz-guia determinística (mesma duração sempre) -> float32 em 44.1 kHz."""
    global _voz
    from piper import PiperVoice, SynthesisConfig
    if _voz is None:
        if not os.path.exists(PIPER):
            sys.exit(f'Voz Piper não encontrada em {PIPER}. Rode ./baixar-modelos.sh --piper')
        _voz = PiperVoice.load(PIPER)
    txt = re.sub(r'\[\[(.*?)\]\]', r'\1', texto).replace('IA', 'I.A.')
    cfg = SynthesisConfig(length_scale=0.9 / max(0.5, speed), noise_scale=0.0, noise_w_scale=0.0)
    partes = [c.audio_float_array for c in _voz.synthesize(txt, syn_config=cfg)]
    a = np.concatenate(partes).astype(np.float32) if partes else np.zeros(1600, np.float32)
    a = resample_poly(a, SR_AL, _voz.config.sample_rate).astype(np.float32)
    thr = np.abs(a).max() * 0.02
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx):
        a = a[max(0, idx[0] - int(0.03 * SR_AL)):idx[-1] + int(0.06 * SR_AL)]
    return a


def _norm(w):
    import unicodedata
    w = unicodedata.normalize('NFD', w.lower())
    return re.sub(r'[^a-z0-9]', '', w.encode('ascii', 'ignore').decode())


def gravar(out, sc, beats, total, narr_44k):
    """Escreve narr.wav (24 kHz) e timing.json no mesmo formato de narrar.py."""
    narr = resample_poly(narr_44k, SR_NARR, SR_AL).astype(np.float32)
    n = int(total * SR_NARR) + 1
    narr = np.pad(narr, (0, max(0, n - len(narr))))[:n]
    sf.write(os.path.join(out, 'narr.wav'), narr, SR_NARR)
    sfx = []
    for i, b in enumerate(sc['beats']):
        for c in b.get('sfx', []):
            at = c.get('at', 0)
            if isinstance(at, str):
                wd, _, nth = at.partition('#'); k = _norm(wd)
                cands = [w for w in beats[i]['words'] if _norm(w['w']) == k]
                hit = cands[min(len(cands), int(nth or 1)) - 1] if cands else None
                tt = hit['s'] if hit else beats[i]['start']
            else:
                tt = beats[i]['start'] + at
            extra = {k: v for k, v in c.items() if k not in ('n', 'at')}
            if extra.get('dur') == 'beat':
                nxt = beats[i + 1]['start'] if i + 1 < len(beats) else total
                extra['dur'] = round(nxt - max(0, tt), 3)
            sfx.append({'n': c['n'], 't': round(max(0, tt), 3), **extra})
    music = [{'t': (beats[m['beat']]['start'] - 0.25 if m['beat'] else 0), 'mood': m['mood']} for m in sc.get('music', [])]
    json.dump({'duration': round(total, 3), 'beats': beats, 'sfx': sfx, 'music': music},
              open(os.path.join(out, 'timing.json'), 'w'), ensure_ascii=False, indent=1)


def _palavras(texto, trechos, t0):
    ws = [w for w in re.sub(r'\[\[(.*?)\]\]', r'\1', texto).split() if any(ch.isalnum() for ch in w)]
    return [{'w': w, 's': round(t0 + a, 3), 'e': round(t0 + b, 3)} for w, a, b in al.palavras_nos_trechos(ws, trechos)]


def guia(name):
    out = os.path.join(ROOT, 'out', name)
    sc = json.load(open(os.path.join(out, 'script.json')))
    t = sc.get('lead', 0.3)
    pieces, beats = [], []
    for i, b in enumerate(sc['beats']):
        t += b.get('gapBefore') or 0
        text = b['say'].strip()
        if not text:
            d = b.get('pause') or 1.0
            beats.append({'start': round(t, 3), 'end': round(t + d, 3), 'words': []}); t += d
            continue
        a = tts(text, b.get('speed') or sc.get('speed', 1.0))
        dur = len(a) / SR_AL
        tr = al.trechos_de_fala(a, min_silencio=0.15) or [(0.0, dur)]
        beats.append({'start': round(t, 3), 'end': round(t + dur, 3), 'words': _palavras(text, tr, t)})
        pieces.append((t, a))
        print(f'{i:2d} {dur:5.2f}s {text[:70]}', flush=True)
        t += dur + sc.get('gap', 0.24)
    total = t - sc.get('gap', 0.24) + sc.get('tail', 1.4)
    narr = np.zeros(int(total * SR_AL) + 1, np.float32)
    for t0, a in pieces:
        i0 = int(t0 * SR_AL); narr[i0:i0 + len(a)] += a[: len(narr) - i0]
    gravar(out, sc, beats, total, narr)
    nw = sum(len(b['words']) for b in beats)
    print(f'voz-guia: duração {total:.1f}s, {nw} palavras ({nw / total * 60:.0f} por minuto)')


def externa(name, src):
    out = os.path.join(ROOT, 'out', name)
    sc = json.load(open(os.path.join(out, 'script.json')))
    x = al.carregar(src)
    thr = np.abs(x).max() * 0.02
    idx = np.where(np.abs(x) > thr)[0]
    x = x[max(0, idx[0] - int(0.05 * SR_AL)):min(len(x), idx[-1] + int(0.15 * SR_AL))]
    dur = len(x) / SR_AL
    trechos = al.trechos_de_fala(x)
    # frases do roteiro (só batidas com fala) e voz-guia de cada uma
    falas = [(i, b['say'].strip()) for i, b in enumerate(sc['beats']) if b['say'].strip()]
    frases, dono, durs, segs = [], [], [], []
    for k, (i, s) in enumerate(falas):
        fs = al.frases(s)
        for f in fs:
            texto = ' '.join(w for w, _ in f)
            a = tts(texto, sc['beats'][i].get('speed') or sc.get('speed', 1.0))
            frases.append(f); dono.append(k); durs.append(len(a) / SR_AL); segs.append(a)
    previsto = al.prever_inicios(x, segs, SR_AL)
    if previsto is None:
        print('(librosa não instalado: alinhando só pelas pausas)')
    grupos = al.alinhar_frases(trechos, dono, durs, previsto=previsto)
    lead = sc.get('lead', 0.3)
    por_fala = {k: {'words': [], 'start': None, 'end': None} for k in range(len(falas))}
    for t0, t1, f0, f1 in grupos:
        k = dono[f0]
        sub = trechos[t0:t1]
        ws = [w for f in frases[f0:f1] for w, _ in f]
        por_fala[k]['words'] += [{'w': w, 's': round(lead + a, 3), 'e': round(lead + b, 3)}
                                 for w, a, b in al.palavras_nos_trechos(ws, sub)]
        if por_fala[k]['start'] is None:
            por_fala[k]['start'] = round(lead + sub[0][0], 3)
        por_fala[k]['end'] = round(lead + sub[-1][1], 3)
    total = lead + dur + sc.get('tail', 1.4)
    beats, k = [], 0
    for i, b in enumerate(sc['beats']):
        if b['say'].strip():
            beats.append(por_fala[k]); k += 1
        else:
            beats.append(None)
    for i, b in enumerate(beats):   # batidas sem fala: ocupam a pausa entre vizinhas
        if b is None:
            ant = next((beats[j]['end'] for j in range(i - 1, -1, -1) if beats[j]), lead)
            prox = next((beats[j]['start'] for j in range(i + 1, len(beats)) if beats[j]), total)
            beats[i] = {'start': round(ant, 3), 'end': round(max(ant + 0.3, prox), 3), 'words': []}
    narr = np.zeros(int(total * SR_AL) + 1, np.float32)
    i0 = int(lead * SR_AL); narr[i0:i0 + len(x)] = x
    gravar(out, sc, beats, total, narr)
    gaps = [round(beats[i + 1]['start'] - beats[i]['end'], 2) for i in range(len(beats) - 1)]
    print(f'{name}: {total:.1f}s, {len(trechos)} trechos de fala casados com {len(frases)} frases '
          f'em {len(falas)} falas; menor pausa entre falas {min(gaps) if gaps else 0}s')


if __name__ == '__main__':
    if sys.argv[1] == 'guia':
        guia(sys.argv[2])
    elif sys.argv[1] == 'externa':
        externa(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__)
