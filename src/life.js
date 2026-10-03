// «Жизнь» мира для текстурированных материалов: шейдерная десатурация (серый мир → цветной).
import * as THREE from 'three';
export const uLife = { value: 0.12 };
export const uSight = { value: 0 };
export function lifeify(mat) {
  if (!mat || mat.userData.lifeified || mat.userData.keep || mat.isShaderMaterial || mat.isMeshBasicMaterial || mat.isPointsMaterial || mat.isLineBasicMaterial || mat.isSpriteMaterial) return mat;
  mat.userData.lifeified = true;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    prev && prev(sh, r);
    sh.uniforms.uLife = uLife;
    sh.fragmentShader = 'uniform float uLife;\n' + sh.fragmentShader.replace(/}\s*$/, `
  { float l = dot(gl_FragColor.rgb, vec3(0.3, 0.59, 0.11)); vec3 g = vec3(l * 0.8 + 0.05, l * 0.8 + 0.055, l * 0.8 + 0.065);
    gl_FragColor.rgb = mix(g, gl_FragColor.rgb, uLife); }
}`);
  };
  mat.customProgramCacheKey = () => 'life';
  mat.needsUpdate = true; return mat;
}
export function lifeifyTree(root) { root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(lifeify); }); }
