// Linha do tempo, composição do quadro, pós-processamento e legendas.
import { W, H, TAU, G, V, makeCam, drawLightmap, css, clamp, lerp, ease, ramp, hash, noise } from './core.js';
import { drawChar } from './char.js';
import { SETS } from './sets.js';
import * as ui from './ui.js';

export const FPS = 30;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const main = document.getElementById('c'); main.width = W; main.height = H;
const ctx = main.getContext('2d');
const shellC = mk(W, H), shellX = shellC.getContext('2d');
const maskC = mk(W, H), maskX = maskC.getContext('2d');
const tmpC = mk(W, H), tmpX = tmpC.getContext('2d');
const lmC = mk(W / 2, H / 2), lmX = lmC.getContext('2d');
const blC = mk(W / 4, H / 4), blX = blC.getContext('2d');
let grainC;

let story, timing, shots = [], caps = [], total = 0;

function makeGrain() {
  grainC = mk(512, 512); const x = grainC.getContext('2d'), im = x.createImageData(512, 512);
  let s = 1234567;
  for (let i = 0; i < im.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = (s >>> 24); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0);
}

const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');

function buildTimeline() {
  shots = []; caps = [];
  const beats = story.beats;
  const marks = [];
  beats.forEach((b, i) => {
    const tb = timing.beats[i];
    const list = b.shots || [b];
    list.forEach((sp, k) => {
      let st = tb.start;
      if (k > 0) {
        let wi = -1;
        if (typeof sp.at === 'number') wi = sp.at;
        else if (sp.at) { const key = norm(sp.at); wi = tb.words.findIndex((w) => norm(w.w) === key); }
        if (wi >= 0 && tb.words[wi]) st = tb.words[wi].s; else st = lerp(tb.start, tb.end, k / list.length);
      }
      marks.push({ t: st, spec: sp, beat: i, first: k === 0 });
    });
  });
  marks.forEach((m, i) => {
    const prevEnd = i ? timing.beats[marks[i - 1].beat].end : 0;
    // o corte antecipa a voz em alguns quadros
    const lead = m.first ? Math.min(0.14, Math.max(0, m.t - prevEnd) * 0.6) : 0.05;
    m.start = i ? m.t - lead : 0;
  });
  marks.forEach((m, i) => { m.end = i + 1 < marks.length ? marks[i + 1].start : timing.duration; shots.push(m); });
  total = timing.duration;
  // legendas: blocos de até 3 palavras
  const words = timing.beats.flatMap((b) => b.words);
  const hl = new Set((story.hl || []).map(norm));
  for (const w of words) { w.raw = w.w; w.hl = hl.has(norm(w.w)); }
  let cur = [];
  const flush = () => { if (cur.length) { caps.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; } };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const len = cur.reduce((a, c) => a + c.w.length + 1, 0) + w.w.length;
    const gap = cur.length ? w.s - cur[cur.length - 1].e : 0;
    if (cur.length && (cur.length >= 3 || len > 17 || gap > 0.28)) flush();
    cur.push(w);
    if (/[.!?…:;]$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 2)) flush();
  }
  flush();
  for (const w of words) w.w = w.w.replace(/[.,:;…]+$/g, '').replace(/^[…]+/, '');
  caps.forEach((c, i) => { const nx = caps[i + 1]; c.end = nx ? Math.min(nx.s, c.e + 0.5) : c.e + 0.6; c.s -= 0.04; });
}

function camAt(spec, u, T, t) {
  const a = spec, b = spec.to;
  const e = (ease[spec.e || 'io'])(u);
  let p = a.p, tg = a.t, f = a.f ?? 45;
  if (b) { p = V.lerp(a.p, b.p || a.p, e); tg = V.lerp(a.t, b.t || a.t, e); f = lerp(f, b.f ?? f, e); }
  else { const k = (spec.push ?? 0.05) * u; p = V.lerp(a.p, a.t, k); }
  const sh = spec.shake ?? 0.006;
  p = [p[0] + noise(T * 0.6, 1) * sh, p[1] + noise(T * 0.7, 2) * sh, p[2] + noise(T * 0.5, 3) * sh];
  tg = [tg[0] + noise(T * 0.5, 4) * sh, tg[1] + noise(T * 0.6, 5) * sh, tg[2]];
  // leve "soco" de zoom ao entrar no plano
  const punch = spec.punch ?? 0.035;
  f = f * (1 + punch * (1 - ease.out(clamp(t / 0.22))));
  if (spec.quake) { const q = spec.quake * Math.max(0, 1 - t / (spec.quakeDur || 0.5)); p = [p[0] + noise(T * 31, 7) * q, p[1] + noise(T * 37, 8) * q, p[2]]; }
  return makeCam({ p, t: tg, f, roll: (spec.roll || 0) + noise(T * 0.3, 9) * 0.004 });
}

function drawItems(g, list) { for (const it of list) { g.tint = null; it.fn(); } }

function compose(g, spec) {
  const fx = g.fx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.fillStyle = '#05040c'; ctx.fillRect(0, 0, W, H);
  drawLightmap(lmX, g);
  if (g.backdrop) {
    g.backdrop(ctx);
    shellX.setTransform(1, 0, 0, 1, 0, 0); shellX.globalCompositeOperation = 'source-over'; shellX.clearRect(0, 0, W, H);
    g.ctx = shellX; for (const fn of g.shell) fn();
    maskX.globalCompositeOperation = 'copy'; maskX.drawImage(shellC, 0, 0); maskX.globalCompositeOperation = 'source-over';
    shellX.globalCompositeOperation = 'destination-over'; shellX.fillStyle = '#000'; shellX.fillRect(0, 0, W, H);
    shellX.globalCompositeOperation = 'multiply'; shellX.drawImage(lmC, 0, 0, W, H);
    shellX.globalCompositeOperation = 'destination-in'; shellX.drawImage(maskC, 0, 0);
    shellX.globalCompositeOperation = 'source-over';
    g.ctx = ctx; ctx.drawImage(shellC, 0, 0);
  } else {
    for (const fn of g.shell) fn();
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(lmC, 0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  }
  for (const fn of g.emits) { g.tint = null; fn(); }
  g.items.sort((a, b) => b.z - a.z);
  const dof = fx.dof || 0;
  if (dof > 0) {
    drawItems(g, g.items.filter((i) => !i.fg));
    tmpX.globalCompositeOperation = 'copy'; tmpX.drawImage(main, 0, 0); tmpX.globalCompositeOperation = 'source-over';
    ctx.filter = `blur(${dof}px)`; const m = dof * 3; ctx.drawImage(tmpC, -m, -m, W + 2 * m, H + 2 * m); ctx.filter = 'none';
    if (fx.dofDim) { ctx.fillStyle = `rgba(6,5,16,${fx.dofDim})`; ctx.fillRect(0, 0, W, H); }
    drawItems(g, g.items.filter((i) => i.fg));
  } else drawItems(g, g.items);
  g.tint = null;
  for (const fn of g.glows) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; fn(); ctx.restore(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}

const GRADES = {
  cool: [['rgba(40,60,160,0.20)', 'rgba(255,150,90,0.10)']],
  warm: [['rgba(255,170,90,0.14)', 'rgba(120,40,90,0.14)']],
  day: [['rgba(255,236,200,0.12)', 'rgba(60,90,160,0.08)']],
  cold: [['rgba(70,110,190,0.13)', 'rgba(30,40,100,0.12)']],
  none: null,
};

function post(g, spec, T) {
  const fx = g.fx;
  // brilho (bloom)
  const ambL = (g.ambient[0] + g.ambient[1] + g.ambient[2]) / 765;
  const bloom = (fx.bloom ?? 0.34) * clamp(1.2 - ambL * 1.1, 0.35, 1);
  if (bloom > 0) {
    blX.globalCompositeOperation = 'copy'; blX.filter = 'brightness(0.72) contrast(1.9) blur(9px)';
    blX.drawImage(main, 0, 0, W / 4, H / 4); blX.filter = 'none';
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = bloom; ctx.drawImage(blC, 0, 0, W, H);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  const gr = GRADES[fx.grade || 'cool'];
  if (gr) {
    const lg = ctx.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, gr[0][0]); lg.addColorStop(1, gr[0][1]);
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  }
  // poeira no ar
  const dust = fx.dust ?? 0.5;
  if (dust > 0) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) {
      const sp = 6 + hash(i * 3.1) * 14, x = (hash(i * 7.7) * W + Math.sin(T * 0.4 + i) * 40 + T * sp * 0.6) % W;
      const y = (hash(i * 5.3) * H - T * sp + 4000 * H) % H, r = 1.5 + hash(i * 9.9) * 4.5;
      const a = dust * (0.12 + 0.4 * hash(i * 2.2)) * (0.6 + 0.4 * Math.sin(T * (0.6 + hash(i)) + i * 3));
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2); rg.addColorStop(0, `rgba(255,244,225,${a})`); rg.addColorStop(1, 'rgba(255,244,225,0)');
      ctx.fillStyle = rg; ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  if (fx.nv) ui.nightVision(ctx, T, fx.nv);
  // vinheta
  const vs = fx.vig ?? 0.62;
  const vg = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.28, W / 2, H * 0.46, H * 0.78);
  vg.addColorStop(0, 'rgba(4,3,12,0)'); vg.addColorStop(1, `rgba(4,3,12,${vs})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // granulação
  const fi = Math.floor(T * FPS);
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = fx.grain ?? 0.085;
  const ox = Math.floor(hash(fi * 1.7) * 512), oy = Math.floor(hash(fi * 2.9) * 512);
  for (let y = -oy; y < H; y += 512) for (let x = -ox; x < W; x += 512) ctx.drawImage(grainC, x, y);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

function drawCaptions(T) {
  const cst = story.captions || {};
  if (cst.off) return;
  const c = caps.find((c) => T >= c.s && T < c.end);
  if (!c) return;
  const size = cst.size || 86, yb = cst.y || H * 0.655;
  ctx.save();
  ctx.font = `400 ${size}px "Archivo Black", Inter, sans-serif`;
  ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; ctx.textAlign = 'left';
  const sp = size * 0.28, maxW = 860;
  const items = c.words.map((w) => ({ w, s: w.w, wd: ctx.measureText(w.w).width }));
  const lines = [[]]; let lw = 0;
  for (const it of items) { if (lines[lines.length - 1].length && lw + sp + it.wd > maxW) { lines.push([]); lw = 0; } lines[lines.length - 1].push(it); lw += (lw ? sp : 0) + it.wd; }
  const lh = size * 1.12;
  const pop = 0.88 + 0.12 * ease.back(clamp((T - c.s) / 0.12));
  ctx.translate(W / 2, yb); ctx.scale(pop, pop);
  lines.forEach((ln, li) => {
    const tw = ln.reduce((a, it) => a + it.wd, 0) + sp * (ln.length - 1);
    let x = -tw / 2; const y = (li - (lines.length - 1) / 2) * lh + size * 0.35;
    for (const it of ln) {
      const active = T >= it.w.s - 0.03 && T < it.w.e + 0.06;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
      ctx.strokeStyle = '#08070f'; ctx.lineWidth = size * 0.24; ctx.strokeText(it.s, x, y);
      ctx.restore();
      ctx.fillStyle = it.w.hl ? (cst.hl || '#7dff9c') : (active && cst.karaoke !== false ? (cst.active || '#ffe14d') : '#ffffff');
      ctx.fillText(it.s, x, y);
      x += it.wd + sp;
    }
  });
  ctx.restore();
}

export function renderFrame(i) {
  const T = Math.min(total - 1e-4, i / FPS);
  let sh = shots[0];
  for (const s of shots) if (T >= s.start) sh = s;
  const spec = sh.spec, t = T - sh.start, dur = sh.end - sh.start, u = clamp(t / dur);
  const cam = camAt(spec.cam, u, T, t);
  const g = new G(ctx, cam, t, T, dur);
  g.fx = { ...(story.fx || {}), ...(typeof spec.fx === 'function' ? spec.fx(t, u) : (spec.fx || {})) };
  const so = typeof spec.so === 'function' ? spec.so(t, u, T) : (spec.so || {});
  (SETS[spec.set || 'void'])(g, so);
  const chars = typeof spec.chars === 'function' ? spec.chars(t, u, T) : (spec.chars || []);
  chars.forEach((c, k) => {
    const def = { id: k + 1, ...(story.cast[c.who] || {}), ...c };
    if ((def.pose === 'phone' || def.pose === 'phoneUp') && def.phoneOn !== false && !def.back) {
      g.light([def.at[0] + (def.flip ? -0.1 : 0.1), (def.y || 0) + 1.0, def.at[1] - 0.32], 1.15, def.phoneC || '#bcd8ff', def.phoneK ?? 0.7);
    }
    g.add([def.at[0], (def.y || 0) + 0.9, def.at[1]], () => drawChar(g, def), { fg: def.fg !== false, bias: def.bias || 0 });
  });
  if (spec.props) spec.props(g, t, u, T);
  compose(g, spec);
  post(g, spec, T);
  if (spec.ui) { ctx.save(); spec.ui(ctx, { t, u, T, dur, g, ui }); ctx.restore(); }
  // transições
  const fin = spec.fadeIn ?? (sh === shots[0] ? 0.35 : 0);
  if (fin && t < fin) { ctx.fillStyle = `rgba(0,0,0,${1 - t / fin})`; ctx.fillRect(0, 0, W, H); }
  if (spec.fadeOut && dur - t < spec.fadeOut) { ctx.fillStyle = `rgba(0,0,0,${1 - (dur - t) / spec.fadeOut})`; ctx.fillRect(0, 0, W, H); }
  if (spec.flash && t < 0.3) { ctx.fillStyle = css(spec.flashC || '#ffffff', spec.flash * (1 - t / 0.3)); ctx.fillRect(0, 0, W, H); }
  if (total - T < 0.25) { ctx.fillStyle = `rgba(0,0,0,${1 - (total - T) / 0.25})`; ctx.fillRect(0, 0, W, H); }
  drawCaptions(T);
  return true;
}

export async function init(name, opts = {}) {
  story = (await import(`../stories/${name}.js?v=${Date.now()}`)).default;
  const r = await fetch(`../out/${name}/timing.json?v=${Date.now()}`);
  timing = await r.json();
  await Promise.all([
    document.fonts.load('400 86px "Archivo Black"'), document.fonts.load('700 40px Inter'), document.fonts.load('500 40px Inter'),
    document.fonts.load('800 40px Inter'), document.fonts.load('300 40px Inter'), document.fonts.load('600 40px Inter'), document.fonts.load('700 40px Caveat'),
  ]);
  makeGrain();
  buildTimeline();
  return { frames: Math.ceil(total * FPS), fps: FPS, duration: total, shots: shots.map((s) => ({ start: s.start, end: s.end, beat: s.beat })), caps: caps.length };
}

window.VID = { init, renderFrame, jpeg: (q = 0.94) => main.toDataURL('image/jpeg', q), png: () => main.toDataURL('image/png') };
