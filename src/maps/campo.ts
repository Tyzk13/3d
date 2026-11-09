// @ts-nocheck — código portado do HTML original.
// Mapa-modelo simples: mostra o mínimo para criar um mapa novo (ver docs/NOVO-MAPA.md).
import * as THREE from 'three';
import type { MapRuntime } from '../core/types';
import { begin, rnd, mat, inst, PL, TX } from '../core/kit';

export function build(M: MapRuntime) {
  begin(M, 11);
  const G = M.G, walk = M.walk;
  const { grass } = TX();
  const fm = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  M.shadowRadius = 55;const g=new THREE.Mesh(new THREE.PlaneGeometry(500,500),mat(0xffffff,{map:grass,bumpMap:grass,bumpScale:2,roughness:1}));g.rotation.x=-Math.PI/2;g.userData.ns=1;g.receiveShadow=true;G.add(g);walk.push(g);
  const gp=[];for(let i=-20;i<=20;i++)gp.push(i,.02,-20,i,.02,20,-20,.02,i,20,.02,i);
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));const gl=new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.12}));gl.userData.ns=1;G.add(gl);
  const tr=[],cr=[],rk=[];for(let i=0;i<60;i++){const a=rnd()*6.283,r=24+rnd()*50,x=Math.cos(a)*r,z=Math.sin(a)*r,h=3+rnd()*3;tr.push({x:x,y:h/2,z:z,sx:1.3,sy:h});cr.push({x:x,y:h+1.2,z:z,sx:2.2,sy:2.4,sz:2.2,c:[0x23402a,0x2a4a30,0x1f3a28][i%3]})}
  for(let i=0;i<24;i++){const a=rnd()*6.283,r=3+rnd()*18;rk.push({x:Math.cos(a)*r,y:.2,z:Math.sin(a)*r,sx:.4+rnd()*.8,sy:.4+rnd()*.5,sz:.4+rnd()*.8,r:rnd()*6,c:0x6f6c66})}
  inst(new THREE.CylinderGeometry(.18,.28,1,8),mat(0x5b3f28),tr);inst(new THREE.IcosahedronGeometry(1,1),mat(0xffffff,{flatShading:true}),cr,1).userData.canopy=1;inst(new THREE.DodecahedronGeometry(1,0),mat(0xffffff,{flatShading:true}),rk,1);
  const fire=new THREE.Mesh(new THREE.SphereGeometry(.25,8,8),fm);fire.position.set(0,.3,-3);fire.userData.ns=1;G.add(fire);PL(0,1.2,-3,1.2,1.8,16);
  G.traverse(o=>{if(o.isMesh&&!o.userData.ns){o.castShadow=o.receiveShadow=true}});
  M.vtt={areas:[{n:'Campo 40×40',b:[-20,20,-20,20],lv:1}],walls:[],portals:[],lights:[[0,-3,6,.9,'ffb067']]};
  G.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial&&o.material.envMapIntensity===1)o.material.envMapIntensity=.45});
  M.layers=[];M.views=[{n:'Geral',p:[0,16,24],t:[0,0,0]},{n:'Tática',p:[0,34,.2],t:[0,0,0]}];
}
