"""Objetos de cena. Cada prop é desenhado num canvas próprio com âncora na base-centro."""
import math
import random
from functools import lru_cache
from .canvas import Canvas, OUT, darker, lighter, star

CENSURA = "█"


def _texto_censurado(c, x, y, txt, size, fill, black=True):
    """Desenha texto; trechos entre [[ ]] viram tarja preta."""
    from .canvas import font
    parts = []
    rest = txt
    while "[[" in rest:
        a, b = rest.split("[[", 1)
        w, rest = b.split("]]", 1)
        parts += [(a, False), (w, True)]
    parts.append((rest, False))
    f = font(size, black)
    widths = [f.getlength(p) for p, _ in parts]
    total = sum(widths)
    cx = x - total / 2
    for (p, cens), wd in zip(parts, widths):
        if cens:
            c.rect(cx, y - size * 0.55, cx + wd, y + size * 0.5, fill=(10, 10, 10), w=0, r=6)
        else:
            c.text(cx, y, p, size, fill=fill, anchor="lm", black=black)
        cx += wd


def _celular(c, w, h, a):
    tela = a.get("cor", (30, 35, 60))
    c.rect(10, 10, w - 10, h - 10, fill=(30, 30, 35), r=40)
    c.rect(28, 50, w - 28, h - 50, fill=tela, r=14, w=4)
    txt = a.get("texto", "")
    size = a.get("tam", 48)
    for i, line in enumerate(txt.split("\n")):
        _texto_censurado(c, w / 2, h / 2 - (len(txt.split("\n")) - 1) * size * 0.6 + i * size * 1.2, line, size,
                         a.get("cor_texto", (255, 255, 255)))
    c.circle(w / 2, 30, 7, fill=(70, 70, 80), w=0)
    c.shade(lambda l: l.poly([(40, 60), (w * 0.55, 60), (40, h * 0.55)], fill=(255, 255, 255), w=0), 0.1)
    c.rect(w - 14, 140, w - 4, 220, fill=(50, 50, 55), w=3, r=3)


PROPS = {}


def prop(nome, w, h):
    def deco(fn):
        PROPS[nome] = (fn, w, h)
        return fn
    return deco


@prop("celular", 300, 560)
def p_celular(c, a, t):
    _celular(c, 300, 560, a)


@prop("tv", 900, 600)
def p_tv(c, a, t):
    c.rect(10, 10, 890, 540, fill=(30, 30, 35), r=26)
    c.rect(40, 40, 860, 510, fill=a.get("cor", (40, 120, 220)), r=8, w=5)
    txt = a.get("texto", "")
    size = a.get("tam", 120)
    lines = txt.split("\n")
    for i, line in enumerate(lines):
        _texto_censurado(c, 450, 275 - (len(lines) - 1) * size * 0.6 + i * size * 1.2, line, size,
                         a.get("cor_texto", (255, 255, 255)))
    c.shade(lambda l: l.poly([(40, 40), (420, 40), (40, 330)], fill=(255, 255, 255), w=0), 0.1)
    c.rect(400, 540, 500, 590, fill=(40, 40, 45), w=5)
    c.circle(840, 520, 7, fill=(80, 230, 120), w=0)


@prop("placa", 620, 760)
def p_placa(c, a, t):
    c.line([(310, 330), (310, 750)], fill=OUT, w=50)
    c.line([(310, 330), (310, 750)], fill=(140, 95, 55), w=34)
    c.poly([(20, 40), (600, 25), (590, 380), (30, 395)], fill=(190, 140, 80), w=8)
    for y in (120, 210, 300):
        c.line([(50, y), (570, y - 6)], fill=(165, 115, 65), w=4)
    lines = a.get("texto", "").split("\n")
    for i, line in enumerate(lines):
        _texto_censurado(c, 310, 115 + i * 95, line, a.get("tam", 64), (60, 30, 20))


@prop("caldeirao", 620, 560)
def p_caldeirao(c, a, t):
    # fogo animado
    for i in range(5):
        x = 140 + i * 85
        hh = 130 + 40 * math.sin(t * 14 + i * 1.7)
        c.poly([(x - 50, 540), (x, 540 - hh), (x + 50, 540)], fill=(250, 120, 30), w=5)
        c.poly([(x - 25, 540), (x, 540 - hh * 0.55), (x + 25, 540)], fill=(255, 220, 80), w=0)
    c.chord(310, 200, 270, 300, 0, 180, fill=(50, 50, 55), w=9)
    c.shade(lambda l: l.chord(250, 200, 180, 260, 90, 180, fill=(255, 255, 255), w=0), 0.15)
    c.ellipse(310, 205, 275, 60, fill=(70, 70, 75), w=9)
    c.ellipse(310, 205, 235, 42, fill=(120, 200, 120), w=6)
    for i in range(6):
        ph = (t * 1.6 + i * 0.37) % 1.0
        x = 160 + i * 60
        c.circle(x, 200 - ph * 150, 10 + ph * 16, fill=(160, 230, 160), w=4)


@prop("fogueira", 440, 440)
def p_fogueira(c, a, t):
    for i in range(4):
        x = 120 + i * 65
        hh = 210 + 50 * math.sin(t * 12 + i * 2.1)
        c.poly([(x - 60, 400), (x, 400 - hh), (x + 60, 400)], fill=(250, 110, 30), w=5)
        c.poly([(x - 30, 400), (x, 400 - hh * 0.55), (x + 30, 400)], fill=(255, 220, 80), w=0)
    c.line([(60, 430), (380, 380)], fill=OUT, w=40)
    c.line([(60, 430), (380, 380)], fill=(120, 75, 40), w=28)
    c.line([(60, 380), (380, 430)], fill=OUT, w=40)
    c.line([(60, 380), (380, 430)], fill=(140, 90, 50), w=28)


@prop("tigela", 360, 260)
def p_tigela(c, a, t):
    for i in range(3):
        x = 120 + i * 60
        ph = (t * 0.8 + i * 0.3) % 1.0
        c.line([(x, 90 - ph * 60), (x + 15 * math.sin(ph * 6), 40 - ph * 60)], fill=(255, 255, 255), w=6)
    c.chord(180, 120, 160, 130, 0, 180, fill=a.get("cor", (220, 60, 50)), w=8)
    c.ellipse(180, 122, 162, 32, fill=(250, 210, 120), w=7)
    for i in range(5):
        c.arc(110 + i * 34, 122, 18, 10, 180, 360, fill=(230, 180, 70), w=5)
    c.circle(230, 115, 22, fill=(255, 255, 255), w=4)
    c.circle(230, 115, 10, fill=(250, 190, 40), w=0)
    c.line([(250, 60), (350, 10)], w=10)
    c.line([(265, 70), (355, 30)], w=10)


@prop("pastel", 320, 200)
def p_pastel(c, a, t):
    c.chord(160, 170, 150, 140, 180, 360, fill=(240, 190, 90), w=8)
    for i in range(9):
        x = 30 + i * 32
        c.line([(x, 165), (x + 10, 148)], fill=(200, 140, 60), w=5)


@prop("miojo", 360, 300)
def p_miojo(c, a, t):
    c.rect(10, 20, 350, 290, fill=(240, 60, 50), r=24)
    c.rect(30, 50, 330, 120, fill=(250, 210, 40), r=12, w=5)
    c.text(180, 86, "MIOJO", 52, fill=(200, 30, 30), black=True)
    c.ellipse(180, 200, 110, 60, fill=(250, 220, 140), w=6)
    for i in range(5):
        c.arc(120 + i * 30, 200, 20, 12, 180, 360, fill=(220, 170, 80), w=5)


@prop("navio", 820, 560)
def p_navio(c, a, t):
    c.poly([(20, 330), (800, 330), (700, 520), (120, 520)], fill=(160, 40, 40), w=8)
    c.rect(120, 330, 700, 360, fill=(250, 250, 250), w=0)
    c.rect(260, 180, 600, 330, fill=(245, 245, 245), w=8)
    for i in range(5):
        c.circle(310 + i * 65, 250, 20, fill=(120, 200, 250), w=5)
    c.rect(440, 60, 520, 180, fill=(230, 180, 40), w=8)
    for i in range(3):
        ph = (t * 0.6 + i * 0.33) % 1.0
        c.circle(480 + ph * 80, 40 - ph * 80, 22 + ph * 26, fill=(220, 220, 225), w=4)


@prop("dinheiro", 520, 300)
def p_dinheiro(c, a, t):
    for row in range(4):
        for i in range(3 - row // 2):
            x = 40 + i * 150 + row * 30
            y = 230 - row * 55
            c.rect(x, y, x + 160, y + 60, fill=(90, 175, 95), w=5, r=6)
            c.circle(x + 80, y + 30, 16, fill=(60, 140, 70), w=3)


@prop("portal", 760, 760)
def p_portal(c, a, t):
    cores = [(80, 30, 160), (140, 60, 220), (90, 200, 255), (220, 240, 255)]
    for i, col in enumerate(cores):
        r = 360 - i * 80
        c.circle(380, 380, r, fill=col, w=6 if i == 0 else 0)
    for k in range(6):
        pts = []
        for i in range(30):
            ang = t * 4 + k * math.pi / 3 + i * 0.12
            rr = 340 - i * 10
            pts.append((380 + rr * math.cos(ang), 380 + rr * math.sin(ang)))
        c.line(pts, fill=(255, 255, 255), w=7)


@prop("bandeira_mastro", 360, 620)
def p_bandeira(c, a, t):
    c.line([(30, 20), (30, 610)], fill=(110, 80, 50), w=16)
    wave = 10 * math.sin(t * 6)
    tipo = a.get("tipo", "br")
    if tipo == "br":
        c.poly([(36, 30), (350, 30 + wave), (350, 230 + wave), (36, 230)], fill=(0, 150, 60), w=6)
        c.poly([(60, 130), (193, 50), (330, 130 + wave), (193, 210)], fill=(255, 210, 0), w=0)
        c.circle(193, 130, 50, fill=(20, 50, 140), w=0)
    else:
        c.poly([(36, 30), (350, 30 + wave), (350, 230 + wave), (36, 230)], fill=(250, 250, 250), w=6)
        c.circle(193, 130, 60, fill=(210, 30, 50), w=0)


@prop("laptop", 520, 380)
def p_laptop(c, a, t):
    c.rect(60, 10, 460, 300, fill=(60, 65, 80), r=18)
    c.rect(80, 30, 440, 280, fill=a.get("cor", (230, 240, 255)), r=6, w=4)
    txt = a.get("texto", "")
    for i, line in enumerate(txt.split("\n")):
        _texto_censurado(c, 260, 120 + i * 60, line, a.get("tam", 44), a.get("cor_texto", (40, 40, 60)))
    c.shade(lambda l: l.poly([(80, 30), (260, 30), (80, 200)], fill=(255, 255, 255), w=0), 0.12)
    c.poly([(20, 360), (500, 360), (460, 300), (60, 300)], fill=(150, 155, 170), w=7)
    for i in range(4):
        c.line([(90 + i * 8, 315 + i * 10), (430 - i * 8, 315 + i * 10)], fill=(120, 125, 140), w=3)


@prop("loading", 860, 300)
def p_loading(c, a, t):
    pct = a.get("pct", 0)
    if a.get("animado"):
        pct = min(99, int(a.get("de", 0) + (a.get("ate", 99) - a.get("de", 0)) * min(1, t / a.get("dur", 3))))
    c.rect(10, 10, 850, 290, fill=(20, 25, 40), r=24)
    c.text(430, 80, a.get("titulo", "PROCESSANDO..."), 48, fill=(80, 230, 255), black=True)
    c.rect(60, 150, 800, 230, fill=(40, 45, 65), r=14, w=5)
    c.rect(66, 156, 66 + 728 * pct / 100, 224, fill=(80, 230, 255) if pct < 90 else (255, 80, 80), r=10, w=0)
    c.text(430, 190, f"{pct}%", 50, fill=(255, 255, 255), stroke=3)


@prop("olho_ia", 900, 560)
def p_olho(c, a, t):
    c.ellipse(450, 280, 430, 250, fill=(30, 10, 15), w=10)
    c.ellipse(450, 280, 380, 210, fill=(70, 15, 25), w=0)
    pulse = 1 + 0.06 * math.sin(t * 5)
    c.circle(450, 280, 150 * pulse, fill=(220, 30, 40), w=8)
    c.circle(450, 280, 80 * pulse, fill=(255, 90, 90), w=0)
    c.circle(450, 280, 36, fill=(255, 230, 230), w=0)


@prop("carro", 520, 260)
def p_carro(c, a, t):
    cor = a.get("cor", (220, 60, 50))
    c.rect(20, 110, 500, 210, fill=cor, r=30)
    c.poly([(120, 115), (170, 30), (360, 30), (420, 115)], fill=cor, w=7)
    c.poly([(150, 110), (190, 50), (260, 50), (260, 110)], fill=(170, 220, 250), w=5)
    c.poly([(280, 110), (280, 50), (345, 50), (390, 110)], fill=(170, 220, 250), w=5)
    for x in (130, 390):
        c.circle(x, 215, 42, fill=(40, 40, 45), w=7)
        c.circle(x, 215, 16, fill=(180, 180, 190), w=4)
    c.circle(490, 150, 14, fill=(255, 240, 160), w=4)


@prop("semaforo", 160, 700)
def p_semaforo(c, a, t):
    c.line([(80, 300), (80, 690)], fill=OUT, w=26)
    c.line([(80, 300), (80, 690)], fill=(90, 90, 100), w=14)
    c.rect(20, 10, 140, 320, fill=(40, 40, 45), r=20)
    on = a.get("luz", "vermelho")
    for i, (nome, col) in enumerate((("vermelho", (255, 50, 50)), ("amarelo", (255, 200, 40)), ("verde", (60, 230, 90)))):
        c.circle(80, 65 + i * 95, 36, fill=col if on == nome else darker(col, 0.3), w=5)


@prop("lampada", 260, 360)
def p_lampada(c, a, t):
    pulse = 1 + 0.05 * math.sin(t * 8)
    for i in range(10):
        r = math.radians(i * 36)
        c.line([(130 + 110 * pulse * math.cos(r), 140 + 110 * pulse * math.sin(r)),
                (130 + 130 * pulse * math.cos(r), 140 + 130 * pulse * math.sin(r))], fill=(255, 220, 60), w=8)
    c.circle(130, 140, 85, fill=(255, 235, 110), w=8)
    c.rect(90, 220, 170, 300, fill=(170, 175, 185), w=7, r=8)
    c.line([(95, 250), (165, 250)], w=5)


@prop("relogio", 340, 340)
def p_relogio(c, a, t):
    c.circle(170, 170, 155, fill=(250, 250, 250), w=10)
    for i in range(12):
        r = math.radians(i * 30)
        c.line([(170 + 120 * math.cos(r), 170 + 120 * math.sin(r)), (170 + 138 * math.cos(r), 170 + 138 * math.sin(r))], w=6)
    ang = math.radians(-90 + t * 220)
    c.line([(170, 170), (170 + 110 * math.cos(ang), 170 + 110 * math.sin(ang))], w=10)
    c.line([(170, 170), (170 + 70 * math.cos(ang / 12 - 1.2), 170 + 70 * math.sin(ang / 12 - 1.2))], w=12)
    c.circle(170, 170, 14, fill=OUT, w=0)


@prop("balao", 760, 380)
def p_balao(c, a, t):
    c.ellipse(380, 160, 360, 150, fill=(255, 255, 255), w=8)
    tail = a.get("cauda", "esq")
    if tail == "esq":
        c.poly([(170, 270), (120, 370), (260, 290)], fill=(255, 255, 255), w=8)
    else:
        c.poly([(590, 270), (640, 370), (500, 290)], fill=(255, 255, 255), w=8)
    c.ellipse(380, 160, 352, 142, fill=(255, 255, 255), w=0)
    lines = a.get("texto", "").split("\n")
    size = a.get("tam", 70)
    for i, line in enumerate(lines):
        _texto_censurado(c, 380, 160 - (len(lines) - 1) * size * 0.6 + i * size * 1.2, line, size, (30, 25, 40))


@prop("briga", 700, 600)
def p_briga(c, a, t):
    rnd = random.Random(int(t * 12))
    for i in range(14):
        x = 350 + rnd.uniform(-220, 220)
        y = 320 + rnd.uniform(-180, 180)
        c.circle(x, y, rnd.uniform(70, 120), fill=(235, 235, 230), w=7)
    for i in range(6):
        x = 350 + rnd.uniform(-250, 250)
        y = 320 + rnd.uniform(-220, 220)
        kind = rnd.choice(["star", "hand", "leg"])
        if kind == "star":
            c.poly(star(x, y, 40, 18), fill=(255, 220, 40), w=5)
        elif kind == "hand":
            c.circle(x, y, 24, fill=(250, 214, 170), w=6)
        else:
            c.line([(x, y), (x + 60, y + 30)], fill=(245, 130, 30), w=26)


@prop("estrelas", 600, 600)
def p_estrelas(c, a, t):
    rnd = random.Random(4)
    for i in range(8):
        x, y = rnd.uniform(60, 540), rnd.uniform(60, 540)
        ph = math.sin(t * 6 + i)
        r = 26 + 16 * ph
        if r > 6:
            c.poly(star(x, y, r, r * 0.4, 4), fill=a.get("cor", (255, 230, 80)), w=4)


@prop("simbolo", 300, 340)
def p_simbolo(c, a, t):
    ch = a.get("txt", "!")
    c.text(150, 170, ch, 300, fill=a.get("cor", (255, 220, 40)), stroke=12, black=True)


@prop("texto", 1000, 300)
def p_texto(c, a, t):
    lines = a.get("txt", "").split("\n")
    size = a.get("tam", 150)
    for i, line in enumerate(lines):
        c.text(500, 150 - (len(lines) - 1) * size * 0.55 + i * size * 1.1, line, size, fill=a.get("cor", (255, 220, 40)),
               stroke=a.get("borda", 14), black=True)


@prop("bolacha", 380, 300)
def p_bolacha(c, a, t):
    c.rect(10, 30, 370, 280, fill=(60, 110, 200), r=30)
    c.rect(30, 50, 350, 120, fill=(250, 220, 60), r=12, w=5)
    c.text(190, 86, "???", 54, fill=(60, 110, 200), black=True)
    for i in range(3):
        c.circle(100 + i * 90, 200, 50, fill=(220, 170, 100), w=6)
        for j in range(4):
            c.circle(85 + i * 90 + (j % 2) * 30, 185 + (j // 2) * 30, 5, fill=(150, 100, 60), w=0)


@prop("pegadas", 600, 700)
def p_pegadas(c, a, t):
    for i in range(6):
        x = 220 + (i % 2) * 150
        y = 640 - i * 110
        c.ellipse(x, y, 40, 60, fill=(200, 160, 100), w=0)
        for j in range(5):
            c.circle(x - 36 + j * 18, y - 66, 10, fill=(200, 160, 100), w=0)


@prop("urna", 360, 420)
def p_urna(c, a, t):
    c.rect(20, 40, 340, 410, fill=(230, 230, 225), r=20)
    c.rect(50, 70, 310, 200, fill=(40, 60, 70), r=8, w=5)
    c.text(180, 135, "CONFIRMA", 40, fill=(80, 230, 120), black=True)
    for r in range(3):
        for k in range(3):
            c.rect(80 + k * 75, 230 + r * 55, 130 + k * 75, 270 + r * 55, fill=(40, 40, 45), r=6, w=3)
    c.rect(240, 345, 320, 395, fill=(60, 180, 80), r=8, w=4)


@prop("drone", 420, 220)
def p_drone(c, a, t):
    for x in (60, 360):
        c.line([(x, 70), (210, 120)], w=12)
        c.ellipse(x, 60, 70, 12 + 6 * abs(math.sin(t * 30)), fill=(200, 200, 210), w=5)
    c.rect(130, 90, 290, 180, fill=(60, 65, 80), r=26)
    c.circle(210, 140, 26, fill=(255, 50, 60), w=5)


PROP_ANIMADOS = {"caldeirao", "fogueira", "tigela", "navio", "portal", "bandeira_mastro", "loading", "olho_ia",
                 "lampada", "relogio", "briga", "estrelas", "drone"}


@lru_cache(maxsize=400)
def _render(nome, args, t_q, scale):
    fn, w, h = PROPS[nome]
    c = Canvas(w, h)
    fn(c, dict(args), t_q)
    return c.final(scale)


def sprite_prop(nome, args, t, scale):
    """Renderiza o prop. Props animados são quantizados a 15 fps."""
    t_q = round(t * 15) / 15 if nome in PROP_ANIMADOS else 0
    return _render(nome, args, t_q, scale)


def tamanho(nome):
    _, w, h = PROPS[nome]
    return w, h
