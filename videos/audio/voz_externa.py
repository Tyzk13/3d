"""Usa uma narração gravada fora (um arquivo com o roteiro inteiro) no lugar da voz sintetizada.
Mede o tempo de cada palavra com o Whisper, casa com o roteiro e gera narr.wav e timing.json.

uso: python audio/voz_externa.py <historia> <arquivo de áudio>
"""
import sys, os, json, subprocess, tempfile
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from narrar import norm, align, ROOT, MODELS, SR


def main():
    name, src = sys.argv[1], sys.argv[2]
    out = os.path.join(ROOT, 'out', name)
    sc = json.load(open(os.path.join(out, 'script.json')))
    tmp = os.path.join(tempfile.mkdtemp(), 'v.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', str(SR), tmp], check=True)
    a, _ = sf.read(tmp, dtype='float32')
    # tira silêncio das pontas
    thr = np.abs(a).max() * 0.02; idx = np.where(np.abs(a) > thr)[0]
    a = a[max(0, idx[0] - int(0.05 * SR)):min(len(a), idx[-1] + int(0.15 * SR))]
    dur = len(a) / SR
    from faster_whisper import WhisperModel
    stt = WhisperModel(os.path.join(MODELS, 'whisper'), device='cpu', compute_type='int8', cpu_threads=4)
    segs, _ = stt.transcribe(resample_poly(a, 2, 3).astype(np.float32), language='pt', word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    rec = [{'w': w.word.strip(), 's': float(w.start), 'e': float(w.end)} for s in segs for w in s.words]
    words = []; owner = []
    for i, b in enumerate(sc['beats']):
        for w in b['say'].split():
            words.append(w); owner.append(i)
    times, matched = align(words, rec, dur)
    lead = sc.get('lead', 0.3)
    beats = []
    for i, b in enumerate(sc['beats']):
        ws = [{'w': w, 's': round(lead + t[0], 3), 'e': round(lead + t[1], 3)} for w, t, o in zip(words, times, owner) if o == i]
        beats.append({'start': ws[0]['s'], 'end': ws[-1]['e'], 'words': ws})
    total = lead + dur + sc.get('tail', 1.4)
    narr = np.zeros(int(total * SR) + 1, dtype=np.float32)
    narr[int(lead * SR):int(lead * SR) + len(a)] = a
    sf.write(os.path.join(out, 'narr.wav'), narr, SR)
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
    gaps = [round(beats[i + 1]['start'] - beats[i]['end'], 2) for i in range(len(beats) - 1)]
    print(f'{name}: {total:.1f}s, palavras casadas {matched}/{len(words)}, menor pausa entre falas {min(gaps)}s')
    print('ouvido:', ' '.join(r['w'] for r in rec)[:160])


if __name__ == '__main__':
    main()
