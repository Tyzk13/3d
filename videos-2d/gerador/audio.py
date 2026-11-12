"""Narração (Piper TTS offline), bip de censura, trilha sonora procedural e efeitos sonoros."""
import os
import re
import wave
import logging
import numpy as np

logging.getLogger("piper").setLevel(logging.ERROR)

SR = 44100
RAIZ = os.path.join(os.path.dirname(__file__), "..")
VOZ_PADRAO = os.environ.get("VOZ_PIPER", os.path.join(RAIZ, "vozes", "pt-br-edresson-low.onnx"))

_voice = None


def _get_voice():
    global _voice
    if _voice is None:
        from piper import PiperVoice
        _voice = PiperVoice.load(VOZ_PADRAO)
    return _voice


def _resample(x, sr_in, sr_out=SR):
    if sr_in == sr_out:
        return x
    n = int(len(x) * sr_out / sr_in)
    t_in = np.arange(len(x)) / sr_in
    t_out = np.arange(n) / sr_out
    return np.interp(t_out, t_in, x).astype(np.float32)


def _limpa_tts(txt):
    txt = txt.replace("IA", "I.A.").replace("Wi-Fi", "uai-fai").replace("%", " por cento")
    return re.sub(r"\s+", " ", txt).strip()


def tts(texto, velocidade=0.9, deterministico=False):
    """Sintetiza texto -> array float32 em 44.1 kHz. deterministico=True: mesma duração sempre (guia)."""
    from piper import SynthesisConfig
    v = _get_voice()
    if deterministico:
        cfg = SynthesisConfig(length_scale=velocidade, noise_scale=0.0, noise_w_scale=0.0)
    else:
        cfg = SynthesisConfig(length_scale=velocidade, noise_scale=0.6, noise_w_scale=0.7)
    chunks = [c.audio_float_array for c in v.synthesize(_limpa_tts(texto), syn_config=cfg)]
    if not chunks:
        return np.zeros(int(0.2 * SR), np.float32)
    x = np.concatenate(chunks).astype(np.float32)
    return _resample(x, v.config.sample_rate)


def trim(x, thr=0.02):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.03 * SR))
    b = min(len(x), idx[-1] + int(0.06 * SR))
    return x[a:b]


def bip(dur=0.5, freq=1000):
    t = np.arange(int(dur * SR)) / SR
    x = 0.42 * np.sin(2 * np.pi * freq * t)
    fade = int(0.01 * SR)
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x.astype(np.float32)


def narrar(fala, voz=None, velocidade=0.9):
    """Gera áudio de uma fala com palavras censuradas ([[palavra]] vira bip).

    Retorna (audio, palavras) onde palavras = [(texto, inicio, fim, censurada)].
    """
    voz = voz or fala
    partes = re.split(r"(\[\[.*?\]\])", voz)
    partes_leg = re.split(r"(\[\[.*?\]\])", fala)
    if len(partes) != len(partes_leg):
        partes_leg = partes
    audio = []
    palavras = []
    t = 0.0
    for p, pl in zip(partes, partes_leg):
        if not p.strip():
            continue
        if p.startswith("[["):
            dur = 0.12 + 0.07 * len(p[2:-2])
            seg = bip(min(dur, 0.75))
            palavras.append(("█" * max(4, len(pl[2:-2])), t, t + len(seg) / SR, True))
        else:
            seg = trim(tts(p, velocidade))
            ws = [w for w in pl.split() if any(ch.isalnum() for ch in w)]
            if ws:
                pesos = [len(w) + 2 + (4 if w[-1] in ".,!?:;…" else 0) for w in ws]
                tot = sum(pesos)
                dur = len(seg) / SR
                acc = 0
                for w, pz in zip(ws, pesos):
                    a = t + dur * acc / tot
                    acc += pz
                    palavras.append((w, a, t + dur * acc / tot, False))
            seg = np.concatenate([seg, np.zeros(int(0.05 * SR), np.float32)])
        audio.append(seg)
        t += len(seg) / SR
    x = np.concatenate(audio) if audio else np.zeros(SR // 4, np.float32)
    return x, palavras


# ------------------------------------------------------------------ trilha
NOTAS = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def _freq(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def _env(n, a=0.01, r=0.3):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
    return e


def trilha(duracao, humor="misterio", bpm=96, seed=1):
    """Trilha instrumental simples (pad + arpejo + batida leve)."""
    rnd = np.random.default_rng(seed)
    n = int(duracao * SR) + SR
    out = np.zeros(n, np.float32)
    progs = {
        "misterio": [(57, [0, 3, 7]), (53, [0, 4, 7]), (55, [0, 4, 7]), (52, [0, 3, 7])],      # Am F G Em
        "aventura": [(50, [0, 3, 7]), (58, [0, 4, 7]), (53, [0, 4, 7]), (57, [0, 4, 7])],      # Dm Bb F A
        "tensao":   [(52, [0, 3, 7]), (52, [0, 3, 6]), (48, [0, 4, 7]), (47, [0, 4, 7])],      # Em Edim C B
        "alegre":   [(48, [0, 4, 7]), (55, [0, 4, 7]), (57, [0, 3, 7]), (53, [0, 4, 7])],      # C G Am F
    }
    prog = progs[humor]
    beat = 60 / bpm
    bar = beat * 4
    t_all = np.arange(n) / SR
    nbars = int(np.ceil(duracao / bar)) + 1
    for b in range(nbars):
        root, chord = prog[b % len(prog)]
        s0 = int(b * bar * SR)
        s1 = min(n, int((b + 1) * bar * SR))
        if s0 >= n:
            break
        tt = t_all[s0:s1] - b * bar
        seg = np.zeros(s1 - s0, np.float32)
        # pad
        for iv in chord:
            f = _freq(root + iv)
            for det in (-0.15, 0.15):
                seg += 0.03 * np.sin(2 * np.pi * f * (1 + det / 100) * tt)
        env = np.minimum(1, tt / 0.4) * np.minimum(1, (bar - tt) / 0.3)
        out[s0:s1] += seg * env
        # baixo
        fb = _freq(root - 12)
        out[s0:s1] += 0.07 * np.sin(2 * np.pi * fb * tt) * np.exp(-tt / 1.2)
        # arpejo
        step = beat / 2
        for k in range(8):
            ks = s0 + int(k * step * SR)
            ln = int(step * SR * 1.5)
            ke = min(n, ks + ln)
            if ks >= n:
                break
            iv = chord[[0, 1, 2, 1, 0, 2, 1, 2][k]] + (12 if k in (2, 5, 7) else 0)
            f = _freq(root + 12 + iv)
            tk = np.arange(ke - ks) / SR
            tone = np.sin(2 * np.pi * f * tk) + 0.3 * np.sin(4 * np.pi * f * tk)
            out[ks:ke] += 0.045 * tone * _env(ke - ks, 0.005, 0.18)
        # batida
        if humor != "misterio" or b >= 2:
            for k in range(4):
                ks = s0 + int(k * beat * SR)
                if ks >= n:
                    break
                ln = min(int(0.25 * SR), n - ks)
                tk = np.arange(ln) / SR
                if k % 2 == 0:
                    f = 110 * np.exp(-tk * 18) + 45
                    out[ks:ks + ln] += 0.22 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tk * 9)
                else:
                    noise = rnd.standard_normal(ln).astype(np.float32)
                    out[ks:ks + ln] += 0.05 * noise * np.exp(-tk * 30)
                hs = ks + int(beat / 2 * SR)
                if hs + 2000 < n:
                    out[hs:hs + 2000] += 0.02 * rnd.standard_normal(2000) * np.exp(-np.arange(2000) / 300)
    fade = int(2 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)
    out[:int(0.5 * SR)] *= np.linspace(0, 1, int(0.5 * SR))
    return out[: int(duracao * SR)]


# ------------------------------------------------------------------ efeitos
def sfx(nome, seed=0):
    rnd = np.random.default_rng(seed)
    if nome == "whoosh":
        n = int(0.45 * SR)
        noise = rnd.standard_normal(n)
        t = np.arange(n) / SR
        k = np.linspace(0.02, 0.4, n)
        y = np.zeros(n)
        acc = 0
        for i in range(n):
            acc += k[i] * (noise[i] - acc)
            y[i] = acc
        env = np.sin(np.pi * t / t[-1]) ** 2
        return (0.5 * y * env).astype(np.float32)
    if nome == "boom":
        n = int(1.2 * SR)
        t = np.arange(n) / SR
        f = 90 * np.exp(-t * 4) + 35
        x = 0.9 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.5)
        x += 0.25 * rnd.standard_normal(n) * np.exp(-t * 14)
        return x.astype(np.float32)
    if nome == "pop":
        n = int(0.12 * SR)
        t = np.arange(n) / SR
        f = 400 + 1400 * t / t[-1]
        return (0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)).astype(np.float32)
    if nome == "ding":
        n = int(1.0 * SR)
        t = np.arange(n) / SR
        x = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((1320, 0.3), (2640, 0.12), (3960, 0.05)))
        return (x * np.exp(-t * 4)).astype(np.float32)
    if nome == "glitch":
        n = int(0.5 * SR)
        x = np.zeros(n)
        for i in range(10):
            s = rnd.integers(0, n - 2000)
            ln = rnd.integers(500, 2000)
            x[s:s + ln] = np.sign(np.sin(np.arange(ln) * rnd.uniform(0.05, 0.5))) * 0.3
        return x.astype(np.float32)
    if nome == "risada":
        n = int(1.2 * SR)
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * (250 + 30 * np.sin(2 * np.pi * 6 * t)) * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 7 * t)))
        return (0.15 * x * np.exp(-t * 1.5)).astype(np.float32)
    if nome == "suspense":
        n = int(2.0 * SR)
        t = np.arange(n) / SR
        x = 0.25 * np.sin(2 * np.pi * 55 * t) + 0.12 * np.sin(2 * np.pi * 58.3 * t)
        return (x * np.minimum(1, t / 0.5) * np.minimum(1, (t[-1] - t) / 0.5)).astype(np.float32)
    if nome == "plim":
        n = int(0.6 * SR)
        t = np.arange(n) / SR
        x = 0.25 * np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 7) + 0.2 * np.sin(2 * np.pi * 2637 * t) * np.exp(-(t - 0.1).clip(0) * 7) * (t > 0.1)
        return x.astype(np.float32)
    raise ValueError(nome)


def salvar_wav(path, x, sr=SR):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


_dur_cache = {}


def duracao_guia(texto, velocidade=0.9):
    """Duração (s) da fala do texto pela voz-guia, sem pausas nas pontas. Sempre igual para o mesmo texto."""
    chave = (texto, velocidade)
    if chave not in _dur_cache:
        _dur_cache[chave] = len(trim(tts(texto, velocidade, deterministico=True))) / SR
    return _dur_cache[chave]
