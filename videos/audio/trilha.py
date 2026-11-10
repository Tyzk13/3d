"""Trilha e efeitos sintetizados (sem amostras de terceiros) + mixagem com a narração.
Gera out/<historia>/audio.wav (48 kHz estéreo).

uso: python audio/trilha.py <historia>
"""
import sys, os, json, subprocess
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, sosfiltfilt, fftconvolve, resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(7)
TAU = 2 * np.pi


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def fade(y, a=0.004, r=0.02):
    y = y.copy(); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    y[:na] *= np.linspace(0, 1, na); y[-nr:] *= np.linspace(1, 0, nr)
    return y


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def stereo(y, pan=0.0):
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([y * l, y * r], axis=1) * np.sqrt(2) / 1.0


_IR = {}
def reverb(x, rt=2.0, wet=0.3, pre=0.02):
    key = round(rt, 2)
    if key not in _IR:
        n = int(rt * 1.4 * SR); t = np.arange(n) / SR
        ir = rng.standard_normal((n, 2)) * np.exp(-t * 6.9 / rt)[:, None]
        ir = np.stack([lp(hp(ir[:, 0], 180), 5200), lp(hp(ir[:, 1], 180), 5200)], axis=1)
        ir /= np.sqrt((ir ** 2).sum(0)).mean()
        _IR[key] = ir
    ir = _IR[key]
    if x.ndim == 1:
        x = stereo(x)
    w = np.stack([fftconvolve(x[:, 0], ir[:, 0]), fftconvolve(x[:, 1], ir[:, 1])], axis=1)
    out = np.zeros((len(w) + int(pre * SR), 2))
    out[:len(x)] += x * (1 - wet * 0.3)
    out[int(pre * SR):int(pre * SR) + len(w)] += w * wet
    return out


def place(bus, y, t0, gain=1.0, pan=0.0):
    if y.ndim == 1:
        y = stereo(y, pan)
    i0 = int(max(0, t0) * SR)
    n = min(len(y), len(bus) - i0)
    if n > 0:
        bus[i0:i0 + n] += y[:n] * gain


# ---------- instrumentos ----------
def piano(f, dur=3.2, vel=1.0):
    t = tt(dur); y = np.zeros_like(t)
    for det in (0.9993, 1.0007):
        for k in range(1, 8):
            fk = f * det * k * np.sqrt(1 + 0.00035 * k * k)
            if fk > 9000:
                break
            y += (1 / k ** 1.35) * np.sin(TAU * fk * t + k) * np.exp(-t * (0.9 + 0.55 * k + f / 900))
    y *= np.minimum(1, t / 0.004)
    return fade(y * vel * 0.25, 0.002, 0.08)


def marimba(f, dur=0.7, vel=1.0):
    t = tt(dur)
    y = np.sin(TAU * f * t) * np.exp(-t * 8) + 0.22 * np.sin(TAU * f * 3.93 * t) * np.exp(-t * 16) + 0.05 * np.sin(TAU * f * 9.2 * t) * np.exp(-t * 30)
    return fade(y * vel * 0.4, 0.002, 0.05)


def epiano(f, dur=2.8, vel=1.0):
    t = tt(dur)
    y = np.sin(TAU * f * t + 1.1 * np.exp(-t * 7) * np.sin(TAU * f * 7 * t)) * np.exp(-t * 1.5)
    y += 0.3 * np.sin(TAU * 2 * f * t) * np.exp(-t * 2.4)
    return fade(y * vel * 0.3, 0.004, 0.1)


def pad(freqs, dur, attack=1.6, release=2.0, bright=1.6):
    t = tt(dur); y = np.zeros_like(t)
    for f in freqs:
        for det in (0.997, 1.0, 1.003):
            for k in range(1, 6):
                y += (1 / k ** bright) * np.sin(TAU * f * det * k * t + rng.uniform(0, TAU))
    env = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    y *= env * (0.85 + 0.15 * np.sin(TAU * 0.13 * t))
    return y / (len(freqs) * 3) * 0.5


def bass(f, dur=0.5, vel=1.0):
    t = tt(dur)
    y = (np.sin(TAU * f * t) + 0.35 * np.sin(TAU * 2 * f * t)) * np.exp(-t * 5)
    return fade(y * vel * 0.5, 0.004, 0.05)


N = {n: 440 * 2 ** ((i - 57) / 12) for i, n in enumerate(
    [f'{p}{o}' for o in range(0, 8) for p in ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']])}


def music_tense(dur):
    b = np.zeros((int((dur + 4) * SR), 2))
    place(b, lp(pad([N['D2'], N['A2'], N['D3']], dur + 2, bright=1.5), 900), 0, 0.9)
    place(b, lp(pad([N['A4'], N['A#4']], dur + 2, attack=4, bright=2.4), 2400), 0, 0.10)
    motif = ['D5', 'F5', 'E5', 'A4', 'D5', 'C5', 'A#4', 'A4']
    seq = np.zeros((int((dur + 4) * SR), 2)); k = 0; t = 1.0
    while t < dur:
        place(seq, piano(N[motif[k % len(motif)]], 3.0, 0.5), t, 1.0, pan=0.25 * np.sin(k)); k += 1; t += 2.0
    b += reverb(seq, 2.6, 0.5)[:len(b)]
    t = 0.0
    while t < dur:
        tk = tt(0.35); place(b, np.sin(TAU * 52 * tk) * np.exp(-tk * 9), t, 0.5); t += 1.0
    return b[:int(dur * SR)]


def music_playful(dur):
    b = np.zeros((int((dur + 3) * SR), 2)); e = 60 / 112 / 2
    chords = [('C4', 'E4', 'G4', 'C5', 'C3'), ('A3', 'C4', 'E4', 'A4', 'A2'), ('F3', 'A3', 'C4', 'F4', 'F2'), ('G3', 'B3', 'D4', 'G4', 'G2')]
    pat = [0, 2, 1, 2, 3, 2, 1, 2]
    seq = np.zeros_like(b); i = 0; t = 0.0
    while t < dur:
        ch = chords[(i // 8) % 4]
        place(seq, marimba(N[ch[pat[i % 8]]], 0.6, 0.8 if i % 2 == 0 else 0.55), t, 1.0, pan=0.3 * (1 if i % 2 else -1))
        if i % 4 == 0:
            place(b, bass(N[ch[4]], 0.5, 0.9), t, 0.8)
        if i % 2 == 1:
            tk = tt(0.04); place(b, hp(rng.standard_normal(len(tk)), 6000) * np.exp(-tk * 90), t, 0.10, pan=0.4)
        i += 1; t += e
    b += reverb(seq, 0.9, 0.18)[:len(b)]
    return b[:int(dur * SR)]


def music_soft(dur):
    b = np.zeros((int((dur + 4) * SR), 2)); beat = 60 / 72
    chords = [('C3', 'E3', 'G3', 'B3', 'E4'), ('A2', 'C3', 'E3', 'G3', 'C4'), ('F2', 'A2', 'C3', 'E3', 'A3'), ('G2', 'B2', 'D3', 'E3', 'B3')]
    seq = np.zeros_like(b); i = 0; t = 0.0
    while t < dur:
        ch = chords[(i // 8) % 4]; k = i % 8
        if k < 5:
            place(seq, epiano(N[ch[k]], 3.0, 0.7 if k == 0 else 0.5), t, 1.0, pan=-0.3 + 0.15 * k)
        i += 1; t += beat / 2
    b += reverb(seq, 2.2, 0.4)[:len(b)]
    place(b, lp(pad([N['C3'], N['G3']], dur + 1, bright=2.0), 1200), 0, 0.25)
    return b[:int(dur * SR)]


def music_sad(dur):
    b = np.zeros((int((dur + 5) * SR), 2)); e = 60 / 58 / 2
    chords = [('A2', 'E3', 'A3', 'C4', 'E4'), ('F2', 'C3', 'F3', 'A3', 'C4'), ('C3', 'G3', 'C4', 'E4', 'G4'), ('E2', 'B2', 'E3', 'G3', 'B3')]
    pat = [0, 1, 2, 3, 4, 3, 2, 1]
    seq = np.zeros_like(b); i = 0; t = 0.0
    while t < dur:
        ch = chords[(i // 8) % 4]
        place(seq, piano(N[ch[pat[i % 8]]], 3.4, 0.75 if i % 8 == 0 else 0.5), t, 1.0, pan=0.2 * np.sin(i * 0.7))
        i += 1; t += e
    b += reverb(seq, 2.8, 0.45)[:len(b)]
    place(b, lp(pad([N['A2'], N['E3']], dur + 1, attack=3, bright=2.0), 1000), 0, 0.3)
    return b[:int(dur * SR)]


def music_dread(dur):
    """Tensão crescente: drone grave, cluster agudo e pulso que acelera levemente."""
    b = np.zeros((int((dur + 4) * SR), 2))
    place(b, lp(pad([N['C2'], N['G2'], N['C#3']], dur + 2, bright=1.4), 700), 0, 1.0)
    hi = lp(pad([N['B4'], N['C5'], N['F#5']], dur + 2, attack=dur * 0.7, bright=2.6), 3000)
    place(b, hi, 0, 0.16)
    t = 0.0; k = 0
    while t < dur:
        tk = tt(0.4); place(b, np.sin(TAU * 48 * tk) * np.exp(-tk * 8), t, 0.6)
        place(b, np.sin(TAU * 56 * tk) * np.exp(-tk * 10), t + 0.2, 0.4)
        t += max(0.72, 1.05 - 0.012 * k); k += 1
    seq = np.zeros_like(b); t = 2.0; k = 0
    notes = ['C5', 'B4', 'C#5', 'G4']
    while t < dur:
        place(seq, piano(N[notes[k % 4]], 3.0, 0.4), t, 1.0, pan=0.3 * np.cos(k)); k += 1; t += 3.1
    b += reverb(seq, 3.0, 0.6)[:len(b)]
    return b[:int(dur * SR)]


MUSIC = {'tense': (music_tense, 0.27), 'playful': (music_playful, 0.24), 'soft': (music_soft, 0.28), 'sad': (music_sad, 0.34), 'dread': (music_dread, 0.32)}


# ---------- efeitos ----------
def sfx_buzz(**k):
    out = np.zeros(int(0.95 * SR))
    for t0 in (0.0, 0.46):
        t = tt(0.32)
        car = np.sign(np.sin(TAU * 158 * t)) * 0.5 + np.sin(TAU * 158 * t)
        am = 0.6 + 0.4 * np.sin(TAU * 31 * t)
        y = lp(car * am, 900) + 0.5 * bp(rng.standard_normal(len(t)), 1500, 3500) * (am > 0.8)
        out[int(t0 * SR):int(t0 * SR) + len(t)] += fade(y, 0.01, 0.04)
    return out / np.abs(out).max() * 0.42


def bell(f, dur=0.8, decay=5):
    t = tt(dur)
    return fade(sum(a * np.sin(TAU * f * r * t) * np.exp(-t * decay * (1 + 0.5 * i)) for i, (r, a) in enumerate([(1, 1), (2.76, 0.4), (5.4, 0.18)])), 0.002, 0.05)


def sfx_ding(**k):
    y = np.zeros(int(1.1 * SR)); a = bell(880, 0.9); b = bell(1174.7, 0.9)
    y[:len(a)] += a; y[int(0.11 * SR):int(0.11 * SR) + len(b)] += b
    return reverb(y / np.abs(y).max() * 0.3, 1.0, 0.25)


def sfx_cash(**k):
    y = np.zeros(int(1.0 * SR))
    tk = tt(0.03); y[:len(tk)] += bp(rng.standard_normal(len(tk)), 2500, 7000) * np.exp(-tk * 120) * 0.8
    for i, f in enumerate([1318.5, 1975.5, 2637]):
        b = bell(f, 0.7, 6) * (1 + 0.3 * np.sin(TAU * 19 * tt(0.7)))
        i0 = int((0.05 + i * 0.012) * SR); y[i0:i0 + len(b)] += b * 0.6
    for i in range(5):
        tk = tt(0.09); i0 = int((0.1 + i * 0.045 + rng.uniform(0, 0.01)) * SR)
        y[i0:i0 + len(tk)] += np.sin(TAU * rng.uniform(4200, 6800) * tk) * np.exp(-tk * 60) * 0.25
    return reverb(y / np.abs(y).max() * 0.34, 0.8, 0.2)


def sfx_click(**k):
    t = tt(0.04); return np.sin(TAU * 1250 * t) * np.exp(-t * 110) * 0.3


def sfx_pop(**k):
    t = tt(0.12); f = 380 + 700 * np.minimum(1, t / 0.06)
    return np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t * 28) * 0.34


def sfx_whoosh(dur=0.5, **k):
    t = tt(dur); n = rng.standard_normal(len(t))
    u = t / dur; env = np.sin(np.pi * u) ** 1.6
    # varredura de filtro: mistura de três bandas
    y = bp(n, 250, 900) * (1 - u) + bp(n, 900, 3000) * np.sin(np.pi * u) + bp(n, 500, 1500) * u
    y = y * env; y = y / np.abs(y).max() * 0.2
    pan = np.linspace(-0.7, 0.7, len(t))
    return np.stack([y * np.cos((pan + 1) * np.pi / 4), y * np.sin((pan + 1) * np.pi / 4)], axis=1) * 1.3


def sfx_hit(**k):
    t = tt(2.2); f = 36 + 50 * np.exp(-t * 14)
    y = np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    y += lp(rng.standard_normal(len(t)), 220) * np.exp(-t * 9) * 0.5
    y += piano(N['D1'], 2.2, 1.6) + piano(N['D#2'], 2.2, 0.7)
    return reverb(y / np.abs(y).max() * 0.62, 2.4, 0.35)


def sfx_sting(**k):
    y = piano(N['A1'], 3.0, 1.4) + piano(N['A#1'], 3.0, 1.2) + piano(N['E2'], 3.0, 0.9) + piano(N['D#5'], 3.0, 0.5)
    return reverb(y / np.abs(y).max() * 0.55, 3.0, 0.5)


def sfx_riser(dur=0.8, **k):
    t = tt(dur); u = t / dur; n = rng.standard_normal(len(t))
    y = (bp(n, 400, 1500) * (1 - u) + bp(n, 1500, 6000) * u) * u ** 2.2
    return fade(y / np.abs(y).max() * 0.3, 0.01, 0.01)


def sfx_heart(dur=4.0, **k):
    out = np.zeros(int((dur + 0.6) * SR)); t0 = 0.0
    while t0 < dur:
        for off, f, a in ((0, 48, 1.0), (0.19, 60, 0.7)):
            t = tt(0.16); y = np.sin(TAU * f * t) * np.exp(-t * 22) * a
            i0 = int((t0 + off) * SR); out[i0:i0 + len(t)] += y
        t0 += 0.86
    n = len(out); env = np.minimum(1, np.arange(n) / (0.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.8 * SR))
    return lp(out, 160) * env / np.abs(out).max() * 0.6


def sfx_count(dur=1.6, **k):
    out = np.zeros(int((dur + 0.1) * SR)); t0 = 0.0; i = 0
    while t0 < dur:
        t = tt(0.022); f = 1700 + 900 * t0 / dur
        i0 = int(t0 * SR); out[i0:i0 + len(t)] += np.sin(TAU * f * t) * np.exp(-t * 180)
        t0 += 0.045; i += 1
    return out * 0.11


def sfx_horn(**k):
    out = np.zeros(int(0.5 * SR))
    for t0 in (0.0, 0.16):
        t = tt(0.07); y = np.sin(TAU * 2350 * t) + 0.4 * np.sin(TAU * 3100 * t)
        i0 = int(t0 * SR); out[i0:i0 + len(t)] += fade(y, 0.003, 0.012)
    return reverb(out / np.abs(out).max() * 0.16, 0.6, 0.3)


def sfx_knock(**k):
    out = np.zeros(int(1.1 * SR))
    for t0 in (0.0, 0.26, 0.52):
        t = tt(0.12); y = (np.sin(TAU * 170 * t) + 0.6 * np.sin(TAU * 310 * t) + 0.3 * bp(rng.standard_normal(len(t)), 600, 2000)) * np.exp(-t * 40)
        i0 = int(t0 * SR); out[i0:i0 + len(t)] += y
    return reverb(out / np.abs(out).max() * 0.5, 0.7, 0.3)


def sfx_step(**k):
    t = tt(0.14); y = (np.sin(TAU * 90 * t) * np.exp(-t * 35) + 0.25 * bp(rng.standard_normal(len(t)), 300, 1200) * np.exp(-t * 55))
    return reverb(y / np.abs(y).max() * 0.3, 0.5, 0.25)


def sfx_steps(dur=2.0, **k):
    out = np.zeros((int((dur + 1) * SR), 2)); t0 = 0.0
    while t0 < dur:
        place(out, sfx_step(), t0, 0.8 + rng.uniform(-0.15, 0.15)); t0 += 0.48
    return out


def sfx_hum(dur=4.0, **k):
    t = tt(dur); y = 0.5 * np.sin(TAU * 60 * t) + 0.25 * np.sin(TAU * 120 * t) + 0.5 * bp(rng.standard_normal(len(t)), 3000, 9000) * 0.25
    env = np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.3)
    return y * env * 0.045


def sfx_tick(dur=3.0, **k):
    out = np.zeros(int((dur + 0.2) * SR)); t0 = 0.0; i = 0
    while t0 < dur:
        t = tt(0.03); y = (np.sin(TAU * (2100 if i % 2 else 1700) * t) + 0.5 * rng.standard_normal(len(t))) * np.exp(-t * 160)
        i0 = int(t0 * SR); out[i0:i0 + len(t)] += y; t0 += 1.0; i += 1
    return reverb(out * 0.12, 0.5, 0.2)


def sfx_door(**k):
    t = tt(0.9); f = 180 + 120 * np.sin(TAU * 1.3 * t) + 60 * t
    y = np.sign(np.sin(TAU * np.cumsum(f) / SR)) * (0.5 + 0.5 * np.sin(TAU * 23 * t))
    y = bp(y, 400, 2400) * np.sin(np.pi * t / 0.9) ** 0.8
    th = tt(0.2); thud = np.sin(TAU * 70 * th) * np.exp(-th * 25)
    out = np.zeros(int(1.3 * SR)); out[:len(y)] += y / np.abs(y).max() * 0.12
    out[int(0.95 * SR):int(0.95 * SR) + len(th)] += thud * 0.5
    return reverb(out, 0.8, 0.3)


SFX = {'buzz': sfx_buzz, 'ding': sfx_ding, 'cash': sfx_cash, 'click': sfx_click, 'pop': sfx_pop, 'whoosh': sfx_whoosh, 'hit': sfx_hit,
       'sting': sfx_sting, 'riser': sfx_riser, 'heart': sfx_heart, 'count': sfx_count, 'horn': sfx_horn, 'knock': sfx_knock,
       'step': sfx_step, 'steps': sfx_steps, 'hum': sfx_hum, 'tick': sfx_tick, 'door': sfx_door}


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def main():
    name = sys.argv[1]
    out = os.path.join(ROOT, 'out', name)
    tm = json.load(open(os.path.join(out, 'timing.json')))
    dur = tm['duration']; n = int(dur * SR) + 1

    # narração: 24k -> 48k, passa-altas, compressão leve, nível
    v, sr = sf.read(os.path.join(out, 'narr.wav'), dtype='float32')
    v = resample_poly(v, SR // sr, 1).astype(np.float64)[:n]
    v = np.pad(v, (0, n - len(v)))
    v = sosfiltfilt(butter(2, 75, btype='high', fs=SR, output='sos'), v)
    w = int(0.02 * SR); env = np.sqrt(np.convolve(v ** 2, np.ones(w) / w, mode='same') + 1e-12)
    thr = 10 ** (-24 / 20) * (np.percentile(env, 95) / 10 ** (-20 / 20))
    g = np.where(env > thr, (env / thr) ** (1 / 2.2 - 1), 1.0)
    g = sosfiltfilt(butter(1, 12, btype='low', fs=SR, output='sos'), g)
    v = v * g
    active = env > np.percentile(env, 95) * 0.1
    v *= 10 ** (-19 / 20) / np.sqrt(np.mean(v[active] ** 2))
    voice = stereo(v)

    # envelope da voz para abaixar a trilha
    ve = (env > np.percentile(env, 95) * 0.08).astype(float)
    hold = int(0.25 * SR); ve = np.convolve(ve, np.ones(hold) / hold, mode='same')
    ve = np.clip(sosfiltfilt(butter(1, 3, btype='low', fs=SR, output='sos'), np.clip(ve * 3, 0, 1)), 0, 1)

    # trilha por trechos
    mus = np.zeros((n, 2)); secs = tm.get('music', [])
    for i, m in enumerate(secs):
        t0 = m['t']; t1 = secs[i + 1]['t'] if i + 1 < len(secs) else dur
        if m['mood'] == 'none' or m['mood'] not in MUSIC or t1 - t0 < 0.5:
            continue
        fn, gain = MUSIC[m['mood']]
        seg = fn(t1 - t0 + 0.6)
        seg = seg / (np.sqrt(np.mean(seg ** 2)) + 1e-9) * 10 ** (-20 / 20) * gain / 0.2
        k = len(seg); fi = int((0.5 if i else 0.3) * SR); fo = int(0.6 * SR)
        e = np.ones(k); e[:fi] = np.linspace(0, 1, fi); e[-fo:] = np.linspace(1, 0, fo)
        place(mus, seg * e[:, None], t0, 0.2)
    mus *= (1 - 0.5 * ve)[:, None]
    tail = int(0.8 * SR); mus[-tail:] *= np.linspace(1, 0, tail)[:, None]

    fxb = np.zeros((n, 2))
    for c in tm.get('sfx', []):
        if c['n'] not in SFX:
            print('efeito desconhecido:', c['n']); continue
        args = {k: val for k, val in c.items() if k not in ('n', 't', 'gain', 'pan')}
        place(fxb, SFX[c['n']](**args), c['t'], c.get('gain', 1.0), c.get('pan', 0.0))

    mix = voice + mus + fxb
    mix = np.tanh(mix * 1.15) / np.tanh(1.15) * 0.92          # limitador suave
    pk = np.abs(mix).max()
    if pk > 0.89:
        mix *= 0.89 / pk
    tmp = os.path.join(out, 'mix_pre.wav'); sf.write(tmp, mix.astype(np.float32), SR)
    # normaliza a sonoridade (duas passadas)
    p = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    js = json.loads(p.stderr[p.stderr.rindex('{'):p.stderr.rindex('}') + 1])
    af = (f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
          f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-ar', str(SR), os.path.join(out, 'audio.wav')], check=True)
    os.remove(tmp)
    print(f"voz {rms_db(voice[active]):.1f} dB | trilha {rms_db(mus[np.abs(mus).sum(1) > 1e-5]) if np.abs(mus).sum() else -99:.1f} dB | efeitos pico {np.abs(fxb).max():.2f} | "
          f"entrada {js['input_i']} LUFS, pico {js['input_tp']} dBTP -> -15 LUFS | {dur:.1f}s")


if __name__ == '__main__':
    main()
