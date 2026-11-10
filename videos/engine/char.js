// Personagens: cabeça redonda, corpo em gota, braços e pernas em traço.
// Desenhados em metros (1 unidade = 1 m) num sprite, depois iluminados pela fatia de luz.
import { W, H, TAU, INK, css, shade, clamp, lerp, hash, noise, drawLightSlice } from './core.js';

export const SKIN = { a: '#f3bd8e', b: '#e6a877', c: '#c58a5e', d: '#93603f', e: '#f8d6b8' };
export const HAIR = { brown: '#3d2b25', black: '#24212e', blonde: '#e0b04c', ginger: '#b9582c', grey: '#a9a9b4', choc: '#5a3a28', wine: '#5b2333' };

export const FACES = {
  neutral: { eyes: 'dot', mouth: 'flat' },
  happy: { eyes: 'dot', mouth: 'smile' },
  joy: { eyes: 'happy', mouth: 'grin' },
  laugh: { eyes: 'squint', mouth: 'grin' },
  shock: { eyes: 'wide', mouth: 'gasp', brows: 'up' },
  scared: { eyes: 'wide', mouth: 'wavy', brows: 'worried', sweat: true },
  nervous: { eyes: 'dot', mouth: 'wavy', brows: 'worried', sweat: true },
  sad: { eyes: 'dot', mouth: 'frown', brows: 'worried' },
  hurt: { eyes: 'dot', mouth: 'wavy', brows: 'worried' },
  cry: { eyes: 'dot', mouth: 'wavy', brows: 'worried', tears: true },
  tired: { eyes: 'half', mouth: 'flat', bags: true },
  awake: { eyes: 'wide', mouth: 'flat', bags: true },
  angry: { eyes: 'dot', mouth: 'frown', brows: 'angry' },
  sus: { eyes: 'half', mouth: 'flat', brows: 'low' },
  smug: { eyes: 'half', mouth: 'smirk' },
  sleep: { eyes: 'closed', mouth: 'flat' },
  love: { eyes: 'happy', mouth: 'smile', blush: true },
  sweet: { eyes: 'dot', mouth: 'smile', blush: true },
  creepy: { eyes: 'closed', mouth: 'wide' },
  blank: { eyes: 'dot', mouth: 'none' },
  talk: { eyes: 'dot', mouth: 'o' },
  think: { eyes: 'dot', mouth: 'flat', brows: 'one' },
};

// mãos em coordenadas do corpo (m): x para a direita da tela, y para cima
export const POSES = {
  down: () => ({ L: [-0.3, 0.5], R: [0.3, 0.5] }),
  phone: (T) => ({ L: [-0.3, 0.5], R: [0.1, 0.9 + Math.sin(T * 1.3) * 0.004], hold: 'R' }),
  phoneUp: (T) => ({ L: [-0.3, 0.5], R: [0.2, 1.12], hold: 'R', frontR: true }),
  up: (T) => ({ L: [-0.4, 1.36 + Math.sin(T * 9) * 0.02], R: [0.4, 1.36 + Math.cos(T * 9) * 0.02], frontL: true, frontR: true }),
  shock: () => ({ L: [-0.44, 0.92], R: [0.44, 0.92] }),
  chin: () => ({ L: [-0.3, 0.5], R: [0.12, 0.99], frontR: true }),
  face: () => ({ L: [-0.19, 1.08], R: [0.19, 1.08], frontL: true, frontR: true }),
  head: () => ({ L: [-0.3, 1.44], R: [0.3, 1.44], frontL: true, frontR: true }),
  hips: () => ({ L: [-0.2, 0.6], R: [0.2, 0.6], bend: 1.6 }),
  point: () => ({ L: [-0.3, 0.5], R: [0.56, 0.98] }),
  wave: (T) => ({ L: [-0.3, 0.5], R: [0.42 + Math.sin(T * 7) * 0.06, 1.34], frontR: true }),
  give: () => ({ L: [-0.3, 0.5], R: [0.46, 0.8] }),
  shrug: () => ({ L: [-0.42, 0.84], R: [0.42, 0.84], bend: 0.7 }),
  table: () => ({ L: [-0.11, 0.6], R: [0.11, 0.6], bend: 0.75 }),
  hold: () => ({ L: [-0.1, 0.78], R: [0.1, 0.78] }),
  reach: () => ({ L: [-0.3, 0.5], R: [0.34, 1.02] }),
  heart: () => ({ L: [-0.06, 0.84], R: [0.06, 0.8] }),
  reachFar: () => ({ L: [-0.2, 0.66], R: [0.66, 0.84] }),
};

let sp, sc, mk, mc, ls, lc;
function ensure() {
  if (sp) return;
  sp = document.createElement('canvas'); sp.width = W; sp.height = H; sc = sp.getContext('2d');
  mk = document.createElement('canvas'); mk.width = W; mk.height = H; mc = mk.getContext('2d');
  ls = document.createElement('canvas'); ls.width = W / 4; ls.height = H / 4; lc = ls.getContext('2d');
}

function ell(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); }

// ---------- cabelo (unidade = raio da cabeça, y para baixo) ----------
function hairBack(c, st, col) {
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 0.075; c.lineJoin = 'round';
  if (st === 'bun') { ell(c, 0.05, -1.12, 0.36, 0.33); c.fill(); c.stroke(); }
  if (st === 'long') {
    c.beginPath(); c.moveTo(-1.08, -0.2);
    c.bezierCurveTo(-1.25, 0.5, -1.2, 1.15, -0.95, 1.35);
    c.lineTo(0.95, 1.35);
    c.bezierCurveTo(1.2, 1.15, 1.25, 0.5, 1.08, -0.2);
    c.closePath(); c.fill(); c.stroke();
  }
  if (st === 'pony') { c.beginPath(); c.moveTo(0.7, -0.75); c.bezierCurveTo(1.55, -0.9, 1.6, 0.2, 1.2, 0.75); c.bezierCurveTo(1.25, 0.2, 1.1, -0.3, 0.75, -0.35); c.closePath(); c.fill(); c.stroke(); }
}

function hairFront(c, st, col, back) {
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 0.075; c.lineJoin = 'round';
  const r = 1.045;
  if (back) {
    if (st === 'bald') return;
    c.beginPath(); c.arc(0, 0, r, Math.PI - 0.62, TAU + 0.62);
    c.quadraticCurveTo(0, 0.86, Math.cos(Math.PI - 0.62) * r, Math.sin(Math.PI - 0.62) * r);
    c.closePath(); c.fill(); c.stroke();
    return;
  }
  const pt = (a) => [Math.cos(a) * r, Math.sin(a) * r];
  if (st === 'short' || st === 'tuft') {
    const a = 0.08, [x1, y1] = pt(TAU - a), [x0, y0] = pt(Math.PI + a);
    c.beginPath(); c.arc(0, 0, r, Math.PI + a, TAU - a);
    c.quadraticCurveTo(0.92, -0.36, 0.5, -0.36);
    c.lineTo(0.3, -0.5); c.lineTo(0.12, -0.34);
    c.quadraticCurveTo(-0.6, -0.3, x0, y0);
    c.closePath(); c.fill(); c.stroke();
    if (st === 'tuft') { c.beginPath(); c.moveTo(-0.1, -1.0); c.quadraticCurveTo(0.05, -1.4, 0.35, -1.25); c.quadraticCurveTo(0.12, -1.2, 0.18, -0.98); c.closePath(); c.fill(); c.stroke(); }
  } else if (st === 'side') {
    const [x0, y0] = pt(Math.PI + 0.0);
    c.beginPath(); c.arc(0, 0, r, Math.PI, TAU - 0.3);
    c.quadraticCurveTo(0.55, -0.32, 0.0, -0.66);
    c.quadraticCurveTo(-0.5, -0.4, x0, y0);
    c.closePath(); c.fill(); c.stroke();
  } else if (st === 'bun' || st === 'long' || st === 'pony') {
    const a = st === 'long' ? -0.25 : 0.02, [x0, y0] = pt(Math.PI + a);
    c.beginPath(); c.arc(0, 0, r, Math.PI + a, TAU - a);
    c.quadraticCurveTo(0.72, -0.52, 0.06, -0.74);
    c.quadraticCurveTo(-0.72, -0.52, x0, y0);
    c.closePath(); c.fill(); c.stroke();
  } else if (st === 'curly') {
    const n = 9;
    for (let i = 0; i < n; i++) { const a = Math.PI - 0.15 + (i / (n - 1)) * (Math.PI + 0.3); ell(c, Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0.3, 0.3); c.fill(); c.stroke(); }
    c.beginPath(); c.arc(0, 0, 0.93, Math.PI - 0.1, TAU + 0.1); c.quadraticCurveTo(0, -0.42, Math.cos(Math.PI - 0.1) * 0.93, Math.sin(Math.PI - 0.1) * 0.93); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-0.84, -0.12); c.quadraticCurveTo(0, -0.5, 0.84, -0.12); c.stroke();
  } else if (st === 'spiky') {
    const a = 0.06, n = 7; c.beginPath();
    for (let i = 0; i <= n * 2; i++) { const ang = Math.PI + a + (i / (n * 2)) * (Math.PI - 2 * a); const rr = i % 2 ? 1.38 : 1.02; const x = Math.cos(ang) * rr, y = Math.sin(ang) * rr; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
    c.quadraticCurveTo(0.3, -0.42, -0.1, -0.3); c.lineTo(-0.3, -0.46); c.quadraticCurveTo(-0.7, -0.3, Math.cos(Math.PI + a) * 1.02, Math.sin(Math.PI + a) * 1.02);
    c.closePath(); c.fill(); c.stroke();
  } else if (st === 'bald') {
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 1.0, -0.3); c.quadraticCurveTo(s * 1.2, 0, s * 0.98, 0.25); c.quadraticCurveTo(s * 0.84, 0, s * 0.9, -0.42); c.closePath(); c.fill(); c.stroke(); }
  } else if (st === 'cap') {
    c.beginPath(); c.arc(0, 0, r, Math.PI + 0.1, TAU - 0.1); c.quadraticCurveTo(0, -0.5, Math.cos(Math.PI + 0.1) * r, Math.sin(Math.PI + 0.1) * r); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0.2, -0.42); c.quadraticCurveTo(1.1, -0.5, 1.55, -0.2); c.quadraticCurveTo(1.0, -0.22, 0.4, -0.22); c.closePath(); c.fill(); c.stroke();
  }
}

// ---------- rosto (unidade = raio da cabeça) ----------
function drawFace(c, f, look, T, seed, opt) {
  const lx = look[0] * 0.24, ly = look[1] * 0.16;
  const ex = 0.27, ey = -0.05 + ly, my = 0.33 + ly;
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = INK; c.fillStyle = INK;
  const per = 3.3 + seed * 1.7;
  const blink = ((T + seed * 9.1) % per) < 0.1;
  let eyes = f.eyes;
  if (blink && (eyes === 'dot' || eyes === 'wide' || eyes === 'half')) eyes = 'line';
  if (f.blush) { c.fillStyle = 'rgba(255,105,110,0.32)'; for (const s of [-1, 1]) { ell(c, lx + s * 0.52, 0.2 + ly, 0.15, 0.09); c.fill(); } c.fillStyle = INK; }
  for (const s of [-1, 1]) {
    const x = lx + s * ex;
    if (f.bags) { c.strokeStyle = 'rgba(120,70,110,0.75)'; c.lineWidth = 0.04; c.beginPath(); c.moveTo(x - 0.1, ey + 0.15); c.quadraticCurveTo(x, ey + 0.23, x + 0.1, ey + 0.15); c.stroke(); c.strokeStyle = INK; }
    if (eyes === 'dot') { ell(c, x, ey, 0.058, 0.088); c.fill(); c.fillStyle = 'rgba(255,255,255,0.85)'; ell(c, x + 0.018, ey - 0.035, 0.016, 0.02); c.fill(); c.fillStyle = INK; }
    else if (eyes === 'wide') {
      c.fillStyle = '#fff'; ell(c, x, ey, 0.17, 0.17); c.fill(); c.lineWidth = 0.045; c.stroke();
      c.fillStyle = INK; ell(c, x + look[0] * 0.06, ey + look[1] * 0.06, 0.06, 0.065); c.fill();
    } else if (eyes === 'half') {
      c.save(); c.beginPath(); c.rect(x - 0.2, ey - 0.02, 0.4, 0.3); c.clip(); ell(c, x, ey - 0.02, 0.06, 0.1); c.fill(); c.restore();
      c.lineWidth = 0.05; c.beginPath(); c.moveTo(x - 0.12, ey - 0.03); c.lineTo(x + 0.12, ey - 0.03); c.stroke();
    } else if (eyes === 'closed') { c.lineWidth = 0.045; c.beginPath(); c.moveTo(x - 0.1, ey - 0.01); c.quadraticCurveTo(x, ey + 0.08, x + 0.1, ey - 0.01); c.stroke(); }
    else if (eyes === 'line') { c.lineWidth = 0.05; c.beginPath(); c.moveTo(x - 0.09, ey); c.lineTo(x + 0.09, ey); c.stroke(); }
    else if (eyes === 'happy') { c.lineWidth = 0.05; c.beginPath(); c.moveTo(x - 0.1, ey + 0.03); c.quadraticCurveTo(x, ey - 0.1, x + 0.1, ey + 0.03); c.stroke(); }
    else if (eyes === 'squint') { c.lineWidth = 0.05; c.beginPath(); c.moveTo(x - s * 0.09, ey - 0.08); c.lineTo(x + s * 0.07, ey); c.lineTo(x - s * 0.09, ey + 0.08); c.stroke(); }
    // sobrancelhas
    const by = ey - (eyes === 'wide' ? 0.3 : 0.22);
    c.lineWidth = 0.05;
    if (f.brows === 'up') { c.beginPath(); c.moveTo(x - 0.1, by - 0.03); c.quadraticCurveTo(x, by - 0.1, x + 0.1, by - 0.03); c.stroke(); }
    else if (f.brows === 'worried') { c.beginPath(); c.moveTo(x - s * 0.13, by - 0.08); c.lineTo(x + s * 0.11, by + 0.04); c.stroke(); }
    else if (f.brows === 'angry') { c.beginPath(); c.moveTo(x - s * 0.13, by + 0.05); c.lineTo(x + s * 0.1, by - 0.08); c.stroke(); }
    else if (f.brows === 'low') { c.beginPath(); c.moveTo(x - 0.12, by + 0.07); c.lineTo(x + 0.12, by + 0.07); c.stroke(); }
    else if (f.brows === 'one' && s === 1) { c.beginPath(); c.moveTo(x - 0.1, by - 0.06); c.quadraticCurveTo(x, by - 0.13, x + 0.1, by - 0.05); c.stroke(); }
  }
  if (opt.glasses) {
    c.lineWidth = 0.04; c.fillStyle = 'rgba(210,235,255,0.22)';
    for (const s of [-1, 1]) { ell(c, lx + s * ex, ey, 0.2, 0.2); c.fill(); c.stroke(); }
    c.beginPath(); c.moveTo(lx - 0.08, ey); c.lineTo(lx + 0.08, ey); c.stroke(); c.fillStyle = INK;
  }
  // boca
  const mx = lx; c.lineWidth = 0.05; c.fillStyle = INK;
  const m = f.mouth;
  if (m === 'flat') { c.beginPath(); c.moveTo(mx - 0.1, my); c.lineTo(mx + 0.1, my); c.stroke(); }
  else if (m === 'smile') { c.beginPath(); c.moveTo(mx - 0.16, my - 0.04); c.quadraticCurveTo(mx, my + 0.13, mx + 0.16, my - 0.04); c.stroke(); }
  else if (m === 'frown') { c.beginPath(); c.moveTo(mx - 0.13, my + 0.06); c.quadraticCurveTo(mx, my - 0.07, mx + 0.13, my + 0.06); c.stroke(); }
  else if (m === 'smirk') { c.beginPath(); c.moveTo(mx - 0.12, my + 0.03); c.quadraticCurveTo(mx + 0.06, my + 0.08, mx + 0.17, my - 0.07); c.stroke(); }
  else if (m === 'wide') { c.beginPath(); c.moveTo(mx - 0.34, my - 0.14); c.quadraticCurveTo(mx, my + 0.3, mx + 0.34, my - 0.14); c.stroke(); }
  else if (m === 'o') { ell(c, mx, my + 0.02, 0.05, 0.066); c.fill(); }
  else if (m === 'gasp') { c.fillStyle = '#5a1522'; ell(c, mx, my + 0.07, 0.11, 0.15); c.fill(); c.lineWidth = 0.045; c.stroke(); c.fillStyle = '#d9606c'; c.save(); c.clip(); ell(c, mx, my + 0.2, 0.09, 0.07); c.fill(); c.restore(); }
  else if (m === 'wavy') { c.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, x = mx - 0.15 + u * 0.3, y = my + Math.sin(u * TAU * 2.5) * 0.03; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); }
  else if (m === 'grin') {
    c.beginPath(); c.moveTo(mx - 0.2, my - 0.06); c.quadraticCurveTo(mx, my - 0.02, mx + 0.2, my - 0.06); c.quadraticCurveTo(mx, my + 0.34, mx - 0.2, my - 0.06); c.closePath();
    c.fillStyle = '#6a1826'; c.fill(); c.save(); c.clip();
    c.fillStyle = '#e8717c'; ell(c, mx, my + 0.2, 0.12, 0.08); c.fill();
    c.fillStyle = '#fff'; c.fillRect(mx - 0.2, my - 0.08, 0.4, 0.075); c.restore(); c.lineWidth = 0.045; c.stroke();
  }
  if (opt.mustache) { c.fillStyle = opt.mustache; c.beginPath(); c.moveTo(mx, my - 0.17); c.quadraticCurveTo(mx + 0.22, my - 0.2, mx + 0.3, my - 0.04); c.quadraticCurveTo(mx + 0.12, my - 0.08, mx, my - 0.07); c.quadraticCurveTo(mx - 0.12, my - 0.08, mx - 0.3, my - 0.04); c.quadraticCurveTo(mx - 0.22, my - 0.2, mx, my - 0.17); c.closePath(); c.fill(); c.lineWidth = 0.03; c.stroke(); }
  if (opt.scratch) {
    c.strokeStyle = '#c0392b'; c.lineWidth = 0.035;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(lx + 0.5 + i * 0.07, 0.02 + ly); c.lineTo(lx + 0.38 + i * 0.07, 0.3 + ly); c.stroke(); }
    c.strokeStyle = INK;
  }
  if (f.sweat) {
    const u = ((T * 0.35 + seed) % 1), sx = 0.66, sy = -0.5 + u * 0.22;
    c.globalAlpha = u < 0.85 ? 1 : (1 - u) / 0.15;
    c.fillStyle = '#c9ecff'; c.lineWidth = 0.035; c.beginPath(); c.moveTo(sx, sy - 0.13); c.quadraticCurveTo(sx + 0.09, sy, sx, sy + 0.07); c.quadraticCurveTo(sx - 0.09, sy, sx, sy - 0.13); c.closePath(); c.fill(); c.stroke();
    c.globalAlpha = 1;
  }
  if (f.tears) {
    c.fillStyle = '#8fd3ff'; c.lineWidth = 0.03;
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
      const u = ((T * 0.55 + k * 0.5 + (s > 0 ? 0.25 : 0)) % 1), x = lx + s * (ex + 0.02), y = ey + 0.12 + u * 0.5;
      c.globalAlpha = u < 0.7 ? 1 : (1 - u) / 0.3;
      c.beginPath(); c.moveTo(x, y - 0.09); c.quadraticCurveTo(x + 0.065, y + 0.02, x, y + 0.05); c.quadraticCurveTo(x - 0.065, y + 0.02, x, y - 0.09); c.closePath(); c.fill(); c.stroke();
    }
    c.globalAlpha = 1;
  }
}

function arm(c, sx, sy, hx, hy, side, bend, sleeve, skin, drawHand = true) {
  const L = 0.255;
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy);
  if (d > L * 2 - 0.01) { const k = (L * 2 - 0.01) / d; dx *= k; dy *= k; d = L * 2 - 0.01; hx = sx + dx; hy = sy + dy; }
  const mx = sx + dx / 2, my = sy + dy / 2;
  const h = Math.sqrt(Math.max(0, L * L - (d / 2) * (d / 2))) * bend;
  let px = -dy / d, py = dx / d;
  if (px * side < 0) { px = -px; py = -py; }           // cotovelo para fora do corpo
  const exx = mx + px * h * 1.5, eyy = my + py * h * 1.5;
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(sx, -sy); c.quadraticCurveTo(exx, -eyy, hx, -hy);
  c.strokeStyle = INK; c.lineWidth = 0.07; c.stroke();
  c.strokeStyle = sleeve; c.lineWidth = 0.034; c.stroke();
  if (drawHand) { ell(c, hx, -hy, 0.05, 0.05); c.fillStyle = skin; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.017; c.stroke(); }
  return [hx, hy];
}

function phoneInHand(c, x, y, on) {
  c.save(); c.translate(x + 0.005, -y - 0.06); c.rotate(-0.1);
  c.fillStyle = '#2a2836'; c.strokeStyle = INK; c.lineWidth = 0.016; c.lineJoin = 'round';
  c.beginPath(); c.roundRect(-0.058, -0.115, 0.116, 0.22, 0.022); c.fill(); c.stroke();
  c.fillStyle = '#17151f'; c.beginPath(); c.roundRect(-0.04, -0.098, 0.036, 0.036, 0.01); c.fill();
  c.fillStyle = '#4a4860'; c.beginPath(); c.arc(-0.022, -0.08, 0.008, 0, TAU); c.fill();
  if (on) { c.strokeStyle = 'rgba(190,225,255,0.85)'; c.lineWidth = 0.008; c.beginPath(); c.roundRect(-0.058, -0.115, 0.116, 0.22, 0.022); c.stroke(); }
  c.restore();
  // dedos por cima do aparelho
  c.fillStyle = INK; ell(c, x, -y, 0.058, 0.058); c.fill();
}

/**
 * Desenha um personagem.
 * c: { at:[x,z], y, skin, hair:{st,c}, shirt, style, face, pose, look:[x,y], tilt, back, sil, sit, scale,
 *      lean, id, walk, glasses, mustache, legs, hop }
 */
export function drawChar(g, c) {
  ensure();
  const { cam, ctx } = g;
  const y0 = c.y || 0;
  const P = cam.proj([c.at[0], y0, c.at[1]]);
  if (!P) return;
  const S = P.s * (c.scale || 1);
  const T = g.T, seed = hash((c.id || 1) * 13.7);
  const skin = SKIN[c.skin] || c.skin || SKIN.a;
  const hairCol = c.hair ? (HAIR[c.hair.c] || c.hair.c) : HAIR.brown;
  const hairSt = c.hair ? c.hair.st : 'short';
  const shirt = c.shirt || '#3f6fb5';
  const face = typeof c.face === 'string' ? (FACES[c.face] || FACES.neutral) : (c.face || FACES.neutral);
  const look = c.look || [0, 0];

  // sombra no chão
  if (!c.noShadow && y0 < 0.2) {
    ctx.save();
    const pitch = Math.abs(cam.fw[1]) * 0.9 + 0.12;
    ctx.fillStyle = 'rgba(8,6,22,0.34)';
    ctx.beginPath(); ctx.ellipse(P.x, P.y, 0.27 * S, 0.27 * S * pitch, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  // área do sprite
  const bx0 = clamp(Math.floor(P.x - 0.95 * S), 0, W), bx1 = clamp(Math.ceil(P.x + 0.95 * S), 0, W);
  const by0 = clamp(Math.floor(P.y - 2.1 * S), 0, H), by1 = clamp(Math.ceil(P.y + 0.2 * S), 0, H);
  const bw = bx1 - bx0, bh = by1 - by0;
  if (bw <= 0 || bh <= 0) return;
  sc.setTransform(1, 0, 0, 1, 0, 0);
  sc.globalCompositeOperation = 'source-over';
  sc.clearRect(bx0, by0, bw, bh);
  sc.save();
  sc.translate(P.x, P.y);
  sc.scale(S * (c.flip ? -1 : 1), S);
  if (c.headOnly) { sc.rotate(c.rot || 0); sc.translate(0, 1.255); }

  const hop = c.hop ? Math.abs(Math.sin(T * c.hop)) * 0.05 : 0;
  const walk = c.walk || 0;
  const wph = T * 7.5;
  const breathe = Math.sin(T * 1.7 + seed * 6) * 0.005;
  const bodyDy = hop + (walk ? Math.abs(Math.sin(wph)) * 0.02 : 0);
  if (c.lean) { sc.rotate(c.lean); }

  if (!c.headOnly) {
  // pernas
  const legC = c.legs || INK;
  sc.lineCap = 'round'; sc.strokeStyle = legC; sc.lineWidth = 0.038;
  for (const s of [-1, 1]) {
    let fx = s * 0.1, fy = 0;
    if (walk) { fx += Math.sin(wph + (s > 0 ? Math.PI : 0)) * 0.07; fy = Math.max(0, Math.cos(wph + (s > 0 ? Math.PI : 0))) * 0.04; }
    if (c.sit) { fx = s * 0.13; fy = -0.1; }
    sc.beginPath(); sc.moveTo(s * 0.085, -(0.39 + bodyDy)); sc.lineTo(fx, -fy - 0.02); sc.stroke();
    sc.fillStyle = c.shoes || INK; ell(sc, fx + s * 0.03, -fy - 0.016, 0.062, 0.028); sc.fill();
  }

  }
  sc.translate(0, -bodyDy);
  const hy = 1.255 + breathe * 1.4;
  hairBackWrap();

  const hands = {};
  let ps = {};
  const drawArmRef = { fn: null };
  if (!c.headOnly) {
  // corpo
  function bodyPath() {
    sc.beginPath();
    sc.moveTo(-0.14, -1.03);
    sc.bezierCurveTo(-0.235, -0.95, -0.275, -0.64, -0.24, -0.5);
    sc.bezierCurveTo(-0.215, -0.385, -0.12, -0.345, 0, -0.345);
    sc.bezierCurveTo(0.12, -0.345, 0.215, -0.385, 0.24, -0.5);
    sc.bezierCurveTo(0.275, -0.64, 0.235, -0.95, 0.14, -1.03);
    sc.closePath();
  }
  bodyPath();
  const gr = sc.createLinearGradient(-0.25, -1.0, 0.25, -0.35);
  gr.addColorStop(0, css(shade(shirt, 1.1))); gr.addColorStop(0.55, css(shirt)); gr.addColorStop(1, css(shade(shirt, 0.8)));
  sc.fillStyle = gr; sc.fill();
  sc.save(); sc.clip();
  // sombra do queixo no peito
  sc.fillStyle = 'rgba(20,10,45,0.26)'; ell(sc, 0, -(hy - 0.3), 0.3, 0.13); sc.fill();
  const st = c.style || 'buttons';
  if (st === 'suit') {
    sc.fillStyle = '#f1f1f4'; sc.beginPath(); sc.moveTo(-0.07, -1.03); sc.lineTo(0.07, -1.03); sc.lineTo(0, -0.7); sc.closePath(); sc.fill();
    sc.fillStyle = c.tie || '#9b2335'; sc.beginPath(); sc.moveTo(-0.022, -1.0); sc.lineTo(0.022, -1.0); sc.lineTo(0.032, -0.76); sc.lineTo(0, -0.7); sc.lineTo(-0.032, -0.76); sc.closePath(); sc.fill();
    sc.strokeStyle = INK; sc.lineWidth = 0.012; sc.beginPath(); sc.moveTo(-0.075, -1.03); sc.lineTo(0, -0.69); sc.lineTo(0.075, -1.03); sc.stroke();
  } else if (st === 'hoodie') {
    sc.strokeStyle = css(shade(shirt, 0.62)); sc.lineWidth = 0.012;
    sc.beginPath(); sc.moveTo(-0.12, -0.52); sc.quadraticCurveTo(0, -0.6, 0.12, -0.52); sc.lineTo(0.14, -0.42); sc.lineTo(-0.14, -0.42); sc.closePath(); sc.stroke();
    sc.strokeStyle = '#f0ede6'; sc.lineWidth = 0.011;
    for (const s of [-1, 1]) { sc.beginPath(); sc.moveTo(s * 0.04, -0.98); sc.lineTo(s * 0.045, -0.8); sc.stroke(); }
  } else if (st === 'stripe') {
    sc.fillStyle = css(shade(shirt, 0.72));
    for (let i = 0; i < 4; i++) sc.fillRect(-0.3, -0.92 + i * 0.15, 0.6, 0.055);
  } else if (st === 'dress') {
    sc.strokeStyle = css(shade(shirt, 0.65)); sc.lineWidth = 0.012;
    sc.beginPath(); sc.moveTo(-0.11, -1.03); sc.quadraticCurveTo(0, -0.84, 0.11, -1.03); sc.stroke();
    sc.fillStyle = skin; sc.beginPath(); sc.moveTo(-0.1, -1.04); sc.quadraticCurveTo(0, -0.86, 0.1, -1.04); sc.closePath(); sc.fill();
  } else if (st === 'apron') {
    sc.fillStyle = '#f2efe6'; sc.strokeStyle = INK; sc.lineWidth = 0.012;
    sc.beginPath(); sc.roundRect(-0.15, -0.88, 0.3, 0.6, 0.03); sc.fill(); sc.stroke();
  } else if (st === 'buttons') {
    sc.strokeStyle = css(shade(shirt, 0.55)); sc.lineWidth = 0.008; sc.fillStyle = css(shade(shirt, 0.78));
    for (const by of [0.84, 0.69, 0.54]) { ell(sc, 0, -by, 0.018, 0.018); sc.fill(); sc.stroke(); }
    sc.strokeStyle = css(shade(shirt, 0.6)); sc.lineWidth = 0.011;
    sc.beginPath(); sc.moveTo(-0.1, -1.0); sc.lineTo(0, -0.93); sc.lineTo(0.1, -1.0); sc.stroke();
  }
  sc.restore();
  bodyPath(); sc.strokeStyle = INK; sc.lineWidth = 0.023; sc.lineJoin = 'round'; sc.stroke();

  // braços
  const poseFn = POSES[c.pose] || POSES.down;
  ps = poseFn(T + seed * 3);
  const sleeve = css(st === 'dress' || c.sleeveless ? skin : shirt);
  const bend = ps.bend ?? 1;
  const sway = walk ? Math.sin(wph) * 0.05 : 0;
  const drawArm = drawArmRef.fn = (side) => {
    const key = side < 0 ? 'L' : 'R';
    const h = ps[key];
    const hand = arm(sc, side * 0.19, 0.9, h[0] + (key === 'L' ? sway : -sway), h[1], side, bend, sleeve, skin, true);
    hands[key] = hand;
    if (ps.hold === key || (c.hold && c.holdHand === key)) { phoneInHand(sc, hand[0], hand[1], c.phoneOn !== false); ell(sc, hand[0], -hand[1], 0.05, 0.05); sc.fillStyle = skin; sc.fill(); sc.strokeStyle = INK; sc.lineWidth = 0.017; sc.stroke(); }
  };
  if (!c.back) { if (!ps.frontL) drawArm(-1); if (!ps.frontR) drawArm(1); }
  else { drawArm(-1); drawArm(1); }

  }
  // cabeça
  function hairBackWrap() {
    if (c.back) return;
    sc.save(); sc.translate((c.headDx || 0), -hy); sc.rotate(c.tilt || 0); sc.scale(0.3, 0.3);
    hairBack(sc, hairSt, hairCol);
    sc.restore();
  }
  sc.save();
  sc.translate((c.headDx || 0), -hy); sc.rotate(c.tilt || 0); sc.scale(0.3, 0.3);
  if (c.back) hairBack(sc, hairSt, hairCol);
  ell(sc, 0, 0, 1, 1);
  const hg = sc.createRadialGradient(-0.3, -0.35, 0.1, 0, 0, 1.25);
  hg.addColorStop(0, css(shade(skin, 1.08))); hg.addColorStop(0.6, css(skin)); hg.addColorStop(1, css(shade(skin, 0.8)));
  sc.fillStyle = hg; sc.fill();
  sc.strokeStyle = INK; sc.lineWidth = 0.075; sc.stroke();
  if (!c.back) {
    // sombra da franja
    sc.save(); ell(sc, 0, 0, 0.96, 0.96); sc.clip();
    if (hairSt !== 'bald') { sc.fillStyle = 'rgba(40,15,50,0.16)'; sc.fillRect(-1, -1, 2, 0.78); }
    drawFace(sc, face, look, T, seed, c);
    sc.restore();
  }
  hairFront(sc, hairSt, hairCol, c.back);
  if (c.hat === 'cap') hairFront(sc, 'cap', c.hatC || '#2d5da8', false);
  sc.restore();

  if (!c.back && drawArmRef.fn) { if (ps.frontL) drawArmRef.fn(-1); if (ps.frontR) drawArmRef.fn(1); }
  if (c.extra) c.extra(sc, { hands, hy, skin, shirt, T });
  sc.restore();

  // luz
  if (c.sil) {
    sc.globalCompositeOperation = 'source-atop';
    sc.fillStyle = typeof c.sil === 'string' ? c.sil : '#0b0916';
    sc.fillRect(bx0, by0, bw, bh);
  } else if (c.lit !== false) {
    mc.setTransform(1, 0, 0, 1, 0, 0);
    mc.globalCompositeOperation = 'source-over';
    mc.clearRect(bx0, by0, bw, bh);
    mc.drawImage(sp, bx0, by0, bw, bh, bx0, by0, bw, bh);
    const amb = Math.max(g.ambient[0], g.ambient[1], g.ambient[2]) / 255;
    drawLightSlice(lc, g, P.z, c.fill ?? lerp(1.35, 1.0, clamp((amb - 0.3) / 0.4)));
    // fundo preto atrás do sprite evita franja clara nas bordas ao multiplicar
    sc.globalCompositeOperation = 'destination-over';
    sc.fillStyle = '#000'; sc.fillRect(bx0, by0, bw, bh);
    sc.globalCompositeOperation = 'multiply';
    sc.drawImage(ls, bx0 / 4, by0 / 4, bw / 4, bh / 4, bx0, by0, bw, bh);
    sc.globalCompositeOperation = 'destination-in';
    sc.drawImage(mk, bx0, by0, bw, bh, bx0, by0, bw, bh);
  }
  sc.globalCompositeOperation = 'source-over';
  ctx.save();
  if (c.alpha != null) ctx.globalAlpha = c.alpha;
  ctx.drawImage(sp, bx0, by0, bw, bh, bx0, by0, bw, bh);
  ctx.restore();
}
