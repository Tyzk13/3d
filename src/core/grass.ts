// Gramado procedural instanciado: touceiras de lâminas curvas (cor da raiz à ponta, variação por touceira)
// com vento na GPU. Densidade controlada pela qualidade.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { addWind } from './anim';

/** Uma touceira: `n` lâminas curvas em volta da origem (base em y=0). */
function clumpGeometry(n = 7, seed = 1) {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const blades: THREE.BufferGeometry[] = [];
  for (let i = 0; i < n; i++) {
    const h = 0.22 + r() * 0.3, w = 0.018 + r() * 0.012, seg = 4;
    const g = new THREE.PlaneGeometry(w, h, 1, seg); g.translate(0, h / 2, 0);
    const p = g.attributes.position, col = new Float32Array(p.count * 3);
    const bend = 0.06 + r() * 0.14;
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k), t = y / h;
      p.setX(k, p.getX(k) * (1 - t * 0.85));      // afina na ponta
      p.setZ(k, bend * t * t);                      // curva para fora
      const c = 0.35 + t * 0.65;                     // escuro na raiz, claro na ponta
      col[k * 3] = c; col[k * 3 + 1] = c; col[k * 3 + 2] = c;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.rotateY(r() * Math.PI * 2);
    g.translate((r() - 0.5) * 0.12, 0, (r() - 0.5) * 0.12);
    g.deleteAttribute('uv');
    blades.push(g);
  }
  const m = mergeGeometries(blades)!;
  m.computeVertexNormals();
  // normais "para cima" iluminam a grama como volume (evita lâminas pretas de costas para a luz)
  const nn = m.attributes.normal; for (let k = 0; k < nn.count; k++) { nn.setXYZ(k, nn.getX(k) * 0.3, 0.9, nn.getZ(k) * 0.3); }
  return m;
}

export interface GrassOpts {
  count: number;
  area: [number, number, number, number]; // xmin, xmax, zmin, zmax
  allow: (x: number, z: number) => number;  // 0..1 (densidade local)
  height: (x: number, z: number) => number;
  colors?: number[];
}

export function grassField(o: GrassOpts) {
  const geo = clumpGeometry(7, 3);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85, envMapIntensity: 0.6 });
  addWind(mat, { amp: 0.06, freq: 1.9, flutter: 0.01, height: 0.5 }, true);
  const im = new THREE.InstancedMesh(geo, mat, o.count);
  const cols = (o.colors || [0x55603a, 0x4a5733, 0x606a3e, 0x6b6a40, 0x4d5a3a]).map(c => new THREE.Color(c));
  const d = new THREE.Object3D(), c = new THREE.Color();
  let s = 77; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let n = 0;
  for (let tries = 0; tries < o.count * 6 && n < o.count; tries++) {
    const x = o.area[0] + r() * (o.area[1] - o.area[0]), z = o.area[2] + r() * (o.area[3] - o.area[2]);
    if (r() > o.allow(x, z)) continue;
    d.position.set(x, o.height(x, z), z); d.rotation.set(0, r() * 6.28, 0);
    const k = 0.7 + r() * 0.8; d.scale.set(k, k * (0.8 + r() * 0.5), k); d.updateMatrix();
    im.setMatrixAt(n, d.matrix);
    im.setColorAt(n, c.copy(cols[(r() * cols.length) | 0]).multiplyScalar(0.85 + r() * 0.3));
    n++;
  }
  im.count = n;
  im.castShadow = false; im.receiveShadow = true; im.userData.ns = 1;
  im.computeBoundingSphere();
  return im;
}
