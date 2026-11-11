// Personagens (desenho próprio): cabeça em "quadrado arredondado" com orelhas, olhos grandes com
// pupila, nariz, tronco com roupa, pernas grossas e tênis. Desenhados em metros num sprite e
// depois iluminados pela fatia de luz da cena.
import { W, H, TAU, INK, css, shade, clamp, lerp, hash, noise, drawLightSlice } from './core.js';

export const SKIN = { a: '#f3bd8e', b: '#e6a877', c: '#c58a5e', d: '#93603f', e: '#f8d6b8' };
export const HAIR = { brown: '#4a2f24', black: '#24212e', blonde: '#e0b04c', ginger: '#c0562a', grey: '#b3b3bd', choc: '#5a3a28', wine: '#6b2338', navy: '#252b4d', teal: '#1e5a66' };

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
  smug: { eyes: 'half', mouth: 'smirk', brows: 'one' },
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
  down: () => ({ L: [-0.32, 0.5], R: [0.32, 0.5] }),
  phone: (T) => ({ L: [-0.32, 0.5], R: [0.1, 0.86 + Math.sin(T * 1.3) * 0.004], hold: 'R' }),
  phoneUp: () => ({ L: [-0.32, 0.5], R: [0.2, 1.08], hold: 'R', frontR: true }),
  up: (T) => ({ L: [-0.42, 1.34 + Math.sin(T * 9) * 0.02], R: [0.42, 1.34 + Math.cos(T * 9) * 0.02], frontL: true, frontR: true }),
  shock: () => ({ L: [-0.46, 0.9], R: [0.46, 0.9] }),
  chin: () => ({ L: [-0.32, 0.5], R: [0.13, 0.97], frontR: true }),
  face: () => ({ L: [-0.2, 1.06], R: [0.2, 1.06], frontL: true, frontR: true }),
  head: () => ({ L: [-0.34, 1.42], R: [0.34, 1.42], frontL: true, frontR: true }),
  hips: () => ({ L: [-0.22, 0.6], R: [0.22, 0.6], bend: 1.6 }),
  point: () => ({ L: [-0.32, 0.5], R: [0.58, 0.96] }),
  wave: (T) => ({ L: [-0.32, 0.5], R: [0.44 + Math.sin(T * 7) * 0.06, 1.32], frontR: true }),
  give: () => ({ L: [-0.32, 0.5], R: [0.48, 0.8] }),
  shrug: () => ({ L: [-0.44, 0.84], R: [0.44, 0.84], bend: 0.7 }),
  table: () => ({ L: [-0.12, 0.6], R: [0.12, 0.6], bend: 0.75 }),
  hold: () => ({ L: [-0.1, 0.76], R: [0.1, 0.76] }),
  reach: () => ({ L: [-0.32, 0.5], R: [0.36, 1.0] }),
  heart: () => ({ L: [-0.06, 0.82], R: [0.07, 0.78] }),
  reachFar: () => ({ L: [-0.2, 0.64], R: [0.68, 0.84] }),
};

let sp, sc, mk, mc, ls, lc;
function ensure() {
  if (sp) return;
  sp = document.createElement('canvas'); sp.width = W; sp.height = H; sc = sp.getContext('2d');
  mk = document.createElement('canvas'); mk.width = W; mk.height = H; mc = mk.getContext('2d');
  ls = document.createElement('canvas'); ls.width = W / 4; ls.height = H / 4; lc = ls.getContext('2d');
}

function ell(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); }
const HEAD_LW = 0.066;

// ---------- cabeça (unidade = 0,3 m; y para baixo) ----------
function headPath(c) {
  c.beginPath();
  c.moveTo(-0.5, -0.93);
  c.bezierCurveTo(-0.15, -0.97, 0.15, -0.97, 0.5, -0.93);
  c.bezierCurveTo(0.95, -0.9, 1.07, -0.7, 1.07, -0.3);
  c.bezierCurveTo(1.07, 0.0, 1.06, 0.15, 1.0, 0.38);
  c.bezierCurveTo(0.92, 0.72, 0.72, 0.92, 0.42, 0.95);
  c.bezierCurveTo(0.15, 0.98, -0.15, 0.98, -0.42, 0.95);
  c.bezierCurveTo(-0.72, 0.92, -0.92, 0.72, -1.0, 0.38);
  c.bezierCurveTo(-1.06, 0.15, -1.07, 0.0, -1.07, -0.3);
  c.bezierCurveTo(-1.07, -0.7, -0.95, -0.9, -0.5, -0.93);
  c.closePath();
}

function hairBack(c, st, col) {
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = HEAD_LW; c.lineJoin = 'round';
  if (st === 'bob') {
    c.beginPath(); c.moveTo(-1.0, -0.8);
    c.bezierCurveTo(-1.45, -0.5, -1.45, 0.6, -1.12, 0.98);
    c.bezierCurveTo(-0.9, 1.12, -0.6, 1.0, -0.5, 0.8);
    c.lineTo(0.5, 0.8);
    c.bezierCurveTo(0.6, 1.0, 0.9, 1.12, 1.12, 0.98);
    c.bezierCurveTo(1.45, 0.6, 1.45, -0.5, 1.0, -0.8);
    c.closePath(); c.fill(); c.stroke();
  } else if (st === 'long') {
    c.beginPath(); c.moveTo(-1.0, -0.8);
    c.bezierCurveTo(-1.42, -0.3, -1.4, 0.9, -1.22, 1.55);
    c.lineTo(1.22, 1.55);
    c.bezierCurveTo(1.4, 0.9, 1.42, -0.3, 1.0, -0.8);
    c.closePath(); c.fill(); c.stroke();
  } else if (st === 'pony') {
    c.beginPath(); c.moveTo(0.55, -0.98);
    c.bezierCurveTo(1.25, -1.5, 1.95, -0.9, 1.8, -0.1);
    c.bezierCurveTo(1.75, 0.3, 1.6, 0.55, 1.42, 0.7);
    c.bezierCurveTo(1.5, 0.2, 1.4, -0.3, 0.95, -0.55);
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#f2c230'; ell(c, 0.86, -0.92, 0.13, 0.1); c.fill(); c.stroke();
  }
}

// cabelo visto de costas: cobre a cabeça até a nuca
function hairRear(c, st, col) {
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = HEAD_LW; c.lineJoin = 'round';
  if (st === 'bald') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 1.08, -0.35); c.quadraticCurveTo(s * 0.5, -0.2, s * 0.55, 0.45); c.quadraticCurveTo(s * 0.95, 0.5, s * 1.05, 0.3); c.closePath(); c.fill(); c.stroke(); } return; }
  c.beginPath(); c.moveTo(-1.1, 0.3);
  c.bezierCurveTo(-1.2, -0.6, -0.95, -1.08, -0.4, -1.08);
  if (st === 'messy') { c.bezierCurveTo(-0.3, -1.42, 0.1, -1.45, 0.2, -1.12); c.bezierCurveTo(0.5, -1.38, 0.95, -1.2, 0.95, -0.9); }
  else c.bezierCurveTo(-0.1, -1.12, 0.3, -1.12, 0.6, -1.05);
  c.bezierCurveTo(1.1, -0.95, 1.2, -0.5, 1.1, 0.3);
  c.bezierCurveTo(0.7, 0.62, -0.7, 0.62, -1.1, 0.3);
  c.closePath(); c.fill(); c.stroke();
}

function hairFront(c, st, col) {
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = HEAD_LW; c.lineJoin = 'round';
  const done = () => { c.closePath(); c.fill(); c.stroke(); };
  if (st === 'messy') {                 // volumoso, com tufos e franja ondulada
    c.beginPath(); c.moveTo(-1.13, -0.22);
    c.bezierCurveTo(-1.34, -0.72, -1.05, -1.22, -0.55, -1.16);
    c.bezierCurveTo(-0.5, -1.5, 0.02, -1.56, 0.2, -1.22);
    c.bezierCurveTo(0.52, -1.5, 1.08, -1.3, 1.0, -0.94);
    c.bezierCurveTo(1.32, -0.84, 1.28, -0.44, 1.13, -0.22);
    c.bezierCurveTo(0.98, -0.52, 0.72, -0.62, 0.46, -0.4);
    c.bezierCurveTo(0.2, -0.76, -0.3, -0.72, -0.5, -0.36);
    c.bezierCurveTo(-0.76, -0.6, -1.0, -0.5, -1.13, -0.22);
    done();
  } else if (st === 'short') {          // curto, com topete de lado
    c.beginPath(); c.moveTo(-1.12, -0.12);
    c.bezierCurveTo(-1.2, -0.75, -0.9, -1.08, -0.3, -1.08);
    c.bezierCurveTo(0.2, -1.22, 0.9, -1.08, 1.05, -0.7);
    c.bezierCurveTo(1.18, -0.5, 1.15, -0.3, 1.12, -0.12);
    c.bezierCurveTo(1.0, -0.3, 0.98, -0.5, 0.86, -0.6);
    c.bezierCurveTo(0.3, -0.5, -0.4, -0.52, -0.84, -0.66);
    c.bezierCurveTo(-0.98, -0.5, -1.02, -0.3, -1.12, -0.12);
    done();
  } else if (st === 'slick') {          // penteado para trás, com entradas
    c.beginPath(); c.moveTo(-1.1, -0.2);
    c.bezierCurveTo(-1.22, -0.8, -0.85, -1.2, -0.2, -1.18);
    c.bezierCurveTo(0.5, -1.3, 1.15, -1.0, 1.1, -0.2);
    c.bezierCurveTo(1.0, -0.42, 0.95, -0.6, 0.7, -0.72);
    c.bezierCurveTo(0.45, -0.62, 0.25, -0.6, 0.0, -0.78);
    c.bezierCurveTo(-0.25, -0.6, -0.45, -0.62, -0.7, -0.72);
    c.bezierCurveTo(-0.95, -0.6, -1.0, -0.42, -1.1, -0.2);
    done();
    c.lineWidth = 0.035; c.strokeStyle = 'rgba(20,16,40,0.45)';
    for (const x of [-0.45, 0.0, 0.45]) { c.beginPath(); c.moveTo(x, -0.82); c.quadraticCurveTo(x * 1.1, -1.0, x * 1.25, -1.12); c.stroke(); }
  } else if (st === 'bob') {            // chanel com franja reta
    c.beginPath(); c.moveTo(-1.16, 0.55);
    c.bezierCurveTo(-1.36, -0.5, -1.0, -1.14, -0.3, -1.12);
    c.bezierCurveTo(0.2, -1.2, 1.0, -1.14, 1.2, -0.3);
    c.bezierCurveTo(1.3, 0.05, 1.26, 0.35, 1.16, 0.55);
    c.bezierCurveTo(1.0, 0.3, 0.92, 0.0, 0.9, -0.34);
    c.lineTo(-0.9, -0.34);
    c.bezierCurveTo(-0.92, 0.0, -1.0, 0.3, -1.16, 0.55);
    done();
  } else if (st === 'long') {           // comprido, repartido de lado
    c.beginPath(); c.moveTo(-1.14, 0.7);
    c.bezierCurveTo(-1.36, -0.4, -1.0, -1.14, -0.3, -1.12);
    c.bezierCurveTo(0.3, -1.2, 1.05, -1.1, 1.2, -0.3);
    c.bezierCurveTo(1.28, 0.2, 1.24, 0.5, 1.14, 0.7);
    c.bezierCurveTo(1.02, 0.2, 0.9, -0.3, 0.45, -0.66);
    c.bezierCurveTo(0.0, -0.3, -0.6, -0.26, -0.92, -0.2);
    c.bezierCurveTo(-1.0, 0.2, -1.04, 0.45, -1.14, 0.7);
    done();
  } else if (st === 'pony') {           // rabo de cavalo, franja de lado
    c.beginPath(); c.moveTo(-1.12, -0.05);
    c.bezierCurveTo(-1.22, -0.75, -0.9, -1.1, -0.3, -1.08);
    c.bezierCurveTo(0.3, -1.16, 0.95, -1.05, 1.08, -0.6);
    c.bezierCurveTo(1.16, -0.4, 1.15, -0.2, 1.12, -0.05);
    c.bezierCurveTo(1.02, -0.3, 0.9, -0.5, 0.62, -0.66);
    c.bezierCurveTo(0.2, -0.3, -0.5, -0.3, -0.9, -0.42);
    c.bezierCurveTo(-1.0, -0.3, -1.04, -0.2, -1.12, -0.05);
    done();
  } else if (st === 'curly') {
    const pts = [[-1.05, -0.35, 0.3], [-0.92, -0.78, 0.33], [-0.5, -1.05, 0.36], [0.0, -1.14, 0.36], [0.5, -1.05, 0.36], [0.92, -0.78, 0.33], [1.05, -0.35, 0.3]];
    for (const [x, y, r] of pts) { ell(c, x, y, r, r); c.fill(); c.stroke(); }
    c.beginPath(); c.moveTo(-1.02, -0.3); c.bezierCurveTo(-0.9, -1.1, 0.9, -1.1, 1.02, -0.3); c.bezierCurveTo(0.5, -0.56, -0.5, -0.56, -1.02, -0.3); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-0.95, -0.32); c.bezierCurveTo(-0.5, -0.56, 0.5, -0.56, 0.95, -0.32); c.stroke();
  } else if (st === 'bald') {
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 1.08, -0.42); c.quadraticCurveTo(s * 1.26, -0.2, s * 1.1, 0.02); c.quadraticCurveTo(s * 0.92, -0.14, s * 0.94, -0.5); c.closePath(); c.fill(); c.stroke(); }
  }
}

function capHat(c, col) {
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = HEAD_LW; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-1.12, -0.42); c.bezierCurveTo(-1.2, -1.0, -0.7, -1.2, 0, -1.2); c.bezierCurveTo(0.7, -1.2, 1.2, -1.0, 1.12, -0.42); c.bezierCurveTo(0.5, -0.56, -0.5, -0.56, -1.12, -0.42); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(0.1, -0.52); c.bezierCurveTo(0.8, -0.62, 1.5, -0.5, 1.72, -0.24); c.bezierCurveTo(1.2, -0.3, 0.7, -0.3, 0.3, -0.34); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.85)'; ell(c, 0, -1.2, 0.1, 0.06); c.fill(); c.stroke();
}

// ---------- rosto ----------
function drawFace(c, f, look, T, seed, opt, skin) {
  const lx = look[0] * 0.2, ly = look[1] * 0.14;
  const ex = 0.41, ey = -0.04 + ly, my = 0.58 + ly;
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = INK; c.fillStyle = INK;
  const per = 3.3 + seed * 1.7;
  const blink = ((T + seed * 9.1) % per) < 0.1;
  let eyes = f.eyes;
  if (blink && (eyes === 'dot' || eyes === 'wide' || eyes === 'half')) eyes = 'line';
  c.fillStyle = `rgba(255,105,110,${f.blush ? 0.4 : 0.16})`;
  for (const s of [-1, 1]) { ell(c, lx + s * 0.7, 0.36 + ly, 0.17, 0.1); c.fill(); }
  c.fillStyle = INK;
  for (const s of [-1, 1]) {
    const x = lx + s * ex;
    if (f.bags) { c.strokeStyle = 'rgba(120,70,110,0.8)'; c.lineWidth = 0.045; c.beginPath(); c.moveTo(x - 0.16, ey + 0.27); c.quadraticCurveTo(x, ey + 0.37, x + 0.16, ey + 0.27); c.stroke(); c.strokeStyle = INK; }
    if (eyes === 'dot' || eyes === 'wide' || eyes === 'half') {
      const rx = eyes === 'wide' ? 0.23 : 0.19, ry = eyes === 'wide' ? 0.27 : 0.23, pr = eyes === 'wide' ? 0.07 : 0.105;
      ell(c, x, ey, rx, ry); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 0.045; c.stroke();
      c.save(); ell(c, x, ey, rx, ry); c.clip();
      const px = x + look[0] * 0.07 + (eyes === 'wide' ? 0 : s * -0.015), py = ey + look[1] * 0.08 + (eyes === 'half' ? 0.05 : 0.01);
      c.fillStyle = INK; ell(c, px, py, pr, pr * 1.08); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.9)'; ell(c, px + pr * 0.35, py - pr * 0.4, pr * 0.3, pr * 0.3); c.fill();
      if (eyes === 'half') { c.fillStyle = skin; c.fillRect(x - 0.3, ey - 0.35, 0.6, 0.33); c.strokeStyle = INK; c.lineWidth = 0.05; c.beginPath(); c.moveTo(x - 0.3, ey - 0.02); c.lineTo(x + 0.3, ey - 0.02); c.stroke(); }
      c.restore();
      if (eyes === 'half') { ell(c, x, ey, rx, ry); c.lineWidth = 0.045; c.strokeStyle = INK; c.stroke(); }
      c.fillStyle = INK;
    } else if (eyes === 'closed') { c.lineWidth = 0.055; c.beginPath(); c.moveTo(x - 0.16, ey); c.quadraticCurveTo(x, ey + 0.13, x + 0.16, ey); c.stroke(); }
    else if (eyes === 'line') { c.lineWidth = 0.055; c.beginPath(); c.moveTo(x - 0.15, ey + 0.02); c.lineTo(x + 0.15, ey + 0.02); c.stroke(); }
    else if (eyes === 'happy') { c.lineWidth = 0.06; c.beginPath(); c.moveTo(x - 0.16, ey + 0.06); c.quadraticCurveTo(x, ey - 0.16, x + 0.16, ey + 0.06); c.stroke(); }
    else if (eyes === 'squint') { c.lineWidth = 0.06; c.beginPath(); c.moveTo(x - s * 0.14, ey - 0.12); c.lineTo(x + s * 0.1, ey); c.lineTo(x - s * 0.14, ey + 0.12); c.stroke(); }
    // sobrancelhas
    const by = ey - (eyes === 'wide' ? 0.42 : 0.36);
    c.lineWidth = 0.07; c.strokeStyle = opt.browC || INK;
    if (f.brows === 'up') { c.beginPath(); c.moveTo(x - 0.15, by - 0.02); c.quadraticCurveTo(x, by - 0.12, x + 0.15, by - 0.02); c.stroke(); }
    else if (f.brows === 'worried') { c.beginPath(); c.moveTo(x - s * 0.17, by - 0.1); c.lineTo(x + s * 0.15, by + 0.04); c.stroke(); }
    else if (f.brows === 'angry') { c.beginPath(); c.moveTo(x - s * 0.17, by + 0.07); c.lineTo(x + s * 0.14, by - 0.08); c.stroke(); }
    else if (f.brows === 'low') { c.beginPath(); c.moveTo(x - 0.16, by + 0.1); c.lineTo(x + 0.16, by + 0.1); c.stroke(); }
    else if (f.brows === 'one') { c.beginPath(); if (s === 1) { c.moveTo(x - 0.15, by - 0.08); c.quadraticCurveTo(x, by - 0.17, x + 0.15, by - 0.07); } else { c.moveTo(x - 0.15, by + 0.06); c.lineTo(x + 0.15, by + 0.04); } c.stroke(); }
    else if (eyes === 'dot' || eyes === 'half') { c.beginPath(); c.moveTo(x - 0.14, by + 0.01); c.quadraticCurveTo(x, by - 0.05, x + 0.14, by + 0.01); c.stroke(); }
    c.strokeStyle = INK;
  }
  if (opt.glasses) {
    c.lineWidth = 0.05; c.fillStyle = 'rgba(210,235,255,0.2)';
    for (const s of [-1, 1]) { c.beginPath(); c.roundRect(lx + s * ex - 0.29, ey - 0.27, 0.58, 0.54, 0.16); c.fill(); c.stroke(); }
    c.beginPath(); c.moveTo(lx - 0.12, ey - 0.02); c.lineTo(lx + 0.12, ey - 0.02); c.stroke(); c.fillStyle = INK;
  }
  // nariz
  c.lineWidth = 0.05; c.strokeStyle = 'rgba(40,20,45,0.75)';
  c.beginPath(); c.moveTo(lx * 1.3 - 0.07, 0.25 + ly); c.quadraticCurveTo(lx * 1.3, 0.36 + ly, lx * 1.3 + 0.08, 0.25 + ly); c.stroke();
  c.strokeStyle = INK;
  // boca
  const mx = lx; c.lineWidth = 0.06; c.fillStyle = INK;
  const m = f.mouth;
  if (m === 'flat') { c.beginPath(); c.moveTo(mx - 0.14, my); c.lineTo(mx + 0.14, my); c.stroke(); }
  else if (m === 'smile') { c.beginPath(); c.moveTo(mx - 0.2, my - 0.05); c.quadraticCurveTo(mx, my + 0.15, mx + 0.2, my - 0.05); c.stroke(); }
  else if (m === 'frown') { c.beginPath(); c.moveTo(mx - 0.17, my + 0.07); c.quadraticCurveTo(mx, my - 0.08, mx + 0.17, my + 0.07); c.stroke(); }
  else if (m === 'smirk') { c.beginPath(); c.moveTo(mx - 0.15, my + 0.03); c.quadraticCurveTo(mx + 0.08, my + 0.1, mx + 0.22, my - 0.08); c.stroke(); }
  else if (m === 'wide') { c.beginPath(); c.moveTo(mx - 0.44, my - 0.2); c.quadraticCurveTo(mx, my + 0.3, mx + 0.44, my - 0.2); c.stroke(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(mx + s * 0.44, my - 0.27); c.lineTo(mx + s * 0.44, my - 0.13); c.stroke(); } }
  else if (m === 'o') { ell(c, mx, my, 0.065, 0.08); c.fill(); }
  else if (m === 'gasp') { c.fillStyle = '#5a1522'; ell(c, mx, my + 0.02, 0.13, 0.17); c.fill(); c.lineWidth = 0.05; c.stroke(); c.fillStyle = '#d9606c'; c.save(); c.clip(); ell(c, mx, my + 0.17, 0.1, 0.08); c.fill(); c.restore(); }
  else if (m === 'wavy') { c.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, x = mx - 0.19 + u * 0.38, y = my + Math.sin(u * TAU * 2.5) * 0.035; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); }
  else if (m === 'grin') {
    c.beginPath(); c.moveTo(mx - 0.24, my - 0.1); c.quadraticCurveTo(mx, my - 0.05, mx + 0.24, my - 0.1); c.quadraticCurveTo(mx, my + 0.32, mx - 0.24, my - 0.1); c.closePath();
    c.fillStyle = '#6a1826'; c.fill(); c.save(); c.clip();
    c.fillStyle = '#e8717c'; ell(c, mx, my + 0.17, 0.14, 0.09); c.fill();
    c.fillStyle = '#fff'; c.fillRect(mx - 0.24, my - 0.12, 0.48, 0.085); c.restore(); c.lineWidth = 0.05; c.stroke();
  }
  if (opt.mustache) { c.fillStyle = opt.mustache; c.beginPath(); c.moveTo(mx, my - 0.2); c.quadraticCurveTo(mx + 0.26, my - 0.24, mx + 0.36, my - 0.04); c.quadraticCurveTo(mx + 0.14, my - 0.1, mx, my - 0.08); c.quadraticCurveTo(mx - 0.14, my - 0.1, mx - 0.36, my - 0.04); c.quadraticCurveTo(mx - 0.26, my - 0.24, mx, my - 0.2); c.closePath(); c.fill(); c.lineWidth = 0.035; c.stroke(); }
  if (opt.beard) { c.fillStyle = opt.beard; c.globalAlpha = 0.55; c.beginPath(); c.moveTo(-0.98, 0.3); c.bezierCurveTo(-0.9, 0.75, -0.6, 0.95, 0, 0.97); c.bezierCurveTo(0.6, 0.95, 0.9, 0.75, 0.98, 0.3); c.bezierCurveTo(0.6, 0.62, -0.6, 0.62, -0.98, 0.3); c.closePath(); c.fill(); c.globalAlpha = 1; }
  if (opt.scratch) {
    c.strokeStyle = '#c0392b'; c.lineWidth = 0.04;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(lx + 0.74 + i * 0.075, 0.18 + ly); c.lineTo(lx + 0.6 + i * 0.075, 0.5 + ly); c.stroke(); }
    c.strokeStyle = INK;
  }
  if (f.sweat) {
    const u = ((T * 0.35 + seed) % 1), sx = 0.78, sy = -0.62 + u * 0.22;
    c.globalAlpha = u < 0.85 ? 1 : (1 - u) / 0.15;
    c.fillStyle = '#c9ecff'; c.lineWidth = 0.035; c.beginPath(); c.moveTo(sx, sy - 0.14); c.quadraticCurveTo(sx + 0.1, sy, sx, sy + 0.08); c.quadraticCurveTo(sx - 0.1, sy, sx, sy - 0.14); c.closePath(); c.fill(); c.stroke();
    c.globalAlpha = 1;
  }
  if (f.tears) {
    c.fillStyle = '#8fd3ff'; c.lineWidth = 0.03;
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
      const u = ((T * 0.55 + k * 0.5 + (s > 0 ? 0.25 : 0)) % 1), x = lx + s * (ex + 0.03), y = ey + 0.28 + u * 0.5;
      c.globalAlpha = u < 0.7 ? 1 : (1 - u) / 0.3;
      c.beginPath(); c.moveTo(x, y - 0.1); c.quadraticCurveTo(x + 0.07, y + 0.02, x, y + 0.055); c.quadraticCurveTo(x - 0.07, y + 0.02, x, y - 0.1); c.closePath(); c.fill(); c.stroke();
    }
    c.globalAlpha = 1;
  }
}

function arm(c, sx, sy, hx, hy, side, bend, sleeve, skin, bare) {
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
  c.strokeStyle = INK; c.lineWidth = 0.102; c.stroke();
  c.strokeStyle = bare ? skin : sleeve; c.lineWidth = 0.064; c.stroke();
  if (bare === 'cap') { ell(c, sx, -sy, 0.062, 0.062); c.fillStyle = sleeve; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.018; c.stroke(); }
  // mão com polegar
  const tx = hx - side * 0.04, ty = hy + 0.045;
  c.fillStyle = skin; c.strokeStyle = INK; c.lineWidth = 0.018;
  ell(c, tx, -ty, 0.026, 0.026); c.fill(); c.stroke();
  ell(c, hx, -hy, 0.06, 0.057); c.fill(); c.stroke();
  return [hx, hy];
}

function phoneInHand(c, x, y, on) {
  c.save(); c.translate(x + 0.005, -y - 0.07); c.rotate(-0.1);
  c.fillStyle = '#2a2836'; c.strokeStyle = INK; c.lineWidth = 0.016; c.lineJoin = 'round';
  c.beginPath(); c.roundRect(-0.06, -0.12, 0.12, 0.23, 0.022); c.fill(); c.stroke();
  c.fillStyle = '#17151f'; c.beginPath(); c.roundRect(-0.042, -0.102, 0.038, 0.038, 0.01); c.fill();
  c.fillStyle = '#4a4860'; c.beginPath(); c.arc(-0.023, -0.083, 0.008, 0, TAU); c.fill();
  if (on) { c.strokeStyle = 'rgba(190,225,255,0.85)'; c.lineWidth = 0.008; c.beginPath(); c.roundRect(-0.06, -0.12, 0.12, 0.23, 0.022); c.stroke(); }
  c.restore();
}

/**
 * Desenha um personagem.
 * c: { at:[x,z], y, skin, hair:{st,c}, shirt, style, pants, shoes, face, pose, look:[x,y], tilt, back, sil, sit,
 *      scale, lean, id, walk, hop, glasses, mustache, beard, hat, print, earring, headOnly, scratch }
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
  const shirt = c.shirt || '#1f9e8f';
  const pants = c.pants || '#2b3352';
  const shoes = c.shoes || '#f1ede4';
  const face = typeof c.face === 'string' ? (FACES[c.face] || FACES.neutral) : (c.face || FACES.neutral);
  const look = c.look || [0, 0];
  const st = c.style || 'hoodie';

  if (!c.noShadow && y0 < 0.2) {
    ctx.save();
    const pitch = Math.abs(cam.fw[1]) * 0.9 + 0.12;
    ctx.fillStyle = 'rgba(8,6,22,0.34)';
    ctx.beginPath(); ctx.ellipse(P.x, P.y, 0.3 * S, 0.3 * S * pitch, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  const bx0 = clamp(Math.floor(P.x - 1.0 * S), 0, W), bx1 = clamp(Math.ceil(P.x + 1.0 * S), 0, W);
  const by0 = clamp(Math.floor(P.y - 2.15 * S), 0, H), by1 = clamp(Math.ceil(P.y + 0.2 * S), 0, H);
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
  if (c.lean) sc.rotate(c.lean);
  const hy = 1.255 + breathe * 1.4;
  const dress = st === 'dress';
  const HIP = 0.41;

  if (!c.headOnly) {
    // pernas e tênis
    sc.lineCap = 'round'; sc.lineJoin = 'round';
    for (const s of [-1, 1]) {
      let fx = s * 0.11, fy = 0;
      if (walk) { fx += Math.sin(wph + (s > 0 ? Math.PI : 0)) * 0.07; fy = Math.max(0, Math.cos(wph + (s > 0 ? Math.PI : 0))) * 0.045; }
      if (c.sit) { fx = s * 0.15; fy = -0.08; }
      sc.beginPath(); sc.moveTo(s * 0.105, -(HIP + bodyDy)); sc.lineTo(fx, -fy - 0.1);
      sc.strokeStyle = INK; sc.lineWidth = 0.15; sc.stroke();
      sc.strokeStyle = dress ? skin : pants; sc.lineWidth = 0.112; sc.stroke();
      // tênis
      sc.save(); sc.translate(fx + s * 0.035, -fy);
      sc.fillStyle = shoes; sc.strokeStyle = INK; sc.lineWidth = 0.018;
      sc.beginPath(); sc.roundRect(-0.105, -0.1, 0.21, 0.1, [0.05, 0.05, 0.02, 0.02]); sc.fill(); sc.stroke();
      sc.fillStyle = c.sole || '#3a3550'; sc.fillRect(-0.103, -0.03, 0.206, 0.028);
      sc.restore();
    }
    sc.translate(0, -bodyDy);
    if (!c.back) { sc.save(); sc.translate((c.headDx || 0), -hy); sc.rotate(c.tilt || 0); sc.scale(0.3, 0.3); hairBack(sc, hairSt, hairCol); sc.restore(); }
    if (st === 'hoodie' && !c.back) { // capuz atrás do pescoço
      ell(sc, 0, -1.0, 0.25, 0.1); sc.fillStyle = css(shade(shirt, 0.72)); sc.fill(); sc.strokeStyle = INK; sc.lineWidth = 0.02; sc.stroke();
    }
    // pescoço
    sc.fillStyle = css(shade(skin, 0.86)); sc.fillRect(-0.075, -1.08, 0.15, 0.1);

    // tronco
    const bot = dress ? 0.3 : 0.4, bwid = dress ? 0.32 : 0.245;
    const torso = () => {
      sc.beginPath();
      sc.moveTo(-0.12, -1.02); sc.lineTo(0.12, -1.02);
      sc.quadraticCurveTo(0.215, -1.0, 0.228, -0.88);
      sc.lineTo(bwid, -(bot + 0.08));
      sc.quadraticCurveTo(bwid, -bot, bwid - 0.075, -bot);
      sc.lineTo(-bwid + 0.075, -bot);
      sc.quadraticCurveTo(-bwid, -bot, -bwid, -(bot + 0.08));
      sc.lineTo(-0.228, -0.88);
      sc.quadraticCurveTo(-0.215, -1.0, -0.12, -1.02);
      sc.closePath();
    };
    torso();
    const gr = sc.createLinearGradient(-0.25, -1.0, 0.25, -0.4);
    gr.addColorStop(0, css(shade(shirt, 1.1))); gr.addColorStop(0.55, css(shirt)); gr.addColorStop(1, css(shade(shirt, 0.8)));
    sc.fillStyle = gr; sc.fill();
    sc.save(); sc.clip();
    sc.fillStyle = 'rgba(20,10,45,0.24)'; ell(sc, 0, -(hy - 0.28), 0.3, 0.1); sc.fill();
    const dk = css(shade(shirt, 0.62));
    if (c.back) {
      if (st === 'hoodie') { sc.fillStyle = css(shade(shirt, 0.82)); sc.strokeStyle = dk; sc.lineWidth = 0.014; sc.beginPath(); sc.moveTo(-0.2, -1.02); sc.quadraticCurveTo(0, -0.72, 0.2, -1.02); sc.closePath(); sc.fill(); sc.stroke(); }
    } else if (st === 'suit') {
      sc.fillStyle = '#f1f1f4'; sc.beginPath(); sc.moveTo(-0.08, -1.03); sc.lineTo(0.08, -1.03); sc.lineTo(0, -0.68); sc.closePath(); sc.fill();
      sc.fillStyle = c.tie || '#9b2335'; sc.beginPath(); sc.moveTo(-0.024, -1.0); sc.lineTo(0.024, -1.0); sc.lineTo(0.036, -0.76); sc.lineTo(0, -0.69); sc.lineTo(-0.036, -0.76); sc.closePath(); sc.fill();
      sc.strokeStyle = INK; sc.lineWidth = 0.013; sc.beginPath(); sc.moveTo(-0.09, -1.03); sc.lineTo(0, -0.67); sc.lineTo(0.09, -1.03); sc.stroke();
      sc.strokeStyle = dk; sc.beginPath(); sc.moveTo(0, -0.67); sc.lineTo(0, -0.4); sc.stroke();
      sc.fillStyle = '#f1f1f4'; sc.fillRect(0.1, -0.84, 0.07, 0.022);
    } else if (st === 'hoodie') {
      sc.strokeStyle = dk; sc.lineWidth = 0.013;
      sc.beginPath(); sc.moveTo(-0.13, -0.6); sc.quadraticCurveTo(0, -0.66, 0.13, -0.6); sc.lineTo(0.16, -0.47); sc.lineTo(-0.16, -0.47); sc.closePath(); sc.stroke();
      sc.beginPath(); sc.moveTo(-0.11, -1.02); sc.quadraticCurveTo(0, -0.9, 0.11, -1.02); sc.stroke();
      sc.strokeStyle = '#f4f1ea'; sc.lineWidth = 0.014; sc.lineCap = 'round';
      for (const s of [-1, 1]) { sc.beginPath(); sc.moveTo(s * 0.045, -0.96); sc.lineTo(s * 0.05, -0.8); sc.stroke(); }
    } else if (st === 'tee') {
      sc.strokeStyle = dk; sc.lineWidth = 0.014; sc.beginPath(); sc.moveTo(-0.1, -1.02); sc.quadraticCurveTo(0, -0.92, 0.1, -1.02); sc.stroke();
      if (c.print) { sc.fillStyle = c.print; sc.beginPath(); sc.moveTo(0.02, -0.82); sc.lineTo(-0.07, -0.66); sc.lineTo(-0.005, -0.66); sc.lineTo(-0.03, -0.54); sc.lineTo(0.075, -0.71); sc.lineTo(0.008, -0.71); sc.closePath(); sc.fill(); }
    } else if (st === 'stripe') {
      sc.fillStyle = css(shade(shirt, 0.74));
      for (let i = 0; i < 5; i++) sc.fillRect(-0.34, -0.93 + i * 0.125, 0.68, 0.05);
      sc.strokeStyle = dk; sc.lineWidth = 0.014; sc.beginPath(); sc.moveTo(-0.1, -1.02); sc.lineTo(0, -0.9); sc.lineTo(0.1, -1.02); sc.stroke();
    } else if (st === 'dress') {
      sc.fillStyle = skin; sc.beginPath(); sc.moveTo(-0.11, -1.04); sc.quadraticCurveTo(0, -0.86, 0.11, -1.04); sc.closePath(); sc.fill();
      sc.strokeStyle = dk; sc.lineWidth = 0.013; sc.beginPath(); sc.moveTo(-0.115, -1.03); sc.quadraticCurveTo(0, -0.85, 0.115, -1.03); sc.stroke();
      sc.beginPath(); sc.moveTo(-0.23, -0.62); sc.quadraticCurveTo(0, -0.57, 0.23, -0.62); sc.stroke();
    } else if (st === 'apron') {
      sc.strokeStyle = dk; sc.lineWidth = 0.014; sc.beginPath(); sc.moveTo(-0.1, -1.02); sc.quadraticCurveTo(0, -0.92, 0.1, -1.02); sc.stroke();
      sc.fillStyle = '#f2efe6'; sc.strokeStyle = INK; sc.lineWidth = 0.013;
      sc.beginPath(); sc.roundRect(-0.16, -0.86, 0.32, 0.5, 0.03); sc.fill(); sc.stroke();
      sc.beginPath(); sc.moveTo(-0.12, -0.86); sc.lineTo(-0.1, -1.02); sc.moveTo(0.12, -0.86); sc.lineTo(0.1, -1.02); sc.stroke();
      sc.beginPath(); sc.roundRect(-0.08, -0.66, 0.16, 0.12, 0.02); sc.stroke();
    } else if (st === 'shirt') {
      sc.strokeStyle = dk; sc.lineWidth = 0.013; sc.beginPath(); sc.moveTo(0, -0.95); sc.lineTo(0, -0.4); sc.stroke();
      sc.fillStyle = css(shade(shirt, 1.14)); sc.strokeStyle = INK;
      for (const s of [-1, 1]) { sc.beginPath(); sc.moveTo(0, -0.95); sc.lineTo(s * 0.12, -1.03); sc.lineTo(s * 0.1, -0.88); sc.closePath(); sc.fill(); sc.stroke(); }
      sc.strokeStyle = dk; sc.beginPath(); sc.roundRect(0.07, -0.8, 0.1, 0.1, 0.015); sc.stroke();
    }
    sc.restore();
    torso(); sc.strokeStyle = INK; sc.lineWidth = 0.023; sc.lineJoin = 'round'; sc.stroke();
  }

  // braços
  let ps = {};
  const hands = {};
  let drawArm = null;
  if (!c.headOnly) {
    const poseFn = POSES[c.pose] || POSES.down;
    ps = poseFn(T + seed * 3);
    const bare = dress ? true : (st === 'tee' || st === 'apron') ? 'cap' : false;
    const sleeve = css(shirt);
    const bend = ps.bend ?? 1;
    const sway = walk ? Math.sin(wph) * 0.05 : 0;
    drawArm = (side) => {
      const key = side < 0 ? 'L' : 'R';
      const h = ps[key];
      const holding = ps.hold === key && !c.back;
      if (holding) phoneInHand(sc, Math.min(h[0], 0.19 + 0.49), h[1], c.phoneOn !== false);
      hands[key] = arm(sc, side * 0.205, 0.9, h[0] + (key === 'L' ? sway : -sway), h[1], side, bend, sleeve, skin, bare);
    };
    if (!c.back) { if (!ps.frontL) drawArm(-1); if (!ps.frontR) drawArm(1); }
    else { drawArm(-1); drawArm(1); }
  }

  // cabeça
  sc.save();
  sc.translate((c.headDx || 0), -hy); sc.rotate(c.tilt || 0); sc.scale(0.3, 0.3);
  if (c.headOnly && !c.back) hairBack(sc, hairSt, hairCol);
  // orelhas
  sc.fillStyle = css(shade(skin, 0.93)); sc.strokeStyle = INK; sc.lineWidth = HEAD_LW;
  for (const s of [-1, 1]) {
    ell(sc, s * 1.07, 0.06, 0.14, 0.2); sc.fill(); sc.stroke();
    if (c.earring && !c.back) { sc.fillStyle = c.earring; ell(sc, s * 1.1, 0.34, 0.07, 0.07); sc.fill(); sc.stroke(); sc.fillStyle = css(shade(skin, 0.93)); }
  }
  headPath(sc);
  const hg = sc.createRadialGradient(-0.3, -0.35, 0.1, 0, 0, 1.3);
  hg.addColorStop(0, css(shade(skin, 1.08))); hg.addColorStop(0.6, css(skin)); hg.addColorStop(1, css(shade(skin, 0.82)));
  sc.fillStyle = hg; sc.fill();
  sc.strokeStyle = INK; sc.lineWidth = HEAD_LW; sc.stroke();
  if (!c.back) {
    sc.save(); headPath(sc); sc.clip();
    drawFace(sc, face, look, T, seed, c, css(shade(skin, 0.94)));
    sc.restore();
    hairFront(sc, hairSt, hairCol);
    if (c.hat === 'cap') capHat(sc, c.hatC || '#2d5da8');
  } else {
    hairRear(sc, hairSt, hairCol);
    if (hairSt === 'pony' || hairSt === 'long' || hairSt === 'bob') { sc.save(); sc.scale(-1, 1); hairBack(sc, hairSt === 'pony' ? 'pony' : hairSt, hairCol); sc.restore(); }
  }
  sc.restore();

  if (!c.back && drawArm) { if (ps.frontL) drawArm(-1); if (ps.frontR) drawArm(1); }
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
