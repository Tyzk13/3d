// @ts-nocheck — código portado do HTML original; será reescrito por partes (ver CHANGELOG).
// Mapa principal: igreja preparada para casamento, com terreno, torre, coro e estacionamento.
import * as THREE from 'three';
import type { MapRuntime } from '../core/types';
import { begin, rnd, mat, box, cyl, inst, PL, LI, TX, cl, sm, glassTex, GM, arch, halo, mistTex } from '../core/kit';

export function build(MPo: MapRuntime) {
begin(MPo, 7);
const G = MPo.G, walk = MPo.walk;
const { wood, stone, tile, grass, cob } = TX();
const lampM = new THREE.MeshBasicMaterial({ color: 0x7a7468 }); MPo.lamps.push(lampM);
const fm = new THREE.MeshBasicMaterial({ color: 0xffb347 });
const doorL = new THREE.PointLight(0xff2a1a, 0, 26, 1); doorL.position.set(0, 2.2, 10); G.add(doorL);
MPo.onTime = p => { doorL.intensity = p.door * LI; doorL.color.set(p.dc || 0xffa050); };
MPo.shadowRadius = 55;
// ---------- terreno ----------
const gg0=new THREE.PlaneGeometry(400,400,80,80),gp0=gg0.attributes.position;
for(let i=0;i<gp0.count;i++){const x=gp0.getX(i),z=-gp0.getY(i),m=Math.min(1,Math.max(0,(Math.hypot(x,z-14)-34)/22));gp0.setZ(i,m*(Math.sin(x*.21)+Math.sin(z*.17)+1.3*Math.sin((x+z)*.11)+2)*.16)}
gg0.computeVertexNormals();
const gnd=new THREE.Mesh(gg0,mat(0xffffff,{map:grass,bumpMap:grass,bumpScale:2,roughness:1}));gnd.rotation.x=-Math.PI/2;gnd.position.y=-.3;gnd.userData.ns=1;gnd.receiveShadow=true;G.add(gnd);walk.push(gnd);
for(let i=0;i<16;i++){const a=i/16*6.283+rnd(),r=110+rnd()*40,s=22+rnd()*20,h=new THREE.Mesh(new THREE.SphereGeometry(1,20,10),mat(0x2c4630));h.scale.set(s*1.6,s*.45,s*1.6);h.position.set(Math.cos(a)*r,-.3,Math.sin(a)*r);h.userData.ns=1;G.add(h)}
function flat(w,d,x,z,y,m){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);p.rotation.x=-Math.PI/2;p.position.set(x,y,z);G.add(p);return p}
flat(3.4,30,0,27,-.27,mat(0xffffff,{map:cl(cob,1,9),roughness:.5}));flat(9,6,0,15,-.26,mat(0xffffff,{map:cl(cob,3,2),roughness:.5}));
// cerca, portão e postes
const FX=26,FZ0=-24,FZ1=40,ir=mat(0x1d1d22,{metalness:.6,roughness:.5}),posts=[];
for(let x=-FX;x<=FX;x+=2)[FZ0,FZ1].forEach(z=>{if(!(z===FZ1&&Math.abs(x)<3))posts.push({x:x,y:.6,z:z})});
for(let z=FZ0+2;z<FZ1;z+=2)[-FX,FX].forEach(x=>posts.push({x:x,y:.6,z:z}));
inst(new THREE.BoxGeometry(.1,1.8,.1),ir,posts);inst(new THREE.ConeGeometry(.08,.3,4),ir,posts.map(p=>({x:p.x,y:1.65,z:p.z})));
[.3,1.3].forEach(y=>{box(2*FX,.07,.07,0,y,FZ0,ir);box(.07,.07,FZ1-FZ0,-FX,y,(FZ0+FZ1)/2,ir);box(.07,.07,FZ1-FZ0,FX,y,(FZ0+FZ1)/2,ir);box(FX-2.5,.07,.07,-(FX+2.5)/2,y,FZ1,ir);box(FX-2.5,.07,.07,(FX+2.5)/2,y,FZ1,ir)});
[-2.6,2.6].forEach(x=>{box(.8,2.4,.8,x,.9,FZ1,sm(1,2.4));box(1,.2,1,x,2.2,FZ1,0x7e7e7b)});
for(let z=15;z<=39;z+=8)[-2.6,2.6].forEach(x=>{cyl(.06,.08,2.8,x,1.1,z,ir);const b=new THREE.Mesh(new THREE.SphereGeometry(.22,10,10),lampM);b.position.set(x,2.6,z);b.userData.ns=1;G.add(b)});
[15,23,31,39].forEach(z=>[-2.6,2.6].forEach(x=>halo(x,2.6,z,3)));PL(-2.6,2.6,15,0,1.5,16);PL(2.6,2.6,15,0,1.5,16);PL(-2.6,2.6,31,0,1.5,16);PL(2.6,2.6,31,0,1.5,16);
// árvores, arbustos, cemitério
const tr=[],cr=[],pn=[],bs=[],tb=[],bad=(x,z)=>(x>9&&z>22&&z<42)||(x<-9&&x>-24&&z>26&&z<38)||(x>14&&x<24&&z>4&&z<12);
for(let i=0;i<70;i++){const x=(rnd()-.5)*120,z=(rnd()-.5)*120+8;if((Math.abs(x)<11&&z>-17&&z<46)||(x<-8&&x>-24&&z>-3&&z<19)||(Math.abs(x)<4&&z>10)||bad(x,z))continue;
 const h=2+rnd()*1.6,gr=[0x2f4f2e,0x3a5a35,0x2a4a2c,0x44603a][rnd()*4|0],big=1.5+rnd()*1.3;tr.push({x:x,y:-.3+h/2,z:z,sx:1+rnd()*.5,sy:h});
 if(rnd()<.65)cr.push({x:x,y:-.3+h+big*.7,z:z,sx:big*1.3,sy:big*1.1,sz:big*1.3,c:gr,r:rnd()*6});else pn.push({x:x,y:-.3+h+big*1.6,z:z,sx:big*1.1,sy:big*3.4,sz:big*1.1,c:0x233f2c})}
for(let i=0;i<22;i++){const sg=i%2?1:-1,x=sg*(14+rnd()*9),z=-16+rnd()*56,h=7+rnd()*2.5,big=3.6+rnd()*1.3;if(bad(x,z))continue;tr.push({x:x,y:-.3+h/2,z:z,sx:2.6,sy:h});cr.push({x:x,y:-.3+h+big*.6,z:z,sx:big*1.3,sy:big*1.05,sz:big*1.3,c:[0x23402a,0x2a4a30,0x1f3a28][rnd()*3|0],r:rnd()*6})}
const tm=mat(0x5b3f28);inst(new THREE.CylinderGeometry(.18,.28,1,8),tm,tr);
inst(new THREE.IcosahedronGeometry(1,1),mat(0xffffff,{flatShading:true}),cr,1).userData.canopy=1;inst(new THREE.ConeGeometry(1,1,8),mat(0xffffff,{flatShading:true}),pn,1).userData.canopy=1;
for(let z=-10;z<=10;z+=2)[-1,1].forEach(s=>{if(!(s<0&&z>7))bs.push({x:s*7.3,y:.05,z:z+rnd()*.5,sx:.8+rnd()*.4,sy:.7,c:[0x2f4f2e,0x2a4a2c,0x3a5a35][rnd()*3|0]})});
for(let x=-6;x<=6;x+=2)bs.push({x:x,y:.05,z:-12.5,sx:.9+rnd()*.3,sy:.7,c:0x2f4f2e});
inst(new THREE.IcosahedronGeometry(1,1),mat(0xffffff,{flatShading:true}),bs,1);
for(let r=0;r<4;r++)for(let c=0;c<5;c++)tb.push({x:-21+c*2.6,y:.2,z:1+r*4.5,r:(rnd()-.5)*.3,c:0x8a8a86});
inst(new THREE.BoxGeometry(.7,1,.18),mat(0xffffff),tb,1);

// ---------- fundação, piso, grade ----------
const plinth=box(13.4,.3,23.4,0,-.15,0,sm(13,23));walk.push(plinth);
const fl=flat(12,22,0,0,.01,mat(0xffffff,{map:wood,bumpMap:wood,bumpScale:1.5,roughness:.4}));walk.push(fl);
function step(w,top,d,x,z){const b=box(w,top+.3,d,x,(top-.3)/2,z,sm(w,1));walk.push(b)}
step(6.4,-.08,.6,0,12);step(6.4,-.16,.6,0,12.6);step(6.4,-.24,.6,0,13.2);
flat(2.3,19,0,1.5,.04,mat(0x8e866f));flat(2,19,0,1.5,.07,mat(0xe4dfd2));
const gp=[];for(let x=-6;x<=6;x++)gp.push(x,.1,-11,x,.1,11);for(let z=-11;z<=11;z++)gp.push(-6,.1,z,6,.1,z);
const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));
const grid=new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.1}));grid.userData.ns=1;G.add(grid);

// ---------- altar ----------
const pf=box(12,.4,4,0,.2,-9,0x8a8a86);walk.push(pf);const s2=box(8,.2,1,0,.1,-6.5,0x8a8a86);walk.push(s2);
box(3,1,1,0,.9,-10,0xe8e0d0);box(3.2,.06,1.2,0,1.42,-10,0xd9a93a);box(2.4,.8,.04,0,1.0,-9.5,0x3d1a20);
const gold=mat(0xd9a93a,{metalness:.6,roughness:.4});
box(.22,1.9,.22,0,2.6,-10.88,gold);box(1.1,.22,.22,0,3.1,-10.88,gold);
[-1,1].forEach(s=>{box(1.6,5,.05,s*3.6,2.9,-10.95,0x3d1a20);cyl(.08,.1,.8,s*2.2,.8,-9.4,0xcfc7b4);cyl(.05,.05,.3,s*2.2,1.35,-9.4,0xf5ecd0);const f=new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),fm);f.position.set(s*2.2,1.6,-9.4);G.add(f);PL(s*2.2,1.8,-9.2,.5,1.6,12)});
box(1.2,1.5,1.2,-4.6,1.15,-8,0x7a5a3a);box(1.5,.15,1.5,-4.6,1.95,-8,0x6b4a2e);

// ---------- decoração do casamento ----------
const fw=[],lf=[],FL=[0xf4f1ea,0xe9dfe0,0xd8d6cc];
for(let i=0;i<7;i++)[-1,1].forEach(s=>{const z=-6+i*1.5;for(let k=0;k<6;k++)fw.push({x:s*1.28+(rnd()-.5)*.3,y:1.32+rnd()*.3,z:z+.05+(rnd()-.5)*.3,sx:.07+rnd()*.05,c:FL[rnd()*3|0]});lf.push({x:s*1.28,y:1.25,z:z+.05,sx:.24,sy:.14,sz:.24,c:0x2f4f2e})});
const arc=new THREE.Mesh(new THREE.TorusGeometry(2.3,.09,8,40,Math.PI),mat(0xcfc9bc));arc.position.set(0,.4,-7.6);G.add(arc);
for(let k=0;k<=34;k++){const a=k/34*Math.PI,x=Math.cos(a)*2.3,y=.4+Math.sin(a)*2.3;lf.push({x:x,y:y,z:-7.6,sx:.2,sy:.16,sz:.2,c:0x2f4f2e});for(let j=0;j<2;j++)fw.push({x:x+(rnd()-.5)*.2,y:y+(rnd()-.5)*.2,z:-7.6+(rnd()-.5)*.25,sx:.09+rnd()*.06,c:FL[rnd()*3|0]})}
[-1,1].forEach(s=>{cyl(.25,.3,1.1,s*3.2,.95,-8.2,0xe0dbd0);for(let k=0;k<10;k++)fw.push({x:s*3.2+(rnd()-.5)*.6,y:1.65+rnd()*.35,z:-8.2+(rnd()-.5)*.6,sx:.1+rnd()*.06,c:FL[rnd()*3|0]});lf.push({x:s*3.2,y:1.6,z:-8.2,sx:.38,sy:.2,sz:.38,c:0x2f4f2e})});
const fmat=mat(0xffffff,{roughness:.8});inst(new THREE.IcosahedronGeometry(1,0),fmat,lf,1);inst(new THREE.IcosahedronGeometry(1,0),fmat,fw,1);
const pt=[];for(let i=0;i<46;i++)pt.push({x:(rnd()-.5)*1.7,y:.09,z:-6.5+rnd()*15,sx:1,r:rnd()*6,c:0xf4f1ea});
inst(new THREE.CircleGeometry(.07,6).rotateX(-Math.PI/2),mat(0xffffff),pt,1);

// ---------- bancos (encosto atrás, virados para o altar) ----------
const pewM=(()=>{const t=cl(wood,.6,.6);return mat(0xd2ab82,{map:t,bumpMap:t,bumpScale:1.2,roughness:.42})})(),kneelM=mat(0x4a1a22,{roughness:.9}),pew=new THREE.Group();
box(3.2,.12,.6,0,.5,0,pewM,pew);for(let k=0;k<3;k++){const b=box(3.2,.2,.04,0,.82+k*.24,.3,pewM,pew);b.rotation.x=-.12}
box(3.2,.12,.12,0,1.5,.32,pewM,pew);[-1,1].forEach(s=>{box(.08,1.1,.08,s*1.5,.95,.3,pewM,pew);box(.1,1.1,.8,s*1.65,.55,.05,pewM,pew);const c=cyl(.4,.4,.1,s*1.65,1.1,.05,pewM,pew,16);c.rotation.z=Math.PI/2});
box(3,.14,.28,0,.14,-.55,pewM,pew);box(2.9,.05,.24,0,.23,-.55,kneelM,pew);
const PG=new THREE.Group();G.add(PG);
for(let i=0;i<7;i++)[-1,1].forEach(s=>{const p=pew.clone();p.position.set(s*2.95,0,-6+i*1.5);PG.add(p)});

// ---------- paredes, vitrais, pilares ----------
const GT=[glassTex(),glassTex(),glassTex()];
const W=new THREE.Group();G.add(W);
[-1,1].forEach(s=>{box(.3,6,22,s*6.15,3,0,sm(22,6),W);for(let z=-6;z<=10;z+=4){cyl(.3,.35,5.6,s*5.7,2.8,z,0xa9a9a5,W);box(.8,.3,.8,s*5.7,5.75,z,0xa9a9a5,W);box(.8,.3,.8,s*5.7,.15,z,0xa9a9a5,W)}
 [-8,-4,0,4,8].forEach((z,i)=>[[5.97,5.975],[6.33,6.325]].forEach(p=>{const g=new THREE.Mesh(arch(.6,3.6),GM(GT[(i+(s>0))%3]));g.position.set(s*p[0],1.5,z);g.rotation.y=Math.PI/2;W.add(g);const f=new THREE.Mesh(arch(.74,3.8),new THREE.MeshStandardMaterial({color:0x626260,side:THREE.DoubleSide}));f.position.set(s*p[1],1.44,z);f.rotation.y=Math.PI/2;W.add(f)}));
 [-8,-4,0,4,8].forEach(z=>{box(.6,4.6,.5,s*6.6,2.3,z,sm(1,4.6),W);box(.75,.2,.65,s*6.6,4.7,z,0x8f8f8c,W)})});
box(12.6,6,.3,0,3,-11.15,sm(12.6,6),W);box(4.8,6,.3,-3.9,3,11.15,sm(4.8,6),W);box(4.8,6,.3,3.9,3,11.15,sm(4.8,6),W);box(3,2,.3,0,5,11.15,sm(3,2),W);
const gmat=mat(0xffffff,{map:cl(stone,.25,.25),side:THREE.DoubleSide}),gs=new THREE.Shape([new THREE.Vector2(-6.3,6),new THREE.Vector2(6.3,6),new THREE.Vector2(0,10.1)]);
[-11.3,11].forEach(z=>{const m=new THREE.Mesh(new THREE.ExtrudeGeometry(gs,{depth:.3,bevelEnabled:false}),gmat);m.position.z=z;W.add(m)});
const rose=new THREE.Mesh(new THREE.CircleGeometry(1.1,32),GM(glassTex(1)));rose.position.set(0,4.9,-10.98);W.add(rose);
const rr=new THREE.Mesh(new THREE.RingGeometry(1.1,1.3,32),mat(0x8f8f8c));rr.position.set(0,4.9,-10.97);W.add(rr);
[10.98,11.32].forEach(zz=>{const bk=zz>11?-.005:.005;[-1,1].forEach(s=>{const g=new THREE.Mesh(arch(.6,3.6),GM(GT[1+(s>0)]));g.position.set(s*3.9,1.5,zz);W.add(g);const f=new THREE.Mesh(arch(.74,3.8),new THREE.MeshStandardMaterial({color:0x626260,side:THREE.DoubleSide}));f.position.set(s*3.9,1.44,zz+bk);W.add(f)});
 const fr=new THREE.Mesh(new THREE.CircleGeometry(.9,32),GM(glassTex(1)));fr.position.set(0,5,zz);W.add(fr);const rg=new THREE.Mesh(new THREE.RingGeometry(.9,1.08,32),mat(0x8f8f8c));rg.position.set(0,5,zz+bk);W.add(rg)});
[[-6.3,-11.15],[6.3,-11.15],[-6.3,11.15],[6.3,11.15]].forEach(a=>{const c=new THREE.Mesh(new THREE.ConeGeometry(.35,1.8,6),mat(0x6a6a68));c.position.set(a[0],6.9,a[1]);W.add(c)});
[-11.15,11.15].forEach(z=>{box(.14,1.4,.14,0,10.9,z,0x2a2a2c,W);box(.7,.14,.14,0,11.2,z,0x2a2a2c,W)});
[-1,1].forEach(s=>{const d=new THREE.Group();d.position.set(s*1.5,0,11.2);d.rotation.y=s*.7;box(1.5,3.8,.12,-s*.75,1.9,0,0x3d2a1c,d);box(.12,3.6,.16,-s*.75,1.9,0,0x241810,d);box(1.4,.12,.16,-s*.75,2.6,0,0x241810,d);W.add(d);box(.25,4,.3,s*1.65,2,11.3,0x3d2a1c,W)});
PL(-1.9,3.2,12.3,0,1.4,12);PL(1.9,3.2,12.3,0,1.4,12);
// lustres
[-3,1.5].forEach(z=>{const g=new THREE.Group();g.position.set(0,4.6,z);W.add(g);cyl(.03,.03,1.5,0,.75,0,0x333333,g,6);const r=new THREE.Mesh(new THREE.TorusGeometry(.7,.05,8,24),gold);r.rotation.x=Math.PI/2;g.add(r);
 for(let k=0;k<6;k++){const a=k*Math.PI/3;cyl(.06,.06,.3,Math.cos(a)*.7,.17,Math.sin(a)*.7,0xf5ecd0,g,8);const f=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),fm);f.position.set(Math.cos(a)*.7,.38,Math.sin(a)*.7);g.add(f)}PL(0,4.9,z,.45,1.6,13)});
[-9,-5,-1,3,7].forEach(z=>box(12.4,.22,.3,0,6.1,z,0x4a2f1c,W));

// ---------- telhado ----------
const RF=new THREE.Group();G.add(RF);const ang=Math.atan(4.3/6.8),tm2=(()=>{const t=cl(tile,2.5,7.25);return mat(0xffffff,{map:t,bumpMap:t,bumpScale:3,roughness:.7})})();
[-1,1].forEach(s=>{const m=box(8.04,.25,23.2,s*3.4,7.95,0,tm2,RF);m.rotation.z=-s*ang});
box(.5,.25,23.4,0,10.22,0,mat(0x5a2a22),RF);[-9,-5,-1,3,7].forEach(z=>box(.2,3.8,.2,0,8,z,0x4a2f1c,RF));

// ---------- torre sineira ----------
const T0=new THREE.Group();G.add(T0);
box(4,12,4,-8.3,6,11.2,sm(4,12),T0);box(4.6,.4,4.6,-8.3,12.2,11.2,0x8f8f8c,T0);
[[ -8.3,13.22,1,.1],[-8.3,9.18,1,.1],[-10.32,11.2,.1,1],[-6.28,11.2,.1,1]].forEach(a=>box(a[2]===1?1:.1,2.4,a[3]===1?1:.1,a[0]===-10.32||a[0]===-6.28?a[0]:a[0],10.2,a[0]===-10.32||a[0]===-6.28?a[1]:a[1],0x15110e,T0));
const clk=new THREE.Mesh(new THREE.CircleGeometry(.8,24),new THREE.MeshBasicMaterial({color:0xf4efe0}));clk.position.set(-8.3,7.5,13.22);T0.add(clk);box(.06,.5,.02,-8.3,7.7,13.24,0x222222,T0);box(.4,.06,.02,-8.15,7.5,13.24,0x222222,T0);
const sp=new THREE.Mesh(new THREE.ConeGeometry(3.1,6.5,4),mat(0x3a3f4a));sp.rotation.y=Math.PI/4;sp.position.set(-8.3,15.65,11.2);T0.add(sp);
box(.2,2.2,.2,-8.3,19.7,11.2,0x1e1e20,T0);box(1.1,.2,.2,-8.3,20.2,11.2,0x1e1e20,T0);

// ---------- véus, estátua, flores, hera e poças ----------
const lace=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(235,228,230,.6)';g.fillRect(0,0,128,128);g.globalCompositeOperation='destination-out';for(let y=0;y<4;y++)for(let x=0;x<5;x++){g.beginPath();g.arc(x*32+(y%2)*16,y*32+16,9,0,7);g.fill()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t})();
const veilM=new THREE.MeshStandardMaterial({map:lace,transparent:true,side:THREE.DoubleSide,roughness:1,depthWrite:false,emissive:0x221418});
function veil(p0,p1,sag,wid,ru,rv,out){const g=new THREE.PlaneGeometry(1,1,28,6),p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const u=p.getX(i)+.5,v=.5-p.getY(i),w=wid*(.65+.35*Math.abs(Math.sin(u*Math.PI*4)));
  p.setXYZ(i,p0[0]+(p1[0]-p0[0])*u,p0[1]+(p1[1]-p0[1])*u-sag*4*u*(1-u)-v*w,p0[2]+(p1[2]-p0[2])*u+out*v*.3);uv.setXY(i,u*ru,v*rv)}
 g.computeVertexNormals();const m=new THREE.Mesh(g,veilM);m.userData.ns=1;return m}
const ST=new THREE.Group();ST.position.set(-9,-.3,19);ST.rotation.y=Math.PI/2;G.add(ST);const sto=mat(0x8d8a86,{roughness:.8});
box(1.3,1.5,1.3,0,.75,0,sto,ST);cyl(.35,.65,2.4,0,2.7,0,sto,ST);const hd=new THREE.Mesh(new THREE.SphereGeometry(.3,12,10),sto);hd.position.y=4.1;ST.add(hd);
[-1,1].forEach(s=>{const w=box(.1,2.2,.9,s*.5,3.6,-.35,sto,ST);w.rotation.z=s*.35});ST.add(veil([-.55,4.25,.3],[.55,4.25,.3],0,2.4,1,2,1));
const gf=[];for(let i=0;i<260;i++){const x=(rnd()-.5)*50,z=-18+rnd()*54;if((Math.abs(x)<9&&z<13)||(Math.abs(x)<4.8&&z>11&&z<19)||(Math.abs(x)<1.9&&z>11))continue;gf.push({x:x,y:-.26,z:z,sx:.5+rnd()*.7,r:rnd()*6,c:[0xf4f1ea,0xe9dfe0,0xd8d6cc][rnd()*3|0]})}
inst(new THREE.CircleGeometry(.14,5).rotateX(-Math.PI/2),mat(0xffffff),gf,1);
const iv=[];for(let i=0;i<150;i++){const k=rnd(),y=.3+rnd()*4.5;if(k<.4)iv.push({x:(rnd()<.5?-1:1)*6.33,y:y,z:-10.5+rnd()*21,sx:.1,sy:.5+rnd()*.5,sz:.5+rnd()*.5,c:0x1c2a1c});else if(k<.7){const x=(rnd()-.5)*12.4;if(Math.abs(x)>1.8)iv.push({x:x,y:y,z:11.33,sx:.5+rnd()*.5,sy:.5+rnd()*.5,sz:.1,c:0x1c2a1c})}else iv.push({x:-8.3+(rnd()-.5)*3.6,y:.3+rnd()*10,z:13.23,sx:.4+rnd()*.5,sy:.6+rnd()*.6,sz:.1,c:0x1c2a1c})}
inst(new THREE.IcosahedronGeometry(1,0),mat(0xffffff),iv,1);
const puddleM=MPo.puddle=new THREE.MeshBasicMaterial({map:(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(8,2,4,.85)';g.fillRect(0,0,128,128);for(let i=0;i<7;i++){const x=36+rnd()*56,gr=g.createLinearGradient(x,0,x+10,128);gr.addColorStop(0,'rgba(255,170,80,.9)');gr.addColorStop(1,'rgba(255,170,80,0)');g.fillStyle=gr;g.fillRect(x,0,5+rnd()*8,128)}
 g.globalCompositeOperation='destination-in';const m=g.createRadialGradient(64,64,10,64,64,64);m.addColorStop(0,'#fff');m.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=m;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})(),transparent:true,depthWrite:false});
[[4,4,-5.5,17],[3,3,5.5,21],[4,3,-6,27]].forEach(a=>{flat(a[0],a[1],a[2],a[3],-.23,puddleM).userData.ns=1});
// ---------- cerimônia: caminho, arco, lanternas, urnas, névoa ----------
const runM=mat(0xefece4,{roughness:.9});
flat(1.6,28,0,27.5,-.24,runM);[[12,-.08],[12.6,-.16],[13.2,-.24]].forEach(a=>flat(1.6,.6,0,a[0],a[1]+.005,runM));
const pt2=[];for(let i=0;i<70;i++)pt2.push({x:(rnd()-.5)*1.5,y:-.23,z:13.8+rnd()*26,sx:1,r:rnd()*6,c:0xf4f1ea});
inst(new THREE.CircleGeometry(.07,6).rotateX(-Math.PI/2),mat(0xffffff),pt2,1);
const hk=[],fw2=[],lf2=[],lan=[];
for(let z=15;z<=39;z+=3)[-1,1].forEach(s=>{const x=s*1.35;hk.push({x:x,y:.65,z:z,sx:1,sy:1.9});lan.push({x:x,y:1.75,z:z,sx:1});for(let k=0;k<5;k++)fw2.push({x:x+(rnd()-.5)*.5,y:-.1+rnd()*.25,z:z+(rnd()-.5)*.5,sx:.1+rnd()*.07,c:FL[rnd()*3|0]});lf2.push({x:x,y:-.15,z:z,sx:.3,sy:.15,sz:.3,c:0x2f4f2e})});
inst(new THREE.CylinderGeometry(.02,.02,1,6),mat(0x1d1d22),hk);
const lnM=new THREE.MeshBasicMaterial({color:0xffffff});lnM.color.setRGB(2.2,1.5,.7);lan.push({x:-1.9,y:3.2,z:11.5,sx:1},{x:1.9,y:3.2,z:11.5,sx:1},{x:-2,y:3.6,z:14.9,sx:1},{x:2,y:3.6,z:14.9,sx:1});inst(new THREE.CylinderGeometry(.1,.1,.3,8),lnM,lan);lan.forEach(a=>halo(a.x,a.y,a.z,2.4));
const ac=new THREE.Mesh(new THREE.TorusGeometry(2.1,.08,8,32,Math.PI),mat(0xcfc9bc));ac.position.set(0,-.3,22);G.add(ac);
for(let k=0;k<=30;k++){const a=k/30*Math.PI,x=Math.cos(a)*2.1,y=-.3+Math.sin(a)*2.1;lf2.push({x:x,y:y,z:22,sx:.2,sy:.16,sz:.2,c:0x2f4f2e});for(let j=0;j<2;j++)fw2.push({x:x+(rnd()-.5)*.2,y:y+(rnd()-.5)*.2,z:22+(rnd()-.5)*.25,sx:.09+rnd()*.06,c:FL[rnd()*3|0]})}
G.add(veil([-2.1,1.7,22],[2.1,1.7,22],.6,1.5,3,1,0));
[-1,1].forEach(s=>{cyl(.38,.26,.9,s*2.9,.2,14.4,0xd8d3c6);for(let k=0;k<16;k++)fw2.push({x:s*2.9+(rnd()-.5)*.7,y:.75+rnd()*.45,z:14.4+(rnd()-.5)*.7,sx:.1+rnd()*.06,c:FL[rnd()*3|0]});lf2.push({x:s*2.9,y:.75,z:14.4,sx:.45,sy:.25,sz:.45,c:0x2f4f2e})});
inst(new THREE.IcosahedronGeometry(1,0),fmat,fw2,1);inst(new THREE.IcosahedronGeometry(1,0),fmat,lf2,1);
const fg=[];for(let i=0;i<26;i++){const t=i/25;[1,-1].forEach(a=>fg.push({x:a*(5.5+t*13+Math.sin(i)*.3),y:-.27,z:15.5+t*9+Math.cos(i*1.7)*.3,sx:.8+rnd()*.3,sy:1,sz:.6+rnd()*.3,r:rnd()*3,c:0x6f6c66}))}
inst(new THREE.BoxGeometry(1,.06,1),mat(0xffffff),fg,1);
// ---------- propriedade: estacionamento, carros, bancos, caramanchão, galpão, pórtico, mato ----------
const CG=new THREE.Group();G.add(CG);const aoI=[];
function roofG(x,y,z,w,d,rise,m,g){const hs=w/2,len=Math.hypot(hs,rise)+.3,an=Math.atan2(rise,hs);[-1,1].forEach(q=>{const r=box(len,.15,d,x+q*hs/2,y+rise/2,z,m,g);r.rotation.z=-q*an})}
flat(16,18,18,32,-.28,mat(0xffffff,{map:cl(cob,6,6),color:0x8a867c,roughness:1}));
function car(x,z,ry,c,wed){aoI.push({x:x,y:-.285,z:z,sx:5.8,sz:2.8,r:ry});const g=new THREE.Group(),m=mat(c,{roughness:.3,metalness:.55,envMapIntensity:1.5}),gl=mat(0x10161c,{roughness:.1,metalness:.6});
 box(4.4,.7,1.8,0,.7,0,m,g);box(2.3,.65,1.6,-.2,1.35,0,gl,g);box(2.35,.1,1.65,-.2,1.7,0,m,g);
 [[-1.4,.9],[1.4,.9],[-1.4,-.9],[1.4,-.9]].forEach(w=>{const t=cyl(.38,.38,.3,w[0],.38,w[1],0x111111,g,14);t.rotation.x=Math.PI/2});
 box(.12,.2,.4,2.2,.75,.55,0xffe9b0,g);box(.12,.2,.4,2.2,.75,-.55,0xffe9b0,g);
 if(wed){box(1.6,.03,.14,1.2,1.07,0,0xf4f1ea,g);for(let k=0;k<9;k++){const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.12,0),fmat);f.position.set(1.9-k%3*.2,1.14+rnd()*.1,(Math.floor(k/3)-1)*.28);g.add(f)}}
 g.position.set(x,-.3,z);g.rotation.y=ry;CG.add(g)}
car(13.5,28.5,Math.PI/2,0xd9d6cc,true);car(17.5,28.5,Math.PI/2,0x1f2a24);car(21.5,28.5,Math.PI/2,0x14161a);car(15.5,35.5,Math.PI/2,0x4a2226);car(20,35.5,Math.PI/2,0x3b4048);
const bwd=mat(0x4a3524,{roughness:.8});
function bench(x,z,ry){aoI.push({x:x,y:-.285,z:z,sx:2.4,sz:1.3,r:ry});const g=new THREE.Group();box(1.8,.07,.5,0,.5,0,bwd,g);box(1.8,.45,.06,0,.86,-.22,bwd,g);[-.8,.8].forEach(a=>box(.07,.5,.45,a,.25,0,bwd,g));box(.12,.12,.06,.5,.98,-.2,0xf4f1ea,g);g.position.set(x,-.3,z);g.rotation.y=ry;CG.add(g)}
[20,26,32,37].forEach(z=>{bench(-3.3,z,Math.PI/2);bench(3.3,z,-Math.PI/2)});bench(-14.5,17.5,0);
const gz=new THREE.Group();gz.position.set(-16,-.3,32);CG.add(gz);cyl(3.3,3.3,.25,0,.125,0,0x6b5a48,gz,8);
for(let k=0;k<8;k++){const a=k/8*6.283+.39,x=Math.cos(a)*3,z=Math.sin(a)*3,a2=(k+1)/8*6.283+.39;cyl(.1,.1,3.2,x,1.85,z,0x5a4430,gz,8);const L=new THREE.Mesh(new THREE.SphereGeometry(.08,6,6),lnM);L.position.set(x,3.3,z);gz.add(L);gz.add(veil([x,3.1,z],[Math.cos(a2)*3,3.1,Math.sin(a2)*3],.35,.9,1,1,0))}
const rf=new THREE.Mesh(new THREE.ConeGeometry(3.9,1.7,8),mat(0x2f2a28));rf.position.y=4.2;gz.add(rf);cyl(.7,.7,.9,0,.7,0,0xf4f1ea,gz,14);
for(let k=0;k<7;k++){const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.13,0),fmat);f.position.set((rnd()-.5)*.5,1.25+rnd()*.15,(rnd()-.5)*.5);gz.add(f)}
halo(-16,3.3,32,5);PL(-16,2.8,32,.5,1.1,10);
box(4,2.4,3,19,.9,8,sm(4,2.4),CG);roofG(19,2.1,8,4.8,3.6,1.1,mat(0x3d2b20),G);box(1,1.8,.08,19,.6,9.55,0x2a1d14,CG);
const wl=new THREE.Mesh(new THREE.PlaneGeometry(.7,.6),lnM);wl.position.set(16.99,1.1,8);wl.rotation.y=-Math.PI/2;G.add(wl);halo(16.8,1.1,8,3.4);
const dtM=mat(0x2b2420);
function dead(x,z,k){const g=new THREE.Group();cyl(.18*k,.38*k,5*k,0,2.5*k,0,dtM,g,7);for(let i=0;i<6;i++){const b=cyl(.04*k,.12*k,2.4*k,0,0,0,dtM,g,5),a=i*1.05;b.rotation.order='YZX';b.rotation.y=a;b.rotation.z=1;b.position.set(Math.cos(a)*.5*k,(2.8+i*.4)*k,Math.sin(a)*.5*k)}g.position.set(x,-.3,z);G.add(g)}
dead(-30,5,1.1);dead(30,10,1);dead(-19,-27,1);dead(21,-27,1.2);dead(-30,30,1);dead(31,34,1.1);dead(-8,-30,1);
const tf=[];for(let i=0;i<900;i++){const x=(rnd()-.5)*52,z=-23+rnd()*61;if(bad(x,z)||(Math.abs(x)<8.5&&z>-13&&z<19)||(Math.abs(x)<2.4&&z>11))continue;tf.push({x:x,y:-.05,z:z,sx:.8+rnd()*.8,sy:.6+rnd()*1.2,r:rnd()*6,c:[0x364f2c,0x2f4a2a,0x445c33][rnd()*3|0]})}
inst(new THREE.ConeGeometry(.12,.8,4),mat(0xffffff),tf,1);
const fb=[];for(let z=-23;z<=39;z+=2.2)[-24.6,24.6].forEach(x=>fb.push({x:x,y:.1,z:z,sx:1+rnd()*.5,sy:.9,c:[0x2f4f2e,0x2a4a2c,0x3a5a35][rnd()*3|0]}));for(let x=-24;x<=24;x+=2.2)fb.push({x:x,y:.1,z:-23,sx:1+rnd()*.5,sy:.9,c:0x2a4a2c});
inst(new THREE.IcosahedronGeometry(1,1),mat(0xffffff,{flatShading:true}),fb,1);
const bu=[];for(let sd3=-1;sd3<=1;sd3+=2)for(let z=15;z<39;z+=8)for(let k=1;k<8;k++){const u=k/8;bu.push({x:sd3*2.6,y:2.6-Math.sin(u*Math.PI)*.35,z:z+u*8,sx:.07})}
inst(new THREE.SphereGeometry(1,6,6),lnM,bu);
const wdM=mat(0xffffff,{map:cl(wood,.5,.5),color:0x6b5038,roughness:.7});
[-1,1].forEach(q=>{box(.3,4.5,.3,q*3.8,1.99,15,wdM,W);box(.25,.25,3.7,q*3.8,4.25,13.15,wdM,W)});box(8,.25,.3,0,4.25,15,wdM,W);roofG(0,4.4,13.2,8.6,4.4,1.3,tm2,W);
const stM=mat(0xa9a9a5,{roughness:.8}),da=new THREE.Mesh(new THREE.TorusGeometry(1.75,.16,8,24,Math.PI),stM);da.position.set(0,4,11.42);W.add(da);
[-1,1].forEach(q=>{box(.1,1.2,22,q*5.93,.6,0,wdM,W);box(.35,.22,22,q*5.85,5.9,0,stM,W)});box(12,1.2,.1,0,.6,-10.93,wdM,W);box(12,.22,.35,0,5.9,-10.85,stM,W);
const aoT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,24,64,64,64);r.addColorStop(0,'rgba(0,0,0,.62)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();
const aoM=new THREE.MeshBasicMaterial({map:aoT,transparent:true,depthWrite:false});flat(20,32,0,0,-.285,aoM).userData.ns=1;
cr.forEach(c=>aoI.push({x:c.x,y:-.285,z:c.z,sx:c.sx*2.3,sz:c.sx*2.3}));pn.forEach(c=>aoI.push({x:c.x,y:-.285,z:c.z,sx:c.sx*2.2,sz:c.sx*2.2}));
aoI.push({x:-16,y:-.285,z:32,sx:8,sz:8},{x:19,y:-.285,z:8,sx:6.5,sz:5.5},{x:-9,y:-.285,z:19,sx:3.2,sz:3.2});
const aoG=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),aoMat=new THREE.MeshBasicMaterial({map:aoT,transparent:true,depthWrite:false,opacity:.85});
inst(aoG,aoMat,aoI).userData.ns=1;
const aoN=[];for(let i=0;i<7;i++)[-1,1].forEach(q=>aoN.push({x:q*2.95,y:.03,z:-6+i*1.5-.1,sx:4,sz:1.7}));
[-1,1].forEach(q=>{aoN.push({x:q*5.35,y:.03,z:0,sx:1.7,sz:22});for(let z=-6;z<=10;z+=4)aoN.push({x:q*5.7,y:.03,z:z,sx:1.9,sz:1.9})});aoN.push({x:0,y:.03,z:-10.4,sx:12,sz:1.7},{x:0,y:.03,z:10.4,sx:12,sz:1.7});
inst(aoG,aoMat,aoN).userData.ns=1;
const mistT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();
const MS=MPo.mist;for(let i=0;i<46;i++){let x=(rnd()-.5)*100;const z=-22+rnd()*78;if(Math.abs(x)<9&&z>-14&&z<14)x+=x<0?-16:16;const m=new THREE.Sprite(new THREE.SpriteMaterial({map:mistT,transparent:true,depthWrite:false,opacity:.2,color:0xaeb8c8,fog:false}));const sc=14+rnd()*16;m.scale.set(sc,sc*.35,1);m.position.set(x,.8+rnd()*2.2,z);m.userData.v=.15+rnd()*.25;G.add(m);MS.push(m)}

// ---------- 2º andar (coro), escada e órgão ----------
const LF=new THREE.Group();G.add(LF);
const lfl=box(12,.3,6.5,0,3.25,7.75,0x7a5a3a,LF);lfl.userData.l=LF;walk.push(lfl);
box(12,.35,.35,0,2.95,4.65,0x4a2f1c,LF);[-3,3].forEach(x=>{box(.35,.35,6.5,x,2.95,7.75,0x4a2f1c,LF);cyl(.22,.25,3,x,1.5,4.65,0xa9a9a5,LF)});
box(12,.1,.1,0,4.4,4.55,0x4a2f1c,LF);for(let x=-5.75;x<=5.8;x+=.5)box(.07,.9,.07,x,3.85,4.55,0x4a2f1c,LF);
const SH=3.4/12;for(let i=0;i<12;i++){const top=(i+1)*SH,b=box(.9,top,.54,-5,top/2,-2+(i+.5)*.54,0x8a6a48,LF);b.userData.l=LF;walk.push(b)}
box(6,1,.9,0,3.9,10.5,0x4a2f1c,LF);for(let i=0;i<11;i++){const h=1.4+Math.abs(Math.sin(i*.8))*1.3;cyl(.17,.17,h,-2.5+i*.5,4.4+h/2,10.45,mat(0xc9b27a,{metalness:.5,roughness:.4}),LF,10)}
box(2,.4,.7,0,3.8,9.3,0x5a3d25,LF);


G.traverse(o=>{if(o.isMesh&&!o.userData.ns){o.castShadow=o.receiveShadow=true}});
G.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial&&o.material.envMapIntensity===1)o.material.envMapIntensity=.45});
MPo.loft=LF;MPo.layers=[{n:'Paredes',o:W,v:true},{n:'Telhado',o:RF,v:true},{n:'2º andar',o:LF,v:true}];
MPo.views=[{n:'Cinema',p:[-16,6.5,52],t:[-2,6,8]},{n:'Geral',p:[0,24,34],t:[0,2,4]},{n:'Tática',p:[0,36,2.2],t:[0,0,2]},{n:'Altar',p:[0.4,2.3,4.5],t:[0,1.9,-10]},{n:'Coro',p:[0,1.9,-6.5],t:[0,3.9,8]},{n:'Fachada',p:[-6,7,34],t:[-1,5,12]}];
MPo.spawn=i=>({x:i%2?.5:-.5,z:1+Math.floor(i/2)*1.5});MPo.walkStart={x:0,z:9.5};
{const LP=[];[15,23,31,39].forEach(z=>[-2.6,2.6].forEach(x=>LP.push([x,z,5,.7,'ffb067'])));
MPo.vtt={areas:[{n:'Interior da igreja',b:[-7,7,-12,12],lv:1},{n:'Igreja + entrada',b:[-13,13,-14,21],lv:1},{n:'Propriedade inteira',b:[-30,30,-26,44],lv:1},{n:'Coro (2º andar)',b:[-6.5,6.5,4.2,11.6],lv:2}],
 walls:[[[-1.5,11.15],[-6.15,11.15],[-6.15,-11.15],[6.15,-11.15],[6.15,11.15],[1.5,11.15]],[[-10.3,9.2],[-6.3,9.2],[-6.3,13.2],[-10.3,13.2],[-10.3,9.2]],[[17,6.5],[21,6.5],[21,9.5],[17,9.5],[17,6.5]]],
 portals:[{p:[0,11.15],a:[-1.5,11.15],b:[1.5,11.15]}],
 lights:[[0,-3,8,.9,'ffb067'],[0,1.5,8,.9,'ffb067'],[-2.2,-9.4,5,.8,'ffb067'],[2.2,-9.4,5,.8,'ffb067'],[-1.9,11.5,5,.8,'ffb067'],[1.9,11.5,5,.8,'ffb067'],[-16,32,6,.8,'ffb067'],[16.8,8,4,.7,'ffb067']].concat(LP)};}
MPo.exportHide=()=>{const a=[],bb=new THREE.Box3();W.traverse(o=>{if(o.isMesh&&bb.setFromObject(o).min.y>3.9)a.push(o)});return a};
MPo.solid=()=>{const a=[];if(W.visible){W.children.forEach(o=>{if(o.isMesh)a.push(o)});PG.traverse(o=>{if(o.isMesh)a.push(o)})}T0.children.forEach(o=>{if(o.isMesh)a.push(o)});CG.traverse(o=>{if(o.isMesh)a.push(o)});return a};
MPo.tick=()=>MS.forEach(m=>{m.position.x+=m.userData.v*.012;if(m.position.x>55)m.position.x=-55});
}
