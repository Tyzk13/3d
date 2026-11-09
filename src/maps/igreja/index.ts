// Mapa principal: igreja tradicional de concreto preparada para um casamento, com terreno amplo.
// Monta as partes (building, interior, grounds) e define vistas, camadas, colisão e dados de VTT.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import type { MapRuntime, View } from '../../core/types';
import { begin, K } from '../../core/kit';
import { buildChurch } from './building';
import { EnvProbe } from '../../core/probe';
import { st } from '../../core/state';
import { buildInterior, PEW } from './interior';
import { buildGrounds, SHED, GAZEBO } from './grounds';
import { FLOOR, NX, NZ, WT, LOFT, LOFT_Z, TOWER, DOOR } from './common';

const P = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];
export const VIEWS: View[] = [
  { n: 'Cinema', p: P(-22, 7.5, 38), t: P(-3, 8, 4), fov: 46 },
  { n: 'Fachada', p: P(-6.5, 1.9, 29), t: P(-1.5, 6.5, 11), fov: 50 },
  { n: 'Altar', p: P(0.5, FLOOR + 1.65, 3.6), t: P(0, FLOOR + 2.0, -10), fov: 55 },
  { n: 'Coro', p: P(1.6, FLOOR + 1.75, -6.4), t: P(0, FLOOR + 3.0, 9), fov: 58 },
  { n: 'Geral', p: P(0, 30, 46), t: P(0, 2, 6) },
  { n: 'Tática', p: P(0, 62, 8.1), t: P(0, 0, 8) },
  { n: 'Do coro', p: P(-1.2, LOFT + 1.65, 9.6), t: P(0, FLOOR + 1.2, -9) },
];

export async function build(M: MapRuntime) {
  begin(M, 7);
  const G = M.G;
  const B = buildChurch(G);
  const I = buildInterior(G);
  const Gr = await buildGrounds(G, I.flowers, VIEWS);
  // as flores do exterior foram somadas ao mesmo coletor; instancia agora
  I.flowers.build(G);

  M.glass.push(...B.glass);
  M.walk.push(...Gr.floors, ...B.floors, ...I.floors);
  M.loft = I.loft;
  M.layers = [{ n: 'Paredes', o: B.walls, v: true }, { n: 'Telhado', o: B.roof, v: true }, { n: '2º andar', o: I.loft, v: true }];
  M.shadowRadius = 48;

  M.views = VIEWS;

  M.spawn = i => ({ x: i % 2 ? 0.45 : -0.45, z: 4.2 - Math.floor(i / 2) * 1.3, y: FLOOR });
  M.walkStart = { x: 0, z: 18 };

  const OX = NX + WT, OZ = NZ + WT, T = TOWER, dw = DOOR.w / 2;
  const sh = { x0: SHED.x - SHED.d / 2, x1: SHED.x + SHED.d / 2, z0: SHED.z - SHED.w / 2, z1: SHED.z + SHED.w / 2 };
  M.vtt = {
    areas: [
      { n: 'Interior da igreja', b: [-7, 7, -12, 12], lv: 1 },
      { n: 'Igreja + entrada', b: [-13, 13, -14, 21], lv: 1 },
      { n: 'Propriedade inteira', b: [-28, 28, -26, 42], lv: 1 },
      { n: 'Coro (2º andar)', b: [-6.5, 6.5, LOFT_Z - 0.6, 11.6], lv: 2 },
    ],
    walls: [
      [[-dw, OZ], [-OX, OZ], [-OX, -OZ], [OX, -OZ], [OX, OZ], [dw, OZ]],
      [[T.x0, T.z0], [T.x1, T.z0], [T.x1, T.z1], [T.x0, T.z1], [T.x0, T.z0]],
      [[sh.x0, sh.z0], [sh.x1, sh.z0], [sh.x1, sh.z1], [sh.x0, sh.z1 - 1.1]],
    ],
    portals: [{ p: [0, OZ], a: [-dw, OZ], b: [dw, OZ] }],
    lights: [
      [0, -3.6, 9, 0.9, 'ffb067'], [0, 0.8, 9, 0.9, 'ffb067'], [-1.05, -9.3, 4, 0.7, 'ffb067'], [1.05, -9.3, 4, 0.7, 'ffb067'],
      [GAZEBO.x, GAZEBO.z, 5, 0.7, 'ffb067'],
      ...Gr.lightsVtt.filter(l => !(l[0] === GAZEBO.x && l[1] === GAZEBO.z)),
    ],
  };
  // exportação de cima: esconde o que fica acima do térreo (lustres, tesouras, topo da torre etc.)
  M.exportHide = () => {
    const out: THREE.Object3D[] = [], bb = new THREE.Box3();
    [B.walls, G.getObjectByName('interior')!].forEach(root => root.traverse(o => {
      if ((o as THREE.Mesh).isMesh && !isIn(o, I.loft) && bb.setFromObject(o).min.y > FLOOR + 3.2) out.push(o);
    }));
    return out;
  };
  const solids = [...B.solids, ...I.solids, ...Gr.solids];
  M.solid = () => (B.walls.visible ? solids : Gr.solids);
  // luz fria e difusa que entra pelos vitrais: uma luz de área ao longo de cada parede lateral
  RectAreaLightUniformsLib.init();
  const fills = [-1, 1].map(s => {
    const l = new THREE.RectAreaLight(0xaebcd6, 0, NZ * 2 - 3, 3.4);
    l.position.set(s * (NX - 0.25), FLOOR + 3.6, 0); l.lookAt(0, FLOOR + 2.2, 0); B.walls.add(l); return l;
  });
  // sonda de ambiente do interior (reflexos do piso, luz rebatida nas paredes)
  const probe = new EnvProbe(new THREE.Vector3(0, FLOOR + 2.4, -1), new THREE.Box3(new THREE.Vector3(-NX - 0.15, 0, -NZ - 0.15), new THREE.Vector3(NX + 0.15, 13, NZ + 0.15)), 1);
  probe.bind(G, o => !!o.userData.ns || !!o.userData.exterior);
  const tokens = () => Object.values(st.T).map(t => t.g);
  M.onTime = p => { fills.forEach(l => (l.intensity = p.env * 3.2)); probe.update(tokens()); probe.update(tokens()); };
  // velas tremulando de leve
  const flick = M.lights.filter(l => l.n > 0 && l.n < 4);
  M.tick = (_dt, t) => flick.forEach((l, i) => { if (l.l.intensity > 0) l.l.intensity = l.n * (0.9 + 0.1 * Math.sin(t * 13 + i * 7) * Math.sin(t * 7.3 + i)); });
  void K; void PEW;
}

function isIn(o: THREE.Object3D, root: THREE.Object3D) { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p === root) return true; return false; }
