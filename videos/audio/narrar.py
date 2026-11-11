"""Narração: sintetiza cada fala com a voz neural (Kokoro, pt-BR) e mede o tempo de cada palavra
(Whisper), gerando out/<historia>/narr.wav e timing.json.

uso: python audio/narrar.py <historia>
Variáveis: MODELOS = pasta com kokoro/ e whisper/ (padrão: ./modelos)
"""
import sys, os, re, json, hashlib, difflib, unicodedata
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.environ.get('MODELOS', os.path.join(ROOT, 'modelos'))
SR = 24000


def norm(w):
    w = unicodedata.normalize('NFD', w.lower())
    return re.sub(r'[^a-z0-9]', '', w.encode('ascii', 'ignore').decode())


def trim(a, pad=0.03):
    thr = max(1e-4, np.abs(a).max() * 0.02)
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    i0 = max(0, idx[0] - int(pad * SR)); i1 = min(len(a), idx[-1] + int(0.09 * SR))
    a = a[i0:i1].copy()
    n = int(0.008 * SR)
    a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
    return a


def align(script_words, rec, dur):
    """Casa as palavras do roteiro com as reconhecidas e interpola o que não casar."""
    a = [norm(w) for w in script_words]; b = [norm(r['w']) for r in rec]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    times = [None] * len(a)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = [rec[blk.b + k]['s'], rec[blk.b + k]['e']]
    i = 0
    while i < len(a):
        if times[i] is None:
            j = i
            while j < len(a) and times[j] is None:
                j += 1
            t0 = times[i - 1][1] if i > 0 else 0.0
            t1 = times[j][0] if j < len(a) else dur
            wl = [max(1, len(x)) for x in a[i:j]]; tot = sum(wl); acc = 0
            for k in range(i, j):
                s = t0 + (t1 - t0) * acc / tot; acc += wl[k - i]; e = t0 + (t1 - t0) * acc / tot
                times[k] = [s, e]
            i = j
        else:
            i += 1
    for k in range(len(times)):
        times[k][0] = min(max(0.0, times[k][0]), dur)
        times[k][1] = min(max(times[k][0] + 0.04, times[k][1]), dur)
        if k and times[k][0] < times[k - 1][0]:
            times[k][0] = times[k - 1][0] + 0.02
        if k and times[k - 1][1] > times[k][0]:
            times[k - 1][1] = times[k][0]
    matched = sum(b.size for b in sm.get_matching_blocks())
    return times, matched


def main():
    name = sys.argv[1]
    out = os.path.join(ROOT, 'out', name)
    sc = json.load(open(os.path.join(out, 'script.json')))
    cache = os.path.join(ROOT, 'out', '_cache'); os.makedirs(cache, exist_ok=True)
    from kokoro_onnx import Kokoro
    from faster_whisper import WhisperModel
    tts = Kokoro(os.path.join(MODELS, 'kokoro', 'kokoro-v1.0.onnx'), os.path.join(MODELS, 'kokoro', 'voices-v1.0.bin'))
    stt = WhisperModel(os.path.join(MODELS, 'whisper'), device='cpu', compute_type='int8', cpu_threads=4)

    t = sc.get('lead', 0.3)
    pieces = []; beats = []; tot_words = 0; tot_match = 0
    for i, b in enumerate(sc['beats']):
        t += b.get('gapBefore') or 0
        text = b['say'].strip()
        if not text:
            d = b.get('pause') or 1.0
            beats.append({'start': t, 'end': t + d, 'words': []}); t += d
            continue
        speed = b.get('speed') or sc.get('speed', 1.0)
        key = hashlib.sha1(f"{sc['voice']}|{speed}|{text}".encode()).hexdigest()[:16]
        wav = os.path.join(cache, key + '.wav'); meta = os.path.join(cache, key + '.json')
        if os.path.exists(wav) and os.path.exists(meta):
            a, _ = sf.read(wav, dtype='float32'); rec = json.load(open(meta))
        else:
            a, sr = tts.create(text, voice=sc['voice'], speed=speed, lang='pt-br')
            assert sr == SR
            a = trim(a.astype(np.float32))
            a16 = resample_poly(a, 2, 3).astype(np.float32)
            segs, _ = stt.transcribe(a16, language='pt', word_timestamps=True, beam_size=5, initial_prompt=text, condition_on_previous_text=False)
            rec = [{'w': w.word.strip(), 's': float(w.start), 'e': float(w.end)} for s in segs for w in s.words]
            sf.write(wav, a, SR); json.dump(rec, open(meta, 'w'), ensure_ascii=False)
        dur = len(a) / SR
        words = text.split()
        times, matched = align(words, rec, dur)
        tot_words += len(words); tot_match += matched
        heard = ' '.join(r['w'] for r in rec)
        flag = '' if matched == len(words) else f'   <-- ouviu: {heard}'
        print(f'{i:2d} {dur:5.2f}s {matched}/{len(words)} {text[:60]}{flag}', flush=True)
        beats.append({'start': round(t, 3), 'end': round(t + dur, 3),
                      'words': [{'w': w, 's': round(t + s, 3), 'e': round(t + e, 3)} for w, (s, e) in zip(words, times)]})
        pieces.append((t, a))
        t += dur + sc.get('gap', 0.24)
    total = t - sc.get('gap', 0.24) + sc.get('tail', 1.4)
    narr = np.zeros(int(total * SR) + 1, dtype=np.float32)
    for t0, a in pieces:
        i0 = int(t0 * SR); narr[i0:i0 + len(a)] += a
    sf.write(os.path.join(out, 'narr.wav'), narr, SR)

    # efeitos: tempo absoluto a partir do início da batida ou de uma palavra
    sfx = []
    for i, b in enumerate(sc['beats']):
        for c in b.get('sfx', []):
            at = c.get('at', 0)
            if isinstance(at, str):
                wd, _, nth = at.partition('#'); k = norm(wd); cands = [w for w in beats[i]['words'] if norm(w['w']) == k]
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
    nw = sum(len(b['words']) for b in beats)
    print(f'duração {total:.1f}s, {nw} palavras ({nw / total * 60:.0f} por minuto), reconhecidas {tot_match}/{tot_words}')


if __name__ == '__main__':
    main()
