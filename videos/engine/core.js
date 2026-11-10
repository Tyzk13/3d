// Núcleo do motor: matemática, câmera, primitivas 3D projetadas em canvas 2D e iluminação.
// Tudo é função pura do tempo: o mesmo quadro sempre sai igual (render em paralelo).

export const W = 1080, H = 1920;
export const TAU = Math.PI * 2;
export const NEAR = 0.06;
export const INK = '#17122b';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const ramp = (t, a, b) => clamp((t - a) / (b - a));
export const ease = {
  lin: (t) => clamp(t),
  io: smooth,
  out: (t) => 1 - Math.pow(1 - clamp(t), 3),
  in: (t) => Math.pow(clamp(t), 3),
  back: (t) => { t = clamp(t); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
export function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return s - Math.floor(s); }
export function noise(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57.31), hash(i + 1 + seed * 57.31), u) * 2 - 1;
}

// ---------- cor ----------
const _rgbCache = new Map();
export function rgb(c) {
  if (Array.isArray(c)) return c;
  let v = _rgbCache.get(c);
  if (!v) {
    let h = c.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    _rgbCache.set(c, v);
  }
  return v;
}
export const css = (c, a = 1) => {
  const [r, g, b] = rgb(c);
  const R = clamp(r, 0, 255) | 0, G_ = clamp(g, 0, 255) | 0, B = clamp(b, 0, 255) | 0;
  return a >= 1 ? `rgb(${R},${G_},${B})` : `rgba(${R},${G_},${B},${a})`;
};
export const mix = (a, b, t) => { a = rgb(a); b = rgb(b); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; };
export const shade = (c, k) => { c = rgb(c); return k > 1 ? mix(c, [255, 255, 255], Math.min(1, k - 1)) : [c[0] * k, c[1] * k, c[2] * k]; };
export const mul = (c, m) => { c = rgb(c); return [c[0] * m[0], c[1] * m[1], c[2] * m[2]]; };

// ---------- vetores ----------
export const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)],
};

// ---------- câmera ----------
// Mundo: x para a direita, y para cima, z para dentro da tela. Unidade: metro.
export function makeCam({ p, t, f = 45, roll = 0 }) {
  const fw = V.norm(V.sub(t, p));
  const rt = V.norm(V.cross([0, 1, 0], fw));
  const up = V.cross(fw, rt);
  const F = (H / 2) / Math.tan((f * Math.PI) / 360);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const cam = {
    p, t, f, fw, rt, up, F,
    toCam(q) {
      const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2];
      const x = dx * rt[0] + dy * rt[1] + dz * rt[2];
      const y = dx * up[0] + dy * up[1] + dz * up[2];
      const z = dx * fw[0] + dy * fw[1] + dz * fw[2];
      return [x * cr - y * sr, x * sr + y * cr, z];
    },
    proj(q) {
      const c = cam.toCam(q);
      if (c[2] < NEAR) return null;
      const s = F / c[2];
      return { x: W / 2 + c[0] * s, y: H / 2 - c[1] * s, s, z: c[2] };
    },
  };
  return cam;
}

function clipNear(pc) {
  const out = [];
  for (let i = 0; i < pc.length; i++) {
    const a = pc[i], b = pc[(i + 1) % pc.length];
    const ia = a[2] >= NEAR, ib = b[2] >= NEAR;
    if (ia) out.push(a);
    if (ia !== ib) {
      const t = (NEAR - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
    }
  }
  return out;
}

// ---------- contexto gráfico de um quadro ----------
export class G {
  constructor(ctx, cam, t, T, dur) {
    this.ctx = ctx; this.cam = cam;
    this.t = t;       // tempo dentro do plano (s)
    this.T = T;       // tempo global (s)
    this.dur = dur;   // duração do plano (s)
    this.shell = [];  // casca da sala (recebe o mapa de luz)
    this.backdrop = null; // fundo (céu) para cenas externas
    this.items = [];  // objetos ordenados por profundidade
    this.lights = []; // luzes pontuais
    this.shafts = []; // manchas de luz (polígonos no chão/parede)
    this.planes = []; // planos da casca da sala que recebem luz
    this.glows = [];  // desenhos aditivos depois da luz
    this.emits = [];  // partes emissivas da casca (vidros de janela…)
    this.ambient = [70, 76, 128];
    this.tint = null; // multiplicador de cor em vigor (objetos)
    this.fx = {};
  }

  // constrói o caminho de um polígono 3D; devolve a escala média (px/m) ou 0 se invisível
  path(pts, close = true) {
    const { cam, ctx } = this;
    let pc = pts.map(cam.toCam);
    if (close) pc = clipNear(pc);
    else pc = pc.filter((c) => c[2] >= NEAR);
    if (pc.length < (close ? 3 : 2)) return 0;
    ctx.beginPath();
    let ss = 0;
    for (let i = 0; i < pc.length; i++) {
      const s = cam.F / pc[i][2];
      const x = W / 2 + pc[i][0] * s, y = H / 2 - pc[i][1] * s;
      ss += s;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    if (close) ctx.closePath();
    return ss / pc.length;
  }

  col(c) { return this.tint ? css(mul(c, this.tint)) : css(c); }

  poly(pts, st = {}) {
    const { ctx } = this;
    const s = this.path(pts);
    if (!s) return;
    if (st.alpha != null) ctx.globalAlpha = st.alpha;
    if (st.fill) { ctx.fillStyle = st.raw ? css(st.fill) : this.col(st.fill); ctx.fill(); }
    if (st.stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = clamp((st.lw ?? 0.012) * s, 0.8, 30);
      ctx.strokeStyle = st.raw ? css(st.stroke) : this.col(st.stroke);
      ctx.stroke();
    }
    if (st.alpha != null) ctx.globalAlpha = 1;
  }

  line(a, b, st = {}) {
    const { ctx, cam } = this;
    let ca = cam.toCam(a), cb = cam.toCam(b);
    if (ca[2] < NEAR && cb[2] < NEAR) return;
    if (ca[2] < NEAR) { const t = (NEAR - ca[2]) / (cb[2] - ca[2]); ca = [lerp(ca[0], cb[0], t), lerp(ca[1], cb[1], t), NEAR]; }
    if (cb[2] < NEAR) { const t = (NEAR - cb[2]) / (ca[2] - cb[2]); cb = [lerp(cb[0], ca[0], t), lerp(cb[1], ca[1], t), NEAR]; }
    const sa = cam.F / ca[2], sb = cam.F / cb[2];
    ctx.beginPath();
    ctx.moveTo(W / 2 + ca[0] * sa, H / 2 - ca[1] * sa);
    ctx.lineTo(W / 2 + cb[0] * sb, H / 2 - cb[1] * sb);
    if (st.alpha != null) ctx.globalAlpha = st.alpha;
    ctx.lineCap = st.cap || 'round';
    ctx.lineWidth = clamp((st.lw ?? 0.012) * (sa + sb) / 2, 0.8, 40);
    ctx.strokeStyle = st.raw ? css(st.stroke || INK) : this.col(st.stroke || INK);
    ctx.stroke();
    if (st.alpha != null) ctx.globalAlpha = 1;
  }

  // caixa: (x, z) é o centro da base, y a base. ry gira em torno de y.
  // st: { c, top, stroke, lw, lit (false = sem luz), emit }
  box(x, y, z, w, h, d, st = {}) {
    const { cam } = this;
    const ry = st.ry || 0, cs = Math.cos(ry), sn = Math.sin(ry);
    const R = (lx, ly, lz) => [x + lx * cs + lz * sn, y + ly, z - lx * sn + lz * cs];
    const hw = w / 2, hd = d / 2;
    const c = [
      R(-hw, 0, -hd), R(hw, 0, -hd), R(hw, 0, hd), R(-hw, 0, hd),
      R(-hw, h, -hd), R(hw, h, -hd), R(hw, h, hd), R(-hw, h, hd),
    ];
    const N = (nx, ny, nz) => [nx * cs + nz * sn, ny, -nx * sn + nz * cs];
    const faces = [
      { i: [4, 5, 6, 7], n: N(0, 1, 0), k: 1.1, col: st.top },
      { i: [0, 1, 5, 4], n: N(0, 0, -1), k: 1.0, col: st.front },
      { i: [3, 0, 4, 7], n: N(-1, 0, 0), k: 0.86, col: st.side },
      { i: [1, 2, 6, 5], n: N(1, 0, 0), k: 0.8, col: st.side },
      { i: [2, 3, 7, 6], n: N(0, 0, 1), k: 0.7 },
      { i: [3, 2, 1, 0], n: N(0, -1, 0), k: 0.6 },
    ];
    const vis = [];
    for (const f of faces) {
      const pts = f.i.map((k) => c[k]);
      const ctr = [(pts[0][0] + pts[2][0]) / 2, (pts[0][1] + pts[2][1]) / 2, (pts[0][2] + pts[2][2]) / 2];
      if (V.dot(f.n, V.sub(cam.p, ctr)) <= 0) continue;
      vis.push({ f, pts, ctr });
    }
    const prevTint = this.tint;
    for (const { f, pts, ctr } of vis) {
      const base = shade(f.col || st.c || '#888', f.k);
      if (st.lit === false) this.tint = null;
      else this.tint = this.lit(V.add(ctr, V.mul(f.n, 0.05)), f.n);
      this.poly(pts, { fill: base, stroke: st.stroke === null ? null : (st.stroke || INK), lw: st.lw ?? 0.012 });
    }
    this.tint = prevTint;
  }

  // registra um objeto para desenhar em ordem de profundidade
  add(anchor, fn, opts = {}) {
    const c = this.cam.toCam(anchor);
    this.items.push({ z: c[2] + (opts.bias || 0), fn, fg: !!opts.fg, anchor });
  }

  // desenho 2D ancorado num ponto 3D: fn(ctx, escala px/m, ponto projetado)
  at(pos, fn) {
    const P = this.cam.proj(pos);
    if (!P) return;
    const { ctx } = this;
    ctx.save();
    ctx.translate(P.x, P.y);
    fn(ctx, P.s, P);
    ctx.restore();
  }

  light(pos, R, color, k = 1) { this.lights.push({ pos, R, color: rgb(color), k }); }

  // luz recebida num ponto (multiplicador por canal, 0..~1.2)
  lit(p, n) {
    const a = this.ambient;
    let r = a[0], g = a[1], b = a[2];
    for (const L of this.lights) {
      const dx = p[0] - L.pos[0], dy = p[1] - L.pos[1], dz = p[2] - L.pos[2];
      const d2 = (dx * dx + dy * dy + dz * dz) / (L.R * L.R);
      if (d2 >= 1) continue;
      let k = L.k * (1 - d2) * (1 - d2);
      if (n) {
        const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const nd = -(dx * n[0] + dy * n[1] + dz * n[2]) / dl;
        k *= 0.55 + 0.45 * clamp(nd, 0, 1);
      }
      r += L.color[0] * k; g += L.color[1] * k; b += L.color[2] * k;
    }
    return [Math.min(1.25, r / 255), Math.min(1.25, g / 255), Math.min(1.25, b / 255)];
  }
}

// ---------- mapa de luz da casca da sala ----------
// Cada plano (chão, paredes, teto) recebe discos concêntricos projetados em perspectiva.
export function drawLightmap(lc, g) {
  const { cam } = g;
  lc.setTransform(1, 0, 0, 1, 0, 0);
  lc.globalCompositeOperation = 'source-over';
  lc.filter = 'none';
  lc.fillStyle = css(g.ambient);
  lc.fillRect(0, 0, lc.canvas.width, lc.canvas.height);
  const k = lc.canvas.width / W;
  lc.setTransform(k, 0, 0, k, 0, 0);
  lc.globalCompositeOperation = 'lighter';
  const RINGS = 10, SEG = 28;
  for (const pl of g.planes) {
    // pl: { o: origem, u, v: eixos unitários no plano, n: normal, clip: [[u,v]…] opcional }
    lc.save();
    if (pl.quad) {
      const pc = clipNear(pl.quad.map(cam.toCam));
      if (pc.length < 3) { lc.restore(); continue; }
      lc.beginPath();
      pc.forEach((c, i) => { const s = cam.F / c[2]; const x = W / 2 + c[0] * s, y = H / 2 - c[1] * s; if (i) lc.lineTo(x, y); else lc.moveTo(x, y); });
      lc.closePath(); lc.clip();
    }
    for (const L of g.lights) {
      const rel = V.sub(L.pos, pl.o);
      const h = V.dot(rel, pl.n);
      if (h <= 0.01 || h >= L.R) continue;
      const cu = V.dot(rel, pl.u), cv = V.dot(rel, pl.v);
      const rmax = Math.sqrt(L.R * L.R - h * h);
      const I = (rho) => { const d2 = (rho * rho + h * h) / (L.R * L.R); return d2 >= 1 ? 0 : L.k * (1 - d2) * (1 - d2); };
      let prev = 0;
      for (let j = 0; j < RINGS; j++) {
        const rho = rmax * (1 - j / RINGS);
        const inner = rmax * (1 - (j + 1) / RINGS);
        const val = I((rho + inner) / 2);
        const dI = val - prev; prev = val;
        if (dI <= 0.002) continue;
        const pts = [];
        for (let a = 0; a < SEG; a++) {
          const ang = (a / SEG) * TAU;
          const uu = cu + Math.cos(ang) * rho, vv = cv + Math.sin(ang) * rho;
          pts.push(V.add(pl.o, V.add(V.mul(pl.u, uu), V.mul(pl.v, vv))));
        }
        const pc = clipNear(pts.map(cam.toCam));
        if (pc.length < 3) continue;
        lc.beginPath();
        pc.forEach((c, i) => { const s = cam.F / c[2]; const x = W / 2 + c[0] * s, y = H / 2 - c[1] * s; if (i) lc.lineTo(x, y); else lc.moveTo(x, y); });
        lc.closePath();
        lc.fillStyle = css([L.color[0] * dI, L.color[1] * dI, L.color[2] * dI]);
        lc.fill();
      }
    }
    lc.restore();
  }
  // manchas de luz (janela no chão, feixe na parede…)
  for (const sh of g.shafts) {
    const pc = clipNear(sh.pts.map(cam.toCam));
    if (pc.length < 3) continue;
    lc.save();
    lc.filter = `blur(${(sh.blur ?? 10) * k}px)`;
    lc.beginPath();
    pc.forEach((c, i) => { const s = cam.F / c[2]; const x = W / 2 + c[0] * s, y = H / 2 - c[1] * s; if (i) lc.lineTo(x, y); else lc.moveTo(x, y); });
    lc.closePath();
    lc.fillStyle = css(sh.color);
    lc.fill();
    lc.restore();
  }
  lc.setTransform(1, 0, 0, 1, 0, 0);
  lc.globalCompositeOperation = 'source-over';
}

// luz no plano de profundidade de um personagem (fatia do campo de luz)
export function drawLightSlice(lc, g, zc, boost = 1.0) {
  const { cam } = g;
  lc.setTransform(1, 0, 0, 1, 0, 0);
  lc.globalCompositeOperation = 'source-over';
  const a = g.ambient;
  lc.fillStyle = css([a[0] * boost, a[1] * boost, a[2] * boost]);
  lc.fillRect(0, 0, lc.canvas.width, lc.canvas.height);
  const k = lc.canvas.width / W;
  lc.setTransform(k, 0, 0, k, 0, 0);
  lc.globalCompositeOperation = 'lighter';
  const s = cam.F / zc;
  for (const L of g.lights) {
    const c = cam.toCam(L.pos);
    const dz = c[2] - zc;
    if (Math.abs(dz) >= L.R) continue;
    const rmax = Math.sqrt(L.R * L.R - dz * dz) * s;
    const x = W / 2 + c[0] * s, y = H / 2 - c[1] * s;
    const gr = lc.createRadialGradient(x, y, 0, x, y, rmax);
    for (let i = 0; i <= 5; i++) {
      const u = i / 5, rho = (u * rmax) / s;
      const d2 = (rho * rho + dz * dz) / (L.R * L.R);
      const I = d2 >= 1 ? 0 : L.k * (1 - d2) * (1 - d2);
      gr.addColorStop(u, css([L.color[0] * I, L.color[1] * I, L.color[2] * I]));
    }
    lc.fillStyle = gr;
    lc.fillRect(x - rmax, y - rmax, rmax * 2, rmax * 2);
  }
  lc.setTransform(1, 0, 0, 1, 0, 0);
  lc.globalCompositeOperation = 'source-over';
}

// retângulo arredondado
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
