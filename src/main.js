// Тридевятое: Сказитель — вертикальный срез (Лукоморье · Иван · «Цепь златая»)
import * as THREE from 'three';
import { Sound } from './audio.js';
import { UI } from './ui.js';
import { loadModels, place, instanced, loadKits } from './assets.js';
import { initCharacters, makeChar, skinOf } from './characters.js';
import { uLife, lifeify, lifeifyTree } from './life.js';
import { initEvening, RETELL } from './evening.js';
window.__RET = RETELL;

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
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color(0x3f8fe0) }, bottom: { value: new THREE.Color(0xd8efff) } },
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y * 1.5 + 0.1, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, pow(h, 0.8)), 1.0); \n#include <colorspace_fragment>\n }',
});
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), skyMat); skyDome.renderOrder = -1; scene.add(skyDome);
const SKY = { topLive: new THREE.Color(0x3d8be0), botLive: new THREE.Color(0xcfeaff), topGray: new THREE.Color(0x7d858f), botGray: new THREE.Color(0xa9b0b6), topSight: new THREE.Color(0x2a1850), botSight: new THREE.Color(0x8a5aa0) };

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
const V2 = (x, y) => new THREE.Vector2(x, y);
const SWAMP = V2(27, -24), GROVE = V2(-30, 14), PORTAL = V2(-15, -36), FIRE = V2(9, 9);
const GARDEN = V2(-6, 30), STONE = V2(13, 18), PIKE = V2(35, 37), MOUSE = V2(-20, 32), KOLO_HOME = V2(24, 10);
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

// ---------- декор (Kenney Nature Kit, CC0, перекрашен в лубочную палитру) ----------
const MODEL_NAMES = ['tree_pineTallA', 'tree_pineTallB', 'tree_pineRoundC', 'tree_pineDefaultA', 'tree_detailed', 'tree_default', 'tree_oak', 'tree_fat', 'tree_plateau', 'tree_simple', 'flower_purpleA', 'flower_redA', 'flower_yellowA', 'flower_yellowB', 'flower_redB', 'mushroom_red', 'mushroom_redGroup', 'mushroom_tanGroup', 'plant_bush', 'plant_bushLarge', 'plant_bushDetailed', 'grass_large', 'grass_leafs', 'rock_largeA', 'rock_largeC', 'rock_smallA', 'rock_tallB', 'stone_tallA', 'stone_largeB', 'stump_old', 'stump_round', 'log', 'log_large', 'log_stack', 'lily_large', 'lily_small', 'crop_turnip', 'campfire_stones', 'canoe', 'sign', 'crops_dirtRow', 'crops_wheatStageB', 'crops_leafsStageB'];
const btnNew = document.getElementById('btnNew');
const prog = [0, 0, 0]; const showProg = () => (btnNew.textContent = `Загрузка… ${Math.round((prog[0] * 0.25 + prog[1] * 0.55 + prog[2] * 0.2) * 100)}%`);
const KIT_LIST = await (await fetch('assets/kits/index.json')).json();
const [{ models: MD }, { kits: KITS, anims: KIT_ANIMS }] = await Promise.all([
  loadModels(MODEL_NAMES, toon, (k) => { prog[0] = k; showProg(); }),
  loadKits(KIT_LIST, grad, lifeify, (k) => { prog[1] = k; showProg(); }),
  initCharacters(grad, (k) => { prog[2] = k; showProg(); }),
]);
btnNew.textContent = 'Новая сказка'; btnNew.disabled = false;
const P = (n, x, z, s = 1, ry = srand() * 6.28, dy = 0) => place(MD, scene, n, x, H(x, z) + dy, z, s, ry);
// экземпляр модели из текстурированного набора
function kit(path, x, z, s = 1, ry = 0, dy = 0, parent = scene, hf = H) {
  const src = KITS[path]; if (!src) { console.warn('нет модели', path); return new THREE.Group(); }
  const o = src.clone(true); o.position.set(x, hf(x, z) + dy, z); o.scale.setScalar(s); o.rotation.y = ry; parent.add(o); return o;
}
// животное из Kenney Cube Pets с анимациями (idle, walk, run, eat, dance, gesture-positive…)
const mixers = []; const chars = [];
function pet(path, s = 1) {
  const root = new THREE.Group(); const m = (KITS[path] || KITS['pets/cat']).clone(true); m.scale.setScalar(s); root.add(m);
  const mixer = new THREE.AnimationMixer(m); const actions = {}; (KIT_ANIMS[path] || []).forEach((c) => (actions[c.name] = mixer.clipAction(c)));
  let cur = null; const play = (n) => { const a = actions[n]; if (!a || a === cur) return; a.reset().play(); if (cur) cur.crossFadeTo(a, 0.25, false); cur = a; };
  play('idle'); mixers.push(mixer); return { root, mixer, actions, play };
}
function npc(kind, opts) { const c = makeChar(kind, opts); chars.push(c); return c; }
const colliders = []; const camBlockers = [];
const trunkMat = toon(0x6b4423), leafA = toon(0x2f8f3a), leafB = toon(0x48a84f), birchMat = toon(0xf4f1e8), birchLeaf = toon(0x9ccc4a), birchSpot = toon(0x2a2a2a);
function birch(x, z) {
  const y = H(x, z); const hgt = 4.5 + srand() * 2; const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  M(new THREE.CylinderGeometry(0.17, 0.24, hgt, 7), birchMat, 0, hgt / 2, 0, g);
  for (let k = 0; k < 6; k++) { const a = k * 1.9; const sp = M(new THREE.BoxGeometry(0.16, 0.05, 0.04), birchSpot, Math.sin(a) * 0.2, 0.6 + (k * hgt) / 7, Math.cos(a) * 0.2, g); sp.rotation.y = a; }
  for (let k = 0; k < 3; k++) M(new THREE.IcosahedronGeometry(1.1 + srand() * 0.5, 0), birchLeaf, srand() - 0.5, hgt - 0.3 + k * 0.7, srand() - 0.5, g);
  colliders.push({ x, z, r: 0.5 }); camBlockers.push(g);
}
const PINES = ['tree_pineTallA', 'tree_pineTallB', 'tree_pineRoundC', 'tree_pineDefaultA'], LEAFY = ['tree_detailed', 'tree_default', 'tree_oak', 'tree_fat', 'tree_plateau', 'tree_simple'];
function tree(x, z) {
  const pine = srand() < 0.5; const n = pine ? PINES[Math.floor(srand() * 4)] : LEAFY[Math.floor(srand() * 6)];
  const o = P(n, x, z, pine ? 4 + srand() * 2.5 : 4.5 + srand() * 2.5); colliders.push({ x, z, r: 0.6 }); camBlockers.push(o);
}
const ZONES = [[SWAMP, 12], [GROVE, 10], [PORTAL, 7], [FIRE, 6], [GARDEN, 10], [STONE, 5], [PIKE, 7], [V2(10, 13), 5], [MOUSE, 3], [V2(0, 0), 9]];
const free = (x, z, extra = 0) => ZONES.every(([p, d]) => Math.hypot(x - p.x, z - p.y) > d + extra);
for (let i = 0; i < 95; i++) { const a = srand() * 6.28, r = 12 + srand() * 33, x = Math.cos(a) * r, z = Math.sin(a) * r; if (!free(x, z)) continue; if (srand() < 0.3) birch(x, z); else tree(x, z); }
for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; birch(GROVE.x + Math.cos(a) * 9, GROVE.y + Math.sin(a) * 9); }
const ROCKS = ['rock_largeA', 'rock_largeC', 'rock_tallB', 'stone_largeB'];
for (let i = 0; i < 24; i++) { const a = srand() * 6.28, r = 14 + srand() * 36, x = Math.cos(a) * r, z = Math.sin(a) * r; if (!free(x, z, -2)) continue; const sc = 2 + srand() * 2.5; const o = P(ROCKS[i % 4], x, z, sc, srand() * 6.28, -0.2); colliders.push({ x, z, r: sc * 0.3 }); camBlockers.push(o); }
for (let i = 0; i < 70; i++) { const a = srand() * 6.28, r = 8 + srand() * 38, x = Math.cos(a) * r, z = Math.sin(a) * r; if (!free(x, z, -3) || H(x, z) < 1) continue; P(['plant_bush', 'plant_bushLarge', 'plant_bushDetailed'][i % 3], x, z, 2.2 + srand() * 1.5); }
for (let i = 0; i < 34; i++) { const a = srand() * 6.28, r = 2 + srand() * 11; const c = i < 18 ? GROVE : SWAMP; const x = c.x + Math.cos(a) * r, z = c.y + Math.sin(a) * r; if (H(x, z) < 0.35) continue; P(['mushroom_red', 'mushroom_redGroup', 'mushroom_tanGroup'][i % 3], x, z, 2 + srand() * 1.5); }
[[-12, -14, 'stump_round'], [31, 2, 'stump_old'], [-38, -6, 'log_large'], [16, -30, 'log'], [6, 34, 'stump_round'], [-26, -16, 'log_stack']].forEach(([x, z, n]) => { P(n, x, z, 3); colliders.push({ x, z, r: 0.9 }); });
P('stump_old', MOUSE.x + 0.9, MOUSE.y, 3.2, 0.5); colliders.push({ x: MOUSE.x + 0.9, z: MOUSE.y, r: 0.6 });
// трава и цветы — инстансами
const grassT = [];
while (grassT.length < 1500) { const x = (srand() - 0.5) * 100, z = (srand() - 0.5) * 100, h = H(x, z); if (h < 1.1 || Math.hypot(x, z) > 47) continue; grassT.push({ p: new THREE.Vector3(x, h - 0.05, z), s: 2 + srand() * 1.6, ry: srand() * 6.28 }); }
instanced(MD.grass_leafs, grassT.slice(0, 900), scene); instanced(MD.grass_large, grassT.slice(900), scene);
const flowerSets = ['flower_purpleA', 'flower_redA', 'flower_yellowA', 'flower_yellowB', 'flower_redB'].map((n) => {
  const t = []; while (t.length < 75) { const x = (srand() - 0.5) * 96, z = (srand() - 0.5) * 96, h = H(x, z); if (h < 1.1 || Math.hypot(x, z) > 46) continue; t.push({ p: new THREE.Vector3(x, h - 0.05, z), s: 2.6 + srand() * 1.2, ry: srand() * 6.28 }); }
  return instanced(MD[n], t, scene);
});
let flowersK = -1;
function setFlowers(k) { k = Math.round(k * 50) / 50; if (k === flowersK) return; flowersK = k; flowerSets.forEach((f) => f.set(Math.max(0.0001, k))); }
// облака
const cloudMat = toon(0xffffff, {}, true); const clouds = [];
for (let i = 0; i < 14; i++) {
  const g = new THREE.Group(); const n = 4 + Math.floor(srand() * 4);
  for (let k = 0; k < n; k++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5 + srand() * 3, 0), cloudMat); c.position.set(k * 3 - n * 1.5, srand() * 1.5, srand() * 3 - 1.5); c.scale.y = 0.6; g.add(c); }
  const a = srand() * 6.28, r = 30 + srand() * 90; g.position.set(Math.cos(a) * r, 45 + srand() * 25, Math.sin(a) * r); g.userData.sp = 0.5 + srand(); scene.add(g); clouds.push(g);
}

// ---------- дуб и златая цепь ----------
const OAK = new THREE.Vector3(0, H(0, 0), 0);
const oak = new THREE.Group(); oak.position.copy(OAK); scene.add(oak);
M(new THREE.CylinderGeometry(1.1, 1.7, 8, 10), trunkMat, 0, 4, 0, oak);
const branch = M(new THREE.CylinderGeometry(0.3, 0.5, 5, 7), trunkMat, 2.4, 6.4, 0, oak); branch.rotation.z = -1.15;
const branch2 = M(new THREE.CylinderGeometry(0.3, 0.45, 4.5, 7), trunkMat, -2, 7, 1, oak); branch2.rotation.set(0.4, 0, 1.1);
[[0, 10, 0, 4.2, leafA], [3, 9, 1.5, 3, leafB], [-3, 9.4, -1, 3.2, leafB], [1, 11.8, -2, 2.8, leafA], [-1.5, 10.5, 2.8, 2.6, leafA], [4.5, 8, -1.5, 2.2, leafA]].forEach(([x, y, z, r, mat]) => M(new THREE.IcosahedronGeometry(r, 1), mat, x, y, z, oak));
colliders.push({ x: 0, z: 0, r: 1.9 }); camBlockers.push(oak);
// нижние ветви: на правой (к морю) сидит русалка, на левой ночью садится Жар-птица. Они выше кота и героя, и листва их не закрывает
const lowBranch = (y, ry, len, seatK = 0.72) => { const tl = 0.18, d = (k) => new THREE.Vector3(Math.cos(ry) * Math.cos(tl) * len * k, y + Math.sin(tl) * len * k, -Math.sin(ry) * Math.cos(tl) * len * k);
  const b = M(new THREE.CylinderGeometry(0.2, 0.42, len, 8), trunkMat, 0, 0, 0, oak); b.position.copy(d(0.5)); b.rotation.set(0, ry, -Math.PI / 2 + tl);
  const tipLeaf = d(1.05); M(new THREE.IcosahedronGeometry(0.8, 1), leafB, tipLeaf.x, tipLeaf.y + 0.3, tipLeaf.z, oak).scale.set(1, 0.6, 1);
  return d(seatK).add(new THREE.Vector3(0, 0.3, 0)); };
const MERMAID_SEAT = lowBranch(3.2, 0.12, 4.8); const FIREBIRD_SEAT = lowBranch(3.7, Math.PI - 0.3, 4.4, 0.8);
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
P('campfire_stones', FIRE.x, FIRE.y, 3.2, 0);
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
for (let i = 0; i < 16; i++) { const a = srand() * 6.28, r = 1 + srand() * 7; place(MD, scene, i % 2 ? 'lily_large' : 'lily_small', SWAMP.x + Math.cos(a) * r, 0.32, SWAMP.y + Math.sin(a) * r, 2.5, srand() * 6.28); }
const KIKI_POS = new THREE.Vector3(SWAMP.x - 4, Math.max(H(SWAMP.x - 4, SWAMP.y + 3), 0.3), SWAMP.y + 3);

// ---------- персонажи ----------
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

const heroes = { ivan: makeChar('ivan'), vasilisa: makeChar('vasilisa'), finist: makeChar('finist') };
Object.values(heroes).forEach((h) => { h.root.visible = false; scene.add(h.root); });
const ivan = heroes.ivan.root; ivan.visible = true;
const catPet = pet('pets/cat', 1.25); const cat = catPet.root; scene.add(cat);
const CAT_HOME = new THREE.Vector3(3.2, H(3.2, 3.2), 3.2); cat.position.copy(CAT_HOME); cat.rotation.y = 0.6;
const mermaid = makeMermaid(); oak.add(mermaid); mermaid.position.copy(MERMAID_SEAT); mermaid.position.y += 0.05; mermaid.rotation.y = 0.75; mermaid.scale.setScalar(1.15);
const MERMAID_GROUND = new THREE.Vector3(5.2, H(5.2, 1.2), 1.2);
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
const freshState = () => ({ stage: 0, links: { mermaid: false, grove: false, kiki: false }, riddle: 0, laugh: 0, groveCleared: false, restored: false, pushkin: false, words: [], book: [], seenGroveHint: false, heroes: ['ivan'], hero: 'ivan', region: 'luk', forest: {}, mount: {}, river: {}, kosh: {}, ending: null, festival: false, turnip: 0, pike: 0, kolobok: 0, feathers: [false, false, false, false, false, false, false], stoneReads: 0 });
let st = freshState();
const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(st));
const linkCount = () => Object.values(st.links).filter(Boolean).length;

const player = { pos: new THREE.Vector3(10, 0, 13), vy: 0, facing: Math.PI, onGround: true, hp: 5, maxHp: 5, word: 100, attackT: 0, hurtT: 0, buffT: 0, speedT: 0, luckCd: 0, walk: 0, sight: false, locked: false, hero: 'ivan', jumps: 0, dashT: 0, hidden: 0, hiddenModel: false, slow: 0, stepPh: 0, sightCost: 1, cold: 0 };
let camYaw = 0.6, camPitch = 0.3, camDist = 8, sens = 1;

// враги
const enemies = [];
function spawnEnemies() {
  removeEnemies('grove');
  if (st.groveCleared) return;
  for (let i = 0; i < 3; i++) {
    const g = makeForgetling(); (typeof lukGroup !== 'undefined' ? lukGroup : scene).add(g);
    const home = new THREE.Vector3(GROVE.x + Math.cos(i * 2.1) * 3.5, 0, GROVE.y + Math.sin(i * 2.1) * 3.5);
    g.position.set(home.x, H(home.x, home.z) + 1.2, home.z);
    enemies.push({ g, home, hp: 3, alive: true, cd: 0, kb: new THREE.Vector3(), flash: 0, dying: 0, ph: i * 2, group: 'grove' });
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
  S.setColor(L); uLife.value = L;
}
function baseLife() { return st.restored ? 1 : 0.12 + 0.11 * linkCount(); }

// ---------- ввод ----------
const keys = new Set(); let mouseBlock = false;
addEventListener('keydown', (e) => {
  if (!started) return;
  keys.add(e.code);
  if (ui.dialogOpen) return;
  if (e.code === 'KeyP' || (e.code === 'Escape' && !settingsEl.classList.contains('hidden'))) { toggleSettings(settingsEl.classList.contains('hidden')); return; }
  if (!settingsEl.classList.contains('hidden')) return;
  if (e.code === 'KeyB') { ui.book(st, !ui.bookOpen); if (ui.bookOpen) document.exitPointerLock(); return; }
  if (ui.bookOpen) return;
  if (player.locked) return;
  if (e.code === 'KeyQ') toggleSight();
  if (e.code === 'KeyF' || e.code === 'KeyE') interact();
  if (e.code === 'KeyJ') attack();
  if (e.code === 'KeyR') ability();
  if (e.code === 'Space') jump();
  if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') switchHero(['ivan', 'vasilisa', 'finist'][+e.code.slice(5) - 1]);
  if (e.code === 'KeyH') document.getElementById('help').classList.toggle('hidden');
  if (e.code === 'KeyT') teleport();
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
  camYaw -= e.movementX * 0.0028 * sens; camPitch = Math.min(1.25, Math.max(0.05, camPitch + e.movementY * 0.0022 * sens * (OPT.invY ? -1 : 1)));
});
addEventListener('wheel', (e) => { camDist = Math.min(16, Math.max(4, camDist + e.deltaY * 0.01)); });

// ---------- механики ----------
function toggleSight(force) {
  const on = force !== undefined ? force : !player.sight;
  if (on && player.word < 5) { ui.toast('Не хватает Слова. Отдохни у костра.'); S.wrong(); return; }
  if (on === player.sight) return;
  player.sight = on; document.body.classList.toggle('sight', on); S.sight(on);
}
function hurtEnemy(e, dmg, from) {
  if (!e.alive) return false;
  if (e.cond && !e.cond()) { e.flash = 0.1; if (e.immune) ui.toast(e.immune, false, 1400); return false; }
  const d = e.g.position.clone().sub(from); d.y = 0; d.normalize();
  e.hp -= dmg; e.flash = 0.2; e.kb.copy(d).multiplyScalar(9 * (e.heavy ? 0.2 : 1));
  burst(e.g.position, 0xffffff, 12, 3, 0.5, 0.18);
  if (e.hp <= 0) { e.alive = false; e.dying = 1; S.sleep(); ui.toast((e.name || 'Забудка') + ' уснула 💤'); burst(e.g.position, 0xffe27a, 40, 4, 1.2); e.onDeath && e.onDeath(e); if (e.group === 'grove') checkGrove(); }
  return true;
}
const hittables = []; // {pos(), r, cond(), onHit(hero)} — то, что можно ударить (лёд, сундук…)
const orbs = [];
function attack() {
  if (player.attackT > 0 || ui.busy() || player.locked) return;
  const hero = player.hero; const H0 = heroes[hero];
  player.attackT = hero === 'finist' ? 0.26 : 0.38; S.swing();
  H0.once(hero === 'vasilisa' ? 'interact-right' : 'attack-melee-right', 'idle', hero === 'finist' ? 1.7 : 1.3);
  const fwd = new THREE.Vector3(Math.sin(player.facing), 0, Math.cos(player.facing));
  if (hero === 'vasilisa') { // волшебный огонёк-клубок: летит к ближайшей цели впереди
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshBasicMaterial({ color: 0x9fe8ff }));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); m.add(glow);
    m.position.copy(player.pos).add(new THREE.Vector3(0, 1.4, 0)).addScaledVector(fwd, 0.8); scene.add(m);
    let tgt = null, best = 18;
    const consider = (q, extra) => { const d = q.clone().sub(m.position); const L = d.length(); if (L < best + extra && L > 0.5) { const f = d.clone().setY(0).normalize().dot(fwd); if (f > 0.55) { best = L - extra; tgt = q; } } };
    for (const e of enemies) if (e.alive && e.g.parent?.visible) consider(e.g.position.clone(), 0);
    for (const h of hittables) if (!h.cond || h.cond()) consider(h.pos(), 2);
    const v = tgt ? tgt.clone().sub(m.position).normalize().multiplyScalar(18) : fwd.clone().multiplyScalar(18);
    orbs.push({ m, v, t: 0, tgt }); S.magic(); return;
  }
  let hitAny = false; const reach = hero === 'finist' ? 3.2 : 2.8;
  for (const e of enemies) {
    if (!e.alive || !e.g.parent?.visible) continue;
    const d = e.g.position.clone().sub(player.pos); const dy = Math.abs(d.y); d.y = 0;
    if (d.length() < reach + (e.big || 0) && dy < 4 + (e.big || 0) && d.normalize().dot(fwd) > 0.2) {
      const dmg = (player.buffT > 0 ? 3 : 1) * (player.sight ? 2 : 1) * (hero === 'ivan' ? 1.5 : 1) * (player.dmgK || 1);
      if (hurtEnemy(e, dmg, player.pos)) hitAny = true;
    }
  }
  for (const h of hittables) { if (h.cond && !h.cond()) continue; const hp = h.pos(); const d = hp.clone().sub(player.pos); if (Math.hypot(d.x, d.z) < (h.r || 3) + 0.8 && Math.abs(d.y) < (h.ry || 3)) { h.onHit(hero); hitAny = true; } }
  if (hitAny) S.hit();
  if (region === LUK && player.pos.distanceTo(KIKI_POS) < 3 && !st.links.kiki) { ui.toast('Кикимору силой не взять! Её надо… рассмешить. (F)'); S.laugh(); }
}
function checkGrove() {
  const g = enemies.filter((e) => e.group === 'grove');
  if (g.length && g.every((e) => !e.alive) && !st.groveCleared) {
    st.groveCleared = true; save();
    setTimeout(() => { ui.toast('Роща притихла… Что-то блеснуло — но глазами не видно.'); }, 900);
  }
}
const LUCK = [
  ['Богатырская сила! Урон ×3 на 8 секунд', () => (player.buffT = 8)],
  ['Апчхи! Иван чихнул — всех вокруг разметало!', () => { enemies.forEach((e) => { if (!e.alive || !e.g.parent?.visible) return; const d = e.g.position.clone().sub(player.pos); d.y = 0; if (d.length() < 9) { e.kb.copy(d.normalize()).multiplyScalar(22); hurtEnemy(e, 1, player.pos); } }); burst(player.pos.clone().setY(player.pos.y + 1.6), 0xffffff, 50, 8, 0.8); }],
  ['В кармане нашёлся пряник! +2 ❤', () => (player.hp = Math.min(player.maxHp, player.hp + 2))],
  ['Вороны засмеялись… и всё. Зато весело! 😄', () => {}],
  ['Попутный ветер! Скорость ×1.6 на 8 секунд', () => (player.speedT = 8)],
];
function ability() {
  if (ui.busy() || player.locked) return;
  if (player.luckCd > 0) { ui.toast(player.hero === 'ivan' ? 'Удача ещё не вернулась.' : 'Сила ещё не вернулась.'); return; }
  const h = player.hero;
  if (h === 'ivan') { const [txt, fn] = LUCK[Math.floor(Math.random() * LUCK.length)]; fn(); player.luckCd = 25; ui.toast('🍀 ' + txt); S.chime(); heroes.ivan.once('emote-yes'); }
  else if (h === 'vasilisa') {
    player.hp = Math.min(player.maxHp, player.hp + 2); player.word = Math.min(100, player.word + 40); player.luckCd = 30; S.magic(); heroes.vasilisa.once('emote-yes');
    burst(player.pos.clone().setY(player.pos.y + 1.4), 0x9fe8ff, 40, 4, 1);
    const [, txt] = objective(); ui.toast('📘 Премудрость: +2 ❤, +Слово. Подсказка: ' + txt, false, 4500);
  } else if (h === 'finist') { player.dashT = 0.28; player.luckCd = 3.5; S.dash(); burst(player.pos.clone().setY(player.pos.y + 1), 0xffe0a0, 20, 3, 0.5); player.vy = Math.max(player.vy, 3); }
}
function heroLabel() {
  const h = player.hero; const cd = player.luckCd;
  const nm = h === 'ivan' ? '🍀 R — Удача дурака' : h === 'vasilisa' ? '📘 R — Премудрость' : '🦅 R — рывок · Пробел×2 — полёт';
  return `${HERO_NAME[h]} · ${cd <= 0 ? nm + ': готово' : nm.replace(/R — /, '') + ': ' + Math.ceil(cd) + ' с'}`;
}
function jump() {
  const p = player; if (ui.busy() || p.locked) return;
  if (p.onGround) { p.vy = p.hero === 'finist' ? 10 : 9; p.onGround = false; p.jumps = 1; S.jump(); }
  else if (p.hero === 'finist' && p.jumps < 2) { p.vy = 11; p.jumps = 2; S.dash(); burst(p.pos.clone().setY(p.pos.y + 1), 0xffe0a0, 14, 3, 0.5); }
}
function damagePlayer(e) {
  const toE = e.g.position.clone().sub(player.pos); toE.y = 0; toE.normalize();
  const fwd = new THREE.Vector3(Math.sin(player.facing), 0, Math.cos(player.facing));
  const blocking = keys.has('KeyK') || mouseBlock;
  if (blocking && fwd.dot(toE) > 0.1) { ui.toast('Блок!', false, 800); e.kb.copy(toE).multiplyScalar(12); S.hit(); return; }
  e.kb.copy(toE).multiplyScalar(6); hurtPlayer(e.dmg || 1);
}
function hurtPlayer(n = 1, why, force = false) {
  if (player.hurtT > 0 && !force) return; if (player.locked && !force) return;
  player.hp -= n; player.hurtT = 0.5; S.hurt(); shake(0.25); heroes[player.hero].once('emote-no', 'idle', 2);
  if (why) ui.toast(why, false, 2200);
  if (player.hp <= 0) fallAsleep();
}
let shakeT = 0; const shake = (k = 0.4) => (shakeT = Math.max(shakeT, k));
async function fallAsleep() {
  player.locked = true; const fade = document.getElementById('fade'); fade.style.opacity = 1; toggleSight(false);
  ui.toast(`${HERO_NAME[player.hero]} засыпает… Сказки не умирают — они засыпают.`, true, 3000);
  await wait(1400);
  if (region === LUK) { player.pos.set(FIRE3.x + 2, FIRE3.y, FIRE3.z + 2.5); spawnEnemies(); }
  else { const sp = region.spawn(); player.pos.set(sp.x, groundH(sp.x, sp.z), sp.z); region.onSleep && region.onSleep(); }
  player.hp = player.maxHp; player.word = 100; player.luckCd = 0; player.cold = 0; player.vy = 0;
  fade.style.opacity = 0; player.locked = false;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- интерактив ----------
const interactables = [
  { label: 'Поговорить с Котом учёным', pos: () => cat.position, r: 3.2, act: () => catTalk() },
  { label: 'Послушать Кота учёного', pos: () => cat.position, r: 3.6, prio: 6, cond: () => st.festival && !st.finalTale, act: () => finalTale() },
  { label: 'Окликнуть русалку на ветвях', pos: () => MERMAID_GROUND, r: 3.5, cond: () => !st.links.mermaid, act: () => mermaidTalk() },
  { label: 'Говорить с Кикиморой', pos: () => KIKI_POS, r: 3.5, cond: () => !st.links.kiki, act: () => kikiTalk() },
  { label: 'Поднять звено цепи', pos: () => GROVE_LINK.position, r: 2.8, cond: () => st.groveCleared && !st.links.grove && player.sight, act: () => getLink('grove', GROVE_LINK.position) },
  { label: 'Скрепить златую цепь', pos: () => OAK, r: 4.8, prio: 5, cond: () => st.stage === 2, act: () => restore() },
  { label: 'Посидеть у костра', pos: () => FIRE3, r: 3, act: () => fireTalk() },
  { label: 'Коснуться портала', pos: () => PORTAL3, r: 4, act: () => portalTalk() },
  { label: 'Прочитать надпись на камне', pos: () => STONE3, r: 3.2, act: () => stoneTalk() },
  { label: 'Поговорить с Дедом', pos: () => ded.position, r: 3.2, act: () => dedTalk() },
  { label: 'Тянуть репку!', pos: () => TURNIP3, r: 3.2, prio: 2, cond: () => st.turnip === 2, act: () => pullTurnip() },
  { label: 'Позвать мышку-норушку', pos: () => MOUSE3, r: 2.8, cond: () => st.turnip < 2 && player.sight, act: () => mouseTalk() },
  { label: 'Помочь щуке', pos: () => PIKE3, r: 3.2, cond: () => !st.pike, act: () => pikeTalk() },
  { label: 'Спросить Колобка, куда идти', pos: () => kolobok.position, r: 2.4, cond: () => st.kolobok === 1, act: () => koloTalk() },
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
async function finalTale() {
  const E = { break: 'Ты сломал иглу — и Кощей сгинул. Так кончаются многие сказки.', cycle: 'Ты вернул иглу в сундук — и Кощей уснул. Сказка замкнулась в кольцо: однажды её расскажут снова.', new: 'Ты рассказал Кощею его собственную сказку — и даже он вспомнил, как жить. Такого финала не знала ни одна книга!' }[st.ending] || '';
  await ui.say(CAT, ['Мур-р… Вот и рассказана сказка, Сказитель. Лес помнит Ягу, горы — Морозко, реки — Алёнушку с братцем.', E, 'А знаешь, что главное? Сказки не умирают — их рассказывают. Пока ты помнишь — Тридевятое живо.', `Ты собрал сказов: ${st.book.length + 1} из ${BOOK_TOTAL}, заветных слов: ${st.words.length} из ${WORDS_TOTAL}. ${st.words.length < WORDS_TOTAL ? 'Начни сказку заново — может, найдёшь другой финал!' : 'Все слова — твои. Настоящий Сказитель!'}`]);
  st.finalTale = true; addBook('Сказитель', 'Однажды Тридевятое царство всё забыло — и стало серым. Пришёл Сказитель, вспомнил сказки одну за другой, и мир снова ожил. С тех пор у Лукоморья, у дуба зелёного, каждый вечер рассказывают эту историю.'); save(); S.fanfare();
}
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
      ui.toast(`Найдено забытое слово 1/${WORDS_TOTAL}`, true);
    } else await ui.say(CAT, ['Мур-р… Ну, раз ты так говоришь. (Кот хитро щурится. Кажется, он что-то перепутал.)']);
    return;
  }
  if (st.book.length >= 5) { await ui.say(CAT, ['Пять сказов в твоей Книге, Сказитель! Лукоморье помнит себя целиком.', 'Скажу тебе тайну: Кощей тоже когда-то был сказителем. Его забыли — и он решил забыть всех. Найди все забытые слова — и узнаешь его настоящее имя.', 'А теперь — в Дремучий лес. Баба-Яга ждёт… хоть сама и не помнит, что ждёт.']); return; }
  await ui.say(CAT, ['Портал в Дремучий лес проснулся. Но не спеши: в Лукоморье ещё остались забытые сказки. Дед с репкой, щука на берегу, Колобок… Собери все пять сказов.']);
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
  if (st.restored && EV) { await EV.fireMenu(); return; }
  await ui.say(IVAN, ['Костёр — единственное, что тут ещё помнит, каким бывает тепло. (Здоровье и Слово восполнены.)']);
}
async function portalTalk() {
  if (!st.restored) { await ui.say(IVAN, ['Каменная арка. Внутри — серая муть. Нить Лукоморья порвана, дальше дороги нет.']); return; }
  const opts = [['forest', '🌲 Дремучий лес — избушка Бабы-Яги', true], ['mount', '🏔 Ледяные горы — царство Морозко', st.forest.done], ['river', '🌊 Молочные реки — гуси-лебеди', st.mount.done], ['kosh', '💀 Царство Кощея Бессмертного', st.river.done]];
  const open = opts.filter((o) => o[2] && CHAPTER_READY.has(o[0]));
  if (!open.length) { await ui.say('Портал', ['Из арки тянет хвоей и дымом. Где-то далеко скрипят куриные ноги избушки…', 'Дорога в Дремучий лес ещё не проложена. (Продолжение — в следующей версии.)']); return; }
  const c = await ui.dialog('Портал', 'Из арки тянет ветрами всех сказок. Куда шагнуть?', [...open.map((o) => o[1]), 'Остаться в Лукоморье']);
  if (c >= 0 && c < open.length) await travel(open[c][0]);
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

// ---------- контур (cel-look) ----------
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a120a, side: THREE.BackSide });
function outline(root, k = 1.07) {
  const list = []; root.traverse((o) => { if (o.isMesh && !o.userData.isOutline) list.push(o); });
  list.forEach((o) => { o.geometry.computeBoundingSphere(); if (o.geometry.boundingSphere.radius < 0.08) return; const m = new THREE.Mesh(o.geometry, outlineMat); m.userData.isOutline = true; m.scale.setScalar(k); o.add(m); });
}
[mermaid, kiki].forEach((g) => outline(g));

// ---------- новые сказки: персонажи ----------
function makeMouse() {
  const g = new THREE.Group(); const fur = toon(0x9a9aa2), pink = toon(0xffa8b8), e = toon(0x111111, {}, true);
  M(new THREE.SphereGeometry(0.22, 10, 8), fur, 0, 0.2, 0, g).scale.set(0.9, 0.85, 1.3);
  M(new THREE.SphereGeometry(0.14, 10, 8), fur, 0, 0.3, 0.27, g);
  [-0.1, 0.1].forEach((x) => { M(new THREE.SphereGeometry(0.08, 8, 6), pink, x, 0.45, 0.22, g).scale.z = 0.4; M(new THREE.SphereGeometry(0.025, 6, 6), e, x * 0.6, 0.34, 0.39, g); });
  const t = M(new THREE.TorusGeometry(0.2, 0.02, 4, 10, Math.PI), pink, 0, 0.2, -0.38, g); t.rotation.y = Math.PI / 2;
  return g;
}
function makeKolobok() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const dough = toon(0xf2b84b), e = toon(0x2a1a0a, {}, true), cheek = toon(0xff8a7a), mouth = toon(0x8a2a1a, {}, true);
  M(new THREE.SphereGeometry(0.5, 16, 12), dough, 0, 0, 0, body);
  [-0.16, 0.16].forEach((x) => { M(new THREE.SphereGeometry(0.06, 8, 6), e, x, 0.12, 0.45, body); M(new THREE.SphereGeometry(0.08, 8, 6), cheek, x * 1.7, -0.02, 0.4, body).scale.z = 0.4; });
  const sm = M(new THREE.TorusGeometry(0.15, 0.03, 6, 12, Math.PI), mouth, 0, -0.05, 0.46, body); sm.rotation.z = Math.PI;
  g.userData.body = body; return g;
}
function makePike() {
  const g = new THREE.Group(); const scale = toon(0x6f8f5a), belly = toon(0xd8dcc0), fin = toon(0xc0603a), teeth = toon(0xffffff, {}, true), e = toon(0xffd23f);
  M(new THREE.SphereGeometry(0.4, 14, 10), scale, 0, 0.3, 0, g).scale.set(0.7, 0.6, 2.2);
  M(new THREE.SphereGeometry(0.35, 12, 8), belly, 0, 0.22, 0.05, g).scale.set(0.6, 0.4, 2);
  const tail = M(new THREE.ConeGeometry(0.3, 0.5, 4), fin, 0, 0.3, -1.05, g); tail.rotation.x = -Math.PI / 2; tail.scale.x = 0.25;
  M(new THREE.ConeGeometry(0.12, 0.35, 4), fin, 0, 0.6, -0.2, g).scale.z = 0.3;
  for (let i = 0; i < 4; i++) M(new THREE.ConeGeometry(0.025, 0.08, 4), teeth, -0.06 + i * 0.04, 0.24, 0.85, g).rotation.x = Math.PI;
  [-0.14, 0.14].forEach((x) => M(new THREE.SphereGeometry(0.05, 6, 6), e, x, 0.42, 0.62, g));
  g.userData.tail = tail; return g;
}
function makeFeather() {
  const g = new THREE.Group();
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.0, 6), new THREE.MeshBasicMaterial({ color: 0xff7a1a })); f.scale.z = 0.25; f.position.y = 0.5; g.add(f);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe14a })); tip.position.y = 0.15; g.add(tip);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff9a2a, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })); glow.position.y = 0.5; g.add(glow);
  g.rotation.z = 0.5; return g;
}

const STONE3 = new THREE.Vector3(STONE.x, H(STONE.x, STONE.y), STONE.y);
const stone = P('stone_tallA', STONE.x, STONE.y, 4.5, 0.4); colliders.push({ x: STONE.x, z: STONE.y, r: 1 }); camBlockers.push(stone);

// огород деда
const GARDEN3 = new THREE.Vector3(GARDEN.x, H(GARDEN.x, GARDEN.y), GARDEN.y);
for (let r = -1; r <= 1; r++) for (let c = -2; c <= 2; c++) { if (r === 0 && c === 0) continue; P('crops_dirtRow', GARDEN.x + c * 1.6, GARDEN.y + r * 2.4, 2.6, 0); P(r === 1 ? 'crops_wheatStageB' : 'crops_leafsStageB', GARDEN.x + c * 1.6, GARDEN.y + r * 2.4, 2.6, 0, 0.1); }
const TURNIP3 = GARDEN3.clone();
const turnip = P('crop_turnip', GARDEN.x, GARDEN.y, 6, 0, -1.6);
colliders.push({ x: GARDEN.x, z: GARDEN.y, r: 1.2 });
const dedC = npc('ded'); const ded = dedC.root; ded.position.set(GARDEN.x + 2.6, H(GARDEN.x + 2.6, GARDEN.y - 1.5), GARDEN.y - 1.5); ded.rotation.set(0, Math.atan2(-ded.position.x, -ded.position.z), 0); /* только поворот по Y: lookAt давал наклон x=π, и покачивание по z переворачивало Деда под землю */ scene.add(ded);
colliders.push({ x: ded.position.x, z: ded.position.z, r: 0.5 });
P('sign', GARDEN.x - 5, GARDEN.y - 4, 3, 0.6);
const mouse = makeMouse(); const MOUSE3 = new THREE.Vector3(MOUSE.x, H(MOUSE.x, MOUSE.y), MOUSE.y); mouse.position.copy(MOUSE3); scene.add(mouse);

// щука на берегу
const PIKE3 = new THREE.Vector3(PIKE.x, Math.max(H(PIKE.x, PIKE.y), 0.1), PIKE.y);
const pike = makePike(); pike.position.copy(PIKE3); pike.rotation.y = 0.9; scene.add(pike); outline(pike);
P('canoe', PIKE.x - 4, PIKE.y + 1, 3.5, 2.2, 0.05);

// колобок
const kolobok = makeKolobok(); kolobok.position.set(KOLO_HOME.x + 8, 0, KOLO_HOME.y); scene.add(kolobok); outline(kolobok, 1.05);
const kolo = { a: 0, cd: 0, sang: 0, vel: new THREE.Vector3() };

// перья Жар-птицы (3 из 7 видно только Сказительским взглядом)
const FEATHERS = [[-40, -10, 0], [38, -6, 1], [4, -42, 0], [-24, -26, 1], [18, 30, 0], [-43, 22, 1], [1, 21, 0]].map(([x, z, hidden], i) => {
  const g = makeFeather(); g.position.set(x, H(x, z) + 1, z); scene.add(g); return { g, hidden: !!hidden, i };
});

// ---------- новые сказки: диалоги ----------
const DED = 'Дед', MOUSEN = 'Мышка-норушка', PIKEN = 'Щука', KOLO = 'Колобок';
function addBook(title, text) {
  if (st.book.some((b) => b.title === title)) return;
  st.book.push({ title, text }); save(); ui.toast(`📖 Новый сказ в Книге: «${title}» (${st.book.length}/${BOOK_TOTAL})`, false, 3500);
  if (st.book.length === 5) setTimeout(() => ui.toast('Все сказы Лукоморья собраны! Кот учёный хочет тебе кое-что сказать.', true, 4500), 2500);
}
function addWord(word, text) { if (st.words.some((w) => w.word === word)) return; st.words.push({ word, text }); save(); S.chime(); ui.toast(`Найдено забытое слово ${st.words.length}/${WORDS_TOTAL}: «${word}»`, true); }
async function stoneTalk() {
  st.stoneReads++; save();
  if (st.stoneReads < 3) {
    await ui.say('Камень на распутье', ['Направо пойдёшь — к болоту придёшь, Кикиморе смех принесёшь.\nНалево пойдёшь — в берёзовой роще забудок найдёшь.\nПрямо пойдёшь — к дубу выйдешь, где кот учёный сказку забыл.', st.stoneReads === 1 ? 'Ниже кто-то нацарапал: «Ваня, не забудь поесть. — Мама».' : 'Буквы будто дрожат… Может, прочесть ещё раз?']);
    return;
  }
  await ui.say('Камень на распутье', ['Ты читаешь в третий раз — и проступают новые буквы. Закон трёх!', '«РАСПУТЬЕ — место, где дорога делится натрое. Выбирая путь, сказочный герой выбирает себя».']);
  addWord('Распутье', 'место, где дорога делится. Выбирая путь, герой выбирает, каким ему быть.');
}
async function dedTalk() {
  if (st.turnip === 0) {
    await ui.say(DED, ['Посадил дед репку. Выросла репка большая-пребольшая… А вытянуть некому!', 'Бабка, внучка, Жучка да кошка — все забыли, кто они, разбрелись по серости. Один я остался.']);
    const c = await ui.dialog(DED, 'Подсоби, молодец! Тянем-потянем?', ['Давай, дедушка!', 'Попозже, дед.']);
    if (c !== 0) return;
    st.turnip = 1; save();
    await ui.timing('Тянем-потянем!', 1.1);
    S.wrong();
    await ui.say(DED, ['Тянут-потянут — вытянуть не могут!', 'Эх… Не хватает самой малости. Позвать бы кого — хоть самого маленького.', 'У старого пня, к западу, мышка-норушка живёт. Да простым глазом её не увидишь — она от серости спряталась.']);
    return;
  }
  if (st.turnip === 1) { await ui.say(DED, ['Мышку найди, внучек. У старого пня, к западу от огорода. Смотри Сказительским взглядом.']); return; }
  if (st.turnip === 2) { await ui.say(DED, ['Мышка с нами! Ну, теперь берись за репку — тянем!']); return; }
  await ui.say(DED, ['Спасибо, внучек! Бабка с внучкой вернутся — кашу сварим. А ты помни: и самый маленький может всё решить.']);
}
async function mouseTalk() {
  if (st.turnip === 0) { await ui.say(MOUSEN, ['Пи! Ты меня видишь? Я мышка-норушка. Боюсь серости… Если кому помощь нужна — зови.']); return; }
  await ui.say(MOUSEN, ['Пи! Репку тянуть? Я? Я же самая маленькая!', 'Ну… раз без меня никак — побежали!']);
  st.turnip = 2; save(); S.chime(); burst(MOUSE3.clone().setY(MOUSE3.y + 0.5), 0xffffff, 20, 2, 0.8, 0.15);
  ui.toast('Мышка-норушка побежала к огороду деда');
}
async function pullTurnip() {
  await ui.say(DED, ['Дедка за репку, Иван за дедку, мышка за Ивана… Три раза дружно — и вытянем! Лови момент!']);
  let ok = 0;
  while (ok < 3) {
    const hit = await ui.timing(`Тянем-потянем! (${ok}/3)`, 1 + ok * 0.25);
    if (hit) { ok++; S.pluck(220 * (1 + ok * 0.25), 0, 0.2, 0.6); turnip.position.y += 0.4; heroes[player.hero].once('holding-both', 'idle', 1.4); dedC.once('holding-both', 'idle', 1.4); }
    else { S.wrong(); const c = await ui.dialog(DED, 'Ух! Не в лад потянули. Ещё разок?', ['Тянем!', 'Передохнём']); if (c === 1) { turnip.position.y = H(GARDEN.x, GARDEN.y) - 1.6; return; } }
  }
  const t0 = performance.now(), y0 = turnip.position.y;
  await new Promise((res) => { const step = () => { const t = Math.min(1, (performance.now() - t0) / 900); turnip.position.y = y0 + Math.sin(t * Math.PI) * 3 + t * 0.6; turnip.position.x = GARDEN.x + t * 2.5; turnip.rotation.z = -t * 1.4; t < 1 ? requestAnimationFrame(step) : res(); }; step(); });
  burst(turnip.position.clone(), 0xffe27a, 80, 6, 1.5, 0.3); S.restore();
  st.turnip = 3; player.maxHp = 6; player.hp = 6; save();
  ui.toast('Вытянули репку! +1 ❤ — сила репки', true);
  await ui.say(DED, ['Вытянули! Ай да мы! А мышка-то — главная оказалась.', 'Держи, внучек: репка богатырская. Кто её поест — тому сил прибавится.']);
  addBook('Репка', 'Посадил дед репку, а вытянуть её было некому — все забыли, кто они. Иван взялся помогать, но и вдвоём не смогли. Только когда прибежала крошечная мышка-норушка, репка поддалась. Самый маленький оказался самым нужным.');
}
async function pikeTalk() {
  await ui.say(PIKEN, ['Ой-ой… Иван! Волной меня на берег выбросило, а серость будто воду высушила…']);
  for (;;) {
    const c = await ui.dialog(PIKEN, 'Отпусти меня в море — я тебе пригожусь!', ['Плыви, щука!', 'А желания исполняешь?', 'Сварю-ка я уху…']);
    if (c === 1) { await ui.say(PIKEN, ['Исполняю! Но только добрым. Отпусти — и проверим, добрый ли ты.']); continue; }
    if (c === 2) { await ui.say(PIKEN, ['Ох, не губи, Иванушка! Да ты и не такой — по глазам вижу, сердце у тебя доброе.']); continue; }
    break;
  }
  const from = pike.position.clone(); const out = new THREE.Vector3(PIKE.x, 0, PIKE.y).normalize().multiplyScalar(9).add(from); out.y = -0.5;
  const t0 = performance.now();
  await new Promise((res) => { const step = () => { const t = Math.min(1, (performance.now() - t0) / 1100); pike.position.lerpVectors(from, out, t); pike.position.y += Math.sin(t * Math.PI) * 3; pike.rotation.x = t * 2; t < 1 ? requestAnimationFrame(step) : res(); }; step(); });
  pike.visible = false; burst(out.clone().setY(0.3), 0xbfe8ff, 50, 5, 1.2, 0.25); S.noise(0, 0.5, 1200, 0.3);
  st.pike = 1; save();
  await ui.say(PIKEN, ['(из воды) Спасибо, Иван! Слушай и запоминай: «По щучьему велению, по моему хотению».', 'Скажи эти слова — нажми T — и окажешься там, где пожелаешь. Только для добрых дел!']);
  ui.toast('Новое умение: T — «По щучьему велению»', true);
  addBook('По щучьему велению', 'На берегу Лукоморья Иван нашёл щуку, выброшенную волной. Мог сварить уху, а отпустил в море. В благодарность щука научила его волшебным словам: «По щучьему велению, по моему хотению» — и теперь Иван может в мгновение ока оказаться где пожелает.');
}
const TP = [['Дуб у Лукоморья', () => new THREE.Vector3(3, 0, 5)], ['Костёр', () => new THREE.Vector3(FIRE.x + 2, 0, FIRE.y + 2.5)], ['Огород деда', () => new THREE.Vector3(GARDEN.x + 3, 0, GARDEN.y - 4)], ['Болото Кикиморы', () => new THREE.Vector3(KIKI_POS.x - 3, 0, KIKI_POS.z + 3)], ['Берёзовая роща', () => new THREE.Vector3(GROVE.x + 5, 0, GROVE.y)], ['Портал', () => new THREE.Vector3(PORTAL.x + 3, 0, PORTAL.y + 4)]];
async function teleport() {
  if (!st.pike) { ui.toast('Волшебных слов ты пока не знаешь…'); return; }
  if (ui.busy() || player.locked) return;
  document.exitPointerLock(); player.locked = true;
  const list = region === LUK ? TP : [...(region.tp || []), ['Домой, в Лукоморье', null]];
  const c = await ui.dialog('По щучьему велению', 'По щучьему велению, по моему хотению — хочу оказаться…', [...list.map((t) => t[0]), 'Остаться здесь']);
  if (c >= 0 && c < list.length) {
    if (!list[c][1]) { player.locked = false; await travel('luk', new THREE.Vector3(PORTAL.x + 3, 0, PORTAL.y + 4)); return; }
    const fade = document.getElementById('fade'); fade.style.opacity = 1; S.chime(); await wait(700);
    player.pos.copy(list[c][1]()); player.pos.y = groundH(player.pos.x, player.pos.z); player.vy = 0; camera.position.copy(player.pos).add(new THREE.Vector3(0, 4, 8));
    fade.style.opacity = 0;
  }
  player.locked = false;
}
async function koloCatch() {
  player.locked = true; document.exitPointerLock();
  await ui.say(KOLO, ['Ой! Догнал! Я Колобок, Колобок! По амбару метён, по сусеку скребён, на сметане мешён…', 'Я от бабушки ушёл, я от дедушки ушёл, от зайца ушёл, от волка ушёл, от медведя ушёл — а от тебя, Иван, не ушёл!']);
  const c = await ui.dialog(KOLO, 'Ну что… съешь меня?', ['Съем! (облизнуться)', 'Нет. Давай лучше дружить!']);
  if (c === 0) { await ui.say(KOLO, ['Все так говорят! А в конце всегда приходит лиса… Нет уж — я покатился!']); kolo.cd = 3.5; S.laugh(); }
  else {
    st.kolobok = 1; save(); S.chime();
    await ui.say(KOLO, ['Дружить? Со мной ещё никто не дружил! Все только съесть хотели…', 'Тогда я буду катиться впереди и показывать дорогу. Я тут каждую кочку знаю! Захочешь подсказку — нажми F рядом со мной.']);
    addBook('Колобок', 'Колобок от всех уходил — от бабушки, от дедушки, от зайца, волка и медведя. Иван догнал его, но не съел, а предложил дружбу. Теперь Колобок катится впереди и показывает дорогу — ведь он знает каждую кочку Лукоморья.');
  }
  player.locked = false;
}
function objective() { return region === LUK ? lukObjective() : region.objective(); }
function lukObjective() {
  if (st.stage === 0) return [cat.position, 'к коту учёному у дуба'];
  if (st.stage === 1) {
    if (!st.links.mermaid) return [MERMAID_GROUND, 'к русалке на ветвях дуба — у неё загадки'];
    if (!st.links.grove) return [new THREE.Vector3(GROVE.x, 0, GROVE.y), st.groveCleared ? 'в берёзовую рощу — звено видно только взглядом (Q)' : 'в берёзовую рощу — там забудки'];
    if (!st.links.kiki) return [KIKI_POS, 'на болото к Кикиморе — её надо рассмешить'];
  }
  if (st.stage === 2) return [OAK, 'к дубу — скрепить цепь'];
  if (!st.pushkin) return [cat.position, 'к коту — послушай его стихи внимательно'];
  if (st.turnip === 0 || st.turnip === 3 ? false : true) return st.turnip === 1 ? [MOUSE3, 'к старому пню — там мышка-норушка (Q)'] : [GARDEN3, 'к деду — тянуть репку'];
  if (st.turnip === 0) return [GARDEN3, 'к деду на огород — у него беда с репкой'];
  if (!st.pike) return [PIKE3, 'на берег — там кто-то бьётся на песке'];
  const f = FEATHERS.find((f) => !st.feathers[f.i]);
  if (f) return [f.g.position, 'к перу Жар-птицы' + (f.hidden ? ' (оно видно только взглядом)' : '')];
  if (!st.forest.done) return [PORTAL3, 'к порталу в Дремучий лес'];
  if (!st.mount.done) return [PORTAL3, 'через портал — в Ледяные горы'];
  if (!st.river.done) return [PORTAL3, 'через портал — к Молочным рекам'];
  if (!st.kosh.done) return [PORTAL3, 'через портал — в царство Кощея'];
  if (!st.finalTale) return [cat.position, 'к коту — сказка рассказана! Послушай его'];
  return [cat.position, 'сказка рассказана! Гуляй по Тридевятому — или начни новую'];
}
async function koloTalk() { const [, txt] = objective(); await ui.say(KOLO, [`Покатили ${txt}! Я впереди.`]); }
function collectFeather(f) {
  st.feathers[f.i] = true; f.g.visible = false; save(); S.chime(); burst(f.g.position.clone(), 0xff8a2a, 40, 4, 1.2, 0.25);
  const n = st.feathers.filter(Boolean).length; ui.toast(`🪶 Перо Жар-птицы ${n}/7`, n === 7);
  if (n === 7) {
    setTimeout(async () => {
      player.locked = true; document.exitPointerLock();
      await ui.say('Жар-птица', ['(Над Лукоморьем вспыхивает золотой огонь — это Жар-птица прилетела за своими перьями.)', 'Ты собрал мои перья и не оставил себе ни одного. Не всякий так сможет!', 'Возьми слово, Сказитель. И пусть Слово твоё теперь восполняется вдвое быстрее.']);
      addWord('Жар-птица', 'волшебная птица, чьи перья светят, как огонь. Её свет помогает находить дорогу в любую сказку.');
      addBook('Жар-птица', 'По всему Лукоморью рассыпались перья Жар-птицы — некоторые видны только Сказительским взглядом. Иван собрал все семь и вернул их хозяйке. Жар-птица подарила ему забытое слово и силу быстрее восполнять Слово.');
      player.locked = false;
    }, 800);
  }
}

// ---------- миникарта ----------
const mm = document.getElementById('minimap'), mctx = mm.getContext('2d');
function drawMinimap() {
  const R = region; const W = mm.width, c = W / 2, k = (W / 2 - 6) / (R === LUK ? 56 : R.radius + 4);
  const X = (x) => c + (x - R.center.x) * k, Z = (z) => c + (z - R.center.y) * k;
  mctx.clearRect(0, 0, W, W);
  const g = (a, b) => { const t = life; return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`; };
  mctx.font = '13px serif'; mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
  if (R === LUK) {
    mctx.fillStyle = g([120, 128, 138], [60, 140, 210]); mctx.beginPath(); mctx.arc(c, c, W / 2, 0, 7); mctx.fill();
    mctx.fillStyle = g([190, 185, 170], [240, 214, 150]); mctx.beginPath(); mctx.arc(c, c, 54 * k, 0, 7); mctx.fill();
    mctx.fillStyle = g([150, 156, 150], [100, 180, 80]); mctx.beginPath(); mctx.arc(c, c, 47 * k, 0, 7); mctx.fill();
    mctx.fillStyle = g([110, 115, 110], [70, 95, 60]); mctx.beginPath(); mctx.arc(X(SWAMP.x), Z(SWAMP.y), 9 * k, 0, 7); mctx.fill();
    [['🌳', 0, 0], ['🔥', FIRE.x, FIRE.y], ['🌀', PORTAL.x, PORTAL.y], ['🪨', STONE.x, STONE.y], ['🥕', GARDEN.x, GARDEN.y], ['🐸', KIKI_POS.x, KIKI_POS.z]].forEach(([e, x, z]) => mctx.fillText(e, X(x), Z(z)));
  } else {
    const mmc = R.mm || {}; mctx.fillStyle = g([110, 115, 120], mmc.bg || [40, 70, 50]); mctx.beginPath(); mctx.arc(c, c, W / 2, 0, 7); mctx.fill();
    mctx.fillStyle = g([150, 154, 150], mmc.land || [90, 150, 80]); mctx.beginPath(); mctx.arc(c, c, R.radius * k, 0, 7); mctx.fill();
    R.mmDraw && R.mmDraw(mctx, X, Z, k, g);
    (R.icons ? R.icons() : []).forEach(([e, x, z]) => mctx.fillText(e, X(x), Z(z)));
  }
  const [op] = objective(); const pulse = 3 + Math.sin(T * 5) * 1.5;
  if (op) { mctx.fillStyle = '#ffd23f'; mctx.beginPath(); mctx.arc(X(op.x), Z(op.z), pulse, 0, 7); mctx.fill(); }
  mctx.save(); mctx.translate(X(player.pos.x), Z(player.pos.z)); mctx.rotate(-player.facing + Math.PI);
  mctx.fillStyle = '#d63a2f'; mctx.strokeStyle = '#fff'; mctx.lineWidth = 1.5; mctx.beginPath(); mctx.moveTo(0, -7); mctx.lineTo(5, 5); mctx.lineTo(-5, 5); mctx.closePath(); mctx.fill(); mctx.stroke(); mctx.restore();
}

// ---------- обновление новых сказок ----------
function updateTales(dt, canMove) {
  const p = player;
  // мышка
  if (st.turnip >= 2) { const tgt = GARDEN3.clone().add(new THREE.Vector3(-1.4, 0, 1.2)); mouse.position.lerp(tgt, Math.min(1, dt * 0.8)); mouse.position.y = H(mouse.position.x, mouse.position.z); mouse.visible = true; }
  else mouse.visible = p.sight; mouse.rotation.y = T * 0.5;
  if (st.turnip === 3 && turnip.position.y < H(GARDEN.x, GARDEN.y)) { turnip.position.set(GARDEN.x + 2.5, H(GARDEN.x + 2.5, GARDEN.y) + 0.6, GARDEN.y); turnip.rotation.z = -1.4; }
  // щука
  if (!st.pike) { pike.rotation.z = Math.sin(T * 6) * 0.3; pike.userData.tail.rotation.y = Math.sin(T * 10) * 0.5; pike.position.y = PIKE3.y + Math.abs(Math.sin(T * 3)) * 0.25; } else pike.visible = false;
  // колобок
  const kb = kolobok; const kp = kb.position; kolo.cd = Math.max(0, kolo.cd - dt);
  let move = new THREE.Vector3();
  if (st.kolobok === 1) {
    const [op] = objective(); const dir = new THREE.Vector3(op.x - p.pos.x, 0, op.z - p.pos.z); const far = dir.length() > 6;
    dir.normalize(); const want = p.pos.clone().addScaledVector(far ? dir : new THREE.Vector3(1, 0, 0), far ? 3.5 : 1.8);
    move.set(want.x - kp.x, 0, want.z - kp.z); if (move.length() > 0.2) move.normalize().multiplyScalar(Math.min(10, move.length() * 4));
    else move.set(0, 0, 0);
  } else if (canMove) {
    const d = new THREE.Vector3(kp.x - p.pos.x, 0, kp.z - p.pos.z); const dist = d.length();
    if (dist < 7 || kolo.cd > 0) { move.copy(d.normalize()).multiplyScalar(kolo.cd > 0 ? 10 : 7.6); if (!kolo.sang || T - kolo.sang > 6) { kolo.sang = T; ui.toast('🎵 «Я от бабушки ушёл, я от дедушки ушёл…»', false, 2000); S.laugh(); } }
    else { kolo.a += dt * 0.25; const tx = KOLO_HOME.x + Math.cos(kolo.a) * 9, tz = KOLO_HOME.y + Math.sin(kolo.a) * 9; move.set(tx - kp.x, 0, tz - kp.z); if (move.length() > 0.1) move.normalize().multiplyScalar(2.5); }
    if (dist < 1.6 && kolo.cd <= 0 && !p.locked) koloCatch();
  }
  kolo.vel.lerp(move, Math.min(1, dt * 6)); kp.addScaledVector(kolo.vel, dt);
  const kr = Math.hypot(kp.x, kp.z); if (kr > 45) { kp.x *= 45 / kr; kp.z *= 45 / kr; kolo.vel.set(-kp.z, 0, kp.x).normalize().multiplyScalar(7); }
  for (const c of colliders) { const dx = kp.x - c.x, dz = kp.z - c.z, d = Math.hypot(dx, dz), m = c.r + 0.5; if (d < m && d > 0.001) { kp.x = c.x + (dx / d) * m; kp.z = c.z + (dz / d) * m; } }
  kp.y = H(kp.x, kp.z) + 0.5 + (st.kolobok ? Math.abs(Math.sin(T * 6)) * 0.15 : 0);
  const sp = kolo.vel.length(); if (sp > 0.1) { kb.rotation.y = Math.atan2(kolo.vel.x, kolo.vel.z); kb.userData.body.rotation.x += (sp * dt) / 0.5; }
  // перья
  FEATHERS.forEach((f) => {
    if (st.feathers[f.i]) { f.g.visible = false; return; }
    f.g.visible = !f.hidden || p.sight; f.g.rotation.y += dt * 1.5; f.g.position.y = H(f.g.position.x, f.g.position.z) + 1 + Math.sin(T * 2 + f.i) * 0.2;
    if (f.g.visible && canMove && Math.hypot(f.g.position.x - p.pos.x, f.g.position.z - p.pos.z) < 1.6) collectFeather(f);
  });
  // дед покачивается
  ded.rotation.z = Math.sin(T * 1.3) * 0.03;
}

// ---------- настройки и сенсорное управление ----------
const settingsEl = document.getElementById('settings');
const OPT = Object.assign({ master: 0.7, music: 0.6, sfx: 0.8, sens: 1, invY: false, help: true, quality: 'medium', shake: true, voice: true, daynight: true, voiceRate: 1 }, (() => { try { return JSON.parse(localStorage.getItem('tri_opts') || '{}'); } catch { return {}; } })());
const saveOpt = () => localStorage.setItem('tri_opts', JSON.stringify(OPT));
function applyQuality() {
  const q = OPT.quality; renderer.setPixelRatio(q === 'low' ? Math.min(devicePixelRatio, 1) * 0.75 : q === 'high' ? Math.min(devicePixelRatio, 2) : Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = q !== 'low'; sun.castShadow = q !== 'low';
  const ms = q === 'high' ? 2048 : 1024; if (sun.shadow.mapSize.x !== ms) { sun.shadow.mapSize.set(ms, ms); sun.shadow.map?.dispose(); sun.shadow.map = null; }
  scene.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => (m.needsUpdate = true)); });
  renderer.setSize(innerWidth, innerHeight);
}
function applyOpt() {
  sens = OPT.sens; S.vol.master = OPT.master; S.vol.music = OPT.music; S.vol.sfx = OPT.sfx; S.applyVolumes();
  document.getElementById('help').classList.toggle('hidden', !OPT.help || isTouch);
}
function toggleSettings(open) { settingsEl.classList.toggle('hidden', !open); ui.bookOpen = open; if (open) document.exitPointerLock(); }
document.getElementById('btnGear').onclick = () => toggleSettings(true);
document.getElementById('optClose').onclick = () => toggleSettings(false);
document.getElementById('optX').onclick = () => toggleSettings(false);
document.getElementById('bookClose').onclick = () => ui.book(st, false);
document.getElementById('optReset').onclick = () => { if (confirm('Начать сказку заново? Прогресс сотрётся.')) { localStorage.removeItem(SAVE_KEY); location.reload(); } };
document.getElementById('optFull').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); };
for (const [id, key] of [['optMaster', 'master'], ['optMusic', 'music'], ['optSfx', 'sfx'], ['optSens', 'sens']]) {
  const el = document.getElementById(id); el.value = OPT[key]; el.oninput = () => { OPT[key] = +el.value; saveOpt(); applyOpt(); if (key === 'sfx') S.click(); };
}
for (const [id, key] of [['optInvY', 'invY'], ['optHelp', 'help'], ['optShake', 'shake'], ['optVoice', 'voice'], ['optDay', 'daynight']]) {
  const el = document.getElementById(id); el.checked = OPT[key]; el.onchange = () => { OPT[key] = el.checked; saveOpt(); applyOpt(); };
}
// озвучка текста: галочка в настройках, кнопка 🔊 в окне диалога и клавиша V — выключение сразу обрывает голос
function setVoice(on) { OPT.voice = on; saveOpt(); if (!on) ui.voiceOff?.(); document.getElementById('optVoice').checked = on; const b = document.getElementById('dVoice'); b.textContent = on ? '🔊' : '🔇'; b.classList.toggle('off', !on); }
document.getElementById('optVoice').onchange = (e) => setVoice(e.target.checked);
document.getElementById('dVoice').addEventListener('click', (e) => { e.stopPropagation(); setVoice(!OPT.voice); });
document.getElementById('dVoice').addEventListener('pointerdown', (e) => e.stopPropagation());
document.getElementById('dVoice').addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
addEventListener('keydown', (e) => { if (e.code === 'KeyV' && !e.repeat && !(e.target instanceof HTMLInputElement)) setVoice(!OPT.voice); });
{ const el = document.getElementById('optVoiceRate'); el.value = OPT.voiceRate || 1; el.oninput = () => { OPT.voiceRate = +el.value; saveOpt(); }; }
setVoice(OPT.voice !== false);
{ const el = document.getElementById('optQuality'); el.value = OPT.quality; el.onchange = () => { OPT.quality = el.value; saveOpt(); applyQuality(); }; }
const joy = { x: 0, y: 0, id: null };
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
applyQuality(); applyOpt();
if (isTouch) {
  document.body.classList.add('touch');
  // подсказка над кнопками — сама по себе кнопка «действие»: тап по ней начинает разговор
  document.getElementById('prompt').addEventListener('pointerdown', (e) => { e.preventDefault(); if (started && !ui.busy() && !player.locked) interact(); });
  document.querySelector('#timing .muted').textContent = 'Тапни, когда бегунок в зелёной зоне!';
  document.getElementById('touch').classList.remove('hidden'); document.getElementById('help').classList.add('hidden');
  const jz = document.getElementById('joy'), knob = document.getElementById('joyKnob');
  const setJ = (t) => { const r = jz.getBoundingClientRect(); let dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2); const l = Math.hypot(dx, dy), mx = r.width / 2 - 20; if (l > mx) { dx *= mx / l; dy *= mx / l; } joy.x = dx / mx; joy.y = dy / mx; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  jz.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.changedTouches[0]; joy.id = t.identifier; setJ(t); }, { passive: false });
  jz.addEventListener('touchmove', (e) => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === joy.id) setJ(t); }, { passive: false });
  const endJ = (e) => { for (const t of e.changedTouches) if (t.identifier === joy.id) { joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; } };
  jz.addEventListener('touchend', endJ); jz.addEventListener('touchcancel', endJ);
  const acts = { attack: () => attack(), interact: () => (ui.dialogOpen ? ui._advance() : interact()), sight: () => toggleSight(), jump: () => jump(), luck: () => ability(), book: () => ui.book(st, !ui.bookOpen),
    hero: () => { const hs = st.heroes; switchHero(hs[(hs.indexOf(player.hero) + 1) % hs.length]); }, tp: () => teleport(), block: () => {} };
  document.querySelectorAll('#tbtns button').forEach((b) => {
    b.addEventListener('touchstart', (e) => { e.preventDefault(); if (!started) return; if (b.dataset.a === 'block') { mouseBlock = true; return; } if (b.dataset.a === 'jump') keys.add('Space'); if (b.dataset.a !== 'book' && b.dataset.a !== 'interact' && (ui.busy() || player.locked)) return; acts[b.dataset.a](); }, { passive: false });
    b.addEventListener('touchend', () => { if (b.dataset.a === 'block') mouseBlock = false; if (b.dataset.a === 'jump') keys.delete('Space'); });
  });
  let camT = null;
  canvas.addEventListener('touchstart', (e) => { const t = e.changedTouches[0]; camT = { id: t.identifier, x: t.clientX, y: t.clientY }; }, { passive: true });
  canvas.addEventListener('touchmove', (e) => { for (const t of e.changedTouches) if (camT && t.identifier === camT.id) { camYaw -= (t.clientX - camT.x) * 0.006 * sens; camPitch = Math.min(1.25, Math.max(0.05, camPitch + (t.clientY - camT.y) * 0.004 * sens * (OPT.invY ? -1 : 1))); camT.x = t.clientX; camT.y = t.clientY; } }, { passive: true });
}

// ---------- трекер ----------
const BOOK_TOTAL = 13, WORDS_TOTAL = 7; ui.totals = { book: BOOK_TOTAL, words: WORDS_TOTAL };
function trackerHtml() {
  if (region !== LUK) return region.tracker() + `<br><span style="opacity:.75;font-size:12px">Сказы: ${st.book.length}/${BOOK_TOTAL} · Слова: ${st.words.length}/${WORDS_TOTAL}</span>`;
  const ck = (b) => (b ? '☑' : '☐');
  let h;
  if (st.stage === 0) h = '<b>📜 Пробуждение</b><br>• Поговори с Котом учёным у дуба (F)';
  else if (st.stage === 1) h = `<b>📜 Цепь златая</b><br>${ck(st.links.mermaid)} Звено русалки — загадки (${st.riddle}/3)<br>${ck(st.links.grove)} Звено берёзовой рощи${st.groveCleared ? '' : ' — забудки'}<br>${ck(st.links.kiki)} Звено Кикиморы — болото<br><i style="opacity:.8">Q — увидеть Нити Сказа</i>`;
  else if (st.stage === 2) h = '<b>📜 Цепь златая</b><br>• Скрепи цепь у дуба (F у ствола)';
  else h = `<b>✨ Лукоморье ожило</b><br>${st.pushkin ? '☑' : '•'} Послушай кота${st.pushkin ? '' : ' (не ошибся ли он?)'}<br>${st.festival ? '🎉 Праздник! ' + (st.finalTale ? 'Сказка рассказана' : 'Послушай кота') : st.kosh.done ? '• Сказка почти рассказана' : '• Портал проснулся — шагни в него'}`;
  if (st.stage >= 1) {
    const nf = st.feathers.filter(Boolean).length;
    h += `<br><b style="font-size:13px">Побочные сказы</b><br>${ck(st.turnip === 3)} 🥕 Репка${st.turnip === 1 ? ' — найди мышку' : st.turnip === 2 ? ' — тяни!' : ''}<br>${ck(st.pike)} 🐟 Кто-то бьётся на берегу<br>${ck(st.kolobok)} 🟡 Догнать Колобка<br>${ck(nf === 7)} 🪶 Перья Жар-птицы ${nf}/7`;
  }
  return h + `<br><span style="opacity:.75;font-size:12px">Сказы: ${st.book.length}/${BOOK_TOTAL} · Слова: ${st.words.length}/${WORDS_TOTAL}</span>`;
}

// ---------- цикл ----------
const clock = new THREE.Clock(); let T = 0; let started = false;
const tmpV = new THREE.Vector3(); const ray = new THREE.Raycaster();
function update(dt) {
  T += dt;
  const Rg = region; const inLuk = Rg === LUK;
  // жизнь мира
  lifeTarget = lifeOverride ?? (inLuk ? baseLife() : Rg.life());
  if (Math.abs(life - lifeTarget) > 0.002) { life += Math.sign(lifeTarget - life) * Math.min(Math.abs(lifeTarget - life), dt * (lifeTarget === 1 ? 0.28 : 0.4)); }
  if (Math.abs(life - lifeShown) > 0.004) { applyLife(life); lifeShown = life; }
  const SK0 = Rg.sky || SKY; const sk = Math.min(1, dt * 4);
  const top = SK0.topGray.clone().lerp(SK0.topLive, life), bot = SK0.botGray.clone().lerp(SK0.botLive, life);
  EV && EV.tintSky(top, bot, inLuk);
  if (player.sight) { top.lerp(SK0.topSight, 0.6); bot.lerp(SK0.botSight, 0.5); }
  skyMat.uniforms.top.value.lerp(top, sk); skyMat.uniforms.bottom.value.lerp(bot, sk);
  scene.background.copy(skyMat.uniforms.bottom.value); scene.fog.color.copy(scene.background);
  skyDome.position.copy(camera.position);
  if (inLuk) clouds.forEach((c) => { c.position.x += dt * c.userData.sp; if (c.position.x > 130) c.position.x = -130; });

  // игрок
  const p = player; const canMove = started && !ui.busy() && !p.locked;
  const hero = heroes[p.hero];
  const blocking = (keys.has('KeyK') || mouseBlock) && canMove;
  let moving = false, speed = 0;
  if (canMove) {
    if (keys.has('ArrowLeft')) camYaw += dt * 2; if (keys.has('ArrowRight')) camYaw -= dt * 2;
    let ix = 0, iz = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) iz -= 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iz += 1; if (keys.has('KeyA')) ix -= 1; if (keys.has('KeyD')) ix += 1;
    if (joy.id !== null) { ix += joy.x; iz += joy.y; }
    const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || Math.hypot(joy.x, joy.y) > 0.85;
    speed = (run ? 9.5 : 6) * (p.speedT > 0 ? 1.6 : 1) * (blocking ? 0.45 : 1) * (p.hero === 'finist' ? 1.08 : 1) * (p.slow > 0 ? 0.6 : 1);
    if (p.dashT > 0) speed = 26;
    if (ix || iz || p.dashT > 0) {
      let dx, dz;
      if (ix || iz) { const l = Math.hypot(ix, iz); ix /= l; iz /= l; const sx = Math.sin(camYaw), cz = Math.cos(camYaw); dx = ix * cz + iz * sx; dz = -ix * sx + iz * cz; }
      else { dx = Math.sin(p.facing); dz = Math.cos(p.facing); }
      p.pos.x += dx * speed * dt; p.pos.z += dz * speed * dt; moving = true;
      const tf = Math.atan2(dx, dz); let df = tf - p.facing; df = Math.atan2(Math.sin(df), Math.cos(df)); p.facing += df * Math.min(1, dt * 12);
      p.walk += dt * speed * 1.6;
    } else p.walk *= 0.85;
  }
  for (const c of colliders) { if (Math.abs(p.pos.x - c.x) > 6 || Math.abs(p.pos.z - c.z) > 6) continue; if (c.h !== undefined && p.pos.y > c.h) continue; const dx = p.pos.x - c.x, dz = p.pos.z - c.z, d = Math.hypot(dx, dz), m = c.r + 0.4; if (d < m && d > 0.0001) { p.pos.x = c.x + (dx / d) * m; p.pos.z = c.z + (dz / d) * m; } }
  { const cx = p.pos.x - Rg.center.x, cz = p.pos.z - Rg.center.y, r = Math.hypot(cx, cz); if (r > Rg.radius) { p.pos.x = Rg.center.x + (cx * Rg.radius) / r; p.pos.z = Rg.center.y + (cz * Rg.radius) / r; } }
  const gh = Math.max(groundH(p.pos.x, p.pos.z), Rg.water === false ? -99 : 0.05);
  const gliding = p.hero === 'finist' && !p.onGround && keys.has('Space') && p.vy < 0 && canMove;
  p.vy -= (gliding ? 6 : 26) * dt; if (gliding) p.vy = Math.max(p.vy, -1.8);
  p.pos.y += p.vy * dt;
  if (p.pos.y <= gh) { if (!p.onGround && p.vy < -8) { S.land(); burst(p.pos.clone(), 0xd8d0c0, 8, 2, 0.4, 0.15); } p.pos.y = gh; p.vy = 0; p.onGround = true; p.jumps = 0; } else if (p.pos.y > gh + 0.05) p.onGround = false;
  if (gliding && Math.random() < dt * 20) burst(p.pos.clone().setY(p.pos.y + 1.2), 0xffe0a0, 1, 0.5, 0.6, 0.12);
  p.attackT = Math.max(0, p.attackT - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.buffT = Math.max(0, p.buffT - dt); p.speedT = Math.max(0, p.speedT - dt); p.luckCd = Math.max(0, p.luckCd - dt);
  p.dashT = Math.max(0, p.dashT - dt); p.hidden = Math.max(0, p.hidden - dt); p.slow = Math.max(0, p.slow - dt);
  if (p.sight) { p.word -= dt * 9 * p.sightCost; if (p.word <= 0) { p.word = 0; toggleSight(false); ui.toast('Слово иссякло. Отдохни у костра.'); } }
  else p.word = Math.min(100, p.word + dt * (st.feathers.every(Boolean) ? 6 : 2.5));
  if (inLuk && p.pos.distanceTo(FIRE3) < 4) { p.word = Math.min(100, p.word + dt * 30); if (T % 1.5 < dt) p.hp = Math.min(p.maxHp, p.hp + 1); }
  // шаги
  if (moving && p.onGround) { p.stepPh += dt * speed * 0.42; if (p.stepPh > 1) { p.stepPh = 0; S.step(Rg.surface ? Rg.surface(p.pos.x, p.pos.z) : inLuk ? lukSurface(p.pos.x, p.pos.z) : 'grass'); } }

  // герой: позиция и анимация
  const hr = hero.root; hr.position.copy(p.pos); hr.rotation.y = p.facing; hr.scale.setScalar(p.buffT > 0 ? 1.15 : 1);
  hr.visible = !(p.hidden > 0 && p.hiddenModel);
  if (!hero._busy) hero.play(!p.onGround ? (gliding ? 'holding-both' : 'sprint') : blocking ? 'holding-both' : moving ? (speed > 8 ? 'sprint' : 'walk') : 'idle');
  const anim = hero.cur; if (anim) anim.timeScale = !p.onGround && !gliding ? 0.4 : moving ? Math.max(0.8, speed / 7) : 1;
  if (hr.userData.wings) { const w = hr.userData.wings; w.visible = gliding || p.dashT > 0 || (!p.onGround && p.jumps >= 2); w.children.forEach((c) => (c.rotation.z = c.userData.s * (gliding ? Math.sin(T * 3) * 0.12 : Math.sin(T * 18) * 0.5))); }
  if (hr.userData.braid) hr.userData.braid.rotation.x = moving ? 0.25 + Math.sin(T * 10) * 0.08 : 0.05;
  hero.update(dt);
  for (const c of chars) if (c.root.parent && c.root.parent.visible !== false && c.root.visible) c.update(dt);
  for (const m of mixers) { const r = m.getRoot(); if (r.parent && r.parent.parent?.visible !== false) m.update(dt); }
  document.getElementById('hurtFx').style.opacity = p.hurtT > 0 ? 1 : 0;

  // враги
  for (const e of enemies) {
    if (e.dying > 0) { e.dying -= dt; e.g.scale.setScalar(Math.max(0.01, e.dying) * (e.scale || 1)); e.g.position.y += dt; if (e.dying <= 0) e.g.visible = false; continue; }
    if (!e.alive || !e.g.parent?.visible) continue;
    const d = p.pos.clone().sub(e.g.position); d.y = 0; const dist = d.length();
    const aggro = !e.passive && dist < (e.aggroR || 13) && canMove && !(p.hidden > 0);
    const target = aggro ? p.pos : e.home;
    const to = new THREE.Vector3(target.x - e.g.position.x, 0, target.z - e.g.position.z);
    if (!e.still && to.length() > (aggro ? (e.reach || 1.1) : 0.5)) { to.normalize().multiplyScalar((aggro ? (e.speed || 3.4) : 1.5) * dt); e.g.position.add(to); }
    e.g.position.addScaledVector(e.kb, dt); e.kb.multiplyScalar(Math.pow(0.02, dt));
    e.g.position.y = groundH(e.g.position.x, e.g.position.z) + (e.fly ?? 1.3) + Math.sin(T * 2 + e.ph) * 0.25;
    e.g.lookAt(p.pos.x, e.g.position.y, p.pos.z);
    e.cd -= dt; if (aggro && dist < (e.reach || 1.1) + 0.4 && e.cd <= 0) { e.cd = e.rate || 1.3; damagePlayer(e); }
    e.flash -= dt; e.custom && e.custom(e, dt);
    const m = e.g.userData.mat;
    if (m && m.emissive) m.emissive.setHex(e.flash > 0 ? 0xffffff : p.sight ? 0x806010 : e.glow || 0x000000);
  }
  // огоньки Василисы
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i]; o.t += dt;
    if (o.tgt) o.v.lerp(o.tgt.clone().sub(o.m.position).normalize().multiplyScalar(18), Math.min(1, dt * 6));
    o.m.position.addScaledVector(o.v, dt); o.m.scale.setScalar(1 + Math.sin(o.t * 30) * 0.1);
    if (Math.random() < dt * 30) burst(o.m.position.clone(), 0x9fe8ff, 1, 0.5, 0.4, 0.12);
    let hit = o.t > 1.2;
    for (const e of enemies) { if (!e.alive || hit || !e.g.parent?.visible) continue; if (e.g.position.distanceTo(o.m.position) < 1.3 + (e.big || 0)) { hurtEnemy(e, 1.5 * (p.sight ? 2 : 1), o.m.position.clone().sub(o.v)); S.hit(); hit = true; } }
    for (const h of hittables) { if (hit || (h.cond && !h.cond())) continue; const hp = h.pos(); if (hp.distanceTo(o.m.position) < (h.r || 3)) { h.onHit('vasilisa'); hit = true; } }
    if (hit) { burst(o.m.position, 0x9fe8ff, 16, 3, 0.5, 0.2); scene.remove(o.m); orbs.splice(i, 1); }
  }
  // море следует за игроком
  sea.position.x = Math.round(p.pos.x / 10) * 10; sea.position.z = Math.round(p.pos.z / 10) * 10;
  const sp = seaGeo.attributes.position; for (let i = 0; i < sp.count; i++) { const x = seaBaseY[i * 3] + sea.position.x, z = seaBaseY[i * 3 + 2] + sea.position.z; sp.setY(i, Math.sin(x * 0.12 + T * 1.3) * 0.15 + Math.cos(z * 0.1 + T) * 0.15); }
  sp.needsUpdate = true;

  // частицы
  for (let i = bursts.length - 1; i >= 0; i--) {
    const bs = bursts[i]; bs.t += dt; const arr = bs.pts.geometry.attributes.position.array;
    bs.v.forEach((v, j) => { v.y -= 2.5 * dt; arr[j * 3] += v.x * dt; arr[j * 3 + 1] += v.y * dt; arr[j * 3 + 2] += v.z * dt; });
    bs.pts.geometry.attributes.position.needsUpdate = true; bs.pts.material.opacity = 1 - bs.t / bs.life;
    if (bs.t >= bs.life) { scene.remove(bs.pts); bs.pts.geometry.dispose(); bs.pts.material.dispose(); bursts.splice(i, 1); }
  }

  if (inLuk) {
    // нити и тайники
    for (const k in threads) { const th = threads[k]; th.g.visible = p.sight && st.stage >= 1 && !st.links[k]; th.glow.material.opacity = 0.18 + 0.12 * Math.sin(T * 4); }
    GROVE_LINK.visible = st.groveCleared && !st.links.grove && p.sight;
    GROVE_LINK.rotation.y += dt * 2;
    if (st.groveCleared && !st.links.grove && !p.sight && !st.seenGroveHint && Math.hypot(p.pos.x - GROVE.x, p.pos.z - GROVE.y) < 5) { st.seenGroveHint = true; ui.toast('Здесь что-то есть… Попробуй Сказительский взгляд (Q).'); }
    flame.scale.set(1 + Math.sin(T * 13) * 0.08, 1 + Math.sin(T * 9) * 0.15, 1); flame2.scale.y = 1 + Math.sin(T * 17) * 0.2;
    fireLight.intensity = 16 + Math.sin(T * 11) * 3 + Math.sin(T * 7.3) * 2;
    if (Math.random() < dt * 4) burst(FIRE3.clone().setY(FIRE3.y + 1.2), 0xffa040, 3, 1.2, 1, 0.12);
    portalDisc.rotation.z += dt; swirl.rotation.z -= dt * 2;
    if (st.restored) { portalMat.color.lerp(new THREE.Color(0x2f9e5a), dt); portalMat.opacity = Math.min(0.75, portalMat.opacity + dt * 0.3); swirl.material.opacity = Math.min(0.9, swirl.material.opacity + dt * 0.3); }
    mermaid.userData.tail.rotation.x = Math.sin(T * 1.6) * 0.25;
    kiki.position.y = KIKI_POS.y + Math.sin(T * 1.2) * 0.05; if (kiki.userData.giggle > 0) { kiki.userData.giggle -= dt; kiki.rotation.z = Math.sin(T * 30) * 0.08; } else kiki.rotation.z = 0;
    if (st.restored && !ui.dialogOpen && !st.festival) {
      const a = T * 0.35; const rr = 2.7; cat.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); cat.position.y = H(cat.position.x, cat.position.z); cat.rotation.y = -a; catPet.play('walk');
    } else { if (!st.restored) cat.position.copy(CAT_HOME); catPet.play(ui.dialogOpen && p.pos.distanceTo(cat.position) < 4 ? 'gesture-positive' : st.festival ? 'dance' : 'idle'); }
    if (ui.dialogOpen) { const d = p.pos.clone().sub(cat.position); if (d.length() < 4) cat.rotation.y = Math.atan2(d.x, d.z); }
    chainLinks.forEach((l) => l.material.emissive.setHex(st.restored ? 0x553300 : 0x221100));
    const bk = smooth(0.8, 1, life);
    butterflies.forEach((b) => { b.g.visible = bk > 0.01; if (!b.g.visible) return; const t = T * 0.6 + b.ph; b.g.position.set(b.home.x + Math.sin(t) * 3, H(b.home.x, b.home.z) + 1.2 + Math.sin(t * 2.3) * 0.6, b.home.z + Math.cos(t * 0.8) * 3); b.g.rotation.y = t; const fl = Math.sin(T * 18 + b.ph) * 0.9; b.p1.rotation.y = fl; b.p2.rotation.y = -fl; b.g.scale.setScalar(bk); });
    if (ringT >= 0) { ringT += dt; const s = ringT * 28; ring.scale.setScalar(s); ring.material.opacity = Math.max(0, 0.8 - ringT * 0.27); if (ringT > 3) ringT = -1; }
    if (life > 0.9 && Math.random() < dt * 0.25 && !(EV && EV.night() > 0.4)) S.bird();
    updateTales(dt, canMove);
    if (st.festival) updateFestival(dt);
  } else Rg.update && Rg.update(dt, canMove);

  EV && EV.update(dt, inLuk);
  // камера
  const tgt = p.pos.clone().add(new THREE.Vector3(0, 1.7, 0));
  const cp = new THREE.Vector3(Math.sin(camYaw) * Math.cos(camPitch) * camDist, Math.sin(camPitch) * camDist, Math.cos(camYaw) * Math.cos(camPitch) * camDist).add(tgt);
  { // «пружинная» камера: не прячемся за деревьями
    const dir = cp.clone().sub(tgt); const len = dir.length(); dir.normalize();
    ray.set(tgt, dir); ray.far = len;
    const near = camBlockers.filter((o) => o.parent && o.parent.visible !== false && Math.hypot(o.position.x - p.pos.x, o.position.z - p.pos.z) < len + 8);
    const hit = ray.intersectObjects(near, true)[0];
    if (hit) cp.copy(tgt).addScaledVector(dir, Math.max(1.6, hit.distance - 0.4));
  }
  cp.y = Math.max(cp.y, groundH(cp.x, cp.z) + 0.6, 0.6);
  if (camOverride) cp.copy(camOverride.pos);
  camera.position.lerp(cp, Math.min(1, dt * (camOverride ? 2.5 : 10))); camera.lookAt(camOverride ? camOverride.look : tgt);
  if (shakeT > 0 && OPT.shake) { shakeT -= dt; camera.position.x += (Math.random() - 0.5) * shakeT; camera.position.y += (Math.random() - 0.5) * shakeT; }
  sun.position.copy(p.pos).add(new THREE.Vector3(25, 45, 18)); sun.target.position.copy(p.pos);

  // HUD
  if (started) {
    ui.hud(p, heroLabel()); ui.tracker(trackerHtml());
    const it = canMove ? nearest() : null; ui.prompt(it ? (isTouch ? `✋ ${it.label}` : `F — ${it.label}`) : '');
    if (T - lastMM > 0.1) { lastMM = T; drawMinimap(); }
  }
}
let loopErr = 0;
function loop() { requestAnimationFrame(loop); const dt = Math.min(0.05, clock.getDelta()); try { update(dt); } catch (e) { if (loopErr++ < 5) console.error('update', e); } renderer.render(scene, camera); }

// ---------- регионы (острова Тридевятого) ----------
const HERO_NAME = { ivan: 'Иван', vasilisa: 'Василиса Премудрая', finist: 'Финист — Ясный Сокол' };
const lukGroup = new THREE.Group(); lukGroup.name = 'luk';
{ const keepSet = new Set([hemi, sun, sun.target, skyDome, sea, ...Object.values(heroes).map((h) => h.root)]);
  [...scene.children].forEach((o) => { if (!keepSet.has(o)) lukGroup.add(o); }); scene.add(lukGroup); }
function lukSurface(x, z) { if (Math.hypot(x - SWAMP.x, z - SWAMP.y) < 9) return 'water'; if (H(x, z) < 0.7) return 'sand'; return 'grass'; }
const LUK = { id: 'luk', name: 'Лукоморье', center: V2(0, 0), radius: 52, H, group: lukGroup, music: 'luk', sky: SKY, fogNear: 45, fogFar: 170, amb: { wind: 0.03, water: 0.06 }, spawn: () => new THREE.Vector3(FIRE.x + 2, 0, FIRE.y + 2.5) };
const REGIONS = { luk: LUK };
const CHAPTERS = {};
for (const id of ['forest', 'mount', 'river', 'kosh']) CHAPTERS[id] = `./chapters/${id}.js`;
const CHAPTER_READY = new Set(['forest', 'mount', 'river', 'kosh']);
let region = LUK; const groundH = (x, z) => region.H(x, z);
let lifeOverride = null, camOverride = null, lastMM = 0, festivalUpd = null;
function updateFestival(dt) { festivalUpd && festivalUpd(dt); }
function setRegion(id) {
  const R = REGIONS[id]; if (region && region !== R && region.onLeave) region.onLeave(); Object.values(REGIONS).forEach((r) => (r.group.visible = r === R));
  region = R; st.region = id;
  scene.fog.near = R.fogNear ?? 45; scene.fog.far = R.fogFar ?? 170;
  sea.visible = R.water !== false; sun.intensity = R.sun ?? 2.3;
  S.setTheme(R.music); S.setAmbience(R.amb || {}); lifeShown = -1; lastMM = -1;
}
async function ensureRegion(id) {
  if (REGIONS[id]) return REGIONS[id];
  const mod = await import(CHAPTERS[id]); const R = mod.default(ctx);
  R.group.visible = false; scene.add(R.group); REGIONS[id] = R; R.init && R.init(); return R;
}
async function travel(id, pos) {
  const fade = document.getElementById('fade'); const wasLocked = player.locked; player.locked = true; fade.style.opacity = 1; toggleSight(false); S.magic();
  await wait(650);
  let R; try { R = await ensureRegion(id); } catch (e) { console.error(e); ui.toast('Эта сказка ещё не написана…'); fade.style.opacity = 0; player.locked = wasLocked; return; }
  setRegion(id);
  const sp = pos || R.spawn(); player.pos.set(sp.x, Math.max(R.H(sp.x, sp.z), R.water === false ? -99 : 0.05), sp.z); player.vy = 0; player.onGround = true;
  camYaw = Math.atan2(sp.x - R.center.x, sp.z - R.center.y); camPitch = 0.3; player.facing = camYaw + Math.PI;
  if (id === 'luk' && pos) { camYaw = Math.atan2(sp.x, sp.z); player.facing = camYaw + Math.PI; }
  camera.position.set(sp.x + Math.sin(camYaw) * 8, player.pos.y + 4, sp.z + Math.cos(camYaw) * 8);
  life = lifeTarget = id === 'luk' ? baseLife() : R.life(); lifeShown = -1;
  save(); await wait(250); fade.style.opacity = 0; player.locked = wasLocked;
  ui.toast(R.name, true, 2600);
  R.onEnter && R.onEnter();
}
function switchHero(k) {
  if (!st.heroes.includes(k)) { ui.toast('Этот герой ещё не встретился в сказке.'); return; }
  if (k === player.hero || ui.busy() || player.locked) return;
  heroes[player.hero].root.visible = false; player.hero = k; st.hero = k;
  const h = heroes[k]; h.root.visible = true; h.root.position.copy(player.pos); h.play('idle');
  burst(player.pos.clone().setY(player.pos.y + 1), 0xffe27a, 30, 3, 0.8); S.magic(); ui.toast(`В сказке — ${HERO_NAME[k]}`); save();
}
function unlockHero(k) {
  if (st.heroes.includes(k)) return; st.heroes.push(k); save(); S.fanfare();
  ui.toast(`${HERO_NAME[k]} теперь с тобой! Клавиша ${['ivan', 'vasilisa', 'finist'].indexOf(k) + 1} (или 👥) — сменить героя.`, true, 5000);
}
// рельеф для глав: сетка с цветами вершин, обесцвечивается шейдером «жизни»
function makeTerrain(cx, cz, size, seg, Hf, colorFn, parent) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position; const col = new Float32Array(pos.count * 3); const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) + cx, z = pos.getZ(i) + cz; const y = Hf(x, z); pos.setY(i, y); colorFn(x, z, y, c); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, lifeify(new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad }))); m.position.set(cx, 0, cz); m.receiveShadow = true; parent.add(m); return m;
}
function spawnEnemy(parent, pos, o = {}) {
  const g = o.model ? o.model() : makeForgetling(); parent.add(g); g.position.copy(pos); if (o.scale) g.scale.setScalar(o.scale);
  const e = Object.assign({ g, home: pos.clone(), hp: 3, alive: true, cd: 0, kb: new THREE.Vector3(), flash: 0, dying: 0, ph: Math.random() * 6 }, o); delete e.model;
  enemies.push(e); return e;
}
function removeEnemies(group) { for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].group === group) { enemies[i].g.parent?.remove(enemies[i].g); enemies.splice(i, 1); } }
const ctx = {
  THREE, scene, S, ui, toon, grad, MD, KITS, KIT_ANIMS, kit, pet, npc, M, P: (n, x, z, s, ry, dy, parent, hf) => place(MD, parent || scene, n, x, (hf || groundH)(x, z) + (dy || 0), z, s ?? 1, ry ?? srand() * 6.28),
  burst, makeChar, wait, srand, smooth, mixers, chars, colliders, camBlockers, interactables, enemies, hittables, player, heroes, keys, camera,
  get st() { return st; }, save, addBook, addWord, travel, groundH, unlockHero, switchHero, hurtPlayer, hurtEnemy, toggleSight, shake, makeForgetling,
  T: () => T, life: () => life, lifeify, lifeifyTree, uLife, objective: () => objective(), makeTerrain, spawnEnemy, removeEnemies, lockPlayer: (v) => (player.locked = v),
  setLifeOverride: (v) => (lifeOverride = v), setCam: (v) => (camOverride = v), setFestival: (f) => (festivalUpd = f), outline, HERO_NAME, PORTAL3, LUK_PORTAL_POS: () => new THREE.Vector3(PORTAL.x + 3, 0, PORTAL.y + 4),
  region: () => region, REGIONS, fade: (v) => (document.getElementById('fade').style.opacity = v), mouseBlock: () => mouseBlock || keys.has('KeyK'), V2, SKY, cat, catPet, OAK,
};

let EV = null;
try { EV = initEvening(ctx, { OPT, H, FIRE3, sun, hemi, SUN_LIVE, MERMAID_GROUND, KIKI_POS, FIREBIRD_SEAT: FIREBIRD_SEAT.clone().add(OAK) }); ui.extra = () => EV.bookHtml(); } catch (e) { console.error('evening', e); EV = null; }
// ---------- старт ----------
function startGame(cont) {
  S.init();
  if (cont) { try { st = Object.assign(freshState(), JSON.parse(localStorage.getItem(SAVE_KEY))); } catch { st = freshState(); } }
  else { st = freshState(); save(); }
  if (st.restored) GAPS.forEach((g) => (chainLinks[g].visible = true));
  if (!st.heroes.includes(st.hero)) st.hero = 'ivan';
  Object.values(heroes).forEach((h) => (h.root.visible = false)); player.hero = st.hero; heroes[st.hero].root.visible = true;
  life = lifeTarget = baseLife(); lifeShown = -1;
  player.maxHp = 5 + (st.turnip === 3 ? 1 : 0) + (st.heroes.includes('finist') ? 1 : 0) + (EV ? EV.hpBonus() : 0); player.hp = player.maxHp; EV && EV.applyCharms();
  if (st.kolobok) kolobok.position.set(player.pos.x + 2, 0, player.pos.z);
  applyOpt(); spawnEnemies();
  if (st.region && st.region !== 'luk' && CHAPTER_READY.has(st.region)) { travel(st.region); } else { st.region = 'luk'; setRegion('luk'); }
  if (st.festival) ensureRegion('kosh').then((R) => R.startFestival && R.startFestival());
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
window.__game = { THREE, scene, camera, renderer, st: () => st, player, startGame, ui, enemies, attack, toggleSight, kolobok, setLife: (v) => (lifeOverride = v), travel, setRegion, REGIONS, switchHero, unlockHero, interact, nearest, hurtEnemy, objective, jump, ability, heroes, hittables, interactables, save, keys, groundH, region: () => region, ctx, S, EV: () => EV, cam: { get yaw() { return camYaw; }, set yaw(v) { camYaw = v; } } };
if ("serviceWorker" in navigator && location.protocol === "https:") setTimeout(() => navigator.serviceWorker.register("sw.js").catch(() => {}), 3000); // кэш музыки и моделей (только на https, напр. GitHub Pages)
loop();
