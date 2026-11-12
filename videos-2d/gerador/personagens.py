"""Personagens no estilo 'cabeça redonda' (desenho 2D com contorno grosso)."""
import math
from functools import lru_cache
from .canvas import Canvas, OUT, LW, darker, lighter, star

SKIN = {
    "clara": (250, 214, 170),
    "media": (226, 178, 128),
    "morena": (186, 128, 84),
    "escura": (128, 84, 58),
}

SW, SH = 520, 720           # tamanho do sprite (1x)
FX, FY = 260, 700           # posição dos pés no sprite
HX, HY, HR = 260, 250, 120  # cabeça


def P(**kw):
    """Cria a especificação de um personagem com valores padrão."""
    base = dict(pele="media", cabelo="espetado", cor_cabelo=(92, 54, 30), roupa="camiseta",
                cor_roupa=(200, 50, 50), cor_calca=(40, 40, 60), acessorios=(), robo=False,
                olho_robo=(80, 230, 255))
    base.update(kw)
    base["acessorios"] = tuple(base["acessorios"])
    return tuple(sorted(base.items()))


# ---------------------------------------------------------------- cabelos
def _spiky(c, color, n=7, tip=1.38, fringe=True, start=192, end=348):
    pts = []
    total = n * 2
    for i in range(total + 1):
        a = math.radians(start + (end - start) * i / total)
        r = HR * (tip if i % 2 == 1 else 1.04)
        pts.append((HX + r * math.cos(a), HY + r * math.sin(a)))
    # franja
    fr = []
    xs = [HX + HR * 0.97, HX + HR * 0.6, HX + HR * 0.3, HX, HX - HR * 0.3, HX - HR * 0.6, HX - HR * 0.97]
    for j, x in enumerate(xs):
        y = HY - 30 if j % 2 == 0 else HY - 62
        if j in (0, len(xs) - 1):
            y = HY - 22
        fr.append((x, y + (14 if fringe and j % 2 == 0 else 0)))
    c.poly(pts + fr, fill=color)
    return pts + fr


def _cap_hair(c, color):
    pts = []
    for i in range(31):
        a = math.radians(185 + 170 * i / 30)
        pts.append((HX + (HR + 6) * math.cos(a), HY + (HR + 6) * math.sin(a)))
    for i in range(21):
        t = i / 20
        x = HX + HR * 1.0 - t * HR * 2.0
        y = HY - 42 - 18 * math.sin(math.pi * t)
        pts.append((x, y))
    c.poly(pts, fill=color)
    return pts


def _curly(c, color):
    for i in range(11):
        a = math.radians(180 + 180 * i / 10)
        c.circle(HX + (HR + 4) * math.cos(a), HY + (HR + 4) * math.sin(a) + 6, 34, fill=color)
    c.chord(HX, HY, HR + 4, HR + 4, 180, 360, fill=color, w=0)
    c.ellipse(HX, HY - 52, HR * 0.92, 22, fill=color, w=0)


def _long_back(c, color):
    c.rect(HX - HR * 1.12, HY - 40, HX + HR * 1.12, HY + HR * 1.45, fill=color, r=60)


def _hair_detail(c, pts, color):
    """Sombra embaixo do cabelo + mechas de brilho + contorno refeito."""
    if not pts:
        return

    def sombra(l):
        l.poly(pts, fill=darker(color, 0.6), w=0)
        l.poly([(x, y - 18) for x, y in pts], fill=(0, 0, 0, 0), w=0)
    c.shade(sombra, 0.75)
    hl = lighter(color, 0.45)

    def brilho(l):
        l.arc(HX - 10, HY - 40, 82, 62, 205, 245, fill=hl, w=9)
        l.arc(HX - 10, HY - 40, 66, 50, 210, 240, fill=hl, w=6)
        l.arc(HX + 20, HY - 50, 70, 50, 280, 300, fill=hl, w=7)
    c.shade(brilho, 0.6)
    c.poly(pts, fill=None)


def _head(c, skin, orelhas=True):
    if orelhas:
        for sx in (-1, 1):
            c.ellipse(HX + sx * (HR - 4), HY + 22, 24, 30, fill=skin)
            c.arc(HX + sx * (HR - 2), HY + 22, 10, 14, 90 + sx * 90 - 60, 90 + sx * 90 + 60, fill=darker(skin, 0.7), w=4)
    c.circle(HX, HY, HR, fill=skin)

    def sombra(l):
        l.circle(HX, HY, HR - 4, fill=darker(skin, 0.78), w=0)
        l.circle(HX - 26, HY - 32, HR + 6, fill=(0, 0, 0, 0), w=0)
    c.shade(sombra, 0.85)
    c.shade(lambda l: l.ellipse(HX - 50, HY - 64, 36, 20, fill=(255, 255, 255), w=0), 0.35, blur=5)


def _ground_shadow(c):
    c.shade(lambda l: l.ellipse(FX, FY - 4, 150, 24, fill=(0, 0, 0), w=0), 0.3, blur=7)


def _body_shade(c):
    def sombra(l):
        l.rect(HX - 92, 355, HX + 92, 585, fill=(0, 0, 0), w=0, r=58)
        l.rect(HX - 126, 340, HX + 58, 600, fill=(0, 0, 0, 0), w=0, r=58)
    c.shade(sombra, 0.2)
    c.shade(lambda l: l.ellipse(HX, 362, 70, 20, fill=(0, 0, 0), w=0), 0.22, blur=5)
    c.rect(HX - 92, 355, HX + 92, 585, fill=None, r=58)


# ---------------------------------------------------------------- rosto
def _eyes(c, expr, blink, dx=0):
    ex = [HX - 42 + dx, HX + 42 + dx]
    ey = HY + 8
    closed_happy = expr in ("feliz", "sorriso", "chorando_feliz", "risada")
    if expr in ("dormindo",) or (blink and not closed_happy and expr not in ("choque", "tonto")):
        for x in ex:
            c.line([(x - 15, ey), (x + 15, ey)], w=6)
        return
    if closed_happy:
        for x in ex:
            c.arc(x, ey + 8, 17, 15, 200, 340, w=6)
    elif expr == "chorando":
        for x in ex:
            c.arc(x, ey - 6, 16, 12, 20, 160, w=6)
    elif expr in ("choque", "medo"):
        for x in ex:
            c.circle(x, ey, 24, fill=(255, 255, 255), w=5)
            c.circle(x + dx * 0.3, ey + 2, 7, fill=OUT, w=0)
    elif expr == "tonto":
        for x in ex:
            c.line([(x - 13, ey - 13), (x + 13, ey + 13)], w=6)
            c.line([(x - 13, ey + 13), (x + 13, ey - 13)], w=6)
    elif expr == "apaixonado":
        for x in ex:
            c.circle(x - 8, ey - 4, 11, fill=(230, 40, 70), w=0)
            c.circle(x + 8, ey - 4, 11, fill=(230, 40, 70), w=0)
            c.poly([(x - 19, ey), (x + 19, ey), (x, ey + 20)], fill=(230, 40, 70), w=0)
    elif expr in ("convencido", "desconfiado"):
        for x in ex:
            c.ellipse(x, ey + 3, 10, 11, fill=OUT, w=0)
            c.line([(x - 18, ey - 6), (x + 18, ey - 6)], w=6)
    else:
        for x in ex:
            c.ellipse(x, ey, 11, 15, fill=OUT, w=0)
            c.circle(x + 3, ey - 6, 4, fill=(255, 255, 255), w=0)
            c.circle(x - 4, ey + 6, 2, fill=(255, 255, 255), w=0)

    # sobrancelhas
    by = ey - 38
    if expr in ("raiva", "determinado"):
        c.line([(ex[0] - 22, by - 6), (ex[0] + 18, by + 10)], w=8)
        c.line([(ex[1] + 22, by - 6), (ex[1] - 18, by + 10)], w=8)
    elif expr in ("triste", "medo", "chorando"):
        c.line([(ex[0] - 20, by + 8), (ex[0] + 16, by - 6)], w=6)
        c.line([(ex[1] + 20, by + 8), (ex[1] - 16, by - 6)], w=6)
    elif expr in ("choque",):
        c.arc(ex[0], by - 6, 16, 8, 200, 340, w=6)
        c.arc(ex[1], by - 6, 16, 8, 200, 340, w=6)
    elif expr in ("pensando", "desconfiado"):
        c.line([(ex[0] - 18, by + 4), (ex[0] + 16, by + 4)], w=6)
        c.arc(ex[1], by - 2, 18, 10, 200, 340, w=6)


def _mouth(c, expr, talk):
    mx, my = HX, HY + 62
    red = (150, 40, 50)
    if talk:
        if expr in ("raiva",):
            c.rect(mx - 26, my - 12, mx + 26, my + 14, fill=(255, 255, 255), r=6, w=6)
            c.line([(mx - 26, my + 1), (mx + 26, my + 1)], w=4)
        elif expr in ("medo", "triste"):
            c.ellipse(mx, my + 4, 18, 14, fill=red, w=6)
        else:
            c.ellipse(mx, my + 2, 22, 20, fill=red, w=6)
            c.ellipse(mx, my + 12, 12, 6, fill=(230, 110, 120), w=0)
        return
    if expr in ("feliz", "chorando_feliz", "apaixonado"):
        c.chord(mx, my - 14, 30, 28, 0, 180, fill=red, w=6)
    elif expr in ("sorriso", "risada", "determinado"):
        c.chord(mx, my - 18, 40, 36, 0, 180, fill=red, w=6)
        c.chord(mx, my - 18, 30, 12, 0, 180, fill=(255, 255, 255), w=0)
    elif expr in ("triste", "chorando"):
        c.arc(mx, my + 18, 24, 16, 200, 340, w=6)
    elif expr in ("choque",):
        c.ellipse(mx, my + 6, 16, 22, fill=red, w=6)
    elif expr in ("medo",):
        pts = [(mx - 30 + i * 7.5, my + (6 if i % 2 else -2)) for i in range(9)]
        c.line(pts, w=6)
    elif expr in ("raiva",):
        c.arc(mx, my + 16, 26, 14, 210, 330, w=7)
    elif expr in ("convencido",):
        c.arc(mx + 8, my - 6, 26, 14, 20, 150, w=6)
    elif expr in ("pensando", "desconfiado"):
        c.line([(mx - 18, my + 4), (mx + 14, my - 2)], w=6)
    elif expr == "dormindo":
        c.circle(mx, my + 4, 9, fill=red, w=5)
    elif expr == "tonto":
        pts = [(mx - 26 + i * 6.5, my + (5 if i % 2 else -5)) for i in range(9)]
        c.line(pts, w=6)
    else:
        c.arc(mx, my - 6, 20, 12, 30, 150, w=6)


def _face_extras(c, expr):
    if expr in ("medo", "choque", "pensando"):
        # gota de suor
        x, y = HX + HR * 0.82, HY - 58
        c.poly([(x, y - 26), (x - 13, y), (x, y + 12), (x + 13, y)], fill=(140, 210, 255), w=4)
    if expr in ("chorando", "chorando_feliz", "triste"):
        for sx in (-1, 1):
            x = HX + sx * 42
            if expr == "triste":
                c.ellipse(x + sx * 6, HY + 40, 7, 11, fill=(120, 200, 255), w=3)
            else:
                c.poly([(x - 10, HY + 22), (x + 10, HY + 22), (x + 14 * sx + 6, HY + 110), (x + 14 * sx - 12, HY + 110)],
                       fill=(120, 200, 255), w=3)
    forte = expr in ("apaixonado", "feliz", "sorriso", "risada", "chorando_feliz")

    def blush(l):
        for sx in (-1, 1):
            l.ellipse(HX + sx * 72, HY + 42, 22, 12, fill=(240, 110, 120), w=0)
    c.shade(blush, 0.6 if forte else 0.28, blur=3)
    if expr == "raiva":
        x, y = HX + 70, HY - 80
        for a in (0, 90, 180, 270):
            r = math.radians(a + 45)
            c.line([(x + 6 * math.cos(r), y + 6 * math.sin(r)), (x + 20 * math.cos(r), y + 20 * math.sin(r))],
                   fill=(220, 40, 40), w=6)


# ---------------------------------------------------------------- corpo
SHOULDER_Y = 395


def _arm(c, x0, y0, x1, y1, sleeve, skin, elbow=None):
    pts = [(x0, y0)] + ([elbow] if elbow else []) + [(x1, y1)]
    c.line(pts, fill=OUT, w=34)
    c.line(pts, fill=sleeve, w=20)
    c.circle(x1, y1, 19, fill=skin, w=6)


def _arms(c, pose, sleeve, skin, layer):
    L, R = HX - 82, HX + 82
    y = SHOULDER_Y
    if pose == "jutsu":
        if layer == "front":
            _arm(c, L, y, HX - 10, 445, sleeve, skin, elbow=(L - 40, 480))
            _arm(c, R, y, HX + 10, 445, sleeve, skin, elbow=(R + 40, 480))
        return
    if pose == "segurando":
        if layer == "front":
            _arm(c, L, y, HX - 40, 490, sleeve, skin, elbow=(L - 18, 470))
            _arm(c, R, y, HX + 40, 490, sleeve, skin, elbow=(R + 18, 470))
        return
    if layer != "back":
        return
    if pose == "bracos_cima":
        _arm(c, L, y, L - 80, 230, sleeve, skin, elbow=(L - 60, 320))
        _arm(c, R, y, R + 80, 230, sleeve, skin, elbow=(R + 60, 320))
    elif pose == "acenando":
        _arm(c, L, y, L - 30, 535, sleeve, skin)
        _arm(c, R, y, R + 90, 250, sleeve, skin, elbow=(R + 70, 340))
    elif pose == "apontando":
        _arm(c, L, y, L - 30, 535, sleeve, skin)
        _arm(c, R, y, R + 175, 380, sleeve, skin, elbow=(R + 80, 400))
    elif pose == "cintura":
        _arm(c, L, y, L + 2, 520, sleeve, skin, elbow=(L - 55, 465))
        _arm(c, R, y, R - 2, 520, sleeve, skin, elbow=(R + 55, 465))
    elif pose == "jutsu":
        _arm(c, L, y, HX - 8, 440, sleeve, skin, elbow=(L - 40, 470))
        _arm(c, R, y, HX + 8, 440, sleeve, skin, elbow=(R + 40, 470))
    else:  # parado
        _arm(c, L, y, L - 28, 540, sleeve, skin)
        _arm(c, R, y, R + 28, 540, sleeve, skin)


def _torso(c, s, skin):
    roupa, cor = s["roupa"], s["cor_roupa"]
    x0, x1, y0, y1 = HX - 92, HX + 92, 355, 585
    if roupa == "tribal":
        c.rect(x0 + 8, y0, x1 - 8, y1 - 10, fill=skin, r=60)
        # saia de folhas
        for i in range(9):
            x = x0 + 4 + i * 23
            c.poly([(x, y1 - 50), (x + 26, y1 - 50), (x + 13, y1 + 30)], fill=(70, 160, 70) if i % 2 else (50, 130, 60), w=4)
        c.rect(x0 + 4, y1 - 62, x1 - 4, y1 - 42, fill=(140, 90, 50), w=5, r=6)
        # pintura
        c.line([(HX - 40, 420), (HX - 10, 450)], fill=(240, 240, 240), w=7)
        c.line([(HX + 40, 420), (HX + 10, 450)], fill=(240, 240, 240), w=7)
        return
    if roupa == "robo":
        c.rect(x0, y0, x1, y1, fill=(170, 180, 195), r=26)
        c.rect(HX - 52, 410, HX + 52, 500, fill=(60, 70, 90), r=10, w=5)
        for i, col in enumerate([(255, 80, 80), (80, 230, 120), (80, 200, 255)]):
            c.circle(HX - 30 + i * 30, 440, 9, fill=col, w=3)
        c.line([(HX - 36, 475), (HX + 36, 475)], fill=(80, 230, 255), w=5)
        return
    c.rect(x0, y0, x1, y1, fill=cor, r=58)
    if roupa == "camiseta":
        c.arc(HX, y0 + 6, 34, 26, 20, 160, w=6)
    elif roupa == "xadrez":
        dk = darker(cor, 0.6)
        for i in range(1, 6):
            c.line([(x0 + i * 31, y0 + 14), (x0 + i * 31, y1 - 12)], fill=dk, w=4, round_caps=False)
        for j in range(1, 6):
            c.line([(x0 + 12, y0 + j * 38), (x1 - 12, y0 + j * 38)], fill=dk, w=4, round_caps=False)
        c.rect(x0, y0, x1, y1, fill=None, r=58)
    elif roupa == "jaqueta":   # jaqueta laranja do ninja
        c.rect(x0, y0, x1, y0 + 60, fill=(40, 50, 80), r=30)
        c.line([(HX, y0 + 30), (HX, y1 - 6)], fill=(250, 250, 250), w=8, round_caps=False)
        c.line([(HX, y0 + 30), (HX, y1 - 6)], fill=OUT, w=3, round_caps=False)
        c.rect(x0, y0, x1, y1, fill=None, r=58)
    elif roupa == "terno":
        c.poly([(HX - 34, y0 + 4), (HX + 34, y0 + 4), (HX, y0 + 95)], fill=(250, 250, 250), w=5)
        c.poly([(HX - 9, y0 + 14), (HX + 9, y0 + 14), (HX + 13, y0 + 92), (HX, y0 + 110), (HX - 13, y0 + 92)],
               fill=s.get("cor_gravata", (200, 30, 40)), w=4)
        c.line([(HX - 34, y0 + 4), (HX - 6, y0 + 130)], w=5)
        c.line([(HX + 34, y0 + 4), (HX + 6, y0 + 130)], w=5)
    elif roupa == "chef":
        for j in range(4):
            c.circle(HX - 24, y0 + 50 + j * 40, 7, fill=(200, 200, 200), w=3)
            c.circle(HX + 24, y0 + 50 + j * 40, 7, fill=(200, 200, 200), w=3)
    elif roupa == "piloto":
        c.poly([(HX - 30, y0 + 4), (HX + 30, y0 + 4), (HX, y0 + 70)], fill=(250, 250, 250), w=5)
        c.poly([(HX - 8, y0 + 12), (HX + 8, y0 + 12), (HX + 10, y0 + 80), (HX - 10, y0 + 80)], fill=(30, 40, 80), w=4)
        for sx in (-1, 1):
            c.rect(HX + sx * 70 - 22, y0 + 18, HX + sx * 70 + 22, y0 + 34, fill=(240, 200, 60), w=4, r=4)
    elif roupa == "moletom":
        c.chord(HX, y0 + 10, 58, 40, 0, 180, fill=darker(cor, 0.8), w=5)
        c.line([(HX - 18, y0 + 40), (HX - 22, y0 + 100)], fill=(250, 250, 250), w=5)
        c.line([(HX + 18, y0 + 40), (HX + 22, y0 + 100)], fill=(250, 250, 250), w=5)
        c.rect(HX - 55, y1 - 85, HX + 55, y1 - 30, fill=darker(cor, 0.85), w=5, r=14)
    elif roupa == "camiseta_b":
        c.text(HX, 455, "B", 90, fill=(232, 182, 40), stroke=4, black=True)


def _legs(c, s):
    calca = s["cor_calca"]
    if s["roupa"] == "tribal":
        calca = None
    for sx in (-1, 1):
        x = HX + sx * 42
        if calca:
            c.line([(x, 560), (x, 668)], fill=OUT, w=40, round_caps=False)
            c.line([(x, 560), (x, 666)], fill=calca, w=26, round_caps=False)
        else:
            c.line([(x, 590), (x, 668)], fill=OUT, w=14)
        if calca:
            c.line([(x - sx * 9, 572), (x - sx * 9, 660)], fill=darker(calca, 0.72), w=6, round_caps=False)
        if s["robo"]:
            c.ellipse(x + sx * 10, 680, 36, 18, fill=(120, 130, 145), w=6)
            continue
        tenis = s.get("cor_tenis", (60, 65, 85))
        c.ellipse(x + sx * 12, 678, 38, 19, fill=tenis, w=6)
        c.chord(x + sx * 12, 680, 38, 17, 0, 180, fill=(250, 250, 250), w=5)
        c.line([(x + sx * 12 - 12, 668), (x + sx * 12 + 4, 664)], fill=(250, 250, 250), w=4)
        c.line([(x + sx * 12 - 8, 676), (x + sx * 12 + 8, 672)], fill=(250, 250, 250), w=4)


# ---------------------------------------------------------------- acessórios
def _acc_back(c, s):
    acc = s["acessorios"]
    if "coroa_folhas" in acc:
        for i in range(9):
            a = math.radians(205 + i * 16.25)
            x, y = HX + 150 * math.cos(a), HY - 10 + 150 * math.sin(a)
            c.poly([(HX + 95 * math.cos(a - 0.12), HY - 10 + 95 * math.sin(a - 0.12)),
                    (x + 30 * math.cos(a), y + 30 * math.sin(a)),
                    (HX + 95 * math.cos(a + 0.12), HY - 10 + 95 * math.sin(a + 0.12))],
                   fill=(70, 170, 80) if i % 2 else (50, 140, 65), w=5)
    if "cocar" in acc:
        cols = [(230, 60, 50), (250, 190, 40), (60, 160, 230), (60, 180, 90)]
        for i in range(11):
            a = math.radians(200 + i * 14)
            x, y = HX + 170 * math.cos(a), HY - 20 + 170 * math.sin(a)
            ang = math.degrees(a)
            col = cols[i % 4]
            # pena como elipse rotacionada aproximada por polígono
            pts = []
            for j in range(16):
                t = math.radians(j * 360 / 16)
                px, py = 70 * math.cos(t), 20 * math.sin(t)
                rr = math.radians(ang)
                pts.append((x + px * math.cos(rr) - py * math.sin(rr), y + px * math.sin(rr) + py * math.cos(rr)))
            c.poly(pts, fill=col, w=5)
    if "capa" in acc:
        c.poly([(HX - 85, 380), (HX + 85, 380), (HX + 140, 660), (HX - 140, 660)], fill=s.get("cor_capa", (180, 30, 40)), w=6)


def _acc_head(c, s):
    acc = s["acessorios"]
    if "bandana_ninja" in acc:
        top, bot = HY - 66, HY - 30
        xt = math.sqrt(HR ** 2 - (top - HY) ** 2)
        xb = math.sqrt(HR ** 2 - (bot - HY) ** 2)
        c.poly([(HX - xt, top), (HX + xt, top), (HX + xb + 2, bot), (HX - xb - 2, bot)], fill=(30, 40, 90), w=6)
        c.rect(HX - 46, top - 6, HX + 46, bot + 6, fill=(200, 205, 215), w=6, r=8)
        # espiral simples
        pts = []
        for i in range(40):
            t = i / 39 * 4.2 * math.pi
            r = 2 + t * 1.25
            pts.append((HX + r * math.cos(t), (top + bot) / 2 + r * math.sin(t) * 0.8))
        c.line(pts, w=4)
        # pontas da bandana
        c.line([(HX + HR - 4, HY - 40), (HX + HR + 50, HY - 10), (HX + HR + 70, HY + 30)], fill=OUT, w=20)
        c.line([(HX + HR - 4, HY - 40), (HX + HR + 50, HY - 10), (HX + HR + 70, HY + 30)], fill=(30, 40, 90), w=10)
    if "bigodes" in acc:
        for sx in (-1, 1):
            for j in range(3):
                y = HY + 28 + j * 15
                c.line([(HX + sx * 62, y), (HX + sx * 96, y + (j - 1) * 5)], w=4)
    if "oculos" in acc:
        for sx in (-1, 1):
            c.circle(HX + sx * 42, HY + 8, 26, fill=None, w=6)
        c.line([(HX - 16, HY + 6), (HX + 16, HY + 6)], w=6)
    if "curativo" in acc:
        c.rect(HX - 62, HY - 40, HX - 22, HY - 20, fill=(240, 200, 160), w=4, r=6)
    if "pintura" in acc:
        for sx in (-1, 1):
            for j in range(2):
                c.line([(HX + sx * 60, HY + 28 + j * 18), (HX + sx * 92, HY + 28 + j * 18)], fill=(240, 240, 240), w=7)
        c.line([(HX, HY - 85), (HX, HY - 40)], fill=(220, 50, 50), w=9)
    if "chapeu_chef" in acc:
        c.rect(HX - 85, HY - 130, HX + 85, HY - 80, fill=(250, 250, 250), w=6, r=8)
        for dx in (-55, 0, 55):
            c.circle(HX + dx, HY - 160, 52, fill=(250, 250, 250), w=6)
        c.rect(HX - 80, HY - 160, HX + 80, HY - 86, fill=(250, 250, 250), w=0)
    if "quepe" in acc:
        c.chord(HX, HY - 70, 112, 70, 180, 360, fill=(30, 40, 80), w=6)
        c.rect(HX - 120, HY - 76, HX + 130, HY - 58, fill=(20, 25, 50), w=6, r=8)
        c.circle(HX, HY - 110, 14, fill=(240, 200, 60), w=4)
    if "coroa" in acc:
        c.poly([(HX - 70, HY - 105), (HX - 80, HY - 175), (HX - 35, HY - 135),
                                                  (HX, HY - 190), (HX + 35, HY - 135), (HX + 80, HY - 175),
                                                  (HX + 70, HY - 105)], fill=(250, 200, 40), w=6)
    if "fone" in acc:
        c.arc(HX, HY - 10, HR + 14, HR + 10, 190, 350, w=14)
        for sx in (-1, 1):
            c.rect(HX + sx * (HR + 8) - 18, HY - 20, HX + sx * (HR + 8) + 18, HY + 40, fill=(60, 60, 70), w=6, r=10)
    if "gorro" in acc:
        c.chord(HX, HY - 20, HR + 8, HR + 6, 180, 360, fill=s.get("cor_gorro", (40, 40, 60)), w=6)
        c.rect(HX - HR - 10, HY - 50, HX + HR + 10, HY - 10, fill=darker(s.get("cor_gorro", (40, 40, 60)), 0.8), w=6, r=12)


def _acc_body(c, s):
    acc = s["acessorios"]
    if "faixa" in acc:   # faixa presidencial verde e amarela
        pts = [(HX - 92, 380), (HX - 52, 365), (HX + 92, 545), (HX + 70, 580)]
        c.poly(pts, fill=(0, 150, 70), w=6)
        c.poly([(HX - 72, 384), (HX - 58, 378), (HX + 82, 552), (HX + 72, 562)], fill=(250, 210, 40), w=0)
        c.circle(HX + 72, 560, 22, fill=(250, 210, 40), w=5)
    if "colar_osso" in acc:
        for i in range(7):
            a = math.radians(30 + i * 20)
            x, y = HX + 70 * math.cos(a), 360 + 40 * math.sin(a)
            c.rect(x - 12, y - 6, x + 12, y + 6, fill=(245, 240, 225), w=4, r=5)
    if "medalha" in acc:
        c.circle(HX, 470, 22, fill=(250, 200, 40), w=5)


# ---------------------------------------------------------------- robô
def _robot(c, s, expr, blink, talk, pose):
    metal = (175, 185, 200)
    eye = s["olho_robo"]
    _arms(c, pose, (150, 160, 175), (120, 130, 145), "back")
    _legs(c, s)
    _torso(c, s, metal)
    _arms(c, pose, (150, 160, 175), (120, 130, 145), "front")
    # pescoço + cabeça
    c.rect(HX - 26, HY + 90, HX + 26, HY + 120, fill=(120, 130, 145), w=6)
    c.line([(HX, HY - 108), (HX, HY - 160)], w=8)
    c.circle(HX, HY - 170, 16, fill=(255, 70, 70), w=6)
    c.rect(HX - 125, HY - 110, HX + 125, HY + 105, fill=metal, r=46)
    c.shade(lambda l: (l.rect(HX - 121, HY - 106, HX + 121, HY + 101, fill=(40, 50, 70), w=0, r=44),
                       l.rect(HX - 150, HY - 135, HX + 90, HY + 70, fill=(0, 0, 0, 0), w=0, r=44)), 0.35)
    for sx in (-1, 1):
        for sy in (-1, 1):
            c.circle(HX + sx * 104, HY + sy * 88, 6, fill=(130, 140, 155), w=3)
    c.shade(lambda l: l.line([(HX - 100, HY - 80), (HX - 40, HY - 98)], fill=(255, 255, 255), w=10), 0.6)
    c.rect(HX - 98, HY - 60, HX + 98, HY + 40, fill=(25, 30, 45), r=26, w=6)
    for sx in (-1, 1):
        c.rect(HX + sx * 125 - (8 if sx > 0 else 18), HY - 30, HX + sx * 125 + (18 if sx > 0 else 8), HY + 30,
               fill=(120, 130, 145), w=5, r=6)
    ex = [HX - 45, HX + 45]
    if blink:
        for x in ex:
            c.line([(x - 20, HY - 8), (x + 20, HY - 8)], fill=eye, w=8)
    elif expr == "raiva":
        for i, x in enumerate(ex):
            sgn = 1 if i == 0 else -1
            c.poly([(x - 26, HY - 26 - 10 * sgn), (x + 26, HY - 26 + 10 * sgn), (x + 26, HY + 4), (x - 26, HY + 4)],
                   fill=eye, w=0)
    elif expr in ("tonto", "erro"):
        for x in ex:
            c.line([(x - 18, HY - 28), (x + 18, HY + 6)], fill=(255, 80, 80), w=8)
            c.line([(x - 18, HY + 6), (x + 18, HY - 28)], fill=(255, 80, 80), w=8)
    elif expr in ("feliz", "sorriso"):
        for x in ex:
            c.arc(x, HY - 2, 22, 18, 200, 340, fill=eye, w=8)
    else:
        for x in ex:
            c.ellipse(x, HY - 10, 22, 22, fill=eye, w=0)
            c.circle(x + 6, HY - 16, 6, fill=(255, 255, 255), w=0)
    # boca grade
    my = HY + 70
    if talk:
        c.rect(HX - 46, my - 14, HX + 46, my + 14, fill=eye, r=6, w=5)
    else:
        c.rect(HX - 46, my - 8, HX + 46, my + 8, fill=(60, 70, 90), r=4, w=5)
    for i in range(1, 5):
        c.line([(HX - 46 + i * 18.4, my - 10), (HX - 46 + i * 18.4, my + 10)], w=3, round_caps=False)


# ---------------------------------------------------------------- principal
@lru_cache(maxsize=500)
def sprite(spec, expr="neutro", blink=False, talk=False, pose="parado", scale=1.0, look=0):
    s = dict(spec)
    c = Canvas(SW, SH)
    if s["robo"]:
        _ground_shadow(c)
        _robot(c, s, expr, blink, talk, pose)
        return c.final(scale)
    skin = SKIN.get(s["pele"], s["pele"]) if isinstance(s["pele"], str) else s["pele"]
    sleeve = s["cor_roupa"] if s["roupa"] not in ("tribal",) else skin
    _ground_shadow(c)
    _acc_back(c, s)
    if s["cabelo"] == "longo":
        _long_back(c, s["cor_cabelo"])
    _arms(c, pose, sleeve, skin, "back")
    _legs(c, s)
    _torso(c, s, skin)
    if s["roupa"] != "tribal":
        _body_shade(c)
    _acc_body(c, s)
    _arms(c, pose, sleeve, skin, "front")
    # pescoço
    c.rect(HX - 22, HY + 100, HX + 22, HY + 130, fill=darker(skin, 0.82), w=6)
    # cabeça
    if "mascara" in s["acessorios"]:
        _head(c, skin, orelhas=False)
        wood = (150, 95, 50)
        c.ellipse(HX, HY + 6, 104, 124, fill=wood, w=7)
        for j in range(5):
            c.arc(HX + 30, HY + 10, 40 + j * 12, 70 + j * 10, 300, 360, fill=darker(wood, 0.8), w=3)
        c.shade(lambda l: (l.ellipse(HX, HY + 6, 100, 120, fill=(0, 0, 0), w=0),
                           l.ellipse(HX - 24, HY - 20, 104, 124, fill=(0, 0, 0, 0), w=0)), 0.3)
        for j in range(3):
            c.line([(HX - 70, HY - 60 + j * 22), (HX - 40, HY - 60 + j * 22)], fill=(245, 240, 230), w=7)
            c.line([(HX + 70, HY - 60 + j * 22), (HX + 40, HY - 60 + j * 22)], fill=(245, 240, 230), w=7)
        big = expr in ("choque", "medo", "feliz", "sorriso")
        for sx in (-1, 1):
            c.ellipse(HX + sx * 40, HY + 10, 24, 18 if not big else 24, fill=(20, 15, 15), w=5)
            if not blink:
                c.circle(HX + sx * 40, HY + 10, 7, fill=(255, 240, 160), w=0)
        mw = 44
        my = HY + 70
        c.rect(HX - mw, my - (18 if talk else 10), HX + mw, my + (18 if talk else 10), fill=(20, 15, 15), r=8, w=5)
        for i in range(6):
            x = HX - mw + 8 + i * 15
            c.poly([(x - 6, my - (18 if talk else 10)), (x + 6, my - (18 if talk else 10)), (x, my)], fill=(250, 250, 240), w=0)
        if "cabelo_mascara" in s["acessorios"]:
            pass
        if s["cabelo"] != "careca":
            _hair_detail(c, _spiky(c, s["cor_cabelo"], n=5, tip=1.25, fringe=False, start=200, end=340), s["cor_cabelo"])
        _acc_head(c, s)
        return c.final(scale)

    _head(c, skin)
    hair = s["cabelo"]
    hc = s["cor_cabelo"]
    pts = None
    if hair == "espetado":
        pts = _spiky(c, hc)
    elif hair == "ninja":
        pts = _spiky(c, hc, n=9, tip=1.55, start=180, end=360)
    elif hair in ("curto", "longo"):
        pts = _cap_hair(c, hc)
    elif hair == "cacheado":
        _curly(c, hc)
        c.shade(lambda l: [l.circle(HX - 40 + i * 30, HY - 95 + (i % 2) * 10, 8, fill=lighter(hc, 0.5), w=0)
                           for i in range(4)], 0.6)
    elif hair == "careca":
        c.shade(lambda l: l.arc(HX - 40, HY - 70, 26, 14, 200, 290, fill=(255, 255, 255), w=7), 0.7)
    if pts:
        _hair_detail(c, pts, hc)
    _face_extras_before = expr
    _eyes(c, expr, blink, look)
    _mouth(c, expr, talk)
    _face_extras(c, _face_extras_before)
    _acc_head(c, s)
    return c.final(scale)


# ---------------------------------------------------------------- elenco
NARUTO = P(pele="clara", cabelo="ninja", cor_cabelo=(252, 205, 50), roupa="jaqueta", cor_roupa=(245, 130, 30),
           cor_calca=(245, 130, 30), acessorios=("bandana_ninja", "bigodes"))
NARUTO_PRES = P(pele="clara", cabelo="ninja", cor_cabelo=(252, 205, 50), roupa="terno", cor_roupa=(40, 45, 60),
                cor_calca=(40, 45, 60), acessorios=("bandana_ninja", "bigodes", "faixa"), cor_gravata=(245, 130, 30))
VOCE = P(pele="media", cabelo="espetado", cor_cabelo=(110, 62, 30), roupa="xadrez", cor_roupa=(200, 40, 45),
         cor_calca=(40, 45, 70))
VOCE_CHEF = P(pele="media", cabelo="espetado", cor_cabelo=(110, 62, 30), roupa="chef", cor_roupa=(250, 250, 250),
              cor_calca=(40, 45, 70), acessorios=("chapeu_chef",))
VOCE_MOLETOM = P(pele="media", cabelo="espetado", cor_cabelo=(110, 62, 30), roupa="moletom", cor_roupa=(60, 90, 160),
                 cor_calca=(40, 45, 70))


def figurante(i, roupa="camiseta"):
    peles = ["clara", "media", "morena", "escura"]
    cabelos = ["curto", "cacheado", "longo", "espetado", "careca", "curto"]
    cores_c = [(40, 30, 25), (110, 62, 30), (230, 190, 90), (20, 20, 20), (150, 80, 40)]
    roupas = [(70, 130, 200), (90, 170, 100), (230, 180, 60), (160, 90, 180), (220, 90, 80), (80, 80, 90)]
    return P(pele=peles[i % 4], cabelo=cabelos[i % 6], cor_cabelo=cores_c[i % 5], roupa=roupa,
             cor_roupa=roupas[i % 6], cor_calca=(40 + (i * 13) % 40, 45, 70),
             acessorios=("oculos",) if i % 5 == 3 else ())


def politico(i):
    return P(pele=["clara", "media", "morena"][i % 3], cabelo=["careca", "curto", "curto"][i % 3],
             cor_cabelo=[(90, 90, 90), (40, 30, 25), (200, 200, 200)][i % 3], roupa="terno",
             cor_roupa=[(50, 50, 60), (70, 60, 50), (40, 50, 70)][i % 3], cor_calca=(45, 45, 55),
             acessorios=("oculos",) if i % 2 else (), cor_gravata=[(200, 30, 40), (40, 90, 200), (60, 140, 60)][i % 3])


def nativo(i):
    return P(pele=["morena", "media", "escura", "clara"][i % 4], cabelo=["espetado", "careca", "espetado"][i % 3],
             cor_cabelo=(30, 25, 20), roupa="tribal", cor_roupa=(0, 0, 0),
             acessorios=("mascara", "colar_osso"))


CHEFE = P(pele="media", cabelo="careca", cor_cabelo=(30, 25, 20), roupa="tribal", cor_roupa=(0, 0, 0),
          acessorios=("coroa_folhas", "colar_osso", "pintura"))
PILOTO = P(pele="clara", cabelo="careca", cor_cabelo=(90, 90, 90), roupa="piloto", cor_roupa=(245, 245, 245),
           cor_calca=(30, 40, 80), acessorios=("quepe",))
CAPITAO = P(pele="media", cabelo="careca", roupa="piloto", cor_roupa=(245, 245, 245), cor_calca=(30, 40, 80),
            acessorios=("quepe", "colar_osso"))
ROBO = P(robo=True, roupa="robo", olho_robo=(80, 230, 255))
ROBO_MAU = P(robo=True, roupa="robo", olho_robo=(255, 50, 60))
