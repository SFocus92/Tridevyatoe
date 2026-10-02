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
