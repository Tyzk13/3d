// Cenários: casca da sala (chão, paredes, teto), janelas, portas, móveis e luzes.
import { W, H, TAU, INK, V, css, shade, mix, mul, clamp, lerp, hash, noise } from './core.js';
import { drawChar } from './char.js';

// ---------- paredes ----------
function walls(g) {
  const { x0, x1, z0, z1 } = g.room;
  return {
    back: { o: [0, 0, z1], u: [1, 0, 0], n: [0, 0, -1], a0: x0, a1: x1 },
    front: { o: [0, 0, z0], u: [1, 0, 0], n: [0, 0, 1], a0: x0, a1: x1 },
    left: { o: [x0, 0, 0], u: [0, 0, 1], n: [1, 0, 0], a0: z0, a1: z1 },
    right: { o: [x1, 0, 0], u: [0, 0, 1], n: [-1, 0, 0], a0: z0, a1: z1 },
  };
}
const wp = (wl, a, y, off = 0) => [wl.o[0] + wl.u[0] * a + wl.n[0] * off, y, wl.o[2] + wl.u[2] * a + wl.n[2] * off];
const wq = (wl, a0, a1, y0, y1, off = 0) => [wp(wl, a0, y0, off), wp(wl, a1, y0, off), wp(wl, a1, y1, off), wp(wl, a0, y1, off)];

/**
 * Casca da sala. o: { w, d, h, z0, floor:{type,c,c2}, wall:{c, stripes, wains, base}, ceil }
 */
export function room(g, o = {}) {
  const w = o.w ?? 5, d = o.d ?? 5.5, h = o.h ?? 2.8, z0 = o.z0 ?? 0;
  const x0 = -w / 2, x1 = w / 2, z1 = z0 + d;
  g.room = { x0, x1, z0, z1, h, w, d };
  const WL = walls(g); g.walls = WL;
  const fl = o.floor || {}, wl = o.wall || {};
  const wallC = wl.c || '#cbbba6';
  g.planes.push({ o: [0, 0, 0], u: [1, 0, 0], v: [0, 0, 1], n: [0, 1, 0], quad: [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]] });
  g.planes.push({ o: [0, h, 0], u: [1, 0, 0], v: [0, 0, 1], n: [0, -1, 0], quad: [[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]] });
  for (const k of ['back', 'front', 'left', 'right']) {
    const q = WL[k];
    g.planes.push({ o: q.o, u: q.u, v: [0, 1, 0], n: q.n, quad: wq(q, q.a0, q.a1, 0, h) });
  }
  g.shell.push(() => {
    // teto
    g.poly([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], { fill: o.ceil || shade(wallC, 1.08) });
    // chão
    const type = fl.type || 'wood', fc = fl.c || '#9a6a3c';
    g.poly([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], { fill: fc });
    if (type === 'wood') {
      const pw = fl.pw || 0.19, n = Math.ceil(w / pw);
      for (let i = 0; i < n; i++) {
        const a = x0 + i * pw, b = Math.min(x1, a + pw);
        g.poly([[a, 0, z0], [b, 0, z0], [b, 0, z1], [a, 0, z1]], { fill: shade(fc, 0.9 + 0.2 * hash(i * 3.1 + 7)) });
        g.line([a, 0, z0], [a, 0, z1], { stroke: shade(fc, 0.5), lw: 0.007, alpha: 0.55 });
        for (let j = 0; j < 3; j++) { const zz = z0 + ((hash(i * 9.7 + j * 3.3) * d + j * d / 3) % d); g.line([a, 0, zz], [b, 0, zz], { stroke: shade(fc, 0.5), lw: 0.006, alpha: 0.5 }); }
      }
    } else if (type === 'tile') {
      const ts = fl.ts || 0.5, c2 = fl.c2 || shade(fc, 0.86);
      const nx = Math.ceil(w / ts), nz = Math.ceil(d / ts);
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        if ((i + j) % 2) continue;
        const a = x0 + i * ts, b = Math.min(x1, a + ts), c = z0 + j * ts, e = Math.min(z1, c + ts);
        g.poly([[a, 0, c], [b, 0, c], [b, 0, e], [a, 0, e]], { fill: c2 });
      }
      for (let i = 0; i <= nx; i++) g.line([x0 + i * ts, 0, z0], [x0 + i * ts, 0, z1], { stroke: shade(fc, 0.6), lw: 0.006, alpha: 0.5 });
      for (let j = 0; j <= nz; j++) g.line([x0, 0, z0 + j * ts], [x1, 0, z0 + j * ts], { stroke: shade(fc, 0.6), lw: 0.006, alpha: 0.5 });
    }
    // paredes
    for (const k of ['back', 'front', 'left', 'right']) {
      const q = WL[k];
      g.poly(wq(q, q.a0, q.a1, 0, h), { fill: wallC });
      if (wl.stripes) {
        const sw = wl.sw || 0.24, c2 = wl.stripes;
        for (let a = q.a0; a < q.a1; a += sw * 2) g.poly(wq(q, a, Math.min(q.a1, a + sw), 0, h), { fill: c2 });
      }
      if (wl.wains) {
        const wh = wl.wh || 0.95;
        g.poly(wq(q, q.a0, q.a1, 0, wh), { fill: wl.wains });
        for (let a = q.a0; a < q.a1; a += 0.6) g.line(wp(q, a, 0.1), wp(q, a, wh), { stroke: shade(wl.wains, 0.6), lw: 0.007, alpha: 0.6 });
        g.poly(wq(q, q.a0, q.a1, wh, wh + 0.05), { fill: shade(wl.wains, 1.12), stroke: INK, lw: 0.008 });
      }
      if (wl.tiles) {
        const th = wl.th || 1.3, ts = 0.3;
        g.poly(wq(q, q.a0, q.a1, 0, th), { fill: wl.tiles });
        for (let a = q.a0; a < q.a1; a += ts) g.line(wp(q, a, 0), wp(q, a, th), { stroke: shade(wl.tiles, 0.7), lw: 0.006, alpha: 0.6 });
        for (let y = ts; y < th; y += ts) g.line(wp(q, q.a0, y), wp(q, q.a1, y), { stroke: shade(wl.tiles, 0.7), lw: 0.006, alpha: 0.6 });
        g.line(wp(q, q.a0, th), wp(q, q.a1, th), { stroke: INK, lw: 0.01 });
      }
      const bc = wl.base || shade(wallC, 0.55);
      g.poly(wq(q, q.a0, q.a1, 0, 0.1), { fill: bc, stroke: INK, lw: 0.008 });
      g.line(wp(q, q.a0, 0), wp(q, q.a0, h), { stroke: INK, lw: 0.012 });
      g.line(wp(q, q.a1, 0), wp(q, q.a1, h), { stroke: INK, lw: 0.012 });
      g.line(wp(q, q.a0, h), wp(q, q.a1, h), { stroke: INK, lw: 0.012 });
    }
  });
}

// céu e cidade vistos por uma janela (ou fundo de cena externa)
const SKY = {
  night: { top: '#070b22', bot: '#232a5c', bld: '#0b0e22', win: '#ffd27a', stars: 1 },
  day: { top: '#6db6ff', bot: '#d4ecff', bld: '#9db4cf', win: '#eaf4ff', stars: 0 },
  dusk: { top: '#2c2460', bot: '#ff9d62', bld: '#231b3c', win: '#ffd98a', stars: 0.3 },
  dawn: { top: '#3b4a8a', bot: '#ffc9a0', bld: '#2a2b4d', win: '#ffe2a8', stars: 0 },
};
export function skyline(ctx, g, view, x, y, w, h, dir = [0, 0, 1]) {
  const s = SKY[view] || SKY.night;
  const gr = ctx.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, s.top); gr.addColorStop(1, s.bot);
  ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
  // ponto de fuga da direção olhada: dá paralaxe correta quando a câmera gira
  const far = g.cam.proj(V.add(g.cam.p, V.mul(dir, 2000))) || { x: W / 2, y: H / 2 };
  if (s.stars) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 70; i++) {
      const sx = far.x + (hash(i * 3.3) - 0.5) * 2600, sy = far.y - hash(i * 7.7) * 1500 - 60;
      ctx.globalAlpha = s.stars * (0.35 + 0.65 * hash(i * 1.9)) * (0.75 + 0.25 * Math.sin(g.T * (1 + hash(i)) * 2 + i));
      ctx.beginPath(); ctx.arc(sx, sy, 1.4 + hash(i * 5.1) * 2.2, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (view === 'night') { // lua
    const mx = far.x + 260, my = far.y - 620;
    const mg = ctx.createRadialGradient(mx, my, 10, mx, my, 150); mg.addColorStop(0, 'rgba(220,230,255,0.5)'); mg.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.fillStyle = mg; ctx.fillRect(mx - 150, my - 150, 300, 300);
    ctx.fillStyle = '#eef2ff'; ctx.beginPath(); ctx.arc(mx, my, 44, 0, TAU); ctx.fill();
  }
  if (view === 'day') {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 5; i++) { const cx = far.x + (hash(i * 4.4) - 0.5) * 2200 + g.T * 6, cy = far.y - 250 - hash(i * 8.8) * 700; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(cx + k * 46, cy + (k % 2) * 14, 60, 30, 0, 0, TAU); ctx.fill(); } }
  }
  // prédios em duas camadas
  for (let layer = 0; layer < 2; layer++) {
    const sc = layer ? 1 : 0.7, baseY = far.y + 40 + layer * 90;
    for (let i = -14; i < 14; i++) {
      const bw = (70 + hash(i * 2.3 + layer * 50) * 90) * sc;
      const bx = far.x + i * 118 * sc + hash(i * 6.1 + layer) * 30;
      const bh = (140 + hash(i * 9.2 + layer * 17) * 420) * sc;
      if (bx + bw < x || bx > x + w) continue;
      ctx.fillStyle = layer ? s.bld : css(mix(s.bld, s.bot, 0.45));
      ctx.fillRect(bx, baseY - bh, bw, bh + 900);
      const cols = Math.floor(bw / (17 * sc)), rows = Math.floor(bh / (24 * sc));
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const hh = hash(i * 31.7 + r * 5.3 + c * 11.9 + layer * 3);
        const on = view === 'day' ? hh > 0.25 : hh > (view === 'night' ? 0.72 : 0.55);
        if (!on) continue;
        ctx.globalAlpha = view === 'day' ? 0.55 : 0.5 + 0.5 * hash(hh * 91);
        ctx.fillStyle = s.win;
        ctx.fillRect(bx + 6 * sc + c * 17 * sc, baseY - bh + 10 * sc + r * 24 * sc, 9 * sc, 13 * sc);
      }
      ctx.globalAlpha = 1;
    }
  }
}

/** Janela numa parede. o: { view, frame, curtain, shaft, blinds, k } */
export function win(g, wall, a, y, w, h, o = {}) {
  const q = g.walls[wall], view = o.view || 'night';
  const fr = o.frame || '#ece6d6';
  const outer = wq(q, a - w / 2 - 0.07, a + w / 2 + 0.07, y - 0.07, y + h + 0.07, 0.004);
  const glass = wq(q, a - w / 2, a + w / 2, y, y + h, 0.006);
  g.shell.push(() => g.poly(outer, { fill: fr, stroke: INK, lw: 0.012 }));
  const dir = [-q.n[0], 0, -q.n[2]];
  g.emits.push(() => {
    const { ctx } = g;
    ctx.save();
    if (g.path(glass)) {
      ctx.clip();
      skyline(ctx, g, view, 0, 0, W, H, dir);
      if (o.rain) {
        ctx.strokeStyle = 'rgba(200,220,255,0.35)'; ctx.lineWidth = 2;
        for (let i = 0; i < 90; i++) { const rx = hash(i * 3.7) * W, ry = ((hash(i * 9.1) * H + g.T * 1600) % H); ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 8, ry + 46); ctx.stroke(); }
      }
      if (o.blinds) {
        ctx.restore(); ctx.save();
        const n = Math.round(h / 0.09);
        for (let i = 0; i < n; i++) g.poly(wq(q, a - w / 2, a + w / 2, y + i * (h / n), y + i * (h / n) + (h / n) * 0.55, 0.008), { fill: mul(o.blinds, g.lit(wp(q, a, y + h / 2, 0.2))) , raw: true });
      }
    }
    ctx.restore();
    const lt = g.lit(wp(q, a, y + h / 2, 0.3));
    const frc = mul(fr, lt), ink = INK;
    g.poly(glass, { stroke: ink, lw: 0.012, raw: true });
    const bars = o.bars ?? 1;
    if (bars) {
      g.line(wp(q, a, y, 0.008), wp(q, a, y + h, 0.008), { stroke: ink, lw: 0.05, raw: true, cap: 'butt' });
      g.line(wp(q, a, y, 0.008), wp(q, a, y + h, 0.008), { stroke: frc, lw: 0.03, raw: true, cap: 'butt' });
      g.line(wp(q, a - w / 2, y + h * 0.55, 0.008), wp(q, a + w / 2, y + h * 0.55, 0.008), { stroke: ink, lw: 0.05, raw: true, cap: 'butt' });
      g.line(wp(q, a - w / 2, y + h * 0.55, 0.008), wp(q, a + w / 2, y + h * 0.55, 0.008), { stroke: frc, lw: 0.03, raw: true, cap: 'butt' });
    }
    if (o.curtain) {
      const cc = mul(o.curtain, lt);
      for (const s of [-1, 1]) {
        const c0 = a + s * (w / 2 + 0.12), c1 = a + s * (w / 2 - w * (o.curtainW ?? 0.22));
        g.poly(wq(q, Math.min(c0, c1), Math.max(c0, c1), y - 0.25, y + h + 0.14, 0.02), { fill: cc, stroke: ink, lw: 0.012, raw: true });
        for (let k = 1; k < 4; k++) { const aa = lerp(c0, c1, k / 4); g.line(wp(q, aa, y - 0.25, 0.022), wp(q, aa, y + h + 0.1, 0.022), { stroke: shade(cc, 0.7), lw: 0.008, raw: true, alpha: 0.7 }); }
      }
      g.line(wp(q, a - w / 2 - 0.25, y + h + 0.16, 0.03), wp(q, a + w / 2 + 0.25, y + h + 0.16, 0.03), { stroke: '#2a2233', lw: 0.03, raw: true });
    }
  });
  // mancha de luz no chão
  const sh = o.shaft;
  if (sh) {
    const L = V.norm(sh.dir || [q.n[0] * 0.8 + 0.25, -1, q.n[2] * 0.8]);
    const hit = (p) => { const t = p[1] / -L[1]; return [p[0] + L[0] * t, 0.002, p[2] + L[2] * t]; };
    const c = glass.map((p) => p);
    g.shafts.push({ pts: [hit(c[0]), hit(c[1]), hit(c[2]), hit(c[3])], color: sh.color || [70, 80, 130], blur: sh.blur ?? 14 });
  }
  if (o.glow) g.glows.push(() => g.at(wp(q, a, y + h / 2, 0.01), (ctx, s) => {
    const r = Math.max(w, h) * s * 1.3, gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, css(o.glow, 0.2)); gr.addColorStop(1, css(o.glow, 0));
    ctx.fillStyle = gr; ctx.fillRect(-r, -r, r * 2, r * 2);
  }));
}

/** Porta. o: { w, h, c, open (0..1), behind (cor do vão), emit, knob } */
export function door(g, wall, a, o = {}) {
  const q = g.walls[wall], w = o.w ?? 0.92, h = o.h ?? 2.08, c = o.c || '#6b4a35';
  const fr = o.frame || shade(c, 0.7);
  g.shell.push(() => {
    g.poly(wq(q, a - w / 2 - 0.08, a + w / 2 + 0.08, 0, h + 0.08, 0.004), { fill: fr, stroke: INK, lw: 0.012 });
    if (!o.open) {
      g.poly(wq(q, a - w / 2, a + w / 2, 0.01, h, 0.006), { fill: c, stroke: INK, lw: 0.012 });
      for (const [y0, y1] of [[0.18, 0.95], [1.1, 1.9]]) g.poly(wq(q, a - w / 2 + 0.12, a + w / 2 - 0.12, y0, y1, 0.008), { fill: shade(c, 0.9), stroke: shade(c, 0.5), lw: 0.008 });
      if (o.peephole) g.poly(wq(q, a - 0.025, a + 0.025, 1.5, 1.55, 0.01), { fill: '#d6c27a', stroke: INK, lw: 0.006 });
    } else if (!o.emit) g.poly(wq(q, a - w / 2, a + w / 2, 0.01, h, 0.006), { fill: o.behind || '#07060f' });
  });
  if (o.open && o.emit) {
    g.emits.push(() => g.poly(wq(q, a - w / 2, a + w / 2, 0.01, h, 0.006), { fill: o.emit, raw: true }));
    g.light(wp(q, a, 1.1, 0.5), 2.6, o.emit, 0.6);
  }
  const hinge = a - w / 2;
  g.add(wp(q, a, 1, 0.05), () => {
    const lt = g.lit(wp(q, a, 1, 0.3));
    if (o.open) {
      // folha aberta para dentro
      const ang = (o.open) * 1.35;
      const e = [q.u[0] * Math.cos(ang) + q.n[0] * Math.sin(ang), 0, q.u[2] * Math.cos(ang) + q.n[2] * Math.sin(ang)];
      const p0 = wp(q, hinge, 0.01, 0.01), p1 = V.add(p0, V.mul(e, w));
      g.poly([p0, p1, [p1[0], h, p1[2]], [p0[0], h, p0[2]]], { fill: mul(shade(c, 0.85), lt), stroke: INK, lw: 0.012, raw: true });
    } else {
      const kx = a + w / 2 - 0.1;
      g.at(wp(q, kx, 1.0, 0.03), (ctx, s) => { ctx.fillStyle = css(mul(o.knob || '#d9b64f', lt)); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, 0.01 * s); ctx.beginPath(); ctx.arc(0, 0, 0.04 * s, 0, TAU); ctx.fill(); ctx.stroke(); });
    }
  }, { bias: 0.3 });
}

export function picture(g, wall, a, y, w, h, o = {}) {
  const q = g.walls[wall];
  g.shell.push(() => {
    g.poly(wq(q, a - w / 2, a + w / 2, y, y + h, 0.012), { fill: o.frame || '#3a2a22', stroke: INK, lw: 0.012 });
    const m = 0.045;
    g.poly(wq(q, a - w / 2 + m, a + w / 2 - m, y + m, y + h - m, 0.014), { fill: o.c || '#e9dfc8' });
    if (o.art === 'mount') {
      g.poly([wp(q, a - w / 2 + m, y + m, 0.015), wp(q, a - w * 0.1, y + h * 0.62, 0.015), wp(q, a + w * 0.08, y + h * 0.4, 0.015), wp(q, a + w * 0.22, y + h * 0.7, 0.015), wp(q, a + w / 2 - m, y + m, 0.015)], { fill: o.c2 || '#5d7fa8' });
      g.at(wp(q, a - w * 0.22, y + h * 0.74, 0.015), (ctx, s) => { ctx.fillStyle = css(g.tint ? mul('#f2b84b', g.tint) : '#f2b84b'); ctx.beginPath(); ctx.arc(0, 0, 0.055 * s, 0, TAU); ctx.fill(); });
    } else if (o.art === 'abs') {
      g.poly(wq(q, a - w * 0.3, a + w * 0.05, y + h * 0.25, y + h * 0.7, 0.015), { fill: o.c2 || '#c9573d' });
      g.poly(wq(q, a - w * 0.05, a + w * 0.3, y + h * 0.4, y + h * 0.8, 0.016), { fill: o.c3 || '#2f4d7a' });
    }
  });
}

export function rug(g, x, z, w, d, o = {}) {
  g.shell.push(() => {
    const c = o.c || '#8a3b3b';
    g.poly([[x - w / 2, 0.003, z - d / 2], [x + w / 2, 0.003, z - d / 2], [x + w / 2, 0.003, z + d / 2], [x - w / 2, 0.003, z + d / 2]], { fill: c, stroke: INK, lw: 0.012 });
    const m = 0.12;
    g.poly([[x - w / 2 + m, 0.004, z - d / 2 + m], [x + w / 2 - m, 0.004, z - d / 2 + m], [x + w / 2 - m, 0.004, z + d / 2 - m], [x - w / 2 + m, 0.004, z + d / 2 - m]], { stroke: o.c2 || shade(c, 1.35), lw: 0.02 });
  });
}

// ---------- móveis ----------
function build(g, x, z, ry, parts, o = {}) {
  g.add([x, o.ay ?? 0.4, z], () => {
    const cs = Math.cos(ry), sn = Math.sin(ry);
    const list = parts.map((p) => {
      const wx = x + (p.x || 0) * cs + (p.z || 0) * sn, wz = z - (p.x || 0) * sn + (p.z || 0) * cs;
      return { p, wx, wz, dist: V.len(V.sub(g.cam.p, [wx, (p.y || 0) + (p.h || 0) / 2, wz])) - (p.pri || 0) };
    });
    list.sort((a, b) => b.dist - a.dist);
    for (const { p, wx, wz } of list) {
      if (p.draw) p.draw(g, wx, wz);
      else g.box(wx, p.y || 0, wz, p.w, p.h, p.d, { c: p.c, ry, top: p.top, front: p.front, side: p.side, lit: p.lit, stroke: p.stroke, lw: p.lw });
    }
  }, o);
}

export function sofa(g, x, z, o = {}) {
  const c = o.c || '#3b4c7c', w = o.w ?? 1.9, ry = o.ry || 0;
  const parts = [
    { x: 0, y: 0.08, z: 0, w, h: 0.34, d: 0.86, c },
    { x: 0, y: 0.08, z: 0.36, w, h: 0.78, d: 0.2, c: shade(c, 0.92) },
    { x: -(w / 2 - 0.1), y: 0.08, z: -0.02, w: 0.2, h: 0.52, d: 0.9, c: shade(c, 0.96), pri: 0.2 },
    { x: (w / 2 - 0.1), y: 0.08, z: -0.02, w: 0.2, h: 0.52, d: 0.9, c: shade(c, 0.96), pri: 0.2 },
    { x: -w / 4 + 0.05, y: 0.42, z: -0.04, w: w / 2 - 0.22, h: 0.07, d: 0.66, c: shade(c, 1.12), pri: 0.1 },
    { x: w / 4 - 0.05, y: 0.42, z: -0.04, w: w / 2 - 0.22, h: 0.07, d: 0.66, c: shade(c, 1.12), pri: 0.1 },
  ];
  build(g, x, z, ry, parts, o);
}

export function table(g, x, z, o = {}) {
  const w = o.w ?? 1.1, d = o.d ?? 0.6, h = o.h ?? 0.42, c = o.c || '#7a5233', ry = o.ry || 0, t = o.t ?? 0.06, lg = o.leg ?? 0.07;
  const parts = [{ x: 0, y: h - t, z: 0, w, h: t, d, c, pri: 0.3 }];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push({ x: sx * (w / 2 - lg), y: 0, z: sz * (d / 2 - lg), w: lg, h: h - t, d: lg, c: shade(c, 0.85) });
  if (o.cloth) parts.push({ x: 0, y: h - 0.22, z: 0, w: w + 0.06, h: 0.225, d: d + 0.06, c: o.cloth, pri: 0.4 });
  if (o.shelf) parts.push({ x: 0, y: 0.1, z: 0, w: w - 0.1, h: 0.03, d: d - 0.1, c: shade(c, 0.9) });
  build(g, x, z, ry, parts, { ...o, ay: h });
}

export function chair(g, x, z, o = {}) {
  const c = o.c || '#5c4030', ry = o.ry || 0;
  const parts = [
    { x: 0, y: 0.42, z: 0, w: 0.44, h: 0.05, d: 0.44, c },
    { x: 0, y: 0.47, z: 0.2, w: 0.44, h: 0.52, d: 0.05, c: shade(c, 0.95) },
  ];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push({ x: sx * 0.19, y: 0, z: sz * 0.19, w: 0.05, h: 0.42, d: 0.05, c: shade(c, 0.8) });
  build(g, x, z, ry, parts, o);
}

function shadeShape(ctx, s, wt, wb, hh, fill, stroke = INK) {
  ctx.beginPath(); ctx.moveTo(-wt * s / 2, -hh * s); ctx.lineTo(wt * s / 2, -hh * s); ctx.lineTo(wb * s / 2, 0); ctx.lineTo(-wb * s / 2, 0); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, 0.012 * s); ctx.lineJoin = 'round'; ctx.stroke();
}
function halo(g, pos, r, color, a = 0.5) {
  g.glows.push(() => g.at(pos, (ctx, s) => {
    const R = r * s, gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, css(color, a)); gr.addColorStop(0.35, css(color, a * 0.35)); gr.addColorStop(1, css(color, 0));
    ctx.fillStyle = gr; ctx.fillRect(-R, -R, R * 2, R * 2);
  }));
}

export function floorLamp(g, x, z, o = {}) {
  const on = o.on !== false, col = o.color || '#ffc27a', k = o.k ?? 1;
  if (on) { g.light([x, 1.5, z], o.R ?? 3.6, col, k); halo(g, [x, 1.5, z], 0.9, col, 0.55 * k); }
  g.add([x, 0.8, z], () => {
    g.box(x, 0, z, 0.3, 0.04, 0.3, { c: '#2b2530' });
    g.box(x, 0.04, z, 0.035, 1.34, 0.035, { c: '#2b2530', stroke: null });
    g.at([x, 1.38, z], (ctx, s) => shadeShape(ctx, s, 0.24, 0.4, 0.3, on ? css(shade(col, 1.25)) : css(mul('#d9cdb4', g.lit([x, 1.4, z])))));
  }, o);
}

export function tableLamp(g, x, y, z, o = {}) {
  const on = o.on !== false, col = o.color || '#ffc27a', k = o.k ?? 0.8;
  if (on) { g.light([x, y + 0.35, z], o.R ?? 2.4, col, k); halo(g, [x, y + 0.32, z], 0.55, col, 0.5 * k); }
  g.add([x, y + 0.2, z], () => {
    g.box(x, y, z, 0.1, 0.2, 0.1, { c: o.base || '#8c6b4a' });
    g.at([x, y + 0.2, z], (ctx, s) => shadeShape(ctx, s, 0.15, 0.27, 0.2, on ? css(shade(col, 1.25)) : css(mul('#d9cdb4', g.lit([x, y + 0.3, z])))));
  }, { bias: -0.05, ...o });
}

export function pendant(g, x, y, z, o = {}) {
  const on = o.on !== false, col = o.color || '#ffd08a', k = o.k ?? 1, h = g.room ? g.room.h : 2.8;
  if (on) { g.light([x, y - 0.15, z], o.R ?? 3.4, col, k); halo(g, [x, y - 0.02, z], 0.5, col, 0.6 * k); }
  if (on && o.cone !== false) g.add([x, y, z + 0.25], () => {
    const a = g.cam.proj([x, y, z]), b = g.cam.proj([x, 0, z]);
    if (!a || !b) return;
    const { ctx } = g, r = 0.95 * b.s, gr = ctx.createLinearGradient(0, a.y, 0, b.y);
    gr.addColorStop(0, css(col, 0.16 * k)); gr.addColorStop(1, css(col, 0));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(10px)';
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(a.x - 0.16 * a.s, a.y); ctx.lineTo(a.x + 0.16 * a.s, a.y); ctx.lineTo(b.x + r, b.y); ctx.lineTo(b.x - r, b.y); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  g.add([x, y, z], () => {
    g.line([x, y + 0.2, z], [x, h, z], { stroke: '#1a1622', lw: 0.012, raw: true });
    g.at([x, y, z], (ctx, s) => {
      shadeShape(ctx, s, 0.1, 0.44, 0.2, css(mul(o.c || '#2b2a3a', g.lit([x, y + 0.2, z]))));
      if (on) { ctx.fillStyle = css(shade(col, 1.3)); ctx.beginPath(); ctx.ellipse(0, 0, 0.19 * s, 0.035 * s, 0, 0, TAU); ctx.fill(); }
    });
  }, { bias: -0.2, ...o });
}

export function plant(g, x, z, o = {}) {
  g.add([x, 0.5, z], () => {
    g.box(x, 0, z, 0.3, 0.3, 0.3, { c: o.pot || '#b5653c' });
    const lt = g.lit([x, 0.8, z]);
    g.at([x, 0.3, z], (ctx, s) => {
      const n = 7; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, 0.012 * s); ctx.lineJoin = 'round';
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.36 + Math.sin(g.T * 0.9 + i) * 0.015, L = (0.55 + hash(i * 3.3 + x) * 0.35) * s;
        const tx = Math.cos(a) * L, ty = Math.sin(a) * L, nx = -Math.sin(a) * 0.06 * s, ny = Math.cos(a) * 0.06 * s;
        ctx.fillStyle = css(mul(i % 2 ? '#3f8a55' : '#2f6f47', lt));
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(tx * 0.5 + nx * 2, ty * 0.5 + ny * 2, tx, ty); ctx.quadraticCurveTo(tx * 0.5 - nx * 2, ty * 0.5 - ny * 2, 0, 0); ctx.fill(); ctx.stroke();
      }
    });
  }, o);
}

export function tv(g, x, z, o = {}) {
  const on = o.on, col = o.color || '#8fb8ff', w = o.w ?? 1.3;
  if (on) { g.light([x, 0.95, z - 0.4], 2.6, col, 0.5 + 0.08 * noise(g.T * 6, 3)); }
  g.add([x, 0.6, z], () => {
    g.box(x, 0, z, w + 0.3, 0.42, 0.4, { c: o.stand || '#4a3527' });
    g.box(x, 0.5, z, w, 0.72, 0.05, { c: '#17151f', front: on ? null : '#1d1b28' });
    g.box(x, 0.42, z, 0.3, 0.08, 0.12, { c: '#17151f' });
  }, o);
  if (on) g.glows.push(() => {
    const q = [[x - w / 2 + 0.04, 0.54, z - 0.03], [x + w / 2 - 0.04, 0.54, z - 0.03], [x + w / 2 - 0.04, 1.18, z - 0.03], [x - w / 2 + 0.04, 1.18, z - 0.03]];
    g.ctx.globalCompositeOperation = 'source-over';
    g.poly(q, { fill: shade(col, 1.15 + 0.1 * noise(g.T * 5, 9)), raw: true });
  });
}

export function shelf(g, x, z, o = {}) {
  const w = o.w ?? 1.0, h = o.h ?? 1.9, d = o.d ?? 0.32, c = o.c || '#6a4a33', ry = o.ry || 0, n = o.n ?? 4;
  const parts = [{ x: 0, y: 0, z: d / 2 - 0.02, w, h, d: 0.04, c: shade(c, 0.7) }, { x: -w / 2 + 0.025, y: 0, z: 0, w: 0.05, h, d, c }, { x: w / 2 - 0.025, y: 0, z: 0, w: 0.05, h, d, c }];
  const cols = o.items || ['#b9483d', '#3f6fa8', '#d6a43f', '#4f8f5e', '#8a5aa3', '#e2ddd0'];
  for (let i = 0; i <= n; i++) {
    const yy = i * ((h - 0.04) / n);
    parts.push({ x: 0, y: yy, z: 0, w: w - 0.08, h: 0.04, d, c, pri: 0.05 });
    if (i < n) {
      let bx = -w / 2 + 0.1, k = 0;
      while (bx < w / 2 - 0.16) {
        const bw = o.boxes ? 0.16 + hash(i * 7 + k * 3 + x) * 0.14 : 0.045 + hash(i * 7 + k * 3 + x) * 0.04, bh = (o.boxes ? 0.16 : 0.22) + hash(i * 5 + k * 9 + x) * 0.12;
        if (hash(i * 13 + k * 17 + x) > 0.2) parts.push({ x: bx + bw / 2, y: yy + 0.04, z: -0.02, w: bw, h: Math.min(bh, (h - 0.04) / n - 0.06), d: d * 0.7, c: cols[(i * 3 + k) % cols.length], lw: 0.008, pri: 0.1 });
        bx += bw + (o.boxes ? 0.05 : 0.004); k++;
      }
    }
  }
  build(g, x, z, ry, parts, { ...o, ay: h / 2 });
}

export function wardrobe(g, x, z, o = {}) {
  const w = o.w ?? 1.3, h = o.h ?? 2.1, d = 0.55, c = o.c || '#6a4631';
  g.add([x, 1, z], () => {
    g.box(x, 0, z, w, h, d, { c, ry: o.ry });
    if (!o.ry) {
      const zf = z - d / 2 - 0.004;
      g.line([x, 0.06, zf], [x, h - 0.04, zf], { stroke: INK, lw: 0.012, raw: true });
      const lt = g.lit([x, 1, zf - 0.2]);
      for (const s of [-1, 1]) {
        g.poly([[x + s * 0.08, 0.2, zf], [x + s * (w / 2 - 0.08), 0.2, zf], [x + s * (w / 2 - 0.08), h - 0.2, zf], [x + s * 0.08, h - 0.2, zf]], { stroke: mul(shade(c, 0.55), lt), lw: 0.01, raw: true });
        g.at([x + s * 0.06, 1.05, zf], (ctx, sc) => { ctx.fillStyle = css(mul('#d9b64f', lt)); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, 0.008 * sc); ctx.beginPath(); ctx.arc(0, 0, 0.028 * sc, 0, TAU); ctx.fill(); ctx.stroke(); });
      }
    }
  }, o);
}

/** Cama com a cabeceira encostada no fundo (pés para a câmera). o.sleeper = personagem deitado. */
export function bed(g, x, z, o = {}) {
  const w = o.w ?? 1.5, d = 2.05, c = o.c || '#4a5f9a', fr = o.frame || '#5a3d2b';
  g.add([x, 0.4, z], () => {
    g.box(x, 0, z + d / 2 + 0.04, w + 0.1, 1.12, 0.08, { c: fr });               // cabeceira
    g.box(x, 0.12, z, w + 0.06, 0.2, d, { c: fr });
    g.box(x, 0.32, z, w, 0.2, d - 0.04, { c: '#e9e4d8' });                         // colchão
    const px = x + (o.px ?? 0), pz = z + d / 2 - 0.34;
    g.box(px, 0.52, pz, 0.95, 0.13, 0.56, { c: '#f6f3ec' });                       // travesseiro
    if (o.sleeper) drawChar(g, { ...o.sleeper, at: [px, pz + 0.02], y: 0.84, headOnly: true, noShadow: true });
    if (!o.empty) {
      g.box(x, 0.5, z - 0.2, w + 0.04, 0.16, d - 0.72, { c });                      // cobertor
      if (o.sleeper) g.box(px, 0.66, z - 0.16, 0.5, 0.07, d - 0.95, { c: shade(c, 1.08), stroke: null });
      g.box(x, 0.66, z + d / 2 - 0.68, w + 0.04, 0.03, 0.2, { c: '#f1eee6' });     // dobra do lençol
    } else {
      g.box(x + 0.28, 0.5, z - 0.4, w * 0.55, 0.2, d - 1.1, { c, ry: 0.22 });
    }
  }, o);
}

export function nightstand(g, x, z, o = {}) {
  const c = o.c || '#6a4631';
  g.add([x, 0.3, z], () => {
    g.box(x, 0, z, 0.5, 0.52, 0.42, { c });
    const zf = z - 0.214, lt = g.lit([x, 0.3, zf - 0.2]);
    g.poly([[x - 0.2, 0.28, zf], [x + 0.2, 0.28, zf], [x + 0.2, 0.46, zf], [x - 0.2, 0.46, zf]], { stroke: mul(shade(c, 0.5), lt), lw: 0.01, raw: true });
    g.at([x, 0.37, zf], (ctx, s) => { ctx.fillStyle = css(mul('#d9b64f', lt)); ctx.beginPath(); ctx.arc(0, 0, 0.022 * s, 0, TAU); ctx.fill(); });
  }, o);
}

/** Celular apoiado (em pé) num móvel, tela virada para a câmera se o.front. */
export function phoneProp(g, x, y, z, o = {}) {
  const on = o.on !== false, col = o.color || '#bfe0ff';
  if (on) g.light([x, y + 0.12, z - 0.15], o.R ?? 1.3, col, o.k ?? 0.55);
  g.add([x, y, z], () => {
    if (o.flat) {
      const w = 0.085, d = 0.17, ry = o.ry || 0;
      g.box(x, y, z, w, 0.012, d, { c: '#15131f', ry, top: on ? shade(col, 1.2) : '#22202c', lit: !on });
      return;
    }
    g.at([x, y, z], (ctx, s) => {
      ctx.rotate(o.rot ?? -0.1);
      ctx.fillStyle = '#15131f'; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, 0.01 * s);
      ctx.beginPath(); ctx.roundRect(-0.045 * s, -0.19 * s, 0.09 * s, 0.19 * s, 0.014 * s); ctx.fill(); ctx.stroke();
      if (o.front) { ctx.fillStyle = on ? css(col) : '#2a2836'; ctx.beginPath(); ctx.roundRect(-0.038 * s, -0.182 * s, 0.076 * s, 0.174 * s, 0.01 * s); ctx.fill(); }
      if (o.rec) { ctx.fillStyle = (g.T % 1) < 0.5 ? '#ff3b3b' : '#7a1b1b'; ctx.beginPath(); ctx.arc(0, -0.165 * s, 0.009 * s, 0, TAU); ctx.fill(); }
    });
  }, { bias: -0.1, ...o });
  if (on && o.glow !== false) halo(g, [x, y + 0.1, z], 0.28, col, 0.35);
}

export function desk(g, x, z, o = {}) {
  const w = o.w ?? 1.5, d = 0.7, c = o.c || '#7a5a3c', ry = o.ry || 0;
  build(g, x, z, ry, [
    { x: 0, y: 0.7, z: 0, w, h: 0.06, d, c, pri: 0.3 },
    { x: -w / 2 + 0.04, y: 0, z: 0, w: 0.06, h: 0.7, d: d - 0.06, c: shade(c, 0.85) },
    { x: w / 2 - 0.04, y: 0, z: 0, w: 0.06, h: 0.7, d: d - 0.06, c: shade(c, 0.85) },
    { x: 0, y: 0.25, z: d / 2 - 0.05, w: w - 0.1, h: 0.45, d: 0.04, c: shade(c, 0.8) },
  ], { ...o, ay: 0.7 });
}

export function monitor(g, x, y, z, o = {}) {
  const col = o.color || '#bcd9ff', on = o.on !== false;
  if (on) g.light([x, y + 0.3, z + (o.back ? 0.35 : -0.35)], 1.6, col, 0.4);
  g.add([x, y + 0.2, z], () => {
    g.box(x, y, z, 0.2, 0.02, 0.14, { c: '#22202c' });
    g.box(x, y + 0.02, z, 0.04, 0.12, 0.03, { c: '#22202c' });
    g.box(x, y + 0.12, z, 0.56, 0.36, 0.03, { c: '#1b1924', front: o.back ? '#262432' : (on ? null : '#262432') });
    if (on && !o.back) g.poly([[x - 0.26, y + 0.14, z - 0.016], [x + 0.26, y + 0.14, z - 0.016], [x + 0.26, y + 0.46, z - 0.016], [x - 0.26, y + 0.46, z - 0.016]], { fill: col, raw: true });
  }, { bias: -0.1, ...o });
}

export function counter(g, x, z, o = {}) {
  const w = o.w ?? 2.4, c = o.c || '#7b5a3e';
  g.add([x, 0.5, z], () => {
    const hh = o.h ?? 0.78;
    g.box(x, 0, z, w, hh, 0.6, { c, ry: o.ry });
    g.box(x, hh, z, w + 0.08, 0.06, 0.68, { c: o.top || '#e7dfcf', ry: o.ry });
  }, o);
}

export function sink(g, x, z, o = {}) {
  g.add([x, 0.5, z], () => {
    g.box(x, 0, z, 0.9, 0.82, 0.5, { c: o.c || '#e8e4dc' });
    g.box(x, 0.82, z, 0.96, 0.08, 0.56, { c: '#f6f4ef' });
    g.box(x, 0.9, z + 0.2, 0.06, 0.16, 0.06, { c: '#b9c0c9' });
    g.box(x, 1.03, z + 0.12, 0.05, 0.035, 0.2, { c: '#b9c0c9' });
  }, o);
}

/** Espelho na parede do fundo com o reflexo de um personagem. */
export function mirror(g, a, y, w, h, o = {}) {
  const q = g.walls.back, z1 = g.room.z1;
  g.shell.push(() => g.poly(wq(q, a - w / 2 - 0.05, a + w / 2 + 0.05, y - 0.05, y + h + 0.05, 0.004), { fill: o.frame || '#d8d2c4', stroke: INK, lw: 0.012 }));
  g.emits.push(() => {
    const { ctx } = g, glass = wq(q, a - w / 2, a + w / 2, y, y + h, 0.006);
    ctx.save();
    if (g.path(glass)) {
      ctx.clip();
      const lt = g.lit(wp(q, a, y + h / 2, 0.8));
      const gr = ctx.createLinearGradient(0, 0, W, H);
      gr.addColorStop(0, css(mul('#aebfcc', lt))); gr.addColorStop(1, css(mul('#7f93a6', lt)));
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = css(mul('#6a7f93', lt), 0.5); ctx.lineWidth = 3;
      const far = g.cam.proj([a, 1.3, z1 + (z1 - g.room.z0)]);
      if (far) { const ts = 0.3 * far.s; for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(far.x + k * ts, 0); ctx.lineTo(far.x + k * ts, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, far.y + k * ts); ctx.lineTo(W, far.y + k * ts); ctx.stroke(); } }
      if (o.reflect) drawChar(g, { ...o.reflect, at: [o.reflect.at[0], 2 * z1 - o.reflect.at[1]], back: false, noShadow: true });
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.moveTo(0, H * 0.2); ctx.lineTo(W, H * 0.05); ctx.lineTo(W, H * 0.16); ctx.lineTo(0, H * 0.33); ctx.fill();
    }
    ctx.restore();
    g.poly(wq(q, a - w / 2, a + w / 2, y, y + h, 0.006), { stroke: INK, lw: 0.012, raw: true });
  });
}

/** Vela + taças + pratos em cima de uma mesa. */
export function tableSet(g, x, y, z, o = {}) {
  const col = '#ffb866';
  g.light([x, y + 0.28, z], 2.0, col, 0.75 + 0.06 * noise(g.T * 7, 5));
  halo(g, [x, y + 0.26, z], 0.42, col, 0.6);
  g.add([x, y + 0.1, z], () => {
    const lt = g.lit([x, y + 0.1, z - 0.3]);
    for (const s of [-1, 1]) {
      g.at([x + s * 0.24, y + 0.005, z - 0.08], (ctx, sc) => { ctx.fillStyle = css(mul('#f4f1ea', lt)); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, 0.008 * sc); ctx.beginPath(); ctx.ellipse(0, 0, 0.11 * sc, 0.11 * sc * (Math.abs(g.cam.fw[1]) + 0.18), 0, 0, TAU); ctx.fill(); ctx.stroke(); });
      g.at([x + s * 0.12, y, z + 0.16], (ctx, sc) => {
        ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, 0.008 * sc); ctx.fillStyle = 'rgba(210,230,255,0.25)';
        ctx.beginPath(); ctx.moveTo(-0.035 * sc, -0.2 * sc); ctx.lineTo(0.035 * sc, -0.2 * sc); ctx.quadraticCurveTo(0.04 * sc, -0.1 * sc, 0, -0.09 * sc); ctx.quadraticCurveTo(-0.04 * sc, -0.1 * sc, -0.035 * sc, -0.2 * sc); ctx.fill(); ctx.stroke();
        ctx.fillStyle = css(mul('#8a1c34', lt)); ctx.beginPath(); ctx.moveTo(-0.03 * sc, -0.15 * sc); ctx.lineTo(0.03 * sc, -0.15 * sc); ctx.quadraticCurveTo(0.03 * sc, -0.1 * sc, 0, -0.095 * sc); ctx.quadraticCurveTo(-0.03 * sc, -0.1 * sc, -0.03 * sc, -0.15 * sc); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, -0.09 * sc); ctx.lineTo(0, 0); ctx.moveTo(-0.03 * sc, 0); ctx.lineTo(0.03 * sc, 0); ctx.stroke();
      });
    }
    g.box(x, y, z, 0.035, 0.14, 0.035, { c: '#f1ece0' });
    g.at([x, y + 0.14, z], (ctx, sc) => {
      const f = 1 + 0.12 * noise(g.T * 9, 2);
      ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.moveTo(0, -0.085 * sc * f); ctx.quadraticCurveTo(0.03 * sc, -0.02 * sc, 0, 0); ctx.quadraticCurveTo(-0.03 * sc, -0.02 * sc, 0, -0.085 * sc * f); ctx.fill();
      ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.ellipse(0, -0.022 * sc, 0.009 * sc, 0.02 * sc, 0, 0, TAU); ctx.fill();
    });
  }, { bias: -0.3, fg: o.fg });
}

/** Carro de perfil (desenho 2D ancorado no chão). */
export function car(g, x, z, o = {}) {
  const c = o.c || '#c2362f';
  if (o.lights) { g.light([x + 2.3, 0.6, z - 0.3], 2.6, '#fff1c9', 0.7); halo(g, [x + 2.05, 0.62, z], 0.5, '#fff1c9', 0.6); }
  g.add([x, 0.6, z], () => {
    const lt = g.lit([x, 0.9, z - 0.6]);
    g.at([x, 0, z], (ctx, s) => {
      ctx.save(); ctx.scale(s * (o.flip ? -1 : 1), s);
      ctx.fillStyle = 'rgba(5,5,18,0.4)'; ctx.beginPath(); ctx.ellipse(0, 0, 2.2, 0.16, 0, 0, TAU); ctx.fill();
      ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 0.035;
      ctx.beginPath();
      ctx.moveTo(-2.1, -0.32); ctx.lineTo(-2.12, -0.72); ctx.quadraticCurveTo(-2.0, -0.92, -1.45, -0.98);
      ctx.quadraticCurveTo(-1.05, -1.5, -0.35, -1.52); ctx.lineTo(0.45, -1.5); ctx.quadraticCurveTo(0.95, -1.42, 1.3, -0.98);
      ctx.quadraticCurveTo(1.95, -0.92, 2.12, -0.7); ctx.lineTo(2.14, -0.32); ctx.closePath();
      const gr = ctx.createLinearGradient(0, -1.5, 0, -0.3);
      gr.addColorStop(0, css(mul(shade(c, 1.18), lt))); gr.addColorStop(0.5, css(mul(c, lt))); gr.addColorStop(1, css(mul(shade(c, 0.7), lt)));
      ctx.fillStyle = gr; ctx.fill(); ctx.stroke();
      ctx.fillStyle = css(mul('#a9cbe8', lt)); ctx.lineWidth = 0.025;
      ctx.beginPath(); ctx.moveTo(-1.28, -1.0); ctx.quadraticCurveTo(-0.95, -1.4, -0.38, -1.41); ctx.lineTo(-0.38, -1.0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-0.28, -1.41); ctx.lineTo(0.42, -1.39); ctx.quadraticCurveTo(0.82, -1.33, 1.1, -1.0); ctx.lineTo(-0.28, -1.0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = css(mul(shade(c, 0.55), lt)); ctx.lineWidth = 0.018;
      ctx.beginPath(); ctx.moveTo(-0.33, -1.0); ctx.lineTo(-0.33, -0.38); ctx.moveTo(-1.5, -0.7); ctx.lineTo(1.9, -0.7); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 0.03;
      for (const wx of [-1.3, 1.32]) {
        ctx.fillStyle = '#17151f'; ctx.beginPath(); ctx.arc(wx, -0.34, 0.36, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = css(mul('#c9ced6', lt)); ctx.beginPath(); ctx.arc(wx, -0.34, 0.19, 0, TAU); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = o.lights ? '#fff6d8' : css(mul('#f2e7b8', lt)); ctx.beginPath(); ctx.ellipse(2.02, -0.74, 0.1, 0.07, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = css(mul('#d8413a', lt)); ctx.beginPath(); ctx.ellipse(-2.05, -0.74, 0.07, 0.07, 0, 0, TAU); ctx.fill(); ctx.stroke();
      if (o.bow) { // laço de presente
        ctx.fillStyle = '#f2c230'; ctx.lineWidth = 0.025;
        for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -1.55); ctx.quadraticCurveTo(sx * 0.45, -2.0, sx * 0.5, -1.6); ctx.quadraticCurveTo(sx * 0.3, -1.5, 0, -1.55); ctx.fill(); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(0, -1.58, 0.08, 0, TAU); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    });
  }, o);
}

/** Par de tênis no chão (o.dirty = com terra). */
export function sneakers(g, x, z, o = {}) {
  g.add([x, 0.05, z], () => {
    const lt = g.lit([x, 0.2, z - 0.2]);
    for (const [dx, dz, r] of [[-0.11, 0, -0.12], [0.1, 0.05, 0.1]]) g.at([x + dx, 0, z + dz], (ctx, s) => {
      ctx.save(); ctx.scale(s, s); ctx.rotate(r);
      ctx.fillStyle = 'rgba(5,5,18,0.35)'; ctx.beginPath(); ctx.ellipse(0, 0.005, 0.14, 0.03, 0, 0, TAU); ctx.fill();
      ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 0.012;
      ctx.fillStyle = css(mul('#f2efe8', lt)); ctx.beginPath(); ctx.roundRect(-0.14, -0.03, 0.28, 0.035, 0.012); ctx.fill(); ctx.stroke();
      ctx.fillStyle = css(mul(o.c || '#d8443c', lt));
      ctx.beginPath(); ctx.moveTo(-0.135, -0.03); ctx.lineTo(-0.13, -0.1); ctx.quadraticCurveTo(-0.08, -0.13, -0.03, -0.1); ctx.quadraticCurveTo(0.06, -0.08, 0.13, -0.05); ctx.lineTo(0.135, -0.03); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = css(mul('#f2efe8', lt)); ctx.lineWidth = 0.01; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-0.03 + i * 0.035, -0.095 + i * 0.012); ctx.lineTo(-0.005 + i * 0.035, -0.07 + i * 0.012); ctx.stroke(); }
      if (o.dirty) { ctx.fillStyle = css(mul('#4a3220', lt)); for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(-0.12 + hash(i * 3.3 + dx) * 0.25, -0.012 - hash(i * 7.1 + dx) * 0.06, 0.012 + hash(i * 1.7) * 0.02, 0.008 + hash(i * 2.9) * 0.012, 0, 0, TAU); ctx.fill(); } }
      ctx.restore();
    });
  }, o);
}

/** Pegadas de terra no chão: lista de pontos [x, z]. */
export function footprints(g, pts, o = {}) {
  g.shell.push(() => {
    pts.forEach(([x, z], i) => {
      const dx = i % 2 ? 0.09 : -0.09, w = 0.07, d = 0.13;
      g.poly([[x + dx - w, 0.004, z - d], [x + dx + w, 0.004, z - d], [x + dx + w * 0.8, 0.004, z + d], [x + dx - w * 0.8, 0.004, z + d]], { fill: o.c || '#3d2a1c', alpha: 0.75 - i * 0.04 });
    });
  });
}

/** Poste de rua. */
export function streetLamp(g, x, z, o = {}) {
  const col = o.color || '#ffc77d';
  g.light([x + 0.5, 3.1, z], 5.2, col, o.k ?? 1.0);
  halo(g, [x + 0.55, 3.25, z], 0.9, col, 0.7);
  g.glows.push(() => {
    const a = g.cam.proj([x + 0.55, 3.2, z]), b = g.cam.proj([x + 0.55, 0, z]);
    if (!a || !b) return;
    const { ctx } = g, r = 1.5 * b.s, gr = ctx.createLinearGradient(0, a.y, 0, b.y);
    gr.addColorStop(0, css(col, 0.2)); gr.addColorStop(1, css(col, 0));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(a.x - 0.12 * a.s, a.y); ctx.lineTo(a.x + 0.12 * a.s, a.y); ctx.lineTo(b.x + r, b.y); ctx.lineTo(b.x - r, b.y); ctx.closePath(); ctx.fill();
  });
  g.add([x, 1.6, z], () => {
    g.box(x, 0, z, 0.16, 0.25, 0.16, { c: '#22212c' });
    g.box(x, 0.25, z, 0.07, 3.1, 0.07, { c: '#22212c', stroke: null });
    g.box(x + 0.3, 3.3, z, 0.66, 0.07, 0.07, { c: '#22212c', stroke: null });
    g.box(x + 0.55, 3.2, z, 0.3, 0.1, 0.16, { c: '#2c2b38', lit: false });
  }, o);
}

// ---------- cenários prontos ----------
const NIGHT = [52, 58, 108], DAY = [160, 156, 152], WARM = [88, 66, 78], DIM = [56, 60, 100];

export const SETS = {
  /** Sala de estar. o: { time:'night'|'day', lamp, tv, door } */
  living(g, o = {}) {
    const night = (o.time || 'night') === 'night';
    g.ambient = o.ambient || (night ? NIGHT : DAY);
    room(g, { w: 5.2, d: 5.6, h: 2.8, floor: { type: 'wood', c: '#9c6b3f' }, wall: { c: '#d9c8ab', stripes: '#d0bd9d', base: '#5b4030' } });
    win(g, 'back', -1.25, 0.95, 1.5, 1.3, { view: night ? 'night' : 'day', curtain: '#8c4a3f', shaft: night ? { color: [55, 66, 120] } : { color: [255, 236, 200], blur: 8 }, glow: night ? null : '#fff3d6' });
    picture(g, 'back', 1.15, 1.35, 0.8, 0.6, { art: 'mount' });
    door(g, 'right', 3.9, { c: '#70503a', open: o.door || 0, behind: '#06050d' });
    rug(g, -0.2, 3.1, 2.6, 1.7, { c: '#7d3440', c2: '#d9a05b' });
    sofa(g, -0.3, 4.55, { c: o.sofa || '#3d4f86' });
    table(g, -0.3, 3.15, { w: 1.15, d: 0.6, h: 0.42, c: '#7a5233', shelf: true });
    floorLamp(g, 1.55, 4.75, { on: o.lamp !== false, k: o.lampK ?? 1 });
    plant(g, -2.2, 4.9);
    if (o.tv !== undefined) tv(g, 0, 0.35, { on: o.tv });
    if (!night) g.light([-1.2, 1.6, 4.6], 4.2, '#fff1d0', 0.5);
  },

  /** Quarto. Porta na parede do fundo, à esquerda da cama. o: { lamp, sleeper, empty, phone, door, time, dresser, rec } */
  bedroom(g, o = {}) {
    const day = o.time === 'day';
    g.ambient = o.ambient || (day ? [158, 152, 150] : DIM);
    room(g, { w: 4.6, d: 4.8, h: 2.7, floor: { type: 'wood', c: '#8a6242' }, wall: { c: '#b9c0d6', base: '#4a4660' } });
    win(g, 'back', 1.4, 1.0, 1.0, 1.2, { view: day ? 'dawn' : 'night', curtain: '#5a5f8f', curtainW: 0.18, shaft: day ? { color: [255, 214, 170], blur: 8 } : { color: [48, 60, 120] }, glow: day ? '#ffe2bd' : null });
    door(g, 'back', -1.78, { c: '#6f5340', open: o.door || 0, behind: '#05040b', emit: o.doorLight });
    picture(g, 'back', -0.45, 1.75, 0.6, 0.45, { art: 'abs' });
    rug(g, -0.4, 2.3, 2.2, 1.3, { c: '#3f4b78', c2: '#aab3d9' });
    bed(g, -0.45, 3.72, { c: o.blanket || '#4e62a3', sleeper: o.sleeper, empty: o.empty });
    nightstand(g, 0.75, 4.5);
    if (o.lamp) tableLamp(g, 0.86, 0.52, 4.58, { k: o.lamp === true ? 0.8 : o.lamp });
    if (!day && o.moon !== 0) g.light([-0.2, 1.7, 3.5], 2.8, o.moonC || '#b7c2f2', o.moon ?? 0.55);
    if (o.phone !== false && !o.dresser) phoneProp(g, 0.66, 0.52, 4.4, { on: o.phoneOn !== false, front: true, rec: o.rec, k: o.phoneK ?? 0.45, color: o.phoneColor });
    if (o.dresser) {
      // cômoda aos pés da cama com o celular apoiado, câmera virada para a cama
      g.add([-0.45, 0.4, 0.36], () => {
        g.box(-0.45, 0, 0.36, 1.2, 0.82, 0.46, { c: '#6a4631' });
        const zf = 0.36 + 0.234, lt = g.lit([-0.45, 0.5, zf + 0.3]);
        for (const yy of [0.12, 0.45]) g.poly([[-0.97, yy, zf], [0.07, yy, zf], [0.07, yy + 0.26, zf], [-0.97, yy + 0.26, zf]], { stroke: mul(shade('#6a4631', 0.5), lt), lw: 0.012, raw: true });
        for (const yy of [0.25, 0.58]) g.at([-0.45, yy, zf], (ctx, sc) => { ctx.fillStyle = css(mul('#d9b64f', lt)); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, 0.008 * sc); ctx.beginPath(); ctx.arc(0, 0, 0.028 * sc, 0, TAU); ctx.fill(); ctx.stroke(); });
      });
      g.light([-0.45, 1.0, 0.75], 1.4, '#bfe0ff', o.rec ? 0.5 : 0.25);
      g.add([-0.45, 0.82, 0.4], () => g.at([-0.45, 0.82, 0.4], (ctx, s) => {
        ctx.fillStyle = '#15131f'; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, 0.012 * s); ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.roundRect(-0.055 * s, -0.23 * s, 0.11 * s, 0.23 * s, 0.018 * s); ctx.fill(); ctx.stroke();
        ctx.fillStyle = o.rec ? '#0e1a2e' : '#22202c'; ctx.beginPath(); ctx.roundRect(-0.046 * s, -0.22 * s, 0.092 * s, 0.21 * s, 0.012 * s); ctx.fill();
        ctx.fillStyle = '#2b3550'; ctx.beginPath(); ctx.arc(0, -0.2 * s, 0.012 * s, 0, TAU); ctx.fill();
        if (o.rec) {
          ctx.fillStyle = (g.T % 1) < 0.55 ? '#ff3b3b' : '#6a1515'; ctx.beginPath(); ctx.arc(-0.026 * s, -0.035 * s, 0.011 * s, 0, TAU); ctx.fill();
          ctx.fillStyle = '#e8f0ff'; ctx.font = `700 ${0.026 * s}px Inter`; ctx.textAlign = 'left'; ctx.fillText('REC', -0.008 * s, -0.026 * s);
        }
      }), { bias: -0.3 });
      if (o.rec) g.glows.push(() => g.at([-0.45, 0.95, 0.42], (ctx, s) => { const R = 0.3 * s, gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, 'rgba(255,60,60,0.35)'); gr.addColorStop(1, 'rgba(255,60,60,0)'); ctx.fillStyle = gr; ctx.fillRect(-R, -R, R * 2, R * 2); }));
    }
  },

  /** Escritório de dia. */
  office(g, o = {}) {
    g.ambient = o.ambient || [150, 150, 160];
    room(g, { w: 5, d: 5, h: 2.8, floor: { type: 'tile', c: '#8f97a8', c2: '#848c9e', ts: 0.6 }, wall: { c: '#cfd6df', base: '#59607a' } });
    win(g, 'back', 0, 1.0, 2.6, 1.35, { view: 'day', blinds: null, shaft: { color: [255, 240, 214], blur: 8 }, glow: '#eaf4ff' });
    picture(g, 'left', 3.6, 1.4, 0.7, 0.5, { art: 'abs', c2: '#3f6fa8', c3: '#d6a43f' });
    desk(g, 0, 3.5, { w: 1.7 });
    monitor(g, -0.5, 0.76, 3.6, { back: true });
    chair(g, 0, 4.15, { c: '#2c2f45' });
    plant(g, 1.95, 4.5);
    shelf(g, -1.85, 4.82, { w: 1.0, h: 1.8 });
    g.light([0, 2.3, 2.6], 4.5, '#fff6e6', 0.4);
  },

  /** Loja. */
  shop(g, o = {}) {
    g.ambient = [150, 140, 132];
    room(g, { w: 5.4, d: 4.6, h: 2.8, floor: { type: 'tile', c: '#c9b99b', c2: '#bba987', ts: 0.55 }, wall: { c: '#e2d2b2', wains: '#b6875a', base: '#5f4332' } });
    shelf(g, -1.5, 4.42, { w: 1.5, h: 2.0, boxes: true, n: 4 });
    shelf(g, 0.2, 4.42, { w: 1.5, h: 2.0, boxes: true, n: 4, items: ['#3f6fa8', '#e2ddd0', '#b9483d', '#f0b93a'] });
    shelf(g, 1.9, 4.42, { w: 1.5, h: 2.0, boxes: true, n: 4 });
    counter(g, 0.2, 3.0, { w: 2.6 });
    pendant(g, -0.9, 2.15, 3.0, { color: '#ffe6b8', k: 0.5, R: 3.6 });
    pendant(g, 1.2, 2.15, 3.0, { color: '#ffe6b8', k: 0.5, R: 3.6 });
  },

  /** Restaurante à noite. Mesa do casal em (0, 4.6). */
  restaurant(g, o = {}) {
    g.ambient = o.ambient || [70, 48, 66];
    room(g, { w: 5.6, d: 6.6, h: 2.9, floor: { type: 'wood', c: '#5d3b2a' }, wall: { c: '#7a3b3d', wains: '#4a2a26', base: '#2a1814' }, ceil: '#3a2428' });
    win(g, 'back', 0, 1.05, 2.6, 1.4, { view: 'night', curtain: '#3d1f2a', curtainW: 0.14 });
    picture(g, 'left', 4.9, 1.5, 0.6, 0.7, { art: 'abs', c2: '#d6a43f', c3: '#2d1a24' });
    table(g, 0, 4.6, { w: 0.8, d: 0.8, h: 0.78, c: '#4a2d20', cloth: '#f1ece2', leg: 0.06 });
    tableSet(g, 0, 0.785, 4.6);
    chair(g, -0.64, 4.62, { ry: -Math.PI / 2, c: '#3a2219' });
    chair(g, 0.64, 4.62, { ry: Math.PI / 2, c: '#3a2219' });
    pendant(g, 0, 2.1, 4.6, { color: '#ffb872', k: 0.9, R: 3.4 });
    table(g, -2.0, 5.8, { w: 0.9, d: 0.7, h: 0.78, c: '#4a2d20', cloth: '#f1ece2' });
    table(g, 2.0, 5.8, { w: 0.9, d: 0.7, h: 0.78, c: '#4a2d20', cloth: '#f1ece2' });
    tableLamp(g, -2.0, 0.78, 5.8, { k: 0.45, R: 1.8, color: '#ffb872' });
    tableLamp(g, 2.0, 0.78, 5.8, { k: 0.45, R: 1.8, color: '#ffb872' });
    plant(g, 2.35, 4.4, { pot: '#3a2a2a' });
  },

  /** Banheiro com espelho. o.reflect = personagem refletido. */
  bathroom(g, o = {}) {
    g.ambient = o.ambient || [40, 46, 84];
    room(g, { w: 3.2, d: 3.4, h: 2.6, floor: { type: 'tile', c: '#7f8ea3', c2: '#6f7f96', ts: 0.4 }, wall: { c: '#c5d0d8', tiles: '#dfe8ec', th: 1.25, base: '#5b6a7a' } });
    mirror(g, 0, 0.98, 1.0, 1.02, { reflect: o.reflect });
    if (!o.noSink) sink(g, 0, 3.12);
    g.light([0, 2.42, 3.2], 2.9, o.lightC || '#dfeaff', o.k ?? 0.9);
    g.add([0, 2.42, 3.36], () => g.box(0, 2.36, 3.34, 0.8, 0.08, 0.08, { c: '#f6fbff', lit: false }));
    g.glows.push(() => g.at([0, 2.4, 3.3], (ctx, s) => { const R = 0.8 * s, gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, 'rgba(225,238,255,0.5)'); gr.addColorStop(1, 'rgba(225,238,255,0)'); ctx.fillStyle = gr; ctx.fillRect(-R, -R, R * 2, R * 2); }));
    if (o.phone) phoneProp(g, 0.32, 0.9, 3.0, { flat: true, on: o.phoneOn, ry: 0.3, k: 0.6, R: 1.5 });
  },

  /** Rua à noite. */
  street(g, o = {}) {
    const view = o.view || 'night';
    g.ambient = o.ambient || (view === 'night' ? [58, 62, 112] : [150, 120, 130]);
    g.backdrop = (ctx) => skyline(ctx, g, view, 0, 0, W, H, [0, 0, 1]);
    g.room = { x0: -20, x1: 20, z0: -4, z1: 14, h: 6 };
    g.planes.push({ o: [0, 0, 0], u: [1, 0, 0], v: [0, 0, 1], n: [0, 1, 0], quad: [[-30, 0, -4], [30, 0, -4], [30, 0, 30], [-30, 0, 30]] });
    g.planes.push({ o: [0, 0, 8], u: [1, 0, 0], v: [0, 1, 0], n: [0, 0, -1], quad: [[-30, 0, 8], [30, 0, 8], [30, 9, 8], [-30, 9, 8]] });
    g.shell.push(() => {
      g.poly([[-30, 0, -4], [30, 0, -4], [30, 0, 30], [-30, 0, 30]], { fill: '#3b3d4c' });
      g.poly([[-30, 0.12, 5.2], [30, 0.12, 5.2], [30, 0.12, 8], [-30, 0.12, 8]], { fill: '#8d8b8f' });
      g.poly([[-30, 0, 5.2], [30, 0, 5.2], [30, 0.12, 5.2], [-30, 0.12, 5.2]], { fill: '#6d6b70', stroke: INK, lw: 0.012 });
      for (let i = -15; i < 15; i++) g.line([i * 1.2, 0.121, 5.2], [i * 1.2, 0.121, 8], { stroke: '#55535a', lw: 0.008, alpha: 0.6 });
      for (let i = -8; i < 8; i++) g.poly([[i * 2.4, 0.002, 1.6], [i * 2.4 + 1.1, 0.002, 1.6], [i * 2.4 + 1.1, 0.002, 1.75], [i * 2.4, 0.002, 1.75]], { fill: '#d9d4c0' });
      // fachadas
      const cols = ['#7a5a52', '#5f6a84', '#8a7a5c', '#6c5a7a'];
      for (let i = -4; i < 4; i++) {
        const bx = i * 4.2, bw = 4.2, c = cols[(i + 8) % 4];
        g.poly([[bx, 0.12, 8], [bx + bw, 0.12, 8], [bx + bw, 9, 8], [bx, 9, 8]], { fill: c, stroke: INK, lw: 0.012 });
        g.poly([[bx + 1.5, 0.12, 7.99], [bx + 2.5, 0.12, 7.99], [bx + 2.5, 2.2, 7.99], [bx + 1.5, 2.2, 7.99]], { fill: shade(c, 0.5), stroke: INK, lw: 0.012 });
      }
    });
    g.emits.push(() => {
      for (let i = -4; i < 4; i++) for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) {
        const bx = i * 4.2 + 0.5 + k * 2.2 + (r === 0 ? (k ? 0.75 : -0.15) : 0), by = (r === 0 ? 1.0 : 3.1 + (r - 1) * 2.4), on = hash(i * 7.3 + r * 3.1 + k * 11.7) > 0.5;
        g.poly([[bx, by, 7.98], [bx + 1.0, by, 7.98], [bx + 1.0, by + 1.3, 7.98], [bx, by + 1.3, 7.98]], { fill: on ? '#ffd58a' : '#1a1d33', stroke: INK, lw: 0.012, raw: true });
      }
    });
    streetLamp(g, o.lampX ?? -2.4, 6.2);
    if (o.car) car(g, o.car.x ?? 0.6, o.car.z ?? 4.3, o.car);
  },

  /** Vazio escuro (para planos abstratos). */
  void(g, o = {}) {
    g.ambient = o.ambient || [40, 44, 90];
    g.backdrop = (ctx) => {
      const gr = ctx.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H * 0.42, H * 0.75);
      gr.addColorStop(0, o.c1 || '#2a2f63'); gr.addColorStop(1, o.c2 || '#080818');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    };
    g.room = { x0: -10, x1: 10, z0: -4, z1: 20, h: 6 };
    if (o.light !== false) g.light(o.lightPos || [0.6, 2.2, 2.2], 4, o.lightC || '#ffd9a8', o.k ?? 0.8);
  },
};
