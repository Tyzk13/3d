// Céu, luz do sol/ambiente, reflexos e predefinições de clima.
import * as THREE from 'three';
import { R, S } from './engine';
import { LI } from './kit';
import { st } from './state';

export interface Preset {
  n: string;
  glow?: number;
  sky: [string, string, string];
  cl: string; dk: string;
  fog: number; fd: [number, number];
  hs: number; hg: number; hi: number;
  sc: number; si: number; sp: [number, number, number];
  win: number; wr?: [number, number, number];
  door: number; dc?: number;
  lamp: number; pw: number; pud: number;
  ex?: number; mist?: number;
}

export const PRE: Preset[] = [
  { n: 'Terror', glow: .55, sky: ['#06090e', '#161d27', '#323c48'], cl: '70,80,92', dk: '6,9,14', fog: 0x1a2129, fd: [16, 125], hs: 0x6f84a8, hg: 0x12100f, hi: .55, sc: 0x8fa2c0, si: .45, sp: [-42, 15, 30], win: 0xffffff, wr: [1.5, 1.05, .62], door: 1.3, dc: 0xff9a4a, lamp: 0xffc27a, pw: 1, pud: .4, ex: 1.3, mist: .2 },
  { n: 'Anoitecer', glow: .45, sky: ['#141b27', '#3b4658', '#7d8794'], cl: '110,120,138', dk: '20,26,38', fog: 0x6a7585, fd: [28, 175], hs: 0x8296bd, hg: 0x1b1a1c, hi: .85, sc: 0xd9c9b8, si: .8, sp: [-60, 13, 34], win: 0xffffff, wr: [1.7, 1.3, .85], door: 1.4, dc: 0xffa050, lamp: 0xffd9a0, pw: 1, pud: .5, ex: 1.15, mist: .22 },
  { n: 'Crepúsculo', glow: .5, dc: 0xff2a1a, ex: 1.1, mist: .15, sky: ['#070308', '#35101a', '#a02c2a'], cl: '150,34,36', dk: '8,4,8', fog: 0x2c1014, fd: [18, 120], hs: 0xff7a60, hg: 0x1c0c0e, hi: .75, sc: 0xff7352, si: .8, sp: [-40, 18, 34], win: 0xff5a48, door: 2.4, lamp: 0xff9a6a, pw: 1, pud: 1 },
  { n: 'Nublado', sky: ['#56606a', '#868f96', '#b0b4b1'], cl: '120,128,134', dk: '60,66,72', fog: 0xa4a9a8, fd: [26, 150], hs: 0xfff0d8, hg: 0x3a3226, hi: .78, sc: 0xdfe6ee, si: .55, sp: [-30, 45, 25], win: 0xc8c8d0, door: 0, lamp: 0x7a7468, pw: 0, pud: .15 },
  { n: 'Noite', glow: .6, sky: ['#03050c', '#0e1426', '#262d44'], cl: '40,50,80', dk: '2,4,10', fog: 0x1a2036, fd: [22, 130], hs: 0x7f93d6, hg: 0x10131c, hi: .3, sc: 0x9db4ff, si: .4, sp: [-25, 40, 20], win: 0xffd49a, door: .6, lamp: 0xffd27a, pw: 1, pud: .45 },
];

// ---------- cúpula do céu desenhada em canvas ----------
const skC = document.createElement('canvas'); skC.width = 1024; skC.height = 512;
const skx = skC.getContext('2d')!;
export const skt = new THREE.CanvasTexture(skC); skt.colorSpace = THREE.SRGBColorSpace;
export const dome = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), new THREE.MeshBasicMaterial({ map: skt, side: THREE.BackSide, fog: false }));
S.add(dome);

const pmrem = new THREE.PMREMGenerator(R);
const envScene = new THREE.Scene();
envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ map: skt, side: THREE.BackSide })));
let envRT: THREE.WebGLRenderTarget | null = null;
export const env = { hdr: null as THREE.Texture | null };
function updEnv() {
  if (env.hdr) return;
  if (envRT) envRT.dispose();
  envRT = pmrem.fromScene(envScene, 0, 0.1, 200);
  S.environment = envRT.texture;
}
export function applyHdr(tex: THREE.Texture | null) {
  env.hdr = tex;
  if (tex) {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    dome.material.map = tex; dome.scale.x = -1;
    if (envRT) envRT.dispose(); envRT = pmrem.fromEquirectangular(tex); S.environment = envRT.texture;
  } else { dome.material.map = skt; dome.scale.x = 1; updEnv(); }
  dome.material.needsUpdate = true;
}

export const hemi = new THREE.HemisphereLight(0xfff0d8, 0x3a3226, 0.95); S.add(hemi);
export const sun = new THREE.DirectionalLight(0xfff0d6, 1.05);
sun.position.set(-30, 45, 25); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 160 });
S.add(sun); S.add(sun.target);

export function setShadowRadius(r: number) {
  Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, far: Math.max(160, r * 4) });
  sun.shadow.camera.updateProjectionMatrix();
}

export function setTime(i: number) {
  const p = PRE[i];
  skx.clearRect(0, 0, 1024, 512);
  const g = skx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, p.sky[0]); g.addColorStop(0.38, p.sky[1]); g.addColorStop(0.5, p.sky[2]); g.addColorStop(1, p.sky[0]);
  skx.fillStyle = g; skx.fillRect(0, 0, 1024, 512);
  let q = 11; const r = () => (q = (q * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 170; k++) {
    const x = r() * 1024, y = 40 + r() * 190, w = 50 + r() * 130, c = r() < 0.6 ? p.dk : p.cl, gr = skx.createRadialGradient(x, y, 0, x, y, w);
    gr.addColorStop(0, 'rgba(' + c + ',.28)'); gr.addColorStop(1, 'rgba(' + c + ',0)'); skx.fillStyle = gr;
    skx.save(); skx.translate(x, y); skx.scale(1, 0.35); skx.translate(-x, -y); skx.fillRect(x - w, y - w, 2 * w, 2 * w); skx.restore();
  }
  skt.needsUpdate = true; updEnv();
  const fog = S.fog as THREE.Fog;
  fog.color.set(p.fog); fog.near = p.fd[0]; fog.far = p.fd[1];
  hemi.color.set(p.hs); hemi.groundColor.set(p.hg); hemi.intensity = p.hi * 0.6 * LI;
  sun.color.set(p.sc); sun.intensity = p.si * LI; sun.position.set(p.sp[0], p.sp[1], p.sp[2]);
  R.toneMappingExposure = p.ex || 1;
  const M = st.MP;
  if (M) {
    M.lamps.forEach(m => m.color.set(p.lamp));
    M.glass.forEach(m => m.color.set(p.win));
    if (p.wr) M.glass.forEach(m => m.color.setRGB(p.wr![0], p.wr![1], p.wr![2]));
    M.lights.forEach(l => (l.l.intensity = p.pw ? l.n : l.d));
    if (M.puddle) (M.puddle as any).opacity = p.pud;
    M.halos.forEach(h => (h.material.opacity = p.glow || 0));
    M.mist.forEach(m => (m.material.opacity = p.mist == null ? 0.12 : p.mist));
    if (M.onTime) M.onTime(p);
  }
}
