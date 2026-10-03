// Загрузка CC0-моделей Kenney Nature Kit и перекраска в «лубочную» палитру + cel-shading.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const PALETTE = {
  stone: 0x9d9a92, leafsFall: 0xe39b3a, wood: 0x9a6a3e, grass: 0x5bab3f, woodBirch: 0xf0e6cc,
  dirtDark: 0x6e4a2e, dirt: 0x8d7a66, woodInner: 0xe8cfa0, _defaultMat: 0xf5efe2, colorPurple: 0x9b6ad6,
  colorRed: 0xd8343a, colorYellow: 0xffc93a, leafsGreen: 0x4aa64a, leafsDark: 0x2f7a3a, woodBark: 0x7a4a2a,
  colorTan: 0xd9a066, woodDark: 0x5a3a22, woodBarkDark: 0x5e3b22,
};

export async function loadModels(names, toon, onProgress) {
  const loader = new GLTFLoader(); const out = {}; const matCache = {}; let done = 0;
  await Promise.all(names.map(async (n) => {
    const g = await loader.loadAsync(`assets/models/${n}.glb`);
    const root = g.scene;
    root.traverse((o) => {
      if (!o.isMesh) return;
      const swap = (m) => {
        const key = m.name || m.uuid;
        if (!matCache[key]) matCache[key] = toon(PALETTE[m.name] ?? m.color.getHex());
        return matCache[key];
      };
      o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
      o.castShadow = true; o.receiveShadow = true;
    });
    out[n] = root; onProgress && onProgress(++done / names.length);
  }));
  return { models: out, mats: matCache };
}

// Экземпляр модели в мире
export function place(models, scene, name, x, y, z, s = 1, ry = 0) {
  const o = models[name].clone(true); o.position.set(x, y, z); o.scale.setScalar(s); o.rotation.y = ry; scene.add(o); return o;
}

// Много копий одной модели одним вызовом отрисовки (трава, цветы)
export function instanced(model, transforms, scene) {
  model.updateMatrixWorld(true);
  const parts = []; const m = new THREE.Matrix4();
  model.traverse((o) => {
    if (!o.isMesh) return;
    const im = new THREE.InstancedMesh(o.geometry, o.material, transforms.length);
    im.receiveShadow = true; im.userData.local = o.matrixWorld.clone(); scene.add(im); parts.push(im);
  });
  const set = (scaleK = 1) => {
    const q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    transforms.forEach((t, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t.ry); s.setScalar(Math.max(0.0001, t.s * scaleK)); p.copy(t.p);
      m.compose(p, q, s);
      parts.forEach((im) => { const mm = m.clone().multiply(im.userData.local); im.setMatrixAt(i, mm); });
    });
    parts.forEach((im) => { im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); });
  };
  set(1);
  return { parts, set };
}

// Текстурированные наборы (colormap): Kenney Castle/Graveyard/Holiday/Fantasy Town/Survival/Cube Pets — всё CC0.
// Материалы переводятся в cel-shading с сохранением текстуры; «серость» мира — шейдером (life.js).
export async function loadKits(list, grad, lifeify, onProgress) {
  const loader = new GLTFLoader(); const out = {}; const anims = {}; let done = 0; const cache = new Map();
  await Promise.all(list.map(async (path) => {
    const g = await loader.loadAsync(`assets/kits/${path}.glb`);
    g.scene.traverse((o) => {
      if (!o.isMesh) return;
      const swap = (m) => {
        if (cache.has(m.map || m)) return cache.get(m.map || m);
        if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.magFilter = THREE.NearestFilter; }
        const t = lifeify(new THREE.MeshToonMaterial({ color: m.map ? 0xffffff : m.color, map: m.map || null, gradientMap: grad, transparent: m.transparent, opacity: m.opacity }));
        cache.set(m.map || m, t); return t;
      };
      o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
      o.castShadow = true; o.receiveShadow = true;
    });
    const key = path.replace('/animal-', '/');
    out[key] = g.scene; anims[key] = g.animations; onProgress && onProgress(++done / list.length);
  }));
  return { kits: out, anims };
}
