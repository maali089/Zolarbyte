import * as THREE from "three";
import { dusk, sunAt } from "@/lib/daylight";

/** Abgeleiteter Zustand pro Stunde – reine Funktion, keine Zahlen in der Szene. */
export function dayState(hour: number) {
  const sun = sunAt(hour);
  const night = dusk(hour);
  const grid = THREE.MathUtils.smoothstep(night, 0.12, 0.55);
  const pv = sun.intensity * (1 - grid);
  const load = Math.min(1, pv + grid);
  // Innenlicht: ab Abenddämmerung (und frühmorgens)
  const lamps = THREE.MathUtils.smoothstep(night, 0.15, 0.7);
  // Wallbox lädt ab ~16 Uhr bis in die Nacht
  const charging =
    THREE.MathUtils.smoothstep(hour, 15.6, 16.4) * (1 - THREE.MathUtils.smoothstep(hour, 21.1, 21.4));
  return { sun, night, grid, pv, load, lamps, charging };
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalV;
  void main() {
    vUv = uv;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPower;
  uniform float uLen;
  uniform float uSpacing;
  uniform float uNight;
  uniform float uDim;
  uniform float uHot;
  uniform vec3 uGhost;
  uniform vec3 uBase;
  uniform vec3 uHi;
  varying vec2 vUv;
  varying vec3 vNormalV;
  void main() {
    float x = vUv.x * uLen / uSpacing - uTime;
    float f = fract(x);
    float head = pow(f, 4.5);
    float core = smoothstep(0.86, 1.0, f);
    float on = smoothstep(0.03, 0.3, uPower);
    float pulse = head * on * uDim;
    vec3 col = mix(uGhost, uBase, 0.2 + 0.8 * uPower);
    col = mix(uGhost, col, uDim);
    col = mix(col, uHi, pulse + uHot * 0.18);
    col += vec3(core * core * 0.55 * on * uDim);
    float shade = 0.72 + 0.28 * clamp(vNormalV.z, 0.0, 1.0);
    col *= mix(shade, 1.0, 0.55 + 0.45 * uNight + pulse);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export interface WireMaterial extends THREE.ShaderMaterial {
  uniforms: {
    uTime: { value: number };
    uPower: { value: number };
    uLen: { value: number };
    uSpacing: { value: number };
    uNight: { value: number };
    uDim: { value: number };
    uHot: { value: number };
    uGhost: { value: THREE.Color };
    uBase: { value: THREE.Color };
    uHi: { value: THREE.Color };
  };
}

export function createWireMaterial(length: number, spacing: number): WireMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uPower: { value: 0 },
      uLen: { value: length },
      uSpacing: { value: spacing },
      uNight: { value: 0 },
      uDim: { value: 1 },
      uHot: { value: 0 },
      uGhost: { value: new THREE.Color("#d9bccb") },
      uBase: { value: new THREE.Color("#c51c84") },
      uHi: { value: new THREE.Color("#ff6bbb") },
    },
  }) as WireMaterial;
}
