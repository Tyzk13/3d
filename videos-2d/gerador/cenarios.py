"""Cenários (fundos 1080x1920) desenhados proceduralmente e guardados em cache.

Cada cenário é montado em camadas (fundo distante -> meio -> frente) com sombras, luzes,
reflexos e objetos de cena para dar profundidade.
"""
import math
import os
import random
from PIL import Image
from .canvas import Canvas, OUT, mix, darker, lighter

W, H = 1080, 1920
CACHE = os.path.join(os.path.dirname(__file__), "..", ".cache", "fundos")
VERSAO = "v3"


# ====================================================================== céu e natureza
def ceu(c, top, bot, y1=H):
    c.vgradient(0, 0, W, y1, top, bot)


def sol(c, x, y, r, cor=(255, 236, 140)):
    c.glow(x, y, r * 3.2, cor, 0.35)
    c.glow(x, y, r * 1.8, cor, 0.5)
    c.circle(x, y, r, fill=cor, w=0)
    c.circle(x, y, r * 0.8, fill=lighter(cor, 0.5), w=0)


def nuvem(c, x, y, s=1.0, cor=(255, 255, 255), sombra=(205, 220, 240)):
    puffs = ((-70, 15, 52), (-10, -25, 72), (65, 0, 58), (125, 22, 42), (-125, 28, 38), (20, 20, 60))
    for dx, dy, r in puffs:
        c.circle(x + dx * s, y + dy * s + 8 * s, r * s, fill=sombra, w=0)
    for dx, dy, r in puffs:
        c.circle(x + dx * s, y + dy * s, r * s * 0.97, fill=cor, w=0)
    c.rect(x - 150 * s, y + 6 * s, x + 162 * s, y + 52 * s, fill=cor, w=0, r=24 * s)
    c.rect(x - 150 * s, y + 40 * s, x + 162 * s, y + 66 * s, fill=sombra, w=0, r=14 * s)
    c.circle(x - 30 * s, y - 50 * s, 22 * s, fill=lighter(cor, 0.6), w=0)


def montanhas(c, y, cor, rnd, alt=260, n=5):
    pts = [(-50, y)]
    for i in range(n + 1):
        x = -50 + i * (W + 100) / n
        pts.append((x - (W / n) * 0.5, y - rnd.uniform(alt * 0.5, alt)))
        pts.append((x, y - rnd.uniform(alt * 0.1, alt * 0.4)))
    pts.append((W + 50, y))
    c.poly(pts, fill=cor, w=0)


def arvore(c, x, y, s=1.0, cor=(70, 160, 80), tronco=(120, 80, 45)):
    c.rect(x - 16 * s, y - 170 * s, x + 16 * s, y, fill=tronco, w=5 * s)
    c.line([(x, y - 110 * s), (x + 40 * s, y - 150 * s)], fill=OUT, w=16 * s)
    c.line([(x, y - 110 * s), (x + 40 * s, y - 150 * s)], fill=tronco, w=8 * s)
    blobs = ((0, -230, 95), (-70, -180, 70), (70, -185, 72), (-30, -290, 70), (40, -280, 66))
    for dx, dy, r in blobs:
        c.circle(x + dx * s, y + dy * s, r * s, fill=cor, w=5 * s)
    for dx, dy, r in blobs:
        c.circle(x + dx * s, y + dy * s, r * s * 0.9, fill=cor, w=0)
    for dx, dy, r in ((-20, -260, 30), (50, -230, 22), (-60, -200, 20)):
        c.circle(x + dx * s - 10 * s, y + dy * s - 10 * s, r * s, fill=lighter(cor, 0.25), w=0)
    for dx, dy, r in ((40, -170, 34), (-40, -160, 30)):
        c.circle(x + dx * s, y + dy * s, r * s, fill=darker(cor, 0.8), w=0)


def arbusto(c, x, y, s=1.0, cor=(60, 150, 75)):
    for dx, r in ((-50, 45), (0, 60), (55, 48)):
        c.circle(x + dx * s, y - r * s * 0.7, r * s, fill=cor, w=5 * s)
    for dx, r in ((-50, 45), (0, 60), (55, 48)):
        c.circle(x + dx * s, y - r * s * 0.7, r * s * 0.9, fill=cor, w=0)
    c.rect(x - 95 * s, y - 30 * s, x + 100 * s, y, fill=cor, w=0)
    c.line([(x - 95 * s, y), (x + 100 * s, y)], w=5 * s)
    for dx in (-40, 10, 50):
        c.circle(x + dx * s, y - 55 * s, 10 * s, fill=lighter(cor, 0.3), w=0)


def coqueiro(c, x, y, s=1.0, flip=1):
    tronco = (160, 108, 60)
    pts = []
    for i in range(14):
        t = i / 13
        pts.append((x + flip * 70 * s * math.sin(t * 1.6), y - 540 * s * t))
    c.line(pts, fill=OUT, w=60 * s)
    c.line(pts, fill=tronco, w=46 * s)
    c.line([(px + 10 * s * flip, py) for px, py in pts], fill=darker(tronco, 0.8), w=14 * s)
    for i in range(1, 13):
        px, py = pts[i]
        c.arc(px, py + 10 * s, 22 * s, 8 * s, 200, 340, fill=darker(tronco, 0.65), w=5 * s)
    tx, ty = pts[-1]
    for k, a in enumerate((200, 235, 275, 305, 340, 165, 15, 255)):
        r = math.radians(a)
        L = (270 if k < 7 else 190) * s
        ex, ey = tx + L * math.cos(r), ty + L * 0.45 * math.sin(r) + 120 * s
        mx, my = tx + L * 0.55 * math.cos(r), ty - 70 * s + L * 0.2 * math.sin(r)
        spine = _bezier((tx, ty), (mx, my), (ex, ey), 22)
        cor = (70, 175, 85) if k % 2 else (52, 148, 72)
        c.poly(_leaf_pts(spine, 34 * s, serra=True), fill=cor, w=5 * s)
        c.line(spine[:-1], fill=darker(cor, 0.65), w=5 * s)
    for dx in (-28, 22, -2):
        c.circle(tx + dx * s, ty + 34 * s, 24 * s, fill=(115, 80, 40), w=5 * s)
        c.circle(tx + dx * s - 7 * s, ty + 27 * s, 7 * s, fill=(150, 110, 60), w=0)


def _bezier(p0, p1, p2, n=18):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in (i / n for i in range(n + 1))]


def _leaf_pts(spine, larg, serra=0):
    """Contorno de folha (formato de lente) ao redor de uma 'espinha' curva."""
    esq, dir_ = [], []
    n = len(spine) - 1
    for i, (x, y) in enumerate(spine):
        t = i / n
        a = spine[min(i + 1, n)]
        b = spine[max(i - 1, 0)]
        dx, dy = a[0] - b[0], a[1] - b[1]
        d = math.hypot(dx, dy) or 1
        nx, ny = -dy / d, dx / d
        wv = larg * (math.sin(math.pi * min(1, t * 1.15)) ** 0.7) if t < 0.99 else 0
        if serra and 0.1 < t < 0.95 and i % 2:
            wv *= 0.55
        esq.append((x + nx * wv, y + ny * wv))
        dir_.append((x - nx * wv, y - ny * wv))
    return esq + dir_[::-1]


def folha_grande(c, x, y, ang, L, cor, curva=0.18, serra=False):
    r = math.radians(ang)
    ex, ey = x + L * math.cos(r), y + L * math.sin(r)
    mx, my = (x + ex) / 2 - math.sin(r) * L * curva, (y + ey) / 2 + math.cos(r) * L * curva
    spine = _bezier((x, y), (mx, my), (ex, ey), 20 if serra else 14)
    c.poly(_leaf_pts(spine, L * 0.22, serra), fill=cor, w=5)
    c.line(spine[:-2], fill=darker(cor, 0.68), w=4)
    if not serra:
        for k in range(3, len(spine) - 3, 3):
            px, py = spine[k]
            qx, qy = spine[k + 2]
            dx, dy = qx - px, qy - py
            c.line([(px, py), (px + dx * 1.2 - dy * 0.9, py + dy * 1.2 + dx * 0.9)], fill=darker(cor, 0.75), w=3)
            c.line([(px, py), (px + dx * 1.2 + dy * 0.9, py + dy * 1.2 - dx * 0.9)], fill=darker(cor, 0.75), w=3)
    c.shade(lambda l: l.poly(_leaf_pts(spine[: len(spine) // 2 + 1], L * 0.08), fill=(255, 255, 255), w=0), 0.15)


def mar(c, y0, y1, top=(70, 175, 225), bot=(20, 110, 180), rnd=None):
    rnd = rnd or random.Random(3)
    c.vgradient(0, y0, W, y1, top, bot)
    for i in range(70):
        x = rnd.uniform(0, W)
        y = rnd.uniform(y0 + 10, y1 - 10)
        ln = rnd.uniform(20, 70) * (0.5 + (y - y0) / (y1 - y0))
        c.line([(x, y), (x + ln, y)], fill=lighter(top, 0.5), w=4)


def raios_luz(c, x0, y0, ang, n=4, L=1700, cor=(255, 245, 210), op=0.18, larg=90):
    def f(l):
        for i in range(n):
            a = math.radians(ang + (i - n / 2) * 7)
            sx = x0 + (i - n / 2) * larg * 1.4
            d = larg * (0.6 + (i % 2) * 0.5)
            ex, ey = sx + L * math.cos(a), y0 + L * math.sin(a)
            l.poly([(sx - d * 0.3, y0), (sx + d * 0.3, y0), (ex + d, ey), (ex - d, ey)], fill=cor, w=0)
    c.shade(f, op, blur=20)


# ====================================================================== cidade
def predio(c, x, y_base, w, h, cor, rnd, noite=False, acesas=0.0, estilo=None, prof=None):
    """Prédio com face lateral (3D), janelas emolduradas, telhado com caixa d'água/antena e térreo."""
    estilo = estilo or rnd.choice(["janelas", "janelas", "vidro", "faixas"])
    prof = prof if prof is not None else w * 0.16
    side = darker(cor, 0.72)
    # face lateral
    c.poly([(x + w, y_base - h), (x + w + prof, y_base - h - prof * 0.45), (x + w + prof, y_base - prof * 0.1),
            (x + w, y_base)], fill=side, w=5)
    c.poly([(x, y_base - h), (x + prof, y_base - h - prof * 0.45), (x + w + prof, y_base - h - prof * 0.45),
            (x + w, y_base - h)], fill=lighter(cor, 0.2), w=5)
    c.rect(x, y_base - h, x + w, y_base, fill=cor, w=5)
    # textura conforme estilo
    if estilo == "vidro":
        vid = mix(cor, (90, 150, 210), 0.6) if not noite else (30, 40, 70)
        c.rect(x + 10, y_base - h + 14, x + w - 10, y_base - 110, fill=vid, w=4)
        for yy in range(int(y_base - h + 14), int(y_base - 110), 44):
            c.line([(x + 10, yy), (x + w - 10, yy)], fill=darker(vid, 0.8), w=3, round_caps=False)
        for xx in range(int(x + 10), int(x + w - 10), 40):
            c.line([(xx, y_base - h + 14), (xx, y_base - 110)], fill=darker(vid, 0.8), w=3, round_caps=False)
        c.shade(lambda l: l.poly([(x + w * 0.2, y_base - h + 14), (x + w * 0.45, y_base - h + 14),
                                  (x + w * 0.05, y_base - h + 14 + w * 0.9), (x + 10, y_base - h + 14 + w * 0.7)],
                                 fill=(255, 255, 255), w=0), 0.25)
        if noite:
            for yy in range(int(y_base - h + 20), int(y_base - 120), 44):
                for xx in range(int(x + 14), int(x + w - 40), 40):
                    if rnd.random() < acesas:
                        c.rect(xx, yy, xx + 34, yy + 38, fill=(255, 220, 130), w=0)
    else:
        jc = lighter(cor, 0.5) if not noite else darker(cor, 0.6)
        jw, jh, gx, gy = 30, 40, 50, 66
        if estilo == "faixas":
            for yy in range(int(y_base - h + 40), int(y_base - 120), 56):
                c.rect(x + 14, yy, x + w - 14, yy + 30, fill=(150, 195, 230) if not noite else (40, 45, 70), w=4)
                c.line([(x + 14, yy + 32), (x + w - 14, yy + 32)], fill=darker(cor, 0.8), w=4)
                if noite:
                    for xx in range(int(x + 20), int(x + w - 50), 46):
                        if rnd.random() < acesas:
                            c.rect(xx, yy + 4, xx + 40, yy + 26, fill=(255, 220, 130), w=0)
        else:
            cols = max(1, int((w - 30) // gx))
            off = (w - cols * gx) / 2 + (gx - jw) / 2
            for yy in range(int(y_base - h + 36), int(y_base - 130), gy):
                for i in range(cols):
                    xx = x + off + i * gx
                    on = noite and rnd.random() < acesas
                    vid = (255, 220, 130) if on else ((160, 205, 240) if not noite else jc)
                    c.rect(xx - 4, yy - 4, xx + jw + 4, yy + jh + 6, fill=lighter(cor, 0.35), w=0)
                    c.rect(xx, yy, xx + jw, yy + jh, fill=vid, w=3)
                    if not noite:
                        c.line([(xx + 5, yy + jh - 8), (xx + jw - 8, yy + 6)], fill=(235, 248, 255), w=4)
                    elif on and rnd.random() < 0.5:
                        c.rect(xx, yy, xx + jw / 2, yy + jh, fill=(230, 120, 90), w=0)
                    c.line([(xx - 6, yy + jh + 7), (xx + jw + 6, yy + jh + 7)], fill=darker(cor, 0.7), w=4)
    # telhado
    c.rect(x - 6, y_base - h - 14, x + w + 6, y_base - h + 6, fill=darker(cor, 0.85), w=5)
    item = rnd.random()
    if item < 0.35:
        tx = x + rnd.uniform(20, max(21, w - 90))
        c.rect(tx, y_base - h - 80, tx + 70, y_base - h - 14, fill=(170, 175, 185), w=5, r=6)
        c.line([(tx + 10, y_base - h - 14), (tx + 10, y_base - h - 30)], w=6)
        c.chord(tx + 35, y_base - h - 80, 35, 14, 180, 360, fill=(150, 155, 165), w=5)
    elif item < 0.6:
        ax = x + rnd.uniform(20, max(21, w - 20))
        c.line([(ax, y_base - h - 14), (ax, y_base - h - 140)], w=6)
        c.line([(ax - 20, y_base - h - 110), (ax + 20, y_base - h - 110)], w=5)
        c.circle(ax, y_base - h - 145, 7, fill=(255, 70, 70) if noite else (220, 60, 60), w=3)
    elif item < 0.8:
        for k in range(2):
            ux = x + 20 + k * 60
            if ux + 46 < x + w:
                c.rect(ux, y_base - h - 50, ux + 46, y_base - h - 14, fill=(200, 205, 210), w=4, r=4)
                c.circle(ux + 23, y_base - h - 32, 12, fill=(150, 155, 160), w=3)
    # térreo
    loja = rnd.choice([(220, 70, 60), (60, 140, 200), (250, 190, 60), (90, 170, 100), (200, 90, 160)])
    c.rect(x, y_base - 110, x + w, y_base, fill=darker(cor, 0.9), w=5)
    if w > 120:
        c.rect(x + 14, y_base - 95, x + w * 0.55, y_base - 6, fill=(170, 210, 235) if not noite else (255, 210, 130), w=4)
        c.rect(x + w * 0.62, y_base - 95, x + w - 16, y_base, fill=darker(cor, 0.6), w=4)
        c.circle(x + w * 0.62 + 12, y_base - 48, 4, fill=(240, 200, 60), w=0)
        n = max(3, int(w // 40))
        for i in range(n):
            x0 = x + i * w / n
            c.rect(x0, y_base - 130, x0 + w / n, y_base - 100, fill=loja if i % 2 == 0 else (250, 250, 245), w=3)
        for i in range(n):
            c.chord(x + (i + 0.5) * w / n, y_base - 100, w / n / 2, 12, 0, 180,
                    fill=loja if i % 2 == 0 else (250, 250, 245), w=3)


def skyline(c, y_base, rnd, cores, noite=False, acesas=0.0, hmin=500, hmax=1050, wmin=170, wmax=260, x0=-60):
    x = x0
    while x < W + 40:
        w = rnd.randint(wmin, wmax)
        h = rnd.randint(hmin, hmax)
        cor = rnd.choice(cores)
        predio(c, x, y_base, w, h, darker(cor, 0.55) if noite else cor, rnd, noite, acesas)
        x += w + rnd.randint(-10, 18)


def skyline_distante(c, y_base, cor, rnd, hmin=300, hmax=700):
    x = -40
    while x < W:
        w = rnd.randint(80, 160)
        h = rnd.randint(hmin, hmax)
        c.rect(x, y_base - h, x + w, y_base, fill=cor, w=0)
        for yy in range(int(y_base - h + 20), int(y_base - 20), 34):
            for xx in range(int(x + 12), int(x + w - 16), 26):
                c.rect(xx, yy, xx + 12, yy + 16, fill=lighter(cor, 0.15), w=0)
        x += w + rnd.randint(0, 12)


def poste(c, x, y, s=1.0, aceso=False):
    c.line([(x, y), (x, y - 520 * s)], fill=OUT, w=22 * s)
    c.line([(x, y), (x, y - 520 * s)], fill=(70, 80, 95), w=12 * s)
    c.line([(x, y - 520 * s), (x + 70 * s, y - 545 * s), (x + 110 * s, y - 530 * s)], fill=OUT, w=18 * s)
    c.line([(x, y - 520 * s), (x + 70 * s, y - 545 * s), (x + 110 * s, y - 530 * s)], fill=(70, 80, 95), w=9 * s)
    c.chord(x + 110 * s, y - 520 * s, 34 * s, 22 * s, 180, 360, fill=(70, 80, 95), w=5 * s)
    c.ellipse(x + 110 * s, y - 517 * s, 24 * s, 8 * s, fill=(255, 235, 160) if aceso else (230, 230, 220), w=3 * s)
    c.rect(x - 18 * s, y - 40 * s, x + 18 * s, y, fill=(60, 70, 85), w=5 * s, r=4)
    if aceso:
        c.glow(x + 110 * s, y - 480 * s, 160 * s, (255, 220, 140), 0.45)
        c.shade(lambda l: l.poly([(x + 90 * s, y - 515 * s), (x + 130 * s, y - 515 * s), (x + 260 * s, y),
                                  (x - 40 * s, y)], fill=(255, 230, 160), w=0), 0.12, blur=10)


def calcada(c, y0, y1, cor=(200, 196, 190)):
    c.rect(0, y0, W, y1, fill=cor, w=0)
    for i in range(-6, 16):
        xa = i * 110
        c.line([(xa, y0), (W / 2 + (xa - W / 2) * 1.35, y1)], fill=darker(cor, 0.88), w=3)
    yy = y0
    step = 18
    while yy < y1:
        c.line([(0, yy), (W, yy)], fill=darker(cor, 0.9), w=3, round_caps=False)
        yy += step
        step *= 1.35
    c.rect(0, y1 - 18, W, y1 + 6, fill=(165, 165, 170), w=5)


def asfalto(c, y0, y1, rnd, faixa=(250, 250, 250), cor=(70, 72, 80)):
    c.vgradient(0, y0, W, y1, darker(cor, 0.9), cor)
    for _ in range(260):
        x, y = rnd.uniform(0, W), rnd.uniform(y0, y1)
        c.circle(x, y, rnd.uniform(1.5, 3.5), fill=lighter(cor, 0.12) if rnd.random() < 0.5 else darker(cor, 0.85), w=0)
    ym = y0 + (y1 - y0) * 0.45
    for i in range(-1, 7):
        xa = 40 + i * 190
        c.poly([(xa, ym - 10), (xa + 110, ym - 10), (xa + 118, ym + 14), (xa - 6, ym + 14)], fill=faixa, w=0)
    # faixa de pedestre
    for i in range(6):
        x = 640 + i * 70
        c.poly([(x, y1 - 150), (x + 40, y1 - 150), (x + 52, y1 - 20), (x + 8, y1 - 20)], fill=(235, 235, 235), w=0)


def bueiro(c, x, y):
    c.ellipse(x, y, 60, 18, fill=(60, 60, 66), w=5)
    for i in range(-2, 3):
        c.line([(x + i * 18, y - 12), (x + i * 18, y + 12)], fill=(40, 40, 45), w=4)


def hidrante(c, x, y):
    c.rect(x - 22, y - 80, x + 22, y, fill=(220, 50, 45), w=5, r=8)
    c.chord(x, y - 80, 24, 20, 180, 360, fill=(220, 50, 45), w=5)
    c.rect(x - 34, y - 58, x + 34, y - 42, fill=(200, 40, 40), w=4, r=4)


def lixeira(c, x, y, cor=(60, 140, 90)):
    c.rect(x - 34, y - 100, x + 34, y, fill=cor, w=5, r=8)
    c.rect(x - 40, y - 112, x + 40, y - 96, fill=darker(cor, 0.8), w=5, r=6)
    for i in (-14, 0, 14):
        c.line([(x + i, y - 85), (x + i, y - 15)], fill=darker(cor, 0.75), w=4)


def carro_bg(c, x, y, cor, s=1.0, flip=1):
    def X(v):
        return x + v * s * flip
    c.shade(lambda l: l.ellipse(x, y + 6 * s, 250 * s, 20 * s, fill=(0, 0, 0), w=0), 0.3, blur=6)
    c.rect(min(X(-240), X(240)), y - 110 * s, max(X(-240), X(240)), y - 20 * s, fill=cor, w=6 * s, r=34 * s)
    c.poly([(X(-150), y - 105 * s), (X(-95), y - 190 * s), (X(110), y - 190 * s), (X(170), y - 105 * s)],
           fill=cor, w=6 * s)
    c.poly([(X(-125), y - 108 * s), (X(-85), y - 172 * s), (X(0), y - 172 * s), (X(0), y - 108 * s)],
           fill=(170, 215, 245), w=5 * s)
    c.poly([(X(14), y - 108 * s), (X(14), y - 172 * s), (X(100), y - 172 * s), (X(145), y - 108 * s)],
           fill=(170, 215, 245), w=5 * s)
    c.line([(X(-70), y - 160 * s), (X(-110), y - 115 * s)], fill=(235, 248, 255), w=6 * s)
    c.line([(X(-230), y - 62 * s), (X(230), y - 62 * s)], fill=darker(cor, 0.75), w=5 * s)
    c.ellipse(X(228), y - 80 * s, 14 * s, 12 * s, fill=(255, 240, 170), w=4 * s)
    c.rect(min(X(-246), X(-226)), y - 90 * s, max(X(-246), X(-226)), y - 70 * s, fill=(230, 60, 50), w=4 * s, r=4)
    for wx in (-140, 140):
        c.circle(X(wx), y - 20 * s, 44 * s, fill=(35, 35, 40), w=6 * s)
        c.circle(X(wx), y - 20 * s, 20 * s, fill=(190, 190, 200), w=4 * s)


# ====================================================================== interiores
def sala(c, y_piso, parede_cor, piso_cor=(170, 120, 75), papel=True, lambri=True, rodape_cor=None):
    c.rect(0, 0, W, y_piso, fill=parede_cor, w=0)
    if papel:
        for x in range(0, W + 60, 60):
            c.line([(x, 0), (x, y_piso)], fill=darker(parede_cor, 0.95), w=14, round_caps=False)
    if lambri:
        lc = darker(parede_cor, 0.85)
        c.rect(-10, y_piso - 300, W + 10, y_piso, fill=lc, w=5)
        for i in range(6):
            x = 20 + i * 180
            c.rect(x, y_piso - 270, x + 150, y_piso - 70, fill=lighter(lc, 0.08), w=4, r=6)
        c.rect(-10, y_piso - 310, W + 10, y_piso - 290, fill=lighter(lc, 0.2), w=5)
    rc = rodape_cor or darker(parede_cor, 0.6)
    c.rect(-10, y_piso - 50, W + 10, y_piso, fill=rc, w=5)
    # sanca
    c.rect(-10, 0, W + 10, 40, fill=lighter(parede_cor, 0.3), w=5)
    piso_madeira(c, y_piso, piso_cor)
    c.shade(lambda l: l.rect(0, y_piso - 10, W, y_piso + 60, fill=(0, 0, 0), w=0), 0.25, blur=18)


def piso_madeira(c, y0, cor=(170, 120, 75)):
    c.vgradient(0, y0, W, H, darker(cor, 0.85), lighter(cor, 0.05))
    rnd = random.Random(int(y0))
    n = 22
    for i in range(-n, n + 1):
        xa = W / 2 + i * 34
        xb = W / 2 + i * 150
        c.line([(xa, y0), (xb, H)], fill=darker(cor, 0.78), w=4, round_caps=False)
    yy = y0 + 14
    step = 22
    while yy < H:
        for i in range(-n, n):
            if rnd.random() < 0.3:
                t = (yy - y0) / (H - y0)
                xa = W / 2 + i * (34 + 116 * t)
                c.line([(xa, yy), (xa + (34 + 116 * t), yy)], fill=darker(cor, 0.82), w=3, round_caps=False)
        yy += step
        step *= 1.25
    c.line([(0, y0), (W, y0)], w=5)


def piso_ladrilho(c, y0, c1, c2):
    c.rect(0, y0, W, H, fill=c1, w=0)
    rows = []
    yy, step = y0, 30
    while yy < H:
        rows.append((yy, yy + step))
        yy += step
        step *= 1.3
    for r, (ya, yb) in enumerate(rows):
        ta, tb = (ya - y0) / (H - y0), (yb - y0) / (H - y0)
        for i in range(-14, 15):
            wa, wb = 50 + 160 * ta, 50 + 160 * tb
            if (i + r) % 2:
                c.poly([(W / 2 + i * wa, ya), (W / 2 + (i + 1) * wa, ya), (W / 2 + (i + 1) * wb, yb), (W / 2 + i * wb, yb)],
                       fill=c2, w=0)
    c.line([(0, y0), (W, y0)], w=5)


def janela(c, x, y, w, h, noite=False, cortina=None):
    c.rect(x - 18, y - 18, x + w + 18, y + h + 18, fill=(245, 242, 235), w=6)
    if noite:
        c.vgradient(x, y, x + w, y + h, (15, 20, 55), (50, 45, 100))
        rnd = random.Random(int(x))
        for _ in range(12):
            c.circle(x + rnd.uniform(10, w - 10), y + rnd.uniform(10, h * 0.6), 2.5, fill=(255, 255, 230), w=0)
        c.circle(x + w * 0.72, y + h * 0.26, 34, fill=(250, 245, 210), w=0)
        for i in range(5):
            bh = rnd.uniform(60, 150)
            c.rect(x + i * w / 5, y + h - bh, x + (i + 0.85) * w / 5, y + h, fill=(30, 30, 60), w=0)
            for k in range(3):
                if rnd.random() < 0.5:
                    c.rect(x + i * w / 5 + 10, y + h - bh + 15 + k * 30, x + i * w / 5 + 20, y + h - bh + 27 + k * 30,
                           fill=(255, 220, 130), w=0)
    else:
        c.vgradient(x, y, x + w, y + h, (110, 185, 250), (215, 238, 255))
        nuvem(c, x + w * 0.35, y + h * 0.3, 0.42)
        rnd = random.Random(int(x))
        for i in range(5):
            bh = rnd.uniform(60, 150)
            c.rect(x + i * w / 5, y + h - bh, x + (i + 0.85) * w / 5, y + h, fill=(150, 175, 205), w=0)
    c.line([(x + w / 2, y), (x + w / 2, y + h)], fill=(245, 242, 235), w=14, round_caps=False)
    c.line([(x, y + h / 2), (x + w, y + h / 2)], fill=(245, 242, 235), w=14, round_caps=False)
    c.rect(x, y, x + w, y + h, fill=None, w=5)
    c.shade(lambda l: l.poly([(x + 20, y + h - 10), (x + w * 0.3, y + 10), (x + w * 0.45, y + 10), (x + w * 0.15, y + h - 10)],
                             fill=(255, 255, 255), w=0), 0.18)
    c.rect(x - 34, y + h + 14, x + w + 34, y + h + 38, fill=(235, 230, 220), w=5, r=4)
    if cortina:
        for sx, xx in ((-1, x - 70), (1, x + w + 70)):
            c.poly([(xx - 50, y - 50), (xx + 50, y - 50), (xx + 40 + sx * 20, y + h + 60), (xx - 40 + sx * 20, y + h + 60)],
                   fill=cortina, w=6)
            for j in (-25, 0, 25):
                c.line([(xx + j, y - 40), (xx + j + sx * 15, y + h + 50)], fill=darker(cortina, 0.8), w=4)
        c.rect(x - 140, y - 64, x + w + 140, y - 44, fill=(120, 90, 60), w=5, r=8)


def luz_janela(c, x, y, w, h, y_piso, dx=220, op=0.16):
    c.shade(lambda l: l.poly([(x, y), (x + w, y), (x + w + dx * 2.2, y_piso + 420), (x + dx * 1.6, y_piso + 420)],
                             fill=(255, 245, 200), w=0), op, blur=24)


def quadro(c, x, y, w, h, tipo="paisagem"):
    c.rect(x - 14, y - 14, x + w + 14, y + h + 14, fill=(150, 105, 55), w=6)
    c.rect(x, y, x + w, y + h, fill=(240, 235, 220), w=4)
    if tipo == "paisagem":
        c.vgradient(x + 4, y + 4, x + w - 4, y + h * 0.6, (130, 190, 240), (210, 235, 250))
        c.rect(x + 4, y + h * 0.6, x + w - 4, y + h - 4, fill=(110, 180, 90), w=0)
        c.poly([(x + 4, y + h * 0.65), (x + w * 0.35, y + h * 0.25), (x + w * 0.7, y + h * 0.65)], fill=(120, 130, 150), w=0)
        c.circle(x + w * 0.78, y + h * 0.25, h * 0.1, fill=(255, 220, 90), w=0)
    elif tipo == "abstrato":
        c.circle(x + w * 0.35, y + h * 0.45, h * 0.25, fill=(240, 120, 90), w=0)
        c.rect(x + w * 0.5, y + h * 0.3, x + w * 0.85, y + h * 0.8, fill=(80, 140, 220), w=0)
    c.shade(lambda l: l.rect(x + w * 0.6, y, x + w, y + h, fill=(0, 0, 0), w=0), 0.08)


def planta(c, x, y, s=1.0):
    c.poly([(x - 60 * s, y - 120 * s), (x + 60 * s, y - 120 * s), (x + 45 * s, y), (x - 45 * s, y)], fill=(200, 110, 70), w=6 * s)
    c.rect(x - 68 * s, y - 135 * s, x + 68 * s, y - 112 * s, fill=(215, 125, 80), w=5 * s, r=6)
    for a, L in ((-120, 180), (-95, 230), (-70, 200), (-140, 150), (-45, 160), (-105, 160)):
        folha_grande(c, x, y - 125 * s, a, L * s, (70, 160, 85) if a % 2 else (55, 140, 75))


def estante(c, x, y, w, h, rnd):
    madeira = (140, 95, 55)
    c.rect(x, y, x + w, y + h, fill=madeira, w=6)
    c.rect(x + 14, y + 14, x + w - 14, y + h - 14, fill=darker(madeira, 0.6), w=4)
    n = 4
    sh = (h - 28) / n
    for i in range(n):
        ys = y + 14 + (i + 1) * sh
        c.rect(x + 8, ys - 10, x + w - 8, ys + 4, fill=madeira, w=4)
        xx = x + 22
        while xx < x + w - 40:
            bw = rnd.uniform(18, 32)
            bh = sh - rnd.uniform(20, 40)
            col = rnd.choice([(200, 70, 60), (60, 120, 190), (230, 180, 60), (80, 160, 100), (160, 90, 170), (240, 240, 230)])
            if rnd.random() < 0.12:
                c.poly([(xx, ys - 10), (xx + bw, ys - 10), (xx + bw + bh * 0.3, ys - 10 - bh), (xx + bh * 0.3, ys - 10 - bh)],
                       fill=col, w=3)
                xx += bw + bh * 0.3 + 6
            else:
                c.rect(xx, ys - 10 - bh, xx + bw, ys - 10, fill=col, w=3)
                c.line([(xx + 5, ys - bh), (xx + bw - 5, ys - bh)], fill=lighter(col, 0.4), w=3)
                xx += bw + 3


def luminaria(c, x, y_fio, aceso=True, cor=(255, 225, 150)):
    c.line([(x, 0), (x, y_fio)], w=5)
    c.chord(x, y_fio + 50, 80, 60, 180, 360, fill=(60, 70, 80), w=6)
    c.ellipse(x, y_fio + 50, 80, 12, fill=(255, 245, 210) if aceso else (120, 120, 120), w=5)
    if aceso:
        c.glow(x, y_fio + 60, 260, cor, 0.35)
        c.shade(lambda l: l.poly([(x - 78, y_fio + 52), (x + 78, y_fio + 52), (x + 420, H), (x - 420, H)],
                                 fill=cor, w=0), 0.1, blur=20)


def tapete(c, cx, cy, rx, ry, cor):
    c.ellipse(cx, cy, rx, ry, fill=cor, w=6)
    c.ellipse(cx, cy, rx * 0.82, ry * 0.78, fill=None, outline=lighter(cor, 0.35), w=6)
    c.ellipse(cx, cy, rx * 0.6, ry * 0.55, fill=darker(cor, 0.88), w=0)


def raios_bg(c, cor1, cor2, cx=W / 2, cy=H * 0.42, n=24):
    c.rect(0, 0, W, H, fill=cor1, w=0)
    R = 2600
    for i in range(0, n, 2):
        a0 = math.radians(i * 360 / n)
        a1 = math.radians((i + 1) * 360 / n)
        c.poly([(cx, cy), (cx + R * math.cos(a0), cy + R * math.sin(a0)), (cx + R * math.cos(a1), cy + R * math.sin(a1))],
               fill=cor2, w=0)
    c.glow(cx, cy, 520, lighter(cor2, 0.6), 0.55)
    # pontinhos (meio-tom)
    rnd = random.Random(int(cor1[0]))
    for _ in range(140):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        d = math.hypot(x - cx, y - cy)
        if d > 450:
            c.circle(x, y, 3 + d / 400, fill=lighter(cor1, 0.18), w=0)


def bandeira_br(c, x, y, w, h):
    c.rect(x, y, x + w, y + h, fill=(0, 150, 60), w=6)
    c.poly([(x + w * 0.08, y + h / 2), (x + w / 2, y + h * 0.1), (x + w * 0.92, y + h / 2), (x + w / 2, y + h * 0.9)],
           fill=(255, 210, 0), w=0)
    c.circle(x + w / 2, y + h / 2, h * 0.24, fill=(20, 50, 140), w=0)
    c.arc(x + w / 2, y + h / 2 + h * 0.25, h * 0.36, h * 0.3, 240, 300, fill=(255, 255, 255), w=h * 0.04)


def oca(c, x, y, s=1.0, rnd=None, noite=False):
    rnd = rnd or random.Random(int(x))
    palha = (210, 170, 95) if not noite else (120, 95, 70)
    parede = (175, 125, 75) if not noite else (95, 70, 55)
    c.shade(lambda l: l.ellipse(x, y + 4, 230 * s, 30 * s, fill=(0, 0, 0), w=0), 0.3, blur=8)
    c.rect(x - 160 * s, y - 180 * s, x + 160 * s, y, fill=parede, w=6)
    for i in range(1, 8):
        xx = x - 160 * s + i * 40 * s
        c.line([(xx, y - 175 * s), (xx, y - 4)], fill=darker(parede, 0.78), w=4)
    c.rect(x - 48 * s, y - 128 * s, x + 48 * s, y, fill=(45, 30, 20), w=6, r=34 * s)
    if noite:
        c.glow(x, y - 60 * s, 90 * s, (255, 170, 80), 0.5)
    c.poly([(x - 230 * s, y - 150 * s), (x, y - 420 * s), (x + 230 * s, y - 150 * s)], fill=palha, w=6)
    for i in range(16):
        t = (i + 0.5) / 16
        bx = x - 230 * s + t * 460 * s
        c.line([(x + (bx - x) * 0.25, y - 360 * s), (bx + rnd.uniform(-8, 8), y - 150 * s)], fill=darker(palha, 0.8), w=4)
    for j in range(5):
        yy = y - 160 * s - j * 50 * s
        half = 230 * s * (1 - (y - 150 * s - yy) / (270 * s))
        pts = [(x - half + k * half / 6, yy + (8 * s if k % 2 else 0)) for k in range(13)]
        c.line(pts, fill=darker(palha, 0.85), w=4)
    c.poly([(x - 30 * s, y - 400 * s), (x, y - 450 * s), (x + 30 * s, y - 400 * s)], fill=darker(palha, 0.8), w=5)


def tocha(c, x, y, s=1.0, rnd=None):
    c.line([(x, y), (x, y - 300 * s)], fill=OUT, w=26 * s)
    c.line([(x, y), (x, y - 300 * s)], fill=(120, 80, 45), w=16 * s)
    c.rect(x - 22 * s, y - 330 * s, x + 22 * s, y - 290 * s, fill=(90, 60, 35), w=5 * s, r=6)
    c.glow(x, y - 380 * s, 170 * s, (255, 160, 60), 0.55)
    c.poly([(x - 30 * s, y - 330 * s), (x - 10 * s, y - 420 * s), (x + 2 * s, y - 380 * s), (x + 14 * s, y - 450 * s),
            (x + 32 * s, y - 330 * s)], fill=(250, 120, 30), w=5 * s)
    c.poly([(x - 14 * s, y - 330 * s), (x, y - 395 * s), (x + 16 * s, y - 330 * s)], fill=(255, 225, 90), w=0)


def cerca(c, y, cor=(130, 90, 50)):
    c.line([(0, y - 70), (W, y - 70)], fill=OUT, w=16)
    c.line([(0, y - 70), (W, y - 70)], fill=cor, w=8)
    for x in range(10, W, 46):
        c.poly([(x - 12, y), (x - 12, y - 110), (x, y - 128), (x + 12, y - 110), (x + 12, y)], fill=cor, w=5)


# ====================================================================== cenários
def _bandeira(c):
    raios_bg(c, (0, 140, 60), (20, 165, 75))
    c.shade(lambda l: l.poly([(W / 2, 380), (W - 10, 920), (W / 2, 1460), (10, 920)], fill=(0, 0, 0), w=0), 0.3, blur=20)
    c.poly([(W / 2, 360), (W - 30, 900), (W / 2, 1440), (30, 900)], fill=(255, 210, 0), w=10)
    c.circle(W / 2, 900, 300, fill=(20, 50, 140), w=10)
    c.arc(W / 2, 1210, 470, 380, 236, 304, fill=(255, 255, 255), w=36)
    rnd = random.Random(3)
    for _ in range(26):
        c.circle(W / 2 + rnd.uniform(-240, 240), 900 + rnd.uniform(-60, 240), rnd.uniform(4, 9), fill=(255, 255, 255), w=0)
    c.shade(lambda l: l.poly([(W / 2 - 120, 400), (W / 2 + 60, 400), (W / 2 - 300, 1400), (W / 2 - 480, 1400)],
                             fill=(255, 255, 255), w=0), 0.12, blur=10)


def _paulista(c, noite=False):
    rnd = random.Random(11)
    if not noite:
        ceu(c, (95, 170, 245), (215, 236, 255), 1300)
        sol(c, 880, 230, 70)
        nuvem(c, 250, 250, 1.0)
        nuvem(c, 760, 430, 0.7)
        skyline_distante(c, 1180, (175, 195, 220), rnd, 380, 820)
    else:
        ceu(c, (10, 14, 40), (70, 50, 110), 1300)
        for _ in range(70):
            c.circle(rnd.uniform(0, W), rnd.uniform(0, 700), rnd.uniform(1.5, 3.5), fill=(255, 255, 230), w=0)
        c.circle(830, 220, 60, fill=(250, 245, 215), w=0)
        c.glow(830, 220, 200, (200, 200, 255), 0.3)
        skyline_distante(c, 1180, (40, 40, 80), rnd, 380, 820)
    skyline(c, 1290, rnd, [(150, 160, 185), (120, 140, 170), (185, 170, 155), (105, 120, 150), (200, 190, 175)],
            noite, 0.55)
    calcada(c, 1290, 1400)
    asfalto(c, 1400, H, rnd)
    for x in (90, 990):
        poste(c, x, 1395, 1.0, aceso=noite)
    arvore(c, 330, 1395, 0.9)
    hidrante(c, 760, 1395)
    lixeira(c, 520, 1395)
    bueiro(c, 300, 1820)
    if noite:
        c.shade(lambda l: l.rect(0, 0, W, H, fill=(20, 20, 60), w=0), 0.25)


def _feira(c):
    rnd = random.Random(31)
    ceu(c, (100, 180, 250), (220, 240, 255), 1250)
    sol(c, 170, 240, 60)
    nuvem(c, 800, 250, 0.9)
    skyline_distante(c, 1130, (190, 205, 225), rnd, 300, 650)
    predio(c, -40, 1250, 380, 700, (235, 200, 160), rnd, estilo="janelas")
    predio(c, 690, 1250, 400, 820, (205, 175, 150), rnd, estilo="janelas")
    arvore(c, 520, 1250, 1.1)
    calcada(c, 1250, H, (185, 182, 178))
    # barraca
    c.shade(lambda l: l.rect(80, 1480, 1000, 1560, fill=(0, 0, 0), w=0), 0.3, blur=14)
    for xx in (120, 960):
        c.line([(xx, 1000), (xx, 1520)], fill=OUT, w=24)
        c.line([(xx, 1000), (xx, 1520)], fill=(170, 170, 180), w=14)
    c.poly([(60, 1060), (1020, 1060), (980, 960), (100, 960)], fill=(240, 240, 240), w=6)
    for i in range(10):
        x0 = 100 + i * 88
        x1 = x0 + 88
        c.poly([(x0, 960), (x1, 960), (60 + (i + 1) * 96, 1060), (60 + i * 96, 1060)],
               fill=(225, 55, 50) if i % 2 == 0 else (250, 250, 250), w=4)
    for i in range(10):
        c.chord(60 + (i + 0.5) * 96, 1060, 48, 30, 0, 180, fill=(225, 55, 50) if i % 2 == 0 else (250, 250, 250), w=4)
    c.rect(330, 840, 750, 945, fill=(250, 210, 40), w=7, r=16)
    c.text(540, 893, "PASTEL", 72, fill=(200, 40, 40), black=True)
    c.glow(540, 893, 260, (255, 230, 120), 0.15)
    # balcão e mercadorias
    c.rect(60, 1380, 1020, 1520, fill=(160, 110, 65), w=7, r=10)
    for i in range(12):
        c.line([(70 + i * 80, 1395), (70 + i * 80, 1510)], fill=darker((160, 110, 65), 0.85), w=4)
    c.rect(50, 1365, 1030, 1395, fill=(185, 130, 80), w=6, r=6)
    for i in range(7):
        x = 130 + i * 135
        c.ellipse(x, 1350, 55, 20, fill=(220, 220, 225), w=5)
        for j in range(3):
            c.chord(x - 25 + j * 25, 1345, 30, 22, 180, 360, fill=(240, 190, 90), w=4)
    c.rect(850, 1190, 980, 1365, fill=(240, 240, 240), w=6, r=8)
    c.text(915, 1260, "CALDO\nDE CANA", 26, fill=(60, 140, 70), black=True)


def _tv_estudio(c):
    c.vgradient(0, 0, W, 1300, (20, 30, 70), (40, 60, 120))
    for i in range(14):
        c.line([(i * 100 - 300, 0), (i * 100 + 300, 1300)], fill=(35, 52, 100), w=26, round_caps=False)
    # telões laterais
    for x in (-60, 900):
        c.rect(x, 380, x + 240, 820, fill=(15, 20, 40), w=8, r=10)
        c.rect(x + 16, 396, x + 224, 804, fill=(40, 110, 210), w=0)
        c.shade(lambda l, x=x: l.poly([(x + 16, 396), (x + 120, 396), (x + 16, 600)], fill=(255, 255, 255), w=0), 0.15)
    # treliça de luz
    c.rect(0, 60, W, 90, fill=(70, 75, 90), w=5)
    for x in range(40, W, 120):
        c.line([(x, 90), (x + 60, 60)], fill=(90, 95, 110), w=6)
        c.rect(x + 20, 90, x + 70, 150, fill=(40, 40, 50), w=5, r=8)
        c.ellipse(x + 45, 150, 25, 8, fill=(255, 250, 220), w=3)
        c.glow(x + 45, 160, 90, (255, 245, 210), 0.25)
    piso_ladrilho(c, 1300, (40, 50, 90), (55, 70, 120))
    c.rect(-20, 1300, W + 20, 1420, fill=(60, 120, 220), w=6)
    c.rect(-20, 1420, W + 20, 1440, fill=(250, 200, 40), w=0)
    c.text(540, 1360, "JORNAL DO MEIO-DIA", 54, fill=(255, 255, 255), black=True)
    c.shade(lambda l: l.rect(0, 1440, W, H, fill=(255, 255, 255), w=0), 0.05)


def _brasilia(c):
    rnd = random.Random(41)
    ceu(c, (85, 165, 245), (220, 240, 255), 1200)
    sol(c, 880, 200, 60)
    nuvem(c, 220, 230, 0.9)
    nuvem(c, 900, 420, 0.6)
    montanhas(c, 1110, (165, 200, 170), rnd, 120, 6)
    # torres do congresso
    for x in (440, 560):
        c.rect(x, 520, x + 85, 1110, fill=(225, 228, 232), w=6)
        c.rect(x + 60, 520, x + 85, 1110, fill=(195, 200, 208), w=0)
        for y in range(545, 1100, 26):
            c.line([(x + 8, y), (x + 77, y)], fill=(130, 165, 200), w=7, round_caps=False)
        c.rect(x, 520, x + 85, 1110, fill=None, w=6)
    c.rect(500, 760, 600, 800, fill=(220, 224, 230), w=6)
    # base / cúpulas
    c.rect(60, 1095, 1020, 1175, fill=(232, 234, 238), w=6)
    for x in range(80, 1020, 60):
        c.line([(x, 1110), (x, 1170)], fill=(200, 205, 212), w=6)
    c.chord(260, 1100, 150, 95, 180, 360, fill=(245, 245, 248), w=6)
    c.shade(lambda l: l.chord(300, 1100, 110, 90, 180, 360, fill=(0, 0, 0)), 0.1)
    c.chord(820, 1176, 200, 125, 0, 180, fill=(245, 245, 248), w=6)
    c.shade(lambda l: l.chord(870, 1176, 150, 120, 0, 180, fill=(0, 0, 0)), 0.1)
    # gramado e espelho d'água
    c.vgradient(0, 1175, W, H, (110, 185, 85), (130, 200, 95))
    for i in range(10):
        c.rect(0, 1175 + i * 80, W, 1215 + i * 80, fill=(120, 195, 92), w=0)
    c.poly([(380, 1175), (700, 1175), (1080, H), (0, H)], fill=(205, 205, 205), w=0)
    c.poly([(470, 1175), (610, 1175), (760, H), (320, H)], fill=(120, 180, 225), w=0)
    c.shade(lambda l: l.poly([(500, 1175), (540, 1175), (520, H), (420, H)], fill=(255, 255, 255), w=0), 0.25)
    c.line([(380, 1175), (0, H)], w=5)
    c.line([(700, 1175), (1080, H)], w=5)
    c.line([(470, 1175), (320, H)], w=4)
    c.line([(610, 1175), (760, H)], w=4)
    for x, s in ((80, 0.9), (1000, 0.9)):
        arvore(c, x, 1300, s, (90, 160, 80))
    for i, x in enumerate((200, 880)):
        c.line([(x, 1460), (x, 1080)], fill=(200, 200, 205), w=10)
        bandeira_br(c, x, 1085, 150, 100)


def _gabinete(c):
    rnd = random.Random(51)
    sala(c, 1300, (225, 210, 180), (130, 85, 55))
    janela(c, 120, 260, 420, 540, cortina=(160, 40, 50))
    luz_janela(c, 120, 260, 420, 540, 1300)
    c.line([(840, 230), (840, 1250)], fill=OUT, w=20)
    c.line([(840, 230), (840, 1250)], fill=(180, 150, 60), w=10)
    c.circle(840, 225, 16, fill=(230, 190, 60), w=5)
    bandeira_br(c, 850, 250, 210, 140)
    quadro(c, 620, 360, 170, 210, "paisagem")
    estante(c, 860, 600, 210, 600, rnd)
    tapete(c, 540, 1620, 520, 220, (130, 30, 40))
    luminaria(c, 540, 60, True)


def _escola(c):
    rnd = random.Random(61)
    sala(c, 1280, (205, 195, 235), (165, 120, 80), papel=False)
    c.rect(130, 280, 950, 780, fill=(140, 95, 55), w=8, r=8)
    c.rect(150, 300, 930, 760, fill=(45, 85, 65), w=5)
    c.shade(lambda l: l.poly([(150, 300), (420, 300), (150, 600)], fill=(255, 255, 255), w=0), 0.06)
    c.text(540, 400, "CARDÁPIO", 62, fill=(250, 250, 250))
    c.line([(380, 445), (700, 445)], fill=(250, 250, 250), w=4)
    c.text(540, 530, "RAMEN GRÁTIS", 74, fill=(250, 220, 90), black=True)
    c.text(540, 650, "todo dia :)", 48, fill=(250, 250, 250))
    c.rect(160, 760, 920, 790, fill=(160, 110, 65), w=5)
    c.rect(300, 765, 330, 778, fill=(250, 250, 250), w=2)
    # relógio
    c.circle(1000, 200, 55, fill=(250, 250, 250), w=6)
    c.line([(1000, 200), (1000, 165)], w=6)
    c.line([(1000, 200), (1025, 210)], w=6)
    # cartazes
    for i, (x, col) in enumerate(((20, (250, 200, 80)), (970, (120, 200, 240)))):
        c.rect(x, 860, x + 90, 990, fill=col, w=5, r=4)
        c.line([(x + 15, 900), (x + 75, 900)], w=5)
        c.line([(x + 15, 930), (x + 60, 930)], w=5)
    luminaria(c, 270, 40, True)
    luminaria(c, 810, 40, True)


def _plenario(c):
    c.vgradient(0, 0, W, 1250, (55, 85, 75), (35, 70, 60))
    # painel de madeira
    c.rect(0, 120, W, 600, fill=(130, 90, 55), w=6)
    for x in range(0, W, 60):
        c.line([(x, 120), (x, 600)], fill=(115, 78, 48), w=6)
    c.rect(300, 180, 780, 380, fill=(110, 75, 45), w=7, r=10)
    bandeira_br(c, 450, 220, 180, 120)
    c.text(540, 365, "PLENÁRIO", 30, fill=(240, 220, 160), black=True)
    # fileiras de bancadas curvas
    for i in range(7):
        y = 560 + i * 110
        cor = (40, 120, 80) if i % 2 else (30, 105, 70)
        c.chord(W / 2, y + 900, 900 + i * 40, 900, 180, 360, fill=cor, w=5)
        for k in range(-8, 9):
            a = math.radians(270 + k * 9)
            cx = W / 2 + (900 + i * 40) * 0.98 * math.cos(a)
            cy = y + 900 + 900 * 0.98 * math.sin(a)
            if 0 < cx < W:
                c.rect(cx - 22, cy - 12, cx + 22, cy + 18, fill=(150, 40, 45), w=3, r=6)
    c.rect(0, 1250, W, H, fill=(25, 85, 55), w=0)
    for i in range(12):
        c.line([(i * 100, 1250), (i * 150 - 280, H)], fill=(30, 95, 62), w=5)
    for x in (180, 900):
        luminaria(c, x, 0, True, (255, 240, 200))


def _cofre(c):
    c.vgradient(0, 0, W, 1300, (55, 60, 72), (80, 86, 98))
    for y in range(0, 1300, 130):
        c.line([(0, y), (W, y)], fill=(45, 50, 60), w=6, round_caps=False)
        for x in range(30, W, 120):
            c.circle(x, y + 16, 5, fill=(110, 115, 128), w=2)
    c.shade(lambda l: l.circle(W / 2 + 20, 620, 400, fill=(0, 0, 0), w=0), 0.4, blur=20)
    c.circle(W / 2, 600, 390, fill=(160, 165, 175), w=10)
    for a in range(0, 360, 30):
        r = math.radians(a)
        c.circle(W / 2 + 350 * math.cos(r), 600 + 350 * math.sin(r), 14, fill=(120, 125, 135), w=4)
    c.circle(W / 2, 600, 300, fill=(125, 130, 140), w=8)
    c.shade(lambda l: (l.circle(W / 2, 600, 296, fill=(0, 0, 0), w=0), l.circle(W / 2 - 40, 560, 300, fill=(0, 0, 0, 0), w=0)), 0.3)
    for a in range(0, 360, 45):
        r = math.radians(a)
        c.line([(W / 2, 600), (W / 2 + 220 * math.cos(r), 600 + 220 * math.sin(r))], fill=OUT, w=24)
        c.line([(W / 2, 600), (W / 2 + 220 * math.cos(r), 600 + 220 * math.sin(r))], fill=(190, 195, 205), w=12)
    c.circle(W / 2, 600, 70, fill=(210, 175, 60), w=8)
    c.shade(lambda l: l.ellipse(W / 2 - 160, 380, 120, 40, fill=(255, 255, 255), w=0), 0.3, blur=6)
    piso_ladrilho(c, 1300, (85, 88, 98), (100, 104, 115))
    rnd = random.Random(5)
    # barras de ouro
    for row in range(3):
        for i in range(5 - row):
            x = 60 + i * 90 + row * 45
            y = 1330 - row * 40
            c.poly([(x, y), (x + 80, y), (x + 70, y - 38), (x + 10, y - 38)], fill=(240, 195, 60), w=5)
            c.line([(x + 16, y - 30), (x + 60, y - 30)], fill=(255, 235, 150), w=4)
    c.glow(240, 1270, 220, (255, 220, 100), 0.25)
    for i in range(40):
        x = rnd.uniform(560, W)
        y = rnd.uniform(1280, 1420)
        c.rect(x, y, x + 120, y + 55, fill=(90, 175, 95), w=5, r=6)
        c.circle(x + 60, y + 27, 14, fill=(60, 140, 70), w=3)


def _cidade_feliz(c):
    rnd = random.Random(21)
    ceu(c, (255, 175, 110), (255, 235, 180), 1300)
    sol(c, W / 2, 640, 150, (255, 240, 160))
    skyline_distante(c, 1150, (250, 200, 160), rnd, 250, 500)
    x = -30
    cores = [(250, 160, 120), (120, 190, 220), (250, 210, 110), (160, 210, 140), (230, 140, 170)]
    while x < W:
        w = rnd.randint(190, 250)
        h = rnd.randint(420, 700)
        cor = rnd.choice(cores)
        predio(c, x, 1300, w, h, cor, rnd, estilo="janelas")
        c.rect(x + 20, 1300 - 175, x + w - 30, 1300 - 135, fill=(220, 50, 45), w=4, r=6)
        c.text(x + w / 2 - 5, 1300 - 155, "RAMEN", 28, fill=(255, 255, 255), black=True)
        for k in range(2):
            lx = x + 40 + k * (w - 90)
            c.line([(lx, 1300 - 135), (lx, 1300 - 120)], w=3)
            c.ellipse(lx, 1300 - 95, 16, 24, fill=(230, 50, 45), w=4)
            c.glow(lx, 1300 - 95, 40, (255, 120, 80), 0.3)
        x += w + 6
    # bandeirolas
    for row in range(2):
        y0 = 980 + row * 120
        pts = [(x, y0 + 60 * math.sin(math.pi * x / W)) for x in range(0, W + 1, 30)]
        c.line(pts, w=4)
        for i in range(0, len(pts) - 1, 2):
            (x0, y0b), (x1, y1b) = pts[i], pts[i + 1]
            col = [(230, 60, 60), (250, 200, 50), (60, 160, 220), (90, 190, 110)][(i // 2) % 4]
            c.poly([(x0, y0b), (x1, y1b), ((x0 + x1) / 2, (y0b + y1b) / 2 + 40)], fill=col, w=3)
    calcada(c, 1300, H, (225, 210, 190))
    for x in (60, 1020):
        arvore(c, x, 1420, 0.9, (90, 175, 90))


def _estadio(c):
    c.vgradient(0, 0, W, 600, (8, 12, 35), (25, 35, 75))
    rnd = random.Random(8)
    for _ in range(40):
        c.circle(rnd.uniform(0, W), rnd.uniform(0, 300), 2, fill=(255, 255, 230), w=0)
    # cobertura
    c.poly([(0, 300), (W, 260), (W, 330), (0, 380)], fill=(70, 75, 90), w=6)
    for x in range(0, W, 90):
        c.line([(x, 300 - x * 0.04), (x + 45, 360 - x * 0.04)], fill=(100, 105, 120), w=5)
    for x in (120, 960):
        c.line([(x, 100), (x, 600)], fill=OUT, w=26)
        c.line([(x, 100), (x, 600)], fill=(90, 90, 100), w=14)
        c.rect(x - 100, 40, x + 100, 150, fill=(60, 60, 70), w=6, r=10)
        for i in range(3):
            for j in range(2):
                c.circle(x - 60 + i * 60, 72 + j * 46, 18, fill=(255, 252, 225), w=3)
        c.glow(x, 95, 320, (255, 250, 220), 0.4)
    # placar
    c.rect(400, 140, 680, 270, fill=(20, 20, 25), w=6, r=8)
    c.text(540, 205, "BRA 0 x 0 JAP", 40, fill=(255, 210, 60), black=True)
    # torcida
    for row in range(16):
        y = 400 + row * 52
        c.rect(0, y + 16, W, y + 50, fill=(60, 60, 75) if row % 2 else (70, 70, 85), w=0)
        for i in range(31):
            x = i * 36 + (row % 2) * 18 + rnd.uniform(-4, 4)
            col = rnd.choice([(250, 210, 40), (0, 150, 60), (250, 250, 250), (220, 40, 50), (40, 60, 160), (250, 214, 170)])
            c.rect(x - 13, y + 8, x + 13, y + 40, fill=col, w=3, r=6)
            c.circle(x, y, 13, fill=rnd.choice([(250, 214, 170), (226, 178, 128), (186, 128, 84), (128, 84, 58)]), w=3)
            if rnd.random() < 0.15:
                c.line([(x + 10, y + 12), (x + 22, y - 18)], w=6)
    c.rect(0, 1215, W, 1245, fill=(40, 120, 200), w=5)
    c.text(540, 1230, "COPA DO MUNDO · FINAL", 26, fill=(255, 255, 255), black=True)
    c.vgradient(0, 1245, W, H, (40, 140, 55), (55, 170, 70))
    for i in range(0, 12, 2):
        y = 1245 + i * 60
        c.rect(0, y, W, y + 60, fill=(50, 158, 66), w=0)
    c.line([(0, 1280), (W, 1280)], fill=(255, 255, 255), w=8)
    c.ellipse(W / 2, 1600, 330, 120, fill=None, outline=(255, 255, 255), w=8)
    c.glow(W / 2, 1400, 600, (255, 255, 230), 0.12)


def _raios_lj(c):
    raios_bg(c, (250, 140, 40), (255, 175, 70))


def _raios_azul(c):
    raios_bg(c, (40, 90, 200), (60, 120, 230))


def _raios_vermelho(c):
    raios_bg(c, (170, 30, 40), (200, 45, 55))


def _raios_verde(c):
    raios_bg(c, (30, 150, 80), (50, 175, 100))


def _escuro(c):
    c.rect(0, 0, W, H, fill=(14, 12, 24), w=0)
    c.glow(W / 2, 800, 700, (60, 55, 95), 0.6)
    c.shade(lambda l: l.poly([(W / 2 - 80, 0), (W / 2 + 80, 0), (W / 2 + 420, H), (W / 2 - 420, H)],
                             fill=(120, 115, 170), w=0), 0.12, blur=30)
    c.ellipse(W / 2, 1820, 400, 70, fill=(40, 38, 60), w=0)


# ---- ilha
def _aviao(c):
    c.vgradient(0, 0, W, 1250, (235, 236, 240), (215, 218, 225))
    # bagageiros
    c.poly([(0, 0), (W, 0), (W, 260), (0, 260)], fill=(225, 226, 232), w=0)
    for x in (0, 540):
        c.rect(x + 10, 120, x + 530, 300, fill=(240, 240, 245), w=6, r=20)
        c.rect(x + 200, 260, x + 340, 280, fill=(180, 180, 190), w=4, r=6)
    c.rect(0, 300, W, 330, fill=(200, 205, 215), w=5)
    for x in range(60, W, 180):
        c.circle(x, 315, 8, fill=(255, 250, 220), w=3)
        c.glow(x, 320, 50, (255, 250, 220), 0.3)
    # janelas
    for x in (110, 790):
        c.rect(x, 430, x + 180, 700, fill=(205, 205, 212), w=6, r=86)
        c.vgradient(x + 22, 452, x + 158, 678, (100, 175, 250), (215, 238, 255))
        nuvem(c, x + 90, 600, 0.32)
        c.rect(x + 22, 452, x + 158, 520, fill=(230, 230, 236), w=4, r=0)
        c.rect(x + 22, 452, x + 158, 678, fill=None, w=5, r=66)
        c.shade(lambda l, x=x: l.poly([(x + 40, 660), (x + 70, 540), (x + 95, 540), (x + 65, 660)], fill=(255, 255, 255), w=0), 0.3)
    # corredor
    c.rect(0, 1150, W, H, fill=(70, 80, 115), w=0)
    c.poly([(380, 1150), (700, 1150), (1000, H), (80, H)], fill=(95, 60, 80), w=0)
    for i in range(14):
        y = 1170 + i * i * 4.4
        c.line([(380 - (y - 1150) * 0.4, y), (700 + (y - 1150) * 0.4, y)], fill=(110, 72, 92), w=4)
    c.line([(380, 1150), (80, H)], w=5)
    c.line([(700, 1150), (1000, H)], w=5)
    # poltronas
    for i, (x, s) in enumerate(((-80, 1.0), (180, 1.0), (900, 1.0), (1160, 1.0))):
        c.rect(x - 110 * s, 880, x + 110 * s, 1360, fill=(40, 70, 145), w=7, r=40)
        c.rect(x - 100 * s, 860, x + 100 * s, 960, fill=(240, 240, 245), w=6, r=24)
        c.rect(x - 70 * s, 1010, x + 70 * s, 1100, fill=(20, 25, 40), w=5, r=8)
        c.shade(lambda l, x=x: l.rect(x - 60, 1018, x + 60, 1092, fill=(80, 160, 255), w=0), 0.5)
        c.rect(x - 80 * s, 1180, x + 80 * s, 1300, fill=(35, 60, 125), w=5, r=10)
        c.shade(lambda l, x=x: l.rect(x + 30, 880, x + 110, 1360, fill=(0, 0, 0), w=0), 0.15)


def _mar_tempestade(c):
    rnd = random.Random(12)
    ceu(c, (25, 30, 48), (75, 80, 105), 1100)
    for x, y, s in ((150, 180, 1.5), (650, 260, 1.7), (400, 520, 1.3), (950, 600, 1.1), (100, 700, 1.0)):
        nuvem(c, x, y, s, (60, 65, 85), (40, 44, 60))
    c.glow(640, 600, 400, (255, 250, 200), 0.35)
    c.poly([(640, 280), (560, 620), (640, 610), (560, 920), (725, 560), (640, 570), (720, 280)], fill=(255, 245, 140), w=6)
    c.shade(lambda l: [l.line([(x, y), (x - 40, y + 120)], fill=(200, 210, 230), w=3)
                       for x, y in ((rnd.uniform(0, W + 200), rnd.uniform(0, H)) for _ in range(160))], 0.4)
    c.vgradient(0, 1080, W, H, (30, 75, 120), (15, 45, 85))
    for row in range(12):
        y = 1100 + row * 75
        for i in range(-1, 10):
            x = i * 130 + (row % 2) * 65
            base = (40, 100, 150) if row % 2 else (30, 80, 130)
            c.chord(x, y, 72, 48, 180, 360, fill=base, w=5)
            c.arc(x - 10, y - 24, 40, 18, 200, 300, fill=(200, 230, 245), w=6)
    c.poly([(0, 1150), (200, 1050), (380, 1120), (520, 1000), (700, 1110), (860, 1040), (W, 1130), (W, 1200), (0, 1200)],
           fill=(35, 90, 140), w=6)
    for x in (200, 520, 860):
        c.circle(x, 1030 if x != 520 else 990, 22, fill=(230, 245, 250), w=4)


def _praia(c):
    rnd = random.Random(2)
    ceu(c, (80, 165, 245), (225, 242, 255), 1040)
    sol(c, 840, 260, 90)
    nuvem(c, 250, 280, 0.9)
    nuvem(c, 620, 470, 0.5)
    c.poly([(640, 1010), (720, 960), (800, 975), (900, 940), (980, 1010)], fill=(110, 150, 140), w=0)
    mar(c, 1000, 1250, (60, 170, 225), (30, 130, 200), rnd)
    def brilho(l):
        r2 = random.Random(5)
        for k in range(26):
            y = 1010 + k * 9
            wv = 20 + k * 5
            x = 840 + r2.uniform(-wv, wv) * 0.6
            l.line([(x - wv * 0.5, y), (x + wv * 0.5, y)], fill=(255, 250, 220), w=4)
    c.shade(brilho, 0.7)
    c.shade(lambda l: l.rect(0, 1215, W, 1262, fill=(255, 255, 255), w=0), 0.15)
    # espuma
    pts = [(x, 1258 + 10 * math.sin(x / 40)) for x in range(-20, W + 40, 20)]
    c.poly(pts + [(W + 40, 1300), (-20, 1300)], fill=(250, 250, 250), w=0)
    c.vgradient(0, 1280, W, H, (240, 210, 145), (250, 222, 160))
    c.poly([(x, 1278 + 10 * math.sin(x / 40 + 1)) for x in range(-20, W + 40, 20)] + [(W + 40, 1320), (-20, 1320)],
           fill=(225, 195, 130), w=0)
    for _ in range(90):
        c.circle(rnd.uniform(0, W), rnd.uniform(1330, H), rnd.uniform(2, 5), fill=(215, 180, 115), w=0)
    for i in range(5):
        y = 1450 + i * 90
        c.arc(rnd.uniform(100, 980), y, 120, 16, 200, 340, fill=(230, 196, 130), w=6)
    # conchas / estrela
    c.poly([(300 + 26 * math.cos(math.radians(-90 + k * 36)) * (1 if k % 2 == 0 else 0.45),
             1820 + 26 * math.sin(math.radians(-90 + k * 36)) * (1 if k % 2 == 0 else 0.45)) for k in range(10)],
           fill=(240, 120, 90), w=4)
    c.chord(820, 1780, 26, 22, 180, 360, fill=(250, 230, 220), w=4)
    c.ellipse(150, 1560, 60, 26, fill=(150, 145, 140), w=5)
    c.ellipse(940, 1700, 46, 20, fill=(160, 155, 150), w=5)
    coqueiro(c, 60, 1440, 1.25, 1)
    coqueiro(c, 1030, 1400, 1.0, -1)
    arbusto(c, 130, 1460, 0.9)


def _selva(c):
    rnd = random.Random(7)
    c.vgradient(0, 0, W, 1400, (120, 175, 140), (60, 120, 80))
    # camada distante (azulada)
    for x in range(-40, W, 140):
        c.rect(x, 0, x + 60, 1300, fill=(95, 140, 115), w=0)
    for _ in range(26):
        c.circle(rnd.uniform(-50, W + 50), rnd.uniform(-60, 600), rnd.uniform(80, 150), fill=(80, 135, 100), w=0)
    c.shade(lambda l: l.rect(0, 700, W, 1300, fill=(230, 245, 230), w=0), 0.25, blur=60)
    raios_luz(c, 400, -50, 70, n=5, L=1800, op=0.2)
    # troncos do meio
    for x, w in ((40, 100), (320, 80), (740, 90), (980, 110)):
        c.rect(x, -20, x + w, 1360, fill=(95, 65, 42), w=6)
        c.rect(x + w * 0.6, -20, x + w, 1360, fill=(75, 50, 32), w=0)
        for y in range(80, 1300, 140):
            c.arc(x + w / 2, y, w * 0.3, 14, 200, 340, fill=(65, 45, 28), w=4)
        c.rect(x, -20, x + w, 1360, fill=None, w=6)
    for _ in range(26):
        c.circle(rnd.uniform(-50, W + 50), rnd.uniform(-80, 420), rnd.uniform(80, 150),
                 fill=rnd.choice(((35, 105, 55), (45, 125, 60), (30, 90, 50))), w=5)
    # cipós
    for _ in range(9):
        x = rnd.uniform(0, W)
        L = rnd.uniform(500, 1000)
        pts = [(x + 25 * math.sin(t / 60), t) for t in range(0, int(L), 20)]
        c.line(pts, fill=(55, 115, 55), w=8)
        for i in range(2, len(pts), 4):
            px, py = pts[i]
            folha_grande(c, px, py, rnd.choice((20, 160)), 40, (60, 140, 65))
    c.vgradient(0, 1300, W, H, (85, 120, 55), (100, 140, 60))
    c.poly([(380, 1300), (700, 1300), (900, H), (180, H)], fill=(150, 120, 80), w=0)
    for _ in range(40):
        c.circle(rnd.uniform(200, 880), rnd.uniform(1320, H), rnd.uniform(3, 7), fill=(130, 100, 65), w=0)
    for x, y in ((90, 1320), (990, 1330), (250, 1360)):
        for a in (-150, -120, -90, -60, -30):
            folha_grande(c, x, y, a, 160, (50, 140, 60))
    # flores e cogumelos
    for x, y, col in ((160, 1500, (240, 80, 120)), (930, 1560, (250, 200, 60)), (60, 1700, (200, 120, 240))):
        for k in range(5):
            a = math.radians(k * 72)
            c.circle(x + 16 * math.cos(a), y + 16 * math.sin(a), 13, fill=col, w=3)
        c.circle(x, y, 9, fill=(255, 230, 120), w=3)
    for x, y in ((880, 1440), (910, 1460)):
        c.rect(x - 7, y - 30, x + 7, y, fill=(245, 235, 215), w=4)
        c.chord(x, y - 30, 26, 22, 180, 360, fill=(220, 60, 50), w=4)
        c.circle(x - 8, y - 42, 4, fill=(255, 255, 255), w=0)
    # folhas grandes de frente nas bordas
    for x, y, a in ((-30, 300, 20), (-40, 900, -10), (W + 30, 500, 165), (W + 40, 1100, 190)):
        folha_grande(c, x, y, a, 300, (40, 120, 55))


def _aldeia(c, noite=False):
    rnd = random.Random(9)
    if noite:
        ceu(c, (8, 12, 35), (70, 40, 75), 1150)
        for _ in range(110):
            c.circle(rnd.uniform(0, W), rnd.uniform(0, 950), rnd.uniform(1.5, 4.5), fill=(255, 255, 230), w=0)
        c.glow(820, 250, 260, (210, 210, 255), 0.35)
        c.circle(820, 250, 85, fill=(250, 245, 215), w=0)
        c.circle(795, 230, 14, fill=(230, 225, 200), w=0)
        c.circle(850, 280, 10, fill=(230, 225, 200), w=0)
    else:
        ceu(c, (255, 150, 90), (255, 220, 160), 1150)
        sol(c, 540, 880, 230, (255, 235, 150))
        nuvem(c, 220, 380, 0.8, (255, 225, 200), (245, 185, 160))
    montanhas(c, 1050, (40, 50, 80) if noite else (200, 120, 110), rnd, 260, 4)
    for x in (-40, 1040):
        coqueiro(c, x, 1180, 0.8, 1 if x < 0 else -1)
    for _ in range(18):
        x = rnd.uniform(-50, W + 50)
        c.circle(x, rnd.uniform(1030, 1150), rnd.uniform(60, 110),
                 fill=((25, 60, 40) if noite else (45, 110, 60)), w=0)
    c.vgradient(0, 1220, W, H, (110, 80, 60) if noite else (190, 145, 95), (90, 65, 55) if noite else (205, 160, 105))
    c.poly([(420, 1230), (660, 1230), (860, H), (220, H)], fill=(120, 95, 70) if noite else (215, 175, 120), w=0)
    for _ in range(40):
        c.circle(rnd.uniform(0, W), rnd.uniform(1260, H), rnd.uniform(3, 8), fill=(80, 60, 50) if noite else (170, 125, 80), w=0)
    oca(c, 170, 1260, 0.95, rnd, noite)
    oca(c, 910, 1240, 0.85, rnd, noite)
    cerca(c, 1250, (110, 75, 45) if noite else (140, 95, 55))
    for x in (40, 1040):
        tocha(c, x, 1330, 0.9)
    if noite:
        c.shade(lambda l: l.rect(0, 0, W, H, fill=(20, 15, 50), w=0), 0.18)
        c.glow(540, 1600, 600, (255, 140, 60), 0.18)


def _aldeia_noite(c):
    _aldeia(c, True)


def _conves(c):
    rnd = random.Random(14)
    ceu(c, (85, 170, 245), (225, 242, 255), 950)
    sol(c, 200, 230, 70)
    nuvem(c, 600, 300, 0.8)
    mar(c, 880, 1130, (60, 165, 220), (30, 125, 195), rnd)
    c.poly([(80, 890), (180, 850), (300, 880)], fill=(110, 150, 130), w=0)
    # mastro e vela
    c.line([(880, 1100), (880, -10)], fill=OUT, w=44)
    c.line([(880, 1100), (880, -10)], fill=(130, 85, 45), w=30)
    c.poly([(895, 120), (895, 820), (1090, 780), (1090, 160)], fill=(250, 248, 240), w=6)
    c.shade(lambda l: l.poly([(895, 120), (895, 820), (980, 805), (980, 140)], fill=(0, 0, 0), w=0), 0.08)
    for y in (300, 500, 700):
        c.line([(895, y), (1090, y - 20)], fill=(220, 215, 200), w=4)
    c.line([(880, 60), (0, 900)], fill=(90, 70, 50), w=5)
    c.line([(880, 60), (300, 1000)], fill=(90, 70, 50), w=5)
    # amurada
    c.rect(-10, 1040, W + 10, 1080, fill=(150, 95, 55), w=6)
    for x in range(20, W, 70):
        c.rect(x, 1080, x + 22, 1170, fill=(140, 90, 50), w=5)
    c.rect(-10, 1160, W + 10, 1190, fill=(130, 82, 45), w=6)
    c.circle(160, 1110, 58, fill=(240, 80, 60), w=6)
    c.circle(160, 1110, 30, fill=(150, 95, 55), w=6)
    for a in (45, 135, 225, 315):
        r = math.radians(a)
        c.line([(160 + 32 * math.cos(r), 1110 + 32 * math.sin(r)), (160 + 56 * math.cos(r), 1110 + 56 * math.sin(r))],
               fill=(250, 250, 250), w=14, round_caps=False)
    # convés
    c.vgradient(0, 1190, W, H, (150, 100, 58), (175, 120, 70))
    for i in range(14):
        y = 1190 + i * i * 4.5
        c.line([(0, y), (W, y)], fill=(125, 82, 45), w=5)
    for x in range(0, W, 150):
        c.line([(x, 1190), (x * 1.3 - 160, H)], fill=(135, 90, 50), w=3)
    for x in (980, 1050):
        c.rect(x - 60, 1180, x + 40, 1330, fill=(140, 90, 50), w=6, r=10)
        c.line([(x - 60, 1220), (x + 40, 1220)], w=5)
        c.line([(x - 60, 1290), (x + 40, 1290)], w=5)
    for k in range(4):
        c.ellipse(80, 1500 - k * 16, 70 - k * 6, 22, fill=(220, 195, 140), w=5)


# ---- IA
def _quarto(c, noite=False):
    rnd = random.Random(71)
    sala(c, 1300, (170, 195, 225) if not noite else (35, 42, 75), (160, 115, 80) if not noite else (65, 50, 55),
         papel=True, lambri=False)
    janela(c, 600, 250, 340, 420, noite=noite, cortina=(240, 200, 90) if not noite else (90, 80, 60))
    if not noite:
        luz_janela(c, 600, 250, 340, 420, 1300, -120, 0.14)
    else:
        luz_janela(c, 600, 250, 340, 420, 1300, -120, 0.08)
    # pôsteres
    c.rect(80, 300, 420, 540, fill=(250, 250, 250) if not noite else (70, 75, 100), w=6)
    c.text(250, 420, "ESTUDAR", 48, fill=(60, 60, 80) if not noite else (150, 150, 170), black=True)
    c.rect(150, 600, 330, 840, fill=(240, 90, 80) if not noite else (90, 50, 60), w=6)
    c.circle(240, 690, 50, fill=(255, 220, 90) if not noite else (120, 110, 70), w=5)
    c.poly([(170, 830), (240, 740), (310, 830)], fill=(60, 60, 80), w=5)
    # prateleira
    c.rect(560, 780, 980, 800, fill=(150, 100, 60), w=5)
    for i, col in enumerate([(200, 70, 60), (60, 120, 190), (230, 180, 60), (80, 160, 100)]):
        c.rect(580 + i * 34, 700, 608 + i * 34, 780, fill=col if not noite else darker(col, 0.5), w=3)
    planta(c, 900, 780, 0.45)
    # mesa
    c.rect(40, 1170, 1040, 1240, fill=(150, 100, 60) if not noite else (65, 48, 42), w=7, r=10)
    c.line([(140, 1240), (140, 1620)], fill=OUT, w=30)
    c.line([(140, 1240), (140, 1620)], fill=(130, 85, 50) if not noite else (55, 40, 36), w=18)
    c.line([(940, 1240), (940, 1620)], fill=OUT, w=30)
    c.line([(940, 1240), (940, 1620)], fill=(130, 85, 50) if not noite else (55, 40, 36), w=18)
    # luminária de mesa
    c.line([(980, 1170), (980, 1060), (930, 1010)], w=8)
    c.chord(915, 1020, 50, 40, 150, 330, fill=(240, 90, 80) if not noite else (120, 60, 60), w=6)
    if noite:
        c.glow(900, 1080, 220, (255, 200, 120), 0.35)
    tapete(c, 540, 1700, 420, 140, (90, 140, 200) if not noite else (40, 55, 85))
    if noite:
        c.shade(lambda l: l.rect(0, 0, W, H, fill=(10, 10, 40), w=0), 0.25)


def _quarto_noite(c):
    _quarto(c, True)


def _cidade_ia(c):
    rnd = random.Random(31)
    ceu(c, (25, 8, 18), (140, 30, 45), 1300)
    c.glow(540, 900, 600, (255, 60, 70), 0.3)
    skyline_distante(c, 1150, (55, 25, 40), rnd, 400, 900)
    skyline(c, 1300, rnd, [(70, 65, 90), (60, 55, 80), (80, 70, 95)], True, 0.25, 500, 1000)
    # letreiros neon
    for x, y, txt, col in ((150, 820, "IA", (255, 60, 80)), (760, 700, "OBEDEÇA", (80, 230, 255)),
                           (420, 950, "24H", (255, 60, 80))):
        c.glow(x, y, 120, col, 0.4)
        c.rect(x - 90, y - 40, x + 90, y + 40, fill=(15, 10, 20), w=5, r=8)
        c.text(x, y, txt, 44, fill=col, black=True)
    # cabos
    for k in range(3):
        y0 = 500 + k * 120
        c.line([(x, y0 + 80 * math.sin(math.pi * x / W)) for x in range(0, W + 1, 40)], fill=(20, 15, 25), w=5)
    calcada(c, 1300, 1390, (60, 55, 65))
    asfalto(c, 1390, H, rnd, (220, 60, 70), (40, 38, 48))
    for x in (90, 990):
        poste(c, x, 1385, 1.0, aceso=True)
    c.shade(lambda l: l.rect(0, 1000, W, 1400, fill=(120, 40, 60), w=0), 0.2, blur=60)


def _rua(c):
    _paulista(c)


def _rua_cinza(c):
    rnd = random.Random(11)
    ceu(c, (150, 155, 162), (195, 197, 200), 1300)
    skyline_distante(c, 1180, (175, 178, 182), rnd, 380, 820)
    skyline(c, 1290, rnd, [(140, 142, 148), (125, 128, 135), (160, 160, 165)], False, 0, 500, 1050)
    calcada(c, 1290, 1400, (175, 175, 178))
    asfalto(c, 1400, H, rnd, (200, 200, 200), (90, 90, 95))
    for x in (90, 990):
        poste(c, x, 1395)
    c.shade(lambda l: l.rect(0, 600, W, 1400, fill=(220, 222, 225), w=0), 0.3, blur=80)


def _porao(c):
    rnd = random.Random(81)
    c.rect(0, 0, W, H, fill=(50, 40, 40), w=0)
    for row in range(0, 1300, 70):
        off = 0 if (row // 70) % 2 else 60
        for x in range(-60, W, 120):
            col = rnd.choice([(110, 65, 52), (100, 58, 48), (120, 72, 58)])
            c.rect(x + off + 3, row + 3, x + off + 117, row + 67, fill=col, w=0, r=4)
            c.line([(x + off + 8, row + 10), (x + off + 60, row + 10)], fill=lighter(col, 0.15), w=3)
    # canos
    for y, col in ((120, (130, 130, 140)), (170, (150, 110, 70))):
        c.line([(0, y), (W, y)], fill=OUT, w=36)
        c.line([(0, y), (W, y)], fill=col, w=24)
        for x in range(100, W, 260):
            c.rect(x, y - 22, x + 26, y + 22, fill=darker(col, 0.8), w=4)
    # mapa e cartaz
    c.rect(90, 400, 470, 720, fill=(230, 215, 170), w=6)
    for i in range(6):
        c.line([(110 + rnd.uniform(0, 300), 420 + rnd.uniform(0, 280)), (110 + rnd.uniform(0, 330), 420 + rnd.uniform(0, 280))],
               fill=(200, 60, 50), w=4)
    c.circle(300, 560, 22, fill=None, outline=(220, 40, 40), w=6)
    c.rect(640, 420, 980, 700, fill=(30, 30, 35), w=6)
    c.text(810, 520, "RESISTÊNCIA", 40, fill=(255, 220, 60), black=True)
    c.text(810, 600, "HUMANA", 52, fill=(255, 255, 255), black=True)
    # caixas
    for x, y, w, h in ((40, 1040, 200, 160), (60, 900, 160, 140), (880, 1060, 180, 140)):
        c.rect(x, y, x + w, y + h, fill=(175, 135, 85), w=6)
        c.line([(x, y + h / 2), (x + w, y + h / 2)], fill=(150, 110, 65), w=6)
        c.line([(x + w / 2, y), (x + w / 2, y + h)], fill=(150, 110, 65), w=6)
    piso_ladrilho(c, 1300, (75, 70, 70), (85, 80, 80))
    c.rect(170, 1150, 910, 1230, fill=(120, 80, 50), w=7, r=8)
    c.line([(220, 1230), (220, 1500)], w=22)
    c.line([(860, 1230), (860, 1500)], w=22)
    luminaria(c, W / 2, 200, True, (255, 220, 140))
    c.shade(lambda l: l.rect(0, 0, W, H, fill=(0, 0, 0), w=0), 0.15)
    c.glow(W / 2, 700, 500, (255, 200, 120), 0.18)


def _servidores(c):
    rnd = random.Random(13)
    c.vgradient(0, 0, W, 1350, (10, 14, 28), (20, 26, 45))
    # cabos no teto
    for k in range(5):
        c.line([(x, 60 + k * 20 + 30 * math.sin(x / 120 + k)) for x in range(0, W + 1, 40)],
               fill=[(40, 120, 200), (200, 60, 60), (60, 180, 90), (220, 200, 60), (120, 120, 140)][k], w=6)
    for i, x in enumerate((10, 285, 560, 835)):
        c.poly([(x + 230, 210), (x + 262, 180), (x + 262, 1320), (x + 230, 1350)], fill=(28, 32, 48), w=5)
        c.rect(x, 210, x + 230, 1350, fill=(42, 48, 70), w=7, r=6)
        for y in range(250, 1320, 64):
            c.rect(x + 18, y, x + 212, y + 48, fill=(24, 28, 42), w=4, r=4)
            for j in range(5):
                col = rnd.choice([(80, 230, 255), (80, 255, 140), (255, 70, 70), (80, 230, 255)])
                c.circle(x + 36 + j * 20, y + 24, 5, fill=col, w=0)
            for j in range(4):
                c.line([(x + 140 + j * 16, y + 10), (x + 140 + j * 16, y + 38)], fill=(55, 62, 85), w=4)
        c.glow(x + 115, 780, 200, (60, 160, 255), 0.18)
    c.vgradient(0, 1350, W, H, (25, 30, 48), (35, 42, 62))
    for i in range(12):
        c.line([(i * 100, 1350), (i * 150 - 280, H)], fill=(45, 52, 75), w=4)
    yy, step = 1360, 24
    while yy < H:
        c.line([(0, yy), (W, yy)], fill=(45, 52, 75), w=3)
        yy += step
        step *= 1.3
    c.shade(lambda l: l.rect(0, 1360, W, 1700, fill=(60, 160, 255), w=0), 0.06, blur=30)


BACKGROUNDS = {
    "bandeira": _bandeira, "paulista": _paulista, "paulista_noite": lambda c: _paulista(c, True), "feira": _feira,
    "tv": _tv_estudio, "brasilia": _brasilia, "gabinete": _gabinete, "escola": _escola, "plenario": _plenario,
    "cofre": _cofre, "cidade_feliz": _cidade_feliz, "estadio": _estadio, "raios_laranja": _raios_lj,
    "raios_azul": _raios_azul, "raios_vermelho": _raios_vermelho, "raios_verde": _raios_verde, "escuro": _escuro,
    "aviao": _aviao, "mar": _mar_tempestade, "praia": _praia, "selva": _selva, "aldeia": _aldeia,
    "aldeia_noite": _aldeia_noite, "conves": _conves, "quarto": _quarto, "quarto_noite": _quarto_noite,
    "cidade_ia": _cidade_ia, "rua": _rua, "rua_cinza": _rua_cinza, "porao": _porao, "servidores": _servidores,
}

_mem = {}


def fundo(nome):
    """Retorna o fundo (RGB 1080x1920). Usa cache em disco e memória."""
    if nome in _mem:
        return _mem[nome]
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f"{nome}_{VERSAO}.png")
    if os.path.exists(path):
        img = Image.open(path).convert("RGB")
    else:
        c = Canvas(W, H, bg=(0, 0, 0, 255))
        BACKGROUNDS[nome](c)
        img = c.final().convert("RGB")
        img.save(path)
    _mem[nome] = img
    return img
