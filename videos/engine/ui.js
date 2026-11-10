// Inserções 2D: celular na mão com telas (bloqueio, conversa, banco, app), visão noturna, cartão final.
import { W, H, TAU, INK, css, shade, clamp, lerp, ease, ramp, hash, noise, rr } from './core.js';

const UI = 'Inter, "Inter Display", system-ui, sans-serif';
export const brl = (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function txt(c, s, x, y, size, o = {}) {
  c.font = `${o.w || 600} ${size}px ${o.font || UI}`;
  c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
  c.fillStyle = o.c || '#fff';
  if (o.max) {
    const words = s.split(' '); let line = '', yy = y; const lh = o.lh || size * 1.25;
    for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > o.max && line) { c.fillText(line, x, yy); line = w; yy += lh; } else line = t; }
    c.fillText(line, x, yy); return yy + lh;
  }
  c.fillText(s, x, y); return y + size * 1.25;
}

/**
 * Celular. o: { cx, cy, h, rot, hand, skin, buzz (0..1 intensidade), T, dim }
 * screen(c, w, h): desenha a tela em coordenadas lógicas 390 x 844.
 */
export function phone(ctx, o, screen) {
  const ph = o.h || 1250, pw = ph * 0.487, T = o.T || 0;
  const bz = o.buzz || 0;
  ctx.save();
  ctx.translate(o.cx ?? W / 2, (o.cy ?? H * 0.47));
  ctx.rotate((o.rot || 0) + Math.sin(T * 95) * 0.012 * bz);
  ctx.translate(Math.sin(T * 120) * 9 * bz, Math.cos(T * 87) * 5 * bz);
  const skin = o.skin || '#f3bd8e';
  const x = -pw / 2, y = -ph / 2, r = pw * 0.13;
  ctx.lineJoin = 'round';
  if (o.hand !== false) { // palma e dedos atrás do aparelho
    ctx.fillStyle = skin; ctx.strokeStyle = INK; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(x - 40, ph * 0.2); ctx.quadraticCurveTo(x - 90, ph * 0.52, x + pw * 0.2, ph * 0.72); ctx.lineTo(x + pw * 0.95, ph * 0.72); ctx.quadraticCurveTo(pw / 2 + 80, ph * 0.5, pw / 2 + 36, ph * 0.12); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 4; i++) { const fy = -ph * 0.02 + i * ph * 0.1; ctx.beginPath(); ctx.ellipse(pw / 2 + 12, fy, 44, 40, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
  }
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 26;
  rr(ctx, x, y, pw, ph, r); ctx.fillStyle = '#14121d'; ctx.fill();
  ctx.restore();
  rr(ctx, x, y, pw, ph, r); ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.stroke();
  rr(ctx, x + 5, y + 5, pw - 10, ph - 10, r - 4); ctx.strokeStyle = '#3a3750'; ctx.lineWidth = 3; ctx.stroke();
  // tela
  const m = pw * 0.035, sw = pw - m * 2, sh = ph - m * 2, k = sw / 390;
  ctx.save();
  rr(ctx, x + m, y + m, sw, sh, r - m); ctx.clip();
  ctx.translate(x + m, y + m); ctx.scale(k, sh / 844 > k ? k : k);
  const LH = sh / k;
  screen(ctx, 390, LH);
  // câmera frontal
  ctx.fillStyle = '#0b0a12'; ctx.beginPath(); ctx.roundRect(195 - 46, 14, 92, 26, 13); ctx.fill();
  if (o.dim) { ctx.fillStyle = `rgba(0,0,0,${o.dim})`; ctx.fillRect(0, 0, 390, LH); }
  // reflexo
  const gl = ctx.createLinearGradient(0, 0, 390, LH * 0.6); gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(0.45, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = gl; ctx.fillRect(0, 0, 390, LH);
  ctx.restore();
  if (o.hand !== false) { // polegar na frente
    ctx.fillStyle = skin; ctx.strokeStyle = INK; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(x - 46, ph * 0.3); ctx.quadraticCurveTo(x - 70, ph * 0.08, x + 28, ph * 0.06); ctx.quadraticCurveTo(x + 80, ph * 0.08, x + 64, ph * 0.15); ctx.quadraticCurveTo(x + 10, ph * 0.2, x + 6, ph * 0.36); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function statusBar(c, time, dark = false) {
  const col = dark ? '#111' : '#fff';
  txt(c, time, 34, 36, 17, { w: 700, c: col });
  c.fillStyle = col;
  for (let i = 0; i < 4; i++) c.fillRect(300 + i * 7, 34 - 5 - i * 3, 5, 5 + i * 3);
  c.strokeStyle = col; c.lineWidth = 1.5; c.strokeRect(336, 22, 26, 13); c.fillRect(338, 24, 17, 9);
}

function card(c, x, y, w, h, r, fill, sh = true) {
  c.save();
  if (sh) { c.shadowColor = 'rgba(0,0,0,0.28)'; c.shadowBlur = 24; c.shadowOffsetY = 8; }
  c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill();
  c.restore();
}

/** Tela de bloqueio com notificação. o: { time, day, n:[{app, title, body, color, icon, at}], t, wall } */
export function lockScreen(c, w, h, o) {
  const wl = o.wall || ['#1b1746', '#4a2a7c', '#0e0c25'];
  const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, wl[0]); gr.addColorStop(0.5, wl[1]); gr.addColorStop(1, wl[2]);
  c.fillStyle = gr; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(255,255,255,0.05)'; c.beginPath(); c.arc(320, 640, 220, 0, TAU); c.fill(); c.beginPath(); c.arc(40, 300, 150, 0, TAU); c.fill();
  statusBar(c, o.time);
  txt(c, o.day || 'segunda-feira', w / 2, 128, 21, { w: 500, align: 'center', c: 'rgba(255,255,255,0.85)' });
  txt(c, o.time, w / 2, 222, 92, { w: 300, align: 'center' });
  let y = 290;
  const ns = (o.n || []).filter((n) => o.t >= (n.at || 0)).reverse();
  for (const n of ns) {
    const a = ease.back(ramp(o.t, n.at || 0, (n.at || 0) + 0.32));
    const hh = n.warn ? 176 : (n.big ? 132 : 104);
    c.save(); c.globalAlpha = clamp(a * 1.5); c.translate(0, (1 - a) * -70);
    card(c, 16, y, w - 32, hh, 24, 'rgba(250,250,255,0.94)');
    if (n.warn) { c.strokeStyle = '#c0392b'; c.lineWidth = 4; c.beginPath(); c.roundRect(16, y, w - 32, hh, 24); c.stroke(); }
    c.beginPath(); c.roundRect(32, y + 18, 40, 40, 10); c.fillStyle = n.color || '#1faa59'; c.fill();
    txt(c, n.icon || '$', 52, y + 47, 25, { w: 800, align: 'center' });
    txt(c, n.app || 'Banco', 84, y + 34, 15, { w: 600, c: '#6a6a78' });
    txt(c, 'agora', w - 34, y + 34, 14, { w: 500, c: '#8a8a98', align: 'right' });
    txt(c, n.title, 84, y + 58, 18, { w: 700, c: '#15131f' });
    if (n.warn) txt(c, n.body, 32, y + 104, 29, { w: 800, c: '#a61f17', max: w - 70, lh: 36 });
    else txt(c, n.body, 32, y + (n.big ? 108 : 88), n.big ? 31 : 17, { w: n.big ? 800 : 500, c: n.big ? '#12833f' : '#3a3a48' });
    c.restore();
    y += (hh + 12) * clamp(a);
  }
}

/** Conversa. o: { name, color, msgs:[{me, text, at}], t, typing } */
export function chatScreen(c, w, h, o) {
  c.fillStyle = '#efeae2'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#0f6b5c'; c.fillRect(0, 0, w, 104);
  statusBar(c, o.time || '18:42');
  c.fillStyle = o.color || '#f0b23a'; c.beginPath(); c.arc(52, 74, 20, 0, TAU); c.fill();
  txt(c, (o.name || 'A')[0], 52, 82, 22, { w: 800, align: 'center', c: '#fff' });
  txt(c, o.name || 'Amigo', 84, 72, 20, { w: 700 });
  txt(c, o.typing && o.t < o.typing ? 'digitando…' : 'online', 84, 92, 14, { w: 500, c: 'rgba(255,255,255,0.8)' });
  let y = 136;
  for (const m of o.msgs) {
    if (o.t < (m.at || 0)) continue;
    const a = ease.out(ramp(o.t, m.at || 0, (m.at || 0) + 0.22));
    c.font = `500 ${m.size || 22}px ${UI}`;
    const maxw = 250, words = m.text.split(' '), lines = []; let line = '';
    for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (c.measureText(t).width > maxw && line) { lines.push(line); line = wd; } else line = t; }
    lines.push(line);
    const bw = Math.max(...lines.map((l) => c.measureText(l).width)) + 34, lh = (m.size || 22) * 1.3, bh = lines.length * lh + 30;
    const bx = m.me ? w - 16 - bw : 16;
    c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 24);
    card(c, bx, y, bw, bh, 18, m.me ? '#d9fdd3' : '#ffffff');
    lines.forEach((l, i) => txt(c, l, bx + 17, y + 30 + i * lh, m.size || 22, { w: 500, c: '#16141f' }));
    txt(c, m.hour || '18:42', bx + bw - 12, y + bh - 8, 11, { w: 500, c: '#7a8a84', align: 'right' });
    c.restore();
    y += bh + 12;
  }
}

/** App de banco. o: { from, to, t0, t1, t, rows:[{label, v}], name } */
export function bankScreen(c, w, h, o) {
  c.fillStyle = '#f4f5f8'; c.fillRect(0, 0, w, h);
  const gr = c.createLinearGradient(0, 0, w, 330); gr.addColorStop(0, '#0e8a4f'); gr.addColorStop(1, '#0a5d3c');
  c.fillStyle = gr; c.beginPath(); c.roundRect(0, -30, w, 350, 34); c.fill();
  statusBar(c, o.time || '09:15');
  txt(c, 'Olá, ' + (o.name || 'você'), 30, 96, 20, { w: 600, c: 'rgba(255,255,255,0.9)' });
  txt(c, 'Saldo disponível', 30, 150, 17, { w: 500, c: 'rgba(255,255,255,0.75)' });
  const u = ease.out(ramp(o.t, o.t0 ?? 0, o.t1 ?? 1));
  const val = lerp(o.from ?? 0, o.to ?? 0, u);
  const pop = 1 + 0.06 * Math.sin(clamp(ramp(o.t, o.t1 ?? 1, (o.t1 ?? 1) + 0.25)) * Math.PI);
  c.save(); c.translate(30, 204); c.scale(pop, pop);
  const s = brl(val); c.font = `800 44px ${UI}`; const tw = c.measureText(s).width; const k = Math.min(1, 330 / tw);
  c.scale(k, k); txt(c, s, 0, 0, 44, { w: 800 });
  c.restore();
  if (o.delta) { card(c, 30, 232, 200, 40, 20, 'rgba(255,255,255,0.18)', false); txt(c, o.delta, 46, 259, 18, { w: 700, c: '#c9ffd9' }); }
  txt(c, 'Últimas movimentações', 30, 372, 18, { w: 700, c: '#23222e' });
  let y = 396;
  (o.rows || []).forEach((r, i) => {
    const a = ease.out(ramp(o.t, (r.at ?? 0), (r.at ?? 0) + 0.25));
    if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.translate((1 - a) * 40, 0);
    card(c, 20, y, w - 40, 74, 18, r.hl ? '#fff7c2' : '#fff');
    c.fillStyle = r.v > 0 ? '#dff5e7' : '#fde3e3'; c.beginPath(); c.arc(56, y + 37, 20, 0, TAU); c.fill();
    txt(c, r.v > 0 ? '+' : '–', 56, y + 46, 26, { w: 700, c: r.v > 0 ? '#12833f' : '#c0392b', align: 'center' });
    txt(c, r.label, 88, y + 33, 17, { w: 600, c: '#23222e' });
    txt(c, r.sub || 'Pix recebido', 88, y + 55, 13, { w: 500, c: '#858496' });
    txt(c, (r.v > 0 ? '+ ' : '– ') + brl(Math.abs(r.v)), w - 34, y + 44, 16, { w: 700, c: r.v > 0 ? '#12833f' : '#c0392b', align: 'right' });
    c.restore();
    y += 84;
  });
}

/** Tela de oferta com botão. o: { title, lines[], amount, sub, btn, t, tapAt, accent, icon } */
export function offerScreen(c, w, h, o) {
  const ac = o.accent || '#8b5cf6';
  const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d0b1f'); gr.addColorStop(1, '#1a1140');
  c.fillStyle = gr; c.fillRect(0, 0, w, h);
  c.fillStyle = css(ac, 0.16); c.beginPath(); c.arc(w / 2, 250, 190 + Math.sin(o.t * 2) * 8, 0, TAU); c.fill();
  c.fillStyle = css(ac, 0.22); c.beginPath(); c.arc(w / 2, 250, 120 + Math.sin(o.t * 2 + 1) * 6, 0, TAU); c.fill();
  statusBar(c, o.time || '23:14');
  c.fillStyle = ac; c.beginPath(); c.arc(w / 2, 250, 64, 0, TAU); c.fill();
  txt(c, o.icon || '$', w / 2, 276, 70, { w: 800, align: 'center' });
  txt(c, o.title || '', w / 2, 392, 26, { w: 800, align: 'center' });
  if (o.amount) txt(c, o.amount, w / 2, 462, 50, { w: 800, align: 'center', c: '#7dffb0' });
  let y = o.amount ? 512 : 448;
  for (const l of o.lines || []) { y = txt(c, l, w / 2, y, 20, { w: 500, align: 'center', c: 'rgba(255,255,255,0.82)', max: 320, lh: 28 }) + 6; }
  const tap = o.tapAt != null ? ramp(o.t, o.tapAt, o.tapAt + 0.18) : 0;
  const pressed = tap > 0 && tap < 1;
  const by = h - 190, bs = pressed ? 0.95 : 1;
  c.save(); c.translate(w / 2, by + 34); c.scale(bs, bs);
  card(c, -150, -34, 300, 68, 34, tap >= 1 ? '#1faa59' : ac);
  txt(c, tap >= 1 ? (o.done || 'ACEITO ✓') : (o.btn || 'ACEITAR'), 0, 9, 24, { w: 800, align: 'center' });
  c.restore();
  if (o.sub) txt(c, o.sub, w / 2, h - 90, 14, { w: 500, align: 'center', c: 'rgba(255,255,255,0.45)' });
  if (tap > 0 && tap < 1.6) { c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - ramp(o.t, o.tapAt, o.tapAt + 0.45))})`; c.lineWidth = 4; c.beginPath(); c.arc(w / 2, by + 34, 30 + ramp(o.t, o.tapAt, o.tapAt + 0.45) * 90, 0, TAU); c.stroke(); }
}

/** Lista de gravações. o: { rows:[{d, hour, len}], sel, t, scroll } */
export function recScreen(c, w, h, o) {
  c.fillStyle = '#0c0c14'; c.fillRect(0, 0, w, h);
  statusBar(c, o.time || '10:02');
  txt(c, 'Gravações', 26, 100, 32, { w: 800 });
  txt(c, o.sub || 'Suas noites', 26, 128, 16, { w: 500, c: 'rgba(255,255,255,0.5)' });
  c.save(); c.beginPath(); c.rect(0, 150, w, h - 150); c.clip();
  c.translate(0, -(o.scroll || 0));
  o.rows.forEach((r, i) => {
    const y = 162 + i * 148, sel = o.sel === i;
    card(c, 18, y, w - 36, 134, 20, sel ? '#22224a' : '#17172a', false);
    if (sel) { c.strokeStyle = '#7d8cff'; c.lineWidth = 3; c.beginPath(); c.roundRect(18, y, w - 36, 134, 20); c.stroke(); }
    const tg = c.createLinearGradient(30, y + 12, 170, y + 122); tg.addColorStop(0, '#16351f'); tg.addColorStop(1, '#0b1a10');
    c.fillStyle = tg; c.beginPath(); c.roundRect(30, y + 12, 150, 110, 12); c.fill();
    c.fillStyle = 'rgba(140,255,170,0.25)'; c.beginPath(); c.roundRect(52, y + 78, 106, 30, 6); c.fill(); c.beginPath(); c.arc(74, y + 68, 14, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.moveTo(96, y + 52); c.lineTo(96, y + 84); c.lineTo(122, y + 68); c.closePath(); c.fill();
    txt(c, r.d, 198, y + 48, 20, { w: 700 });
    txt(c, r.hour, 198, y + 78, 17, { w: 600, c: r.hot ? '#ff6b6b' : 'rgba(255,255,255,0.65)' });
    txt(c, r.len || '8h 02min', 198, y + 106, 14, { w: 500, c: 'rgba(255,255,255,0.4)' });
  });
  c.restore();
}

/** Efeito de câmera de visão noturna sobre a cena já desenhada. */
export function nightVision(ctx, T, o = {}) {
  ctx.save();
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(70,90,80,0.55)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = o.tint || '#7dffa0'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);
  const by = ((T * 260) % (H + 400)) - 200;
  const bg = ctx.createLinearGradient(0, by, 0, by + 200); bg.addColorStop(0, 'rgba(180,255,200,0)'); bg.addColorStop(0.5, 'rgba(180,255,200,0.07)'); bg.addColorStop(1, 'rgba(180,255,200,0)');
  ctx.fillStyle = bg; ctx.fillRect(0, by, W, 200);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // HUD
  ctx.font = `700 44px "DejaVu Sans Mono", monospace`; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(210,255,220,0.92)'; ctx.textAlign = 'left';
  ctx.fillText(o.cam || 'CAM 01 · QUARTO', 70, 190);
  ctx.fillText(o.date || '', 70, 246);
  ctx.textAlign = 'right';
  ctx.fillText(o.time || '03:07:00', W - 70, 190);
  if ((T % 1) < 0.6) { ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(W - 250, 232, 14, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(210,255,220,0.92)'; ctx.fillText('REC', W - 70, 246);
  ctx.strokeStyle = 'rgba(210,255,220,0.6)'; ctx.lineWidth = 5;
  const m = 46, L = 80;
  for (const [cx, cy, sx, sy] of [[m, m + 60, 1, 1], [W - m, m + 60, -1, 1], [m, H - m - 330, 1, -1], [W - m, H - m - 330, -1, -1]]) { ctx.beginPath(); ctx.moveTo(cx + sx * L, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * L); ctx.stroke(); }
  ctx.restore();
}

/** Texto grande centralizado (cartão final / título). lines: [{ s, c, size }] */
export function bigText(ctx, lines, o = {}) {
  const a = o.a ?? 1;
  ctx.save();
  ctx.globalAlpha = a;
  let y = o.y ?? H * 0.36;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  lines.forEach((l, i) => {
    const size = l.size || 110;
    if (i) y += size * 1.12;
    ctx.font = `400 ${size}px "Archivo Black", ${UI}`;
    ctx.save(); ctx.translate(W / 2, y); const sc = o.pop ?? 1; ctx.scale(sc, sc);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.strokeStyle = '#0b0914'; ctx.lineWidth = size * 0.2; ctx.strokeText(l.s, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = l.c || '#fff'; ctx.fillText(l.s, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

/** Seta apontando para baixo (chamada para os comentários). */
export function arrowDown(ctx, x, y, s, T, c = '#ffe14d') {
  ctx.save(); ctx.translate(x, y + Math.sin(T * 6) * 14); ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.strokeStyle = '#0b0914'; ctx.lineWidth = 16; ctx.fillStyle = c;
  ctx.beginPath(); ctx.moveTo(-22, -70); ctx.lineTo(22, -70); ctx.lineTo(22, 0); ctx.lineTo(58, 0); ctx.lineTo(0, 70); ctx.lineTo(-58, 0); ctx.lineTo(-22, 0); ctx.closePath(); ctx.stroke(); ctx.fill();
  ctx.restore();
}

/** Papel com texto manuscrito. */
export function note(ctx, o) {
  ctx.save(); ctx.translate(o.cx ?? W / 2, o.cy ?? H * 0.45); ctx.rotate(o.rot || -0.04);
  const w = o.w || 760, h = o.h || 520;
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  ctx.fillStyle = '#f4efe2'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(90,120,180,0.28)'; ctx.lineWidth = 3;
  for (let y = -h / 2 + 90; y < h / 2 - 20; y += 74) { ctx.beginPath(); ctx.moveTo(-w / 2 + 30, y); ctx.lineTo(w / 2 - 30, y); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#1c2a55'; ctx.textAlign = 'center'; ctx.font = `700 ${o.size || 84}px Caveat, cursive`;
  (o.lines || []).forEach((l, i) => ctx.fillText(l, 0, -h / 2 + 150 + i * 96));
  ctx.restore();
}

/** Etiqueta no topo (dia da semana, lugar…). */
export function chip(ctx, s, t) {
  const a = ease.back(ramp(t, 0.05, 0.38));
  ctx.save();
  ctx.globalAlpha = clamp(a * 1.5);
  ctx.translate(W / 2, 265 - (1 - a) * 90); ctx.rotate(-0.025);
  ctx.font = `800 56px ${UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(s).width + 76;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  ctx.beginPath(); ctx.roundRect(-tw / 2, -52, tw, 104, 26); ctx.fillStyle = '#ffe14d'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke();
  ctx.fillStyle = INK; ctx.fillText(s, 0, 4);
  ctx.restore();
}

/** Valor subindo e sumindo (dinheiro caindo na conta). */
export function moneyPop(ctx, x, y, s, t, k = 1) {
  if (t < 0 || t > 1.5) return;
  const u = t / 1.5, a = u < 0.12 ? u / 0.12 : 1 - Math.max(0, (u - 0.62) / 0.38);
  const size = 92 * k, pop = 0.7 + 0.3 * ease.back(clamp(t / 0.22));
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.translate(x, y - ease.out(u) * 190 * k); ctx.scale(pop, pop); ctx.rotate(-0.05);
  ctx.font = `400 ${size}px "Archivo Black", ${UI}`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#08070f'; ctx.lineWidth = size * 0.22; ctx.strokeText(s, 0, 0);
  ctx.fillStyle = '#7dff9c'; ctx.fillText(s, 0, 0);
  ctx.restore();
}

/** "Zzz" flutuando (sono). */
export function zzz(ctx, x, y, T, k = 1) {
  ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    const u = ((T * 0.45 + i / 3) % 1), size = (46 + i * 26) * k;
    ctx.globalAlpha = Math.sin(Math.PI * u) * 0.95;
    ctx.font = `400 ${size}px "Archivo Black", ${UI}`;
    const px = x + u * 110 * k + Math.sin(u * 6 + i) * 14, py = y - u * 230 * k;
    ctx.strokeStyle = '#08070f'; ctx.lineWidth = size * 0.2; ctx.strokeText('Z', px, py);
    ctx.fillStyle = '#dfe6ff'; ctx.fillText('Z', px, py);
  }
  ctx.restore();
}

/** Tela de instalação de aplicativo. o: { name, tag, amount, t, tapAt, icon, accent } */
export function appScreen(c, w, h, o) {
  const ac = o.accent || '#5b6cff';
  const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#070818'); gr.addColorStop(1, '#141a44');
  c.fillStyle = gr; c.fillRect(0, 0, w, h);
  c.fillStyle = '#fff';
  for (let i = 0; i < 40; i++) { c.globalAlpha = 0.25 + 0.5 * hash(i * 3.3) * (0.6 + 0.4 * Math.sin(o.t * 2 + i)); c.beginPath(); c.arc(hash(i * 7.7) * w, hash(i * 2.9) * h * 0.6, 1 + hash(i) * 1.6, 0, TAU); c.fill(); }
  c.globalAlpha = 1;
  statusBar(c, o.time || '23:41');
  // ícone: lua
  c.save(); c.translate(w / 2, 230);
  c.beginPath(); c.roundRect(-78, -78, 156, 156, 38); c.fillStyle = ac; c.fill();
  c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(4, 0, 46, 0, TAU); c.fill();
  c.fillStyle = ac; c.beginPath(); c.arc(26, -14, 40, 0, TAU); c.fill();
  c.restore();
  txt(c, o.name || 'SonoPago', w / 2, 366, 34, { w: 800, align: 'center' });
  txt(c, o.tag || 'Durma. A gente paga.', w / 2, 400, 18, { w: 500, align: 'center', c: 'rgba(255,255,255,0.7)' });
  txt(c, o.amount || 'R$ 5.000', w / 2, 492, 60, { w: 800, align: 'center', c: '#7dffb0' });
  txt(c, o.per || 'por noite dormida', w / 2, 528, 20, { w: 600, align: 'center', c: 'rgba(255,255,255,0.85)' });
  if (o.rule) { card(c, 34, 566, w - 68, 84, 18, 'rgba(255,255,255,0.08)', false); txt(c, o.rule, w / 2, 600, 16, { w: 500, align: 'center', c: 'rgba(255,255,255,0.8)', max: w - 100, lh: 23 }); }
  const tap = o.tapAt != null ? ramp(o.t, o.tapAt, o.tapAt + 0.16) : 0;
  const prog = o.tapAt != null ? ramp(o.t, o.tapAt + 0.16, o.tapAt + 0.95) : 0;
  const by = h - 170;
  c.save(); c.translate(w / 2, by + 34); const bs = tap > 0 && tap < 1 ? 0.95 : 1; c.scale(bs, bs);
  card(c, -150, -34, 300, 68, 34, prog >= 1 ? '#1faa59' : (tap >= 1 ? 'rgba(255,255,255,0.14)' : ac));
  if (tap >= 1 && prog < 1) { c.save(); c.beginPath(); c.roundRect(-150, -34, 300, 68, 34); c.clip(); c.fillStyle = ac; c.fillRect(-150, -34, 300 * prog, 68); c.restore(); }
  txt(c, prog >= 1 ? 'INSTALADO' : (tap >= 1 ? `${Math.round(prog * 100)}%` : (o.btn || 'INSTALAR')), 0, 9, 24, { w: 800, align: 'center' });
  c.restore();
  if (tap > 0 && o.t < o.tapAt + 0.5) { c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - ramp(o.t, o.tapAt, o.tapAt + 0.45))})`; c.lineWidth = 4; c.beginPath(); c.arc(w / 2, by + 34, 30 + ramp(o.t, o.tapAt, o.tapAt + 0.45) * 90, 0, TAU); c.stroke(); }
}

/**
 * Balão de fala ou de pensamento. o: { x, y (centro), text, t, kind:'say'|'think', maxW, size, tail:[x,y], c, ink }
 */
export function bubble(ctx, o) {
  const t = o.t ?? 1;
  if (t <= 0) return;
  const a = ease.back(clamp(t / 0.26)), size = o.size || 54, maxW = o.maxW || 620, think = o.kind === 'think';
  ctx.save();
  ctx.font = `${think ? 700 : 800} ${size}px ${UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = o.text.split(' '), lines = []; let line = '';
  for (const w of words) { const tl = line ? line + ' ' + w : w; if (ctx.measureText(tl).width > maxW && line) { lines.push(line); line = w; } else line = tl; }
  lines.push(line);
  const lh = size * 1.2, bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + size * 1.5, bh = lines.length * lh + size * 1.1;
  const fl = Math.sin((o.T || 0) * 1.6) * 6;
  ctx.globalAlpha = clamp(t / 0.12) * (o.alpha ?? 1);
  const fill = o.c || (think ? '#efe9ff' : '#ffffff'), ink = o.ink || INK;
  const shapes = (grow) => {
    ctx.save(); ctx.translate(o.x, o.y + fl); ctx.scale(a, a);
    if (think) {
      ctx.beginPath(); ctx.roundRect(-bw / 2 - grow, -bh / 2 - grow, bw + 2 * grow, bh + 2 * grow, bh * 0.42); ctx.fill();
      const n = Math.max(5, Math.round(bw / 120));
      for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, r = bh * 0.2 + (i % 2) * bh * 0.07 + grow; for (const sy of [-1, 1]) { ctx.beginPath(); ctx.arc(-bw / 2 + u * bw, sy * bh * 0.46, r, 0, TAU); ctx.fill(); } }
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * bw * 0.49, 0, bh * 0.3 + grow, 0, TAU); ctx.fill(); }
    } else {
      ctx.beginPath(); ctx.roundRect(-bw / 2 - grow, -bh / 2 - grow, bw + 2 * grow, bh + 2 * grow, 34); ctx.fill();
    }
    ctx.restore();
    if (o.tail) {
      const [tx, ty] = o.tail, bx = o.x, by = o.y + fl + Math.sign(ty - o.y) * bh * 0.5 * a;
      if (think) { for (let i = 1; i <= 3; i++) { const u = i / 3.6; ctx.beginPath(); ctx.arc(lerp(bx, tx, u) * 1, lerp(by, ty, u), (26 - i * 6) * a + grow, 0, TAU); ctx.fill(); } }
      else { const dx = tx > bx ? 1 : -1; ctx.beginPath(); ctx.moveTo(bx - 30 - grow, by - 8 * Math.sign(ty - o.y)); ctx.lineTo(bx + 30 + grow, by - 8 * Math.sign(ty - o.y)); ctx.lineTo(lerp(bx, tx, 0.55) + dx * grow, lerp(by, ty, 0.55) + Math.sign(ty - o.y) * grow * 1.5); ctx.closePath(); ctx.fill(); }
    }
  };
  ctx.fillStyle = ink; shapes(9);
  ctx.fillStyle = fill; shapes(0);
  ctx.translate(o.x, o.y + fl); ctx.scale(a, a);
  ctx.fillStyle = think ? '#3b2a6b' : '#15131f';
  ctx.font = `${think ? 'italic 700' : 800} ${size}px ${UI}`;
  lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * lh + 3));
  ctx.restore();
}
