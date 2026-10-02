// Тридевятое: Сказитель — вертикальный срез (Лукоморье · Иван · «Цепь златая»)
import * as THREE from 'three';
import { Sound } from './audio.js';
import { UI } from './ui.js';

const S = new Sound();
const ui = new UI();
const SAVE_KEY = 'tridevyatoe_save_v1';

// ---------- рендер ----------
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 600);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const SKY_LIVE = new THREE.Color(0x8fd3ff), SKY_GRAY = new THREE.Color(0x9ba3ab), SKY_SIGHT = new THREE.Color(0x3b2a5c);
scene.background = SKY_GRAY.clone();
scene.fog = new THREE.Fog(SKY_GRAY.clone(), 45, 170);
const hemi = new THREE.HemisphereLight(0xffffff, 0x4a5a3a, 1.1); scene.add(hemi);
const SUN_LIVE = new THREE.Color(0xfff0c8), SUN_GRAY = new THREE.Color(0xd8dce0);
const sun = new THREE.DirectionalLight(0xffffff, 2.3);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 140 });
sun.shadow.bias = -0.0008;
scene.add(sun, sun.target);

// ---------- материалы и «жизнь» мира ----------
const grad = new THREE.DataTexture(new Uint8Array([85, 165, 255]), 3, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const painted = [];
function toon(color, opts = {}, keep = false) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: grad, ...opts });
  if (!keep) painted.push({ mat: m, base: new THREE.Color(color) });
  return m;
}
const _g = new THREE.Color();
function grayOf(c, out) { const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; return out.setRGB(l * 0.8 + 0.05, l * 0.8 + 0.055, l * 0.8 + 0.065); }

// ---------- рельеф ----------
const SWAMP = new THREE.Vector2(27, -24), GROVE = new THREE.Vector2(-30, 14), PORTAL = new THREE.Vector2(-15, -36), FIRE = new THREE.Vector2(9, 9);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function H(x, z) {
  const r = Math.hypot(x, z); const land = 1 - smooth(48, 62, r);
  let h = land * 1.4 - (1 - land) * 3;
  h += 3.2 * Math.exp(-(r * r) / 220);
  h += land * (Math.sin(x * 0.16) * Math.cos(z * 0.13) * 0.45 + Math.sin(x * 0.05 + z * 0.07) * 0.5);
  const ds = (x - SWAMP.x) ** 2 + (z - SWAMP.y) ** 2; h -= 1.5 * Math.exp(-ds / 90) * land;
  return h;
}
let seed = 11; const srand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const rand = (a, b) => a + Math.random() * (b - a);

function M(geo, mat, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}

const tg = new THREE.PlaneGeometry(170, 170, 170, 170); tg.rotateX(-Math.PI / 2);
const tpos = tg.attributes.position; const terBase = new Float32Array(tpos.count * 3);
{
  const cG = new THREE.Color(0x63b548), cG2 = new THREE.Color(0x9bd35c), cS = new THREE.Color(0xf0d595), cW = new THREE.Color(0xb59a62), cSw = new THREE.Color(0x4d5a32), c = new THREE.Color();
  for (let i = 0; i < tpos.count; i++) {
    const x = tpos.getX(i), z = tpos.getZ(i), h = H(x, z); tpos.setY(i, h);
    const r = Math.hypot(x, z);
    if (h < 0) c.copy(cW); else if (h < 1.0 && r > 40) c.copy(cS);
    else { c.copy(cG).lerp(cG2, 0.5 + 0.5 * Math.sin(x * 0.21 + Math.cos(z * 0.17) * 2)); const ds = Math.hypot(x - SWAMP.x, z - SWAMP.y); c.lerp(cSw, 1 - smooth(6, 15, ds)); }
    terBase[i * 3] = c.r; terBase[i * 3 + 1] = c.g; terBase[i * 3 + 2] = c.b;
  }
  tg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(terBase), 3));
  tg.computeVertexNormals();
}
const terrain = new THREE.Mesh(tg, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad }));
terrain.receiveShadow = true; scene.add(terrain);

const seaMat = toon(0x2b93d9, { transparent: true, opacity: 0.88 });
const seaGeo = new THREE.PlaneGeometry(600, 600, 120, 120); seaGeo.rotateX(-Math.PI / 2);
const sea = new THREE.Mesh(seaGeo, seaMat); sea.position.y = 0.05; scene.add(sea);
const seaBaseY = Float32Array.from(seaGeo.attributes.position.array);

// ---------- декор ----------
const colliders = [];
const trunkMat = toon(0x6b4423), leafA = toon(0x2f8f3a), leafB = toon(0x48a84f), birchMat = toon(0xf4f1e8), birchLeaf = toon(0x9ccc4a), pineMat = toon(0x1f6b3a), rockMat = toon(0x8a8a90);
function birch(x, z) {
  const y = H(x, z); const hgt = rand(4, 6);
  M(new THREE.CylinderGeometry(0.18, 0.25, hgt, 6), birchMat, x, y + hgt / 2, z);
  for (let k = 0; k < 3; k++) M(new THREE.IcosahedronGeometry(rand(1.1, 1.6), 0), birchLeaf, x + rand(-0.6, 0.6), y + hgt - 0.3 + k * 0.7, z + rand(-0.6, 0.6));
  colliders.push({ x, z, r: 0.5 });
}
function pine(x, z) {
  const y = H(x, z);
  M(new THREE.CylinderGeometry(0.2, 0.3, 1.6, 6), trunkMat, x, y + 0.8, z);
  for (let k = 0; k < 3; k++) M(new THREE.ConeGeometry(1.8 - k * 0.45, 2.2, 7), pineMat, x, y + 2 + k * 1.2, z);
  colliders.push({ x, z, r: 0.6 });
}
function rock(x, z, s) { const r = M(new THREE.DodecahedronGeometry(s, 0), rockMat, x, H(x, z) + s * 0.3, z); r.rotation.set(rand(0, 3), rand(0, 3), 0); colliders.push({ x, z, r: s * 0.9 }); }
const far = (x, z, p, d) => Math.hypot(x - p.x, z - p.y) > d;
for (let i = 0; i < 70; i++) {
  const a = srand() * Math.PI * 2, r = 12 + srand() * 32, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (!far(x, z, SWAMP, 12) || !far(x, z, GROVE, 10) || !far(x, z, PORTAL, 7) || !far(x, z, FIRE, 6) || Math.hypot(x - 10, z - 13) < 5) continue;
  if (srand() < 0.5) birch(x, z); else pine(x, z);
}
for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; birch(GROVE.x + Math.cos(a) * 9, GROVE.y + Math.sin(a) * 9); }
for (let i = 0; i < 18; i++) { const a = srand() * 6.28, r = 15 + srand() * 38; rock(Math.cos(a) * r, Math.sin(a) * r, 0.4 + srand() * 0.9); }

// трава
const grassMat = toon(0x5fb24a);
const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.12, 0.6, 3), grassMat, 1800);
const flowerGeo = new THREE.IcosahedronGeometry(0.16, 0);
const flowers = new THREE.InstancedMesh(flowerGeo, new THREE.MeshToonMaterial({ gradientMap: grad }), 420);
const flowerPos = [];
{
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
  let gi = 0;
  while (gi < 1800) {
    const x = (srand() - 0.5) * 100, z = (srand() - 0.5) * 100, h = H(x, z);
    if (h < 1.1 || Math.hypot(x, z) > 47) continue;
    p.set(x, h + 0.25, z); s.setScalar(0.7 + srand() * 0.8); m.compose(p, q, s); grass.setMatrixAt(gi++, m);
  }
  const fc = [0xff4d6d, 0xffd23f, 0x4d9dff, 0xffffff, 0xff8c42, 0xc77dff].map((h) => new THREE.Color(h));
  let fi = 0;
  while (fi < 420) {
    const x = (srand() - 0.5) * 96, z = (srand() - 0.5) * 96, h = H(x, z);
    if (h < 1.1 || Math.hypot(x, z) > 46) continue;
    flowerPos.push(new THREE.Vector3(x, h + 0.3, z)); flowers.setColorAt(fi, fc[fi % fc.length]); fi++;
  }
}
grass.receiveShadow = true; scene.add(grass, flowers);
function setFlowers(k) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  flowerPos.forEach((p, i) => { s.setScalar(Math.max(0.001, k)); m.compose(p, q, s); flowers.setMatrixAt(i, m); });
  flowers.instanceMatrix.needsUpdate = true;
}

// ---------- дуб и златая цепь ----------
const OAK = new THREE.Vector3(0, H(0, 0), 0);
const oak = new THREE.Group(); oak.position.copy(OAK); scene.add(oak);
M(new THREE.CylinderGeometry(1.1, 1.7, 8, 10), trunkMat, 0, 4, 0, oak);
const branch = M(new THREE.CylinderGeometry(0.3, 0.5, 5, 7), trunkMat, 2.4, 6.4, 0, oak); branch.rotation.z = -1.15;
const branch2 = M(new THREE.CylinderGeometry(0.3, 0.45, 4.5, 7), trunkMat, -2, 7, 1, oak); branch2.rotation.set(0.4, 0, 1.1);
[[0, 10, 0, 4.2, leafA], [3, 9, 1.5, 3, leafB], [-3, 9.4, -1, 3.2, leafB], [1, 11.8, -2, 2.8, leafA], [-1.5, 10.5, 2.8, 2.6, leafA], [4.5, 8, -1.5, 2.2, leafA]].forEach(([x, y, z, r, mat]) => M(new THREE.IcosahedronGeometry(r, 1), mat, x, y, z, oak));
colliders.push({ x: 0, z: 0, r: 1.9 });
const goldMat = toon(0xffc93a, { emissive: 0x332200 });
const chainLinks = []; const GAPS = [7, 15, 23];
for (let i = 0; i < 30; i++) {
  const a = i * 0.62, y = 1.2 + i * 0.16, rr = 1.45 - i * 0.012;
  const l = M(new THREE.TorusGeometry(0.22, 0.06, 6, 12), goldMat, Math.cos(a) * rr, y, Math.sin(a) * rr, oak);
  l.rotation.set(i % 2 ? Math.PI / 2 : 0, -a, 0.35);
  chainLinks.push(l); if (GAPS.includes(i)) l.visible = false;
}
const gapWorld = (k) => chainLinks[GAPS[k]].getWorldPosition(new THREE.Vector3());

// ---------- костёр ----------
const FIRE3 = new THREE.Vector3(FIRE.x, H(FIRE.x, FIRE.y), FIRE.y);
for (let k = 0; k < 4; k++) { const lg = M(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 5), trunkMat, FIRE3.x, FIRE3.y + 0.15, FIRE3.z); lg.rotation.set(Math.PI / 2, (k * Math.PI) / 4, 0); }
const flameMat = new THREE.MeshBasicMaterial({ color: 0xff9a2a, transparent: true, opacity: 0.9 });
const flame2Mat = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.9 });
const flame = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.3, 7), flameMat); flame.position.set(FIRE3.x, FIRE3.y + 0.8, FIRE3.z);
const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.8, 7), flame2Mat); flame2.position.set(FIRE3.x, FIRE3.y + 0.65, FIRE3.z);
scene.add(flame, flame2);
const fireLight = new THREE.PointLight(0xff8a30, 18, 14, 1.6); fireLight.position.set(FIRE3.x, FIRE3.y + 1.5, FIRE3.z); scene.add(fireLight);
colliders.push({ x: FIRE3.x, z: FIRE3.z, r: 0.8 });

// ---------- портал в Дремучий лес ----------
const PORTAL3 = new THREE.Vector3(PORTAL.x, H(PORTAL.x, PORTAL.y), PORTAL.y);
const stoneMat = toon(0x9a958c);
const portal = new THREE.Group(); portal.position.copy(PORTAL3); portal.lookAt(0, PORTAL3.y, 0); scene.add(portal);
M(new THREE.BoxGeometry(0.9, 5, 0.9), stoneMat, -2.2, 2.5, 0, portal); M(new THREE.BoxGeometry(0.9, 5, 0.9), stoneMat, 2.2, 2.5, 0, portal);
M(new THREE.BoxGeometry(5.6, 0.9, 1.1), stoneMat, 0, 5.3, 0, portal);
const portalMat = new THREE.MeshBasicMaterial({ color: 0x777788, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
const portalDisc = new THREE.Mesh(new THREE.CircleGeometry(1.8, 32), portalMat); portalDisc.position.set(0, 2.6, 0); portal.add(portalDisc);
const swirl = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.06, 6, 40, 5), new THREE.MeshBasicMaterial({ color: 0x55ff99, transparent: true, opacity: 0 }));
swirl.position.set(0, 2.6, 0.02); portal.add(swirl);
colliders.push({ x: PORTAL3.x + 0, z: PORTAL3.z, r: 0.1 });

// ---------- болото ----------
const SWAMP3 = new THREE.Vector3(SWAMP.x, H(SWAMP.x, SWAMP.y), SWAMP.y);
const bogMat = toon(0x3d5a3a, { transparent: true, opacity: 0.85 });
const bog = new THREE.Mesh(new THREE.CircleGeometry(9, 28), bogMat); bog.rotation.x = -Math.PI / 2; bog.position.set(SWAMP.x, 0.3, SWAMP.y); scene.add(bog);
const reedMat = toon(0x7a8a3a);
for (let i = 0; i < 40; i++) { const a = srand() * 6.28, r = 6 + srand() * 5; const x = SWAMP.x + Math.cos(a) * r, z = SWAMP.y + Math.sin(a) * r; M(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 4), reedMat, x, Math.max(H(x, z), 0.3) + 0.8, z); }
const KIKI_POS = new THREE.Vector3(SWAMP.x - 4, Math.max(H(SWAMP.x - 4, SWAMP.y + 3), 0.3), SWAMP.y + 3);

// ---------- персонажи ----------
function makeIvan() {
  const g = new THREE.Group();
  const skin = toon(0xf2c9a0), shirt = toon(0xd63a2f), pants = toon(0x3b4f9a), boots = toon(0x5a3a22), hair = toon(0xe8c15a), belt = toon(0xf2b632), eye = toon(0x222222, {}, true);
  const leg = (x) => { const p = new THREE.Group(); p.position.set(x, 0.8, 0); g.add(p); M(new THREE.BoxGeometry(0.24, 0.7, 0.24), pants, 0, -0.35, 0, p); M(new THREE.BoxGeometry(0.28, 0.18, 0.36), boots, 0, -0.72, 0.05, p); return p; };
  const arm = (x) => { const p = new THREE.Group(); p.position.set(x, 1.5, 0); g.add(p); M(new THREE.BoxGeometry(0.17, 0.6, 0.17), shirt, 0, -0.3, 0, p); M(new THREE.SphereGeometry(0.11, 8, 6), skin, 0, -0.64, 0, p); return p; };
  const legL = leg(-0.15), legR = leg(0.15), armL = arm(-0.43), armR = arm(0.43);
  M(new THREE.CylinderGeometry(0.3, 0.38, 0.85, 10), shirt, 0, 1.2, 0, g);
  M(new THREE.CylinderGeometry(0.385, 0.385, 0.1, 10), belt, 0, 0.86, 0, g);
  M(new THREE.SphereGeometry(0.29, 12, 10), skin, 0, 1.88, 0, g);
  const hc = M(new THREE.SphereGeometry(0.31, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hair, 0, 1.92, -0.02, g); hc.scale.y = 0.8;
  M(new THREE.SphereGeometry(0.045, 6, 6), eye, -0.1, 1.9, 0.26, g); M(new THREE.SphereGeometry(0.045, 6, 6), eye, 0.1, 1.9, 0.26, g);
  g.userData = { legL, legR, armL, armR };
  return g;
}
function makeCat() {
  const g = new THREE.Group();
  const fur = toon(0x55555f), belly = toon(0xe8e2d6), eyeM = toon(0xffd23f, { emissive: 0x332200 }), gold = toon(0xd9a83a);
  const body = M(new THREE.SphereGeometry(0.5, 12, 10), fur, 0, 0.5, 0, g); body.scale.set(0.8, 0.8, 1.15);
  M(new THREE.SphereGeometry(0.3, 10, 8), belly, 0, 0.45, 0.25, g).scale.set(0.9, 1, 0.6);
  M(new THREE.SphereGeometry(0.36, 12, 10), fur, 0, 1.0, 0.45, g);
  [-0.18, 0.18].forEach((x) => { const e = M(new THREE.ConeGeometry(0.11, 0.25, 4), fur, x, 1.33, 0.42, g); e.rotation.z = x > 0 ? -0.25 : 0.25; });
  [-0.12, 0.12].forEach((x) => { M(new THREE.SphereGeometry(0.06, 8, 6), eyeM, x, 1.05, 0.76, g); const s = M(new THREE.TorusGeometry(0.09, 0.015, 6, 14), gold, x, 1.05, 0.79, g); });
  const tail = M(new THREE.TorusGeometry(0.4, 0.07, 6, 12, Math.PI * 1.2), fur, 0, 0.8, -0.55, g); tail.rotation.y = Math.PI / 2;
  g.userData.tail = tail; return g;
}
function makeMermaid() {
  const g = new THREE.Group();
  const skin = toon(0xf5d2b8), tailM = toon(0x26c2a8), hair = toon(0x3dd68c), shell = toon(0xff9ec7);
  M(new THREE.CylinderGeometry(0.2, 0.28, 0.6, 10), skin, 0, 0.3, 0, g);
  M(new THREE.SphereGeometry(0.24, 12, 10), skin, 0, 0.8, 0, g);
  const h = M(new THREE.SphereGeometry(0.28, 12, 10), hair, 0, 0.82, -0.08, g); h.scale.set(1, 1.1, 1);
  const hl = M(new THREE.CylinderGeometry(0.2, 0.32, 1.1, 8), hair, 0, 0.25, -0.18, g);
  M(new THREE.SphereGeometry(0.09, 6, 6), shell, -0.1, 0.45, 0.17, g); M(new THREE.SphereGeometry(0.09, 6, 6), shell, 0.1, 0.45, 0.17, g);
  const t = new THREE.Group(); t.position.y = 0; g.add(t);
  M(new THREE.ConeGeometry(0.28, 1.6, 10), tailM, 0, -0.8, 0.05, t).rotation.x = Math.PI;
  const fin = M(new THREE.ConeGeometry(0.3, 0.4, 3), tailM, 0, -1.65, 0.05, t); fin.scale.z = 0.3;
  g.userData.tail = t; return g;
}
function makeKiki() {
  const g = new THREE.Group();
  const body = toon(0x6b7d3a), skin = toon(0x9bb06b), moss = toon(0x3f5a2a), eyeM = toon(0xfff07a, { emissive: 0x444400 });
  M(new THREE.ConeGeometry(0.7, 1.6, 9), body, 0, 0.8, 0, g);
  M(new THREE.SphereGeometry(0.38, 12, 10), skin, 0, 1.85, 0, g);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28; M(new THREE.SphereGeometry(0.16, 6, 5), moss, Math.cos(a) * 0.35, 2.05 + Math.sin(i) * 0.08, Math.sin(a) * 0.35 - 0.05, g); }
  M(new THREE.SphereGeometry(0.1, 8, 6), eyeM, -0.14, 1.9, 0.32, g); M(new THREE.SphereGeometry(0.1, 8, 6), eyeM, 0.14, 1.9, 0.32, g);
  M(new THREE.ConeGeometry(0.07, 0.35, 5), skin, 0, 1.8, 0.45, g).rotation.x = Math.PI / 2;
  return g;
}
function makeForgetling() {
  const g = new THREE.Group();
  const mat = new THREE.MeshToonMaterial({ color: 0x9aa0aa, gradientMap: grad, transparent: true, opacity: 0.85, emissive: 0x000000 });
  const b = M(new THREE.SphereGeometry(0.6, 14, 12), mat, 0, 0, 0, g);
  const cone = M(new THREE.ConeGeometry(0.5, 0.9, 12), mat, 0, -0.6, 0, g); cone.rotation.x = Math.PI;
  const e = new THREE.MeshBasicMaterial({ color: 0x20222a });
  M(new THREE.SphereGeometry(0.09, 6, 6), e, -0.2, 0.1, 0.52, g); M(new THREE.SphereGeometry(0.09, 6, 6), e, 0.2, 0.1, 0.52, g);
  g.userData.mat = mat; return g;
}

const ivan = makeIvan(); scene.add(ivan);
const cat = makeCat(); scene.add(cat);
const CAT_HOME = new THREE.Vector3(3.2, H(3.2, 3.2), 3.2); cat.position.copy(CAT_HOME); cat.rotation.y = 0.6;
const mermaid = makeMermaid(); oak.add(mermaid); mermaid.position.set(4.3, 7.9, 0); mermaid.rotation.y = Math.PI / 2;
const MERMAID_GROUND = new THREE.Vector3(5.5, H(5.5, 0), 0);
const kiki = makeKiki(); kiki.position.copy(KIKI_POS); kiki.lookAt(0, KIKI_POS.y, 0); scene.add(kiki);
colliders.push({ x: KIKI_POS.x, z: KIKI_POS.z, r: 0.8 });

// звенья-подарки
const linkMesh = () => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.13, 8, 16), new THREE.MeshBasicMaterial({ color: 0xffd23f })); g.add(t); const glow = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(glow); return g; };
const GROVE_LINK = linkMesh(); GROVE_LINK.position.set(GROVE.x, H(GROVE.x, GROVE.y) + 1.4, GROVE.y); GROVE_LINK.visible = false; scene.add(GROVE_LINK);

// ---------- Нити Сказа ----------
const threads = {};
function makeThread(key, from, to) {
  const pts = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; const p = from.clone().lerp(to, t); p.y += Math.sin(t * Math.PI) * (3 + from.distanceTo(to) * 0.12) + Math.sin(t * 13) * 0.4; pts.push(p); }
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.06, 6), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.95, depthWrite: false }));
  const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.22, 8), new THREE.MeshBasicMaterial({ color: 0xffb82a, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  g.add(core, glow); g.visible = false; scene.add(g);
  threads[key] = { g, core, glow };
}
scene.updateMatrixWorld(true);
makeThread('mermaid', gapWorld(0), mermaid.getWorldPosition(new THREE.Vector3()));
makeThread('grove', gapWorld(1), new THREE.Vector3(GROVE.x, H(GROVE.x, GROVE.y) + 1.4, GROVE.y));
makeThread('kiki', gapWorld(2), KIKI_POS.clone().add(new THREE.Vector3(0, 2, 0)));

// ---------- бабочки (после оживления) ----------
const butterflies = [];
{
  const cols = [0xffd23f, 0xff6b9d, 0x6bc5ff, 0xffffff];
  for (let i = 0; i < 26; i++) {
    const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: cols[i % 4], side: THREE.DoubleSide });
    const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), m); w1.position.x = 0.15; const p1 = new THREE.Group(); p1.add(w1);
    const w2 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), m); w2.position.x = -0.15; const p2 = new THREE.Group(); p2.add(w2);
    g.add(p1, p2); g.visible = false; scene.add(g);
    const a = srand() * 6.28, r = 6 + srand() * 34;
    butterflies.push({ g, p1, p2, home: new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r), ph: srand() * 10 });
  }
}

// ---------- частицы ----------
const bursts = [];
function burst(pos, color, n = 30, speed = 4, life = 1.2, size = 0.25) {
  const geo = new THREE.BufferGeometry(); const p = new Float32Array(n * 3); const v = [];
  for (let i = 0; i < n; i++) { p[i * 3] = pos.x; p[i * 3 + 1] = pos.y; p[i * 3 + 2] = pos.z; v.push(new THREE.Vector3(rand(-1, 1), rand(-0.2, 1.2), rand(-1, 1)).normalize().multiplyScalar(speed * rand(0.4, 1))); }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat); scene.add(pts); bursts.push({ pts, v, t: 0, life });
}
const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
ring.rotation.x = -Math.PI / 2; ring.position.set(0, OAK.y + 0.5, 0); scene.add(ring);
let ringT = -1;

// ---------- состояние ----------
const freshState = () => ({ stage: 0, links: { mermaid: false, grove: false, kiki: false }, riddle: 0, laugh: 0, groveCleared: false, restored: false, pushkin: false, words: [], book: [], seenGroveHint: false });
let st = freshState();
const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(st));
const linkCount = () => Object.values(st.links).filter(Boolean).length;

const player = { pos: new THREE.Vector3(10, 0, 13), vy: 0, facing: Math.PI, onGround: true, hp: 5, maxHp: 5, word: 100, attackT: 0, hurtT: 0, buffT: 0, speedT: 0, luckCd: 0, walk: 0, sight: false, locked: false };
let camYaw = 0.6, camPitch = 0.3, camDist = 8;

// враги
const enemies = [];
function spawnEnemies() {
  enemies.forEach((e) => scene.remove(e.g)); enemies.length = 0;
  if (st.groveCleared) return;
  for (let i = 0; i < 3; i++) {
    const g = makeForgetling(); scene.add(g);
    const home = new THREE.Vector3(GROVE.x + Math.cos(i * 2.1) * 3.5, 0, GROVE.y + Math.sin(i * 2.1) * 3.5);
    g.position.set(home.x, H(home.x, home.z) + 1.2, home.z);
    enemies.push({ g, home, hp: 3, alive: true, cd: 0, kb: new THREE.Vector3(), flash: 0, dying: 0, ph: i * 2 });
  }
}

// ---------- применение «жизни» ----------
let life = 0.12, lifeTarget = 0.12, lifeShown = -1;
function applyLife(L) {
  for (const p of painted) { grayOf(p.base, _g); p.mat.color.copy(_g).lerp(p.base, L); }
  const col = tg.attributes.color.array; const a = new THREE.Color(), b = new THREE.Color();
  for (let i = 0; i < col.length; i += 3) { a.setRGB(terBase[i], terBase[i + 1], terBase[i + 2]); grayOf(a, b); b.lerp(a, L); col[i] = b.r; col[i + 1] = b.g; col[i + 2] = b.b; }
  tg.attributes.color.needsUpdate = true;
  sun.color.copy(SUN_GRAY).lerp(SUN_LIVE, L); hemi.intensity = 0.8 + 0.4 * L;
  setFlowers(smooth(0.55, 1, L));
  S.setGray(1 - L);
}
function baseLife() { return st.restored ? 1 : 0.12 + 0.11 * linkCount(); }

// ---------- ввод ----------
const keys = new Set(); let mouseBlock = false;
addEventListener('keydown', (e) => {
  if (!started) return;
  keys.add(e.code);
  if (ui.dialogOpen) return;
  if (e.code === 'KeyB') { ui.book(st, !ui.bookOpen); if (ui.bookOpen) document.exitPointerLock(); return; }
  if (ui.bookOpen) return;
  if (player.locked) return;
  if (e.code === 'KeyQ') toggleSight();
  if (e.code === 'KeyF' || e.code === 'KeyE') interact();
  if (e.code === 'KeyJ') attack();
  if (e.code === 'KeyR') luck();
  if (e.code === 'KeyH') document.getElementById('help').classList.toggle('hidden');
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('mousedown', (e) => {
  if (!started || ui.busy() || player.locked) return;
  if (document.pointerLockElement !== canvas) { canvas.requestPointerLock?.(); return; }
  if (e.button === 0) attack(); if (e.button === 2) mouseBlock = true;
});
addEventListener('mouseup', (e) => { if (e.button === 2) mouseBlock = false; });
addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  camYaw -= e.movementX * 0.0028; camPitch = Math.min(1.25, Math.max(0.05, camPitch + e.movementY * 0.0022));
});
addEventListener('wheel', (e) => { camDist = Math.min(16, Math.max(4, camDist + e.deltaY * 0.01)); });

// ---------- механики ----------
function toggleSight(force) {
  const on = force !== undefined ? force : !player.sight;
  if (on && player.word < 5) { ui.toast('Не хватает Слова. Отдохни у костра.'); S.wrong(); return; }
  if (on === player.sight) return;
  player.sight = on; document.body.classList.toggle('sight', on); S.sight(on);
}
function attack() {
  if (player.attackT > 0 || ui.busy() || player.locked) return;
  player.attackT = 0.38; S.swing();
  const fwd = new THREE.Vector3(Math.sin(player.facing), 0, Math.cos(player.facing));
  let hitAny = false;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = e.g.position.clone().sub(player.pos); d.y = 0;
    if (d.length() < 2.8 && d.normalize().dot(fwd) > 0.2) {
      const dmg = (player.buffT > 0 ? 3 : 1) * (player.sight ? 2 : 1);
      e.hp -= dmg; e.flash = 0.2; e.kb.copy(d).multiplyScalar(9); hitAny = true;
      burst(e.g.position, 0xffffff, 12, 3, 0.5, 0.18);
      if (e.hp <= 0) { e.alive = false; e.dying = 1; S.sleep(); ui.toast('Забудка уснула 💤'); burst(e.g.position, 0xffe27a, 40, 4, 1.2); }
    }
  }
  if (hitAny) S.hit();
  if (player.pos.distanceTo(KIKI_POS) < 3 && !st.links.kiki) { ui.toast('Кикимору силой не взять! Её надо… рассмешить. (F)'); S.laugh(); }
  if (enemies.length && enemies.every((e) => !e.alive) && !st.groveCleared) {
    st.groveCleared = true; save();
    setTimeout(() => { ui.toast('Роща притихла… Что-то блеснуло — но глазами не видно.'); }, 900);
  }
}
const LUCK = [
  ['Богатырская сила! Урон ×3 на 8 секунд', () => (player.buffT = 8)],
  ['Апчхи! Иван чихнул — всех вокруг разметало!', () => { enemies.forEach((e) => { if (!e.alive) return; const d = e.g.position.clone().sub(player.pos); d.y = 0; if (d.length() < 9) { e.kb.copy(d.normalize()).multiplyScalar(22); e.hp -= 1; e.flash = 0.3; if (e.hp <= 0) { e.alive = false; e.dying = 1; S.sleep(); } } }); burst(player.pos.clone().setY(player.pos.y + 1.6), 0xffffff, 50, 8, 0.8); }],
  ['В кармане нашёлся пряник! +2 ❤', () => (player.hp = Math.min(player.maxHp, player.hp + 2))],
  ['Вороны засмеялись… и всё. Зато весело! 😄', () => {}],
  ['Попутный ветер! Скорость ×1.6 на 8 секунд', () => (player.speedT = 8)],
];
function luck() {
  if (player.luckCd > 0) { ui.toast('Удача ещё не вернулась.'); return; }
  const [txt, fn] = LUCK[Math.floor(Math.random() * LUCK.length)]; fn(); player.luckCd = 25;
  ui.toast('🍀 ' + txt); S.chime();
  if (enemies.length && enemies.every((e) => !e.alive) && !st.groveCleared) { st.groveCleared = true; save(); }
}
function damagePlayer(e) {
  const toE = e.g.position.clone().sub(player.pos); toE.y = 0; toE.normalize();
  const fwd = new THREE.Vector3(Math.sin(player.facing), 0, Math.cos(player.facing));
  const blocking = keys.has('KeyK') || mouseBlock;
  if (blocking && fwd.dot(toE) > 0.1) { ui.toast('Блок!', false, 800); e.kb.copy(toE).multiplyScalar(12); S.hit(); return; }
  player.hp -= 1; player.hurtT = 0.4; S.hurt(); e.kb.copy(toE).multiplyScalar(6);
  if (player.hp <= 0) fallAsleep();
}
async function fallAsleep() {
  player.locked = true; const fade = document.getElementById('fade'); fade.style.opacity = 1;
  ui.toast('Иван уснул… Сказки не умирают — они засыпают.', true, 3000);
  await wait(1400);
  player.pos.set(FIRE3.x + 2, FIRE3.y, FIRE3.z + 2.5); player.hp = player.maxHp; player.word = 100; player.luckCd = 0;
  spawnEnemies(); fade.style.opacity = 0; player.locked = false;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- интерактив ----------
const interactables = [
  { label: 'Поговорить с Котом учёным', pos: () => cat.position, r: 3.2, act: () => catTalk() },
  { label: 'Окликнуть русалку на ветвях', pos: () => MERMAID_GROUND, r: 3.5, cond: () => !st.links.mermaid, act: () => mermaidTalk() },
  { label: 'Говорить с Кикиморой', pos: () => KIKI_POS, r: 3.5, cond: () => !st.links.kiki, act: () => kikiTalk() },
  { label: 'Поднять звено цепи', pos: () => GROVE_LINK.position, r: 2.8, cond: () => st.groveCleared && !st.links.grove && player.sight, act: () => getLink('grove', GROVE_LINK.position) },
  { label: 'Скрепить златую цепь', pos: () => OAK, r: 4.8, prio: 5, cond: () => st.stage === 2, act: () => restore() },
  { label: 'Посидеть у костра', pos: () => FIRE3, r: 3, act: () => fireTalk() },
  { label: 'Коснуться портала', pos: () => PORTAL3, r: 4, act: () => portalTalk() },
];
function nearest() {
  let best = null, bd = 1e9;
  for (const it of interactables) { if (it.cond && !it.cond()) continue; const p = it.pos(); const d = Math.hypot(p.x - player.pos.x, p.z - player.pos.z); const sc = d - (it.prio || 0); if (d < it.r && sc < bd) { bd = sc; best = it; } }
  return best;
}
async function interact() { const it = nearest(); if (!it) return; document.exitPointerLock(); player.locked = true; try { await it.act(); } finally { player.locked = false; } }

function getLink(key, fromPos) {
  st.links[key] = true; threads[key].g.visible = false;
  burst(fromPos.clone(), 0xffd23f, 60, 5, 1.5, 0.3); S.chime();
  if (key === 'grove') GROVE_LINK.visible = false;
  ui.toast(`Звено златой цепи ${linkCount()}/3`, true);
  if (linkCount() === 3) { st.stage = 2; setTimeout(() => ui.toast('Все три звена! Неси их к дубу.'), 1600); }
  lifeTarget = baseLife(); save();
}

const CAT = 'Кот учёный', MER = 'Русалка', KIKI = 'Кикимора', IVAN = 'Иван';
async function catTalk() {
  if (st.stage === 0) {
    await ui.say(CAT, [
      'Мяу… то есть, здравствуй. Проснулся? Значит, ты — Сказитель.',
      'Я Кот учёный. Днём и ночью я ходил по цепи кругом… а теперь сижу и не помню, куда идти. Цепь порвана.',
      'Кощей крадёт у мира память о сказках. Видишь — всё серое и тихое. Даже я забываю свои песни.',
      'Ты умеешь вселяться в героев. Сейчас ты — Иван. Простой, зато сердце доброе.',
      'Нажми Q — это Сказительский взгляд. Увидишь Нити Сказа. Три звена златой цепи разлетелись — нити приведут к ним.',
      'Взгляд тратит Слово. Кончится — посиди у костра, он греет и память, и душу.',
      'И помни три закона сказки: Закон трёх, Закон имени, Закон добра. Они пригодятся.',
    ]);
    const c = await ui.dialog(CAT, 'Ну что, Сказитель, возьмёшься?', ['Найду все три звена!', 'А почему я — Иван-дурак?']);
    if (c === 1) await ui.say(CAT, ['Потому что дураку везёт. Нажми R — «Удача дурака». Что выпадет — не знаю даже я. Может, сила богатырская. А может, вороны засмеются.', 'Ступай. Мур.']);
    st.stage = 1; save(); ui.toast('Новый сказ: «Цепь златая»', true);
    return;
  }
  if (st.stage === 1) {
    const hints = [];
    if (!st.links.mermaid) hints.push('Русалка на ветвях бормочет загадки. Подойди к дубу с той стороны, где ветка над морем.');
    if (!st.links.grove) hints.push(st.groveCleared ? 'В берёзовой роще звено спрятано от простых глаз. Смотри Сказительским взглядом.' : 'В берёзовой роще завелись забудки — серые, сонные. Взглядом увидишь их слабость: бей — и уснут.');
    if (!st.links.kiki) hints.push('Кикимора на болоте что-то стащила. Силой её не возьмёшь — Кикимор надо смешить.');
    await ui.say(CAT, [hints[0] + (hints.length > 1 ? ' А ещё… мур, забыл. Нажми Q — нити подскажут.' : '')]);
    return;
  }
  if (st.stage === 2) { await ui.say(CAT, ['Все три! Неси к дубу, к самому стволу. Скрепи цепь — и посмотрим, что будет.']); return; }
  if (!st.pushkin) {
    await ui.say(CAT, ['У лукоморья дуб зелёный;\nЗлатая цепь на дубе том:\nИ днём и ночью кот учёный\nВсё ходит по цепи кругом;']);
    const c = await ui.dialog(CAT, 'Идёт налево — песнь заводит,\nНаправо — сказку говорит…', ['Красиво! Всё верно.', 'Постой, кот! Направо — песнь, налево — сказка!', 'Мур-мур!']);
    if (c === 1) {
      st.pushkin = true;
      st.words.push({ word: 'Лукоморье', text: 'изогнутый морской берег, залив. Место, где сходятся все сказки — и откуда начинается любая дорога.' });
      S.chime(); save();
      await ui.say(CAT, ['Мур… А ведь правда! Поймал старика. Вот что значит — Сказитель: помнишь, как было на самом деле.', 'Держи забытое слово: «ЛУКОМОРЬЕ». В каждой земле спрятано такое. Собери все — узнаешь, кем был Кощей.']);
      ui.toast('Найдено забытое слово 1/5', true);
    } else await ui.say(CAT, ['Мур-р… Ну, раз ты так говоришь. (Кот хитро щурится. Кажется, он что-то перепутал.)']);
    return;
  }
  await ui.say(CAT, ['Портал в Дремучий лес проснулся. Там Баба-Яга забыла, кто она. Но это — уже другая сказка.']);
}
async function mermaidTalk() {
  if (st.stage === 0) { await ui.say(MER, ['Ля-ля… кто ты? Я забыла… Спроси сначала кота.']); return; }
  const R = [
    ['Без окон, без дверей — полна горница людей.', ['Изба', 'Огурец', 'Сундук'], 1],
    ['Сидит дед, во сто шуб одет. Кто его раздевает — тот слёзы проливает.', ['Капуста', 'Морозко', 'Лук'], 2],
    ['Не лает, не кусает, а в дом не пускает.', ['Замок', 'Кот', 'Забор'], 0],
  ];
  if (st.riddle === 0) await ui.say(MER, ['Ой, живой! Тёплый! Я тут сижу на ветвях и всё забываю…', 'У меня звено златое — нашла в волнах. Отдам тому, кто отгадает три загадки. Закон трёх!']);
  while (st.riddle < 3) {
    const [q, opts, ok] = R[st.riddle];
    const c = await ui.dialog(MER, `Загадка ${st.riddle + 1}: ${q}`, [...opts, 'Подумаю позже']);
    if (c === 3) { await ui.say(MER, ['Думай, богатырь. Я подожду — мне торопиться некуда.']); return; }
    if (c === ok) { st.riddle++; S.chime(); save(); if (st.riddle < 3) await ui.say(MER, ['Верно! Ой, а цвета вокруг чуть ярче стали…']); }
    else { S.wrong(); await ui.say(MER, ['Ха-ха! Мимо! Подумай ещё.']); }
  }
  await ui.say(MER, ['Три из трёх! Держи звено. И… спасибо. Я вспомнила, что умею петь.']);
  getLink('mermaid', mermaid.getWorldPosition(new THREE.Vector3()));
}
async function kikiTalk() {
  if (st.stage === 0) { await ui.say(KIKI, ['Чего припёрся? Ступай к своему коту.']); return; }
  const J = [
    ['Ну, насмеши меня, богатырь. Только чтоб болото дрогнуло!', ['В Тридевятом царстве в среднем двадцать семь дождливых дней в году.', 'Знаешь, почему Леший не играет в прятки? Его и так никто найти не может — он сам заблудился!', 'Я сильный. Очень.'], 1, ['Цифры… Скукота болотная.', 'Хвастун, а не шутник.']],
    ['Хи. Ну… ещё!', ['Колобок от бабушки ушёл, от дедушки ушёл — а от утренней зарядки не смог!', 'Сегодня хорошая погода.', 'Давай драться!'], 0, ['Погода у меня всегда одна — болотная.', 'Драться? Со мной? Ну-ну.']],
    ['Хи-хи! Последняя попытка — и если засмеюсь, отдам блестяшку.', ['Кикимора, ты очень… зелёная.', 'А можно я просто пойду?', 'Я дурак, мне можно: вчера щуку поймал — так теперь она мне желания загадывает!'], 2, ['Ну зелёная. Это правда. А не смешно.', 'Иди-иди. Без блестяшки.']],
  ];
  if (st.laugh === 0) await ui.say(KIKI, ['Чего уставился? Блестяшка моя. Нашла — значит моя.', 'Силой не отдам. А вот если рассмешишь… Тут так скучно с тех пор, как всё посерело.']);
  while (st.laugh < 3) {
    const [q, opts, ok, bads] = J[st.laugh];
    const c = await ui.dialog(KIKI, q, [...opts, '(Уйти)']);
    if (c === 3) return;
    if (c === ok) { st.laugh++; S.laugh(); save(); kiki.userData.giggle = 1.2; }
    else { S.wrong(); const others = [0, 1, 2].filter((k) => k !== ok); await ui.say(KIKI, [bads[others.indexOf(c)] || 'Хмф.']); }
  }
  await ui.say(KIKI, ['Ха-ха-ха-ХА! Ох, не могу! Болото аж забулькало!', 'На, держи свою блестяшку. Заходи ещё — с шутками. Закон добра: ты меня развеселил — я тебе помогла.']);
  getLink('kiki', KIKI_POS.clone().add(new THREE.Vector3(0, 2, 0)));
}
async function fireTalk() {
  player.hp = player.maxHp; player.word = 100;
  await ui.say(IVAN, [st.restored ? 'Тепло. Где-то поёт кот, шумит море. Хорошо.' : 'Костёр — единственное, что тут ещё помнит, каким бывает тепло. (Здоровье и Слово восполнены.)']);
}
async function portalTalk() {
  if (!st.restored) { await ui.say(IVAN, ['Каменная арка. Внутри — серая муть. Нить Лукоморья порвана, дальше дороги нет.']); return; }
  await ui.say('Портал', ['Из арки тянет хвоей и дымом. Где-то далеко скрипят куриные ноги избушки…', 'Дремучий лес ждёт. (Продолжение — в следующем срезе: Баба-Яга забыла своё имя.)']);
}
async function restore() {
  player.locked = true; toggleSight(false);
  const flying = [];
  for (let k = 0; k < 3; k++) { const m = linkMesh(); m.position.copy(player.pos).add(new THREE.Vector3(0, 1.6, 0)); scene.add(m); flying.push({ m, from: m.position.clone(), to: gapWorld(k) }); }
  S.chime();
  const t0 = performance.now();
  await new Promise((res) => {
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / 1600);
      flying.forEach((f, i) => { const k = Math.min(1, Math.max(0, t * 1.3 - i * 0.15)); f.m.position.lerpVectors(f.from, f.to, k); f.m.position.y += Math.sin(k * Math.PI) * 3; f.m.scale.setScalar(1 - k * 0.5); });
      if (t < 1) requestAnimationFrame(step); else res();
    };
    step();
  });
  flying.forEach((f) => scene.remove(f.m));
  GAPS.forEach((g) => (chainLinks[g].visible = true));
  st.restored = true; st.stage = 3; lifeTarget = 1; ringT = 0;
  burst(OAK.clone().setY(OAK.y + 4), 0xffd23f, 160, 9, 2.2, 0.35);
  S.restore(); setTimeout(() => S.startMusic(), 1800);
  ui.toast('Нить Сказа восстановлена!', true, 4000);
  st.book.push({ title: 'У лукоморья дуб зелёный', text: 'Кощей украл у Лукоморья память, и златая цепь распалась на три звена. Иван отгадал три загадки русалки, усыпил забудок в берёзовой роще и рассмешил Кикимору. Цепь снова цела — и кот учёный опять ходит по ней кругом.' });
  save();
  await wait(2500);
  ui.toast('📖 Новая запись в Книге Сказов (B)');
  await ui.say(CAT, ['Мяу!.. МЯУ! Я помню! Я всё помню! Направо — песнь, налево — сказка!', 'Смотри, Сказитель: море синее, трава зелёная… Это ты сделал. Ты рассказал сказку заново.', 'Подойди, когда отдышишься. Прочту тебе кое-что.']);
}

// ---------- трекер ----------
function trackerHtml() {
  const ck = (b) => (b ? '☑' : '☐');
  if (st.stage === 0) return '<b>📜 Пробуждение</b><br>• Поговори с Котом учёным у дуба (F)';
  if (st.stage === 1) return `<b>📜 Цепь златая</b><br>${ck(st.links.mermaid)} Звено русалки — загадки (${st.riddle}/3)<br>${ck(st.links.grove)} Звено берёзовой рощи${st.groveCleared ? '' : ' — забудки'}<br>${ck(st.links.kiki)} Звено Кикиморы — болото<br><i style="opacity:.8">Q — увидеть Нити Сказа</i>`;
  if (st.stage === 2) return '<b>📜 Цепь златая</b><br>• Скрепи цепь у дуба (F у ствола)';
  return `<b>✨ Лукоморье ожило</b><br>${st.pushkin ? '☑' : '•'} Послушай кота${st.pushkin ? '' : ' (и проверь, не ошибся ли он)'}<br>• Портал в Дремучий лес проснулся<br><span style="opacity:.8">Книга Сказов: ${st.book.length} · Слова: ${st.words.length}/5</span>`;
}

// ---------- цикл ----------
const clock = new THREE.Clock(); let T = 0; let started = false;
const tmpV = new THREE.Vector3();
function update(dt) {
  T += dt;
  // жизнь мира
  if (Math.abs(life - lifeTarget) > 0.002) { life += Math.sign(lifeTarget - life) * Math.min(Math.abs(lifeTarget - life), dt * (lifeTarget === 1 ? 0.28 : 0.4)); }
  if (Math.abs(life - lifeShown) > 0.004) { applyLife(life); lifeShown = life; }
  const skyTarget = tmpV; // unused helper
  const sky = SKY_GRAY.clone().lerp(SKY_LIVE, life); if (player.sight) sky.lerp(SKY_SIGHT, 0.55);
  scene.background.lerp(sky, Math.min(1, dt * 4)); scene.fog.color.copy(scene.background);

  // игрок
  const p = player; const canMove = started && !ui.busy() && !p.locked;
  if (canMove) {
    if (keys.has('ArrowLeft')) camYaw += dt * 2; if (keys.has('ArrowRight')) camYaw -= dt * 2;
    let ix = 0, iz = 0;
    if (keys.has('KeyW')) iz -= 1; if (keys.has('KeyS')) iz += 1; if (keys.has('KeyA')) ix -= 1; if (keys.has('KeyD')) ix += 1;
    const blocking = keys.has('KeyK') || mouseBlock;
    let speed = (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 9.5 : 6) * (p.speedT > 0 ? 1.6 : 1) * (blocking ? 0.45 : 1);
    if (ix || iz) {
      const l = Math.hypot(ix, iz); ix /= l; iz /= l;
      const sx = Math.sin(camYaw), cz = Math.cos(camYaw);
      const dx = ix * cz + iz * sx, dz = -ix * sx + iz * cz;
      p.pos.x += dx * speed * dt; p.pos.z += dz * speed * dt;
      const tf = Math.atan2(dx, dz); let df = tf - p.facing; df = Math.atan2(Math.sin(df), Math.cos(df)); p.facing += df * Math.min(1, dt * 12);
      p.walk += dt * speed * 1.6;
    } else p.walk *= 0.85;
    if (keys.has('Space') && p.onGround) { p.vy = 9; p.onGround = false; }
  }
  for (const c of colliders) { const dx = p.pos.x - c.x, dz = p.pos.z - c.z, d = Math.hypot(dx, dz), m = c.r + 0.4; if (d < m && d > 0.0001) { p.pos.x = c.x + (dx / d) * m; p.pos.z = c.z + (dz / d) * m; } }
  const r = Math.hypot(p.pos.x, p.pos.z); if (r > 52) { p.pos.x *= 52 / r; p.pos.z *= 52 / r; }
  const gh = Math.max(H(p.pos.x, p.pos.z), 0.05);
  p.vy -= 26 * dt; p.pos.y += p.vy * dt; if (p.pos.y <= gh) { p.pos.y = gh; p.vy = 0; p.onGround = true; }
  p.attackT = Math.max(0, p.attackT - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.buffT = Math.max(0, p.buffT - dt); p.speedT = Math.max(0, p.speedT - dt); p.luckCd = Math.max(0, p.luckCd - dt);
  if (p.sight) { p.word -= dt * 9; if (p.word <= 0) { p.word = 0; toggleSight(false); ui.toast('Слово иссякло. Отдохни у костра.'); } }
  else p.word = Math.min(100, p.word + dt * 2.5);
  if (p.pos.distanceTo(FIRE3) < 4) { p.word = Math.min(100, p.word + dt * 30); if (T % 1.5 < dt) p.hp = Math.min(p.maxHp, p.hp + 1); }

  ivan.position.copy(p.pos); ivan.rotation.y = p.facing;
  const u = ivan.userData; const sw = Math.sin(p.walk) * 0.7 * Math.min(1, p.walk);
  u.legL.rotation.x = sw; u.legR.rotation.x = -sw; u.armL.rotation.x = -sw * 0.8;
  u.armR.rotation.x = p.attackT > 0 ? -Math.PI / 2 * Math.sin((p.attackT / 0.38) * Math.PI) - 0.3 : (keys.has('KeyK') || mouseBlock) ? -1.3 : sw * 0.8;
  ivan.scale.setScalar(p.buffT > 0 ? 1.15 : 1);
  document.getElementById('hurtFx').style.opacity = p.hurtT > 0 ? 1 : 0;

  // враги
  for (const e of enemies) {
    if (e.dying > 0) { e.dying -= dt; e.g.scale.setScalar(Math.max(0.01, e.dying)); e.g.position.y += dt; if (e.dying <= 0) e.g.visible = false; continue; }
    if (!e.alive) continue;
    const d = p.pos.clone().sub(e.g.position); d.y = 0; const dist = d.length();
    const aggro = dist < 13 && canMove;
    const target = aggro ? p.pos : e.home;
    const to = new THREE.Vector3(target.x - e.g.position.x, 0, target.z - e.g.position.z);
    if (to.length() > (aggro ? 1.1 : 0.5)) { to.normalize().multiplyScalar((aggro ? 3.4 : 1.5) * dt); e.g.position.add(to); }
    e.g.position.addScaledVector(e.kb, dt); e.kb.multiplyScalar(Math.pow(0.02, dt));
    e.g.position.y = H(e.g.position.x, e.g.position.z) + 1.3 + Math.sin(T * 2 + e.ph) * 0.25;
    e.g.lookAt(p.pos.x, e.g.position.y, p.pos.z);
    e.cd -= dt; if (aggro && dist < 1.4 && e.cd <= 0) { e.cd = 1.3; damagePlayer(e); }
    e.flash -= dt;
    const m = e.g.userData.mat;
    m.emissive.setHex(e.flash > 0 ? 0xffffff : p.sight ? 0x806010 : 0x000000);
  }

  // нити и тайники
  for (const k in threads) { const th = threads[k]; th.g.visible = p.sight && st.stage >= 1 && !st.links[k]; th.glow.material.opacity = 0.18 + 0.12 * Math.sin(T * 4); }
  GROVE_LINK.visible = st.groveCleared && !st.links.grove && p.sight;
  GROVE_LINK.rotation.y += dt * 2;
  if (st.groveCleared && !st.links.grove && !p.sight && !st.seenGroveHint && Math.hypot(p.pos.x - GROVE.x, p.pos.z - GROVE.y) < 5) { st.seenGroveHint = true; ui.toast('Здесь что-то есть… Попробуй Сказительский взгляд (Q).'); }

  // мир
  const sp = seaGeo.attributes.position; for (let i = 0; i < sp.count; i++) { const x = seaBaseY[i * 3], z = seaBaseY[i * 3 + 2]; sp.setY(i, Math.sin(x * 0.12 + T * 1.3) * 0.15 + Math.cos(z * 0.1 + T) * 0.15); }
  sp.needsUpdate = true;
  flame.scale.set(1 + Math.sin(T * 13) * 0.08, 1 + Math.sin(T * 9) * 0.15, 1); flame2.scale.y = 1 + Math.sin(T * 17) * 0.2;
  fireLight.intensity = 16 + Math.sin(T * 11) * 3 + Math.sin(T * 7.3) * 2;
  if (Math.random() < dt * 4) burst(FIRE3.clone().setY(FIRE3.y + 1.2), 0xffa040, 3, 1.2, 1, 0.12);
  portalDisc.rotation.z += dt; swirl.rotation.z -= dt * 2;
  if (st.restored) { portalMat.color.lerp(new THREE.Color(0x2f9e5a), dt); portalMat.opacity = Math.min(0.75, portalMat.opacity + dt * 0.3); swirl.material.opacity = Math.min(0.9, swirl.material.opacity + dt * 0.3); }
  mermaid.userData.tail.rotation.x = Math.sin(T * 1.6) * 0.25;
  kiki.position.y = KIKI_POS.y + Math.sin(T * 1.2) * 0.05; if (kiki.userData.giggle > 0) { kiki.userData.giggle -= dt; kiki.rotation.z = Math.sin(T * 30) * 0.08; } else kiki.rotation.z = 0;
  cat.userData.tail.rotation.z = Math.sin(T * 2) * 0.3;
  if (st.restored && !ui.dialogOpen) {
    const a = T * 0.35; const rr = 2.7; cat.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); cat.position.y = H(cat.position.x, cat.position.z); cat.rotation.y = -a + Math.PI;
  } else if (!st.restored) { cat.position.copy(CAT_HOME); }
  if (ui.dialogOpen) { const d = p.pos.clone().sub(cat.position); if (d.length() < 4) cat.rotation.y = Math.atan2(d.x, d.z); }
  chainLinks.forEach((l, i) => (l.material.emissive.setHex(st.restored ? 0x553300 : 0x221100)));

  // бабочки
  const bk = smooth(0.8, 1, life);
  butterflies.forEach((b) => { b.g.visible = bk > 0.01; if (!b.g.visible) return; const t = T * 0.6 + b.ph; b.g.position.set(b.home.x + Math.sin(t) * 3, H(b.home.x, b.home.z) + 1.2 + Math.sin(t * 2.3) * 0.6, b.home.z + Math.cos(t * 0.8) * 3); b.g.rotation.y = t; const fl = Math.sin(T * 18 + b.ph) * 0.9; b.p1.rotation.y = fl; b.p2.rotation.y = -fl; b.g.scale.setScalar(bk); });

  // частицы, кольцо
  for (let i = bursts.length - 1; i >= 0; i--) {
    const bs = bursts[i]; bs.t += dt; const arr = bs.pts.geometry.attributes.position.array;
    bs.v.forEach((v, j) => { v.y -= 2.5 * dt; arr[j * 3] += v.x * dt; arr[j * 3 + 1] += v.y * dt; arr[j * 3 + 2] += v.z * dt; });
    bs.pts.geometry.attributes.position.needsUpdate = true; bs.pts.material.opacity = 1 - bs.t / bs.life;
    if (bs.t >= bs.life) { scene.remove(bs.pts); bs.pts.geometry.dispose(); bs.pts.material.dispose(); bursts.splice(i, 1); }
  }
  if (ringT >= 0) { ringT += dt; const s = ringT * 28; ring.scale.setScalar(s); ring.material.opacity = Math.max(0, 0.8 - ringT * 0.27); if (ringT > 3) ringT = -1; }

  // камера
  const tgt = p.pos.clone().add(new THREE.Vector3(0, 1.7, 0));
  const cp = new THREE.Vector3(Math.sin(camYaw) * Math.cos(camPitch) * camDist, Math.sin(camPitch) * camDist, Math.cos(camYaw) * Math.cos(camPitch) * camDist).add(tgt);
  cp.y = Math.max(cp.y, H(cp.x, cp.z) + 0.6, 0.6);
  camera.position.lerp(cp, Math.min(1, dt * 10)); camera.lookAt(tgt);
  sun.position.copy(p.pos).add(new THREE.Vector3(25, 45, 18)); sun.target.position.copy(p.pos);

  // HUD
  if (started) {
    ui.hud(p); ui.tracker(trackerHtml());
    const it = canMove ? nearest() : null; ui.prompt(it ? `F — ${it.label}` : '');
  }
}
function loop() { const dt = Math.min(0.05, clock.getDelta()); update(dt); renderer.render(scene, camera); requestAnimationFrame(loop); }

// ---------- старт ----------
function startGame(cont) {
  S.init();
  if (cont) { try { st = Object.assign(freshState(), JSON.parse(localStorage.getItem(SAVE_KEY))); } catch { st = freshState(); } }
  else { st = freshState(); save(); }
  if (st.restored) { GAPS.forEach((g) => (chainLinks[g].visible = true)); S.startMusic(); }
  life = lifeTarget = baseLife(); lifeShown = -1;
  spawnEnemies();
  document.getElementById('title').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  started = true;
  if (!cont) setTimeout(() => ui.toast('Ты просыпаешься на берегу Лукоморья. Всё вокруг серое…', false, 4000), 600);
}
document.getElementById('btnNew').onclick = () => startGame(false);
if (localStorage.getItem(SAVE_KEY)) { const b = document.getElementById('btnCont'); b.classList.remove('hidden'); b.onclick = () => startGame(true); }
// фон титульного экрана: медленный облёт
camera.position.set(20, 12, 20); camera.lookAt(0, 4, 0);
applyLife(life); lifeShown = life;
window.__game = { st: () => st, player, startGame, ui, enemies, attack, toggleSight, setLife: (v) => (lifeTarget = v) };
loop();
