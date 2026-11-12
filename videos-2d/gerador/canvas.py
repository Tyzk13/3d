"""Tela de desenho com supersampling (desenha em 2x e reduz -> traço suave)."""
import math
from PIL import Image, ImageDraw, ImageFont

OUT = (28, 22, 36)          # cor do contorno (quase preto, igual desenho animado)
LW = 7                      # espessura padrão do contorno
SS = 2                      # fator de supersampling

FONT_BOLD = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FONT_BLACK = "/usr/share/fonts/opentype/inter/Inter-Black.otf"


def font(size, black=False):
    path = FONT_BLACK if black else FONT_BOLD
    try:
        return ImageFont.truetype(path, int(size))
    except OSError:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(size))


def mix(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))


def darker(c, f=0.75):
    return tuple(int(v * f) for v in c[:3])


def lighter(c, f=0.3):
    return mix(c[:3], (255, 255, 255), f)


class Canvas:
    """Coordenadas sempre em 1x; internamente desenha em SS x."""

    def __init__(self, w, h, bg=(0, 0, 0, 0), k=SS):
        self.w, self.h, self.k = int(w), int(h), k
        mode = "RGBA" if len(bg) == 4 else "RGB"
        self.img = Image.new(mode, (int(w * k), int(h * k)), bg)
        self.d = ImageDraw.Draw(self.img)

    # ---------- helpers ----------
    def _p(self, pts):
        k = self.k
        return [(x * k, y * k) for x, y in pts]

    def _w(self, w):
        return max(1, int(round(w * self.k)))

    # ---------- primitivas ----------
    def ellipse(self, cx, cy, rx, ry, fill=None, outline=OUT, w=LW):
        k = self.k
        box = [(cx - rx) * k, (cy - ry) * k, (cx + rx) * k, (cy + ry) * k]
        self.d.ellipse(box, fill=fill, outline=outline if w else None, width=self._w(w) if w else 0)

    def circle(self, cx, cy, r, fill=None, outline=OUT, w=LW):
        self.ellipse(cx, cy, r, r, fill, outline, w)

    def rect(self, x0, y0, x1, y1, fill=None, outline=OUT, w=LW, r=0):
        k = self.k
        box = [min(x0, x1) * k, min(y0, y1) * k, max(x0, x1) * k, max(y0, y1) * k]
        if r:
            self.d.rounded_rectangle(box, radius=r * k, fill=fill, outline=outline if w else None,
                                     width=self._w(w) if w else 0)
        else:
            self.d.rectangle(box, fill=fill, outline=outline if w else None, width=self._w(w) if w else 0)

    def poly(self, pts, fill=None, outline=OUT, w=LW):
        pts = self._p(pts)
        if fill is not None:
            self.d.polygon(pts, fill=fill)
        if w and outline is not None:
            self.d.line(pts + [pts[0]], fill=outline, width=self._w(w), joint="curve")
            r = self._w(w) / 2
            for x, y in pts:
                self.d.ellipse([x - r, y - r, x + r, y + r], fill=outline)

    def line(self, pts, fill=OUT, w=LW, round_caps=True):
        pts = self._p(pts)
        self.d.line(pts, fill=fill, width=self._w(w), joint="curve")
        if round_caps:
            r = self._w(w) / 2
            for x, y in (pts[0], pts[-1]):
                self.d.ellipse([x - r, y - r, x + r, y + r], fill=fill)

    def arc(self, cx, cy, rx, ry, a0, a1, fill=OUT, w=LW):
        """Arco desenhado como polilinha (ângulos em graus, 0 = direita, horário)."""
        n = max(8, int(abs(a1 - a0) / 6))
        pts = []
        for i in range(n + 1):
            a = math.radians(a0 + (a1 - a0) * i / n)
            pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
        self.line(pts, fill, w)

    def chord(self, cx, cy, rx, ry, a0, a1, fill, outline=OUT, w=LW):
        k = self.k
        box = [(cx - rx) * k, (cy - ry) * k, (cx + rx) * k, (cy + ry) * k]
        self.d.chord(box, a0, a1, fill=fill, outline=outline, width=self._w(w))

    def pieslice(self, cx, cy, rx, ry, a0, a1, fill, outline=None, w=0):
        k = self.k
        box = [(cx - rx) * k, (cy - ry) * k, (cx + rx) * k, (cy + ry) * k]
        self.d.pieslice(box, a0, a1, fill=fill, outline=outline, width=self._w(w) if w else 0)

    def text(self, x, y, s, size, fill=(255, 255, 255), anchor="mm", stroke=0, stroke_fill=OUT, black=False):
        f = font(size * self.k, black)
        self.d.text((x * self.k, y * self.k), s, font=f, fill=fill, anchor=anchor,
                    stroke_width=int(stroke * self.k), stroke_fill=stroke_fill)

    def vgradient(self, x0, y0, x1, y1, c_top, c_bot):
        k = self.k
        h = int((y1 - y0) * k)
        for i in range(h):
            c = mix(c_top, c_bot, i / max(1, h - 1))
            self.d.line([(x0 * k, y0 * k + i), (x1 * k, y0 * k + i)], fill=c)

    # ---------- camadas (sombras, luzes, transparência) ----------
    def layer(self):
        """Nova camada transparente do mesmo tamanho (desenhar com fill (0,0,0,0) apaga)."""
        return Canvas(self.w, self.h, bg=(0, 0, 0, 0), k=self.k)

    def merge(self, lay, opacity=1.0, blur=0):
        from PIL import ImageFilter
        im = lay.img
        if blur:
            im = im.filter(ImageFilter.GaussianBlur(blur * self.k))
        if opacity < 1.0:
            a = im.getchannel("A").point(lambda v: int(v * opacity))
            im = im.copy()
            im.putalpha(a)
        if self.img.mode != "RGBA":
            base = self.img.convert("RGBA")
            base.alpha_composite(im)
            self.img = base.convert(self.img.mode)
        else:
            self.img.alpha_composite(im)
        self.d = ImageDraw.Draw(self.img)

    def glow(self, cx, cy, r, color, opacity=0.5, ry=None):
        """Brilho suave (luz de lâmpada, sol, tocha)."""
        lay = self.layer()
        lay.ellipse(cx, cy, r, ry or r, fill=tuple(color[:3]) + (255,), w=0)
        self.merge(lay, opacity, blur=r * 0.45)

    def shade(self, draw_fn, opacity=0.3, blur=0):
        """Desenha algo numa camada e mistura com opacidade (sombras/realces)."""
        lay = self.layer()
        draw_fn(lay)
        self.merge(lay, opacity, blur)

    # ---------- saída ----------
    def final(self, scale=1.0):
        w = max(1, int(self.w * scale))
        h = max(1, int(self.h * scale))
        return self.img.resize((w, h), Image.LANCZOS)


def star(cx, cy, r1, r2, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        r = r1 if i % 2 == 0 else r2
        a = math.radians(rot + i * 180 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts
