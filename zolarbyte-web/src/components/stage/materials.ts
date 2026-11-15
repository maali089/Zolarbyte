import * as THREE from "three";
import { cabinetDoorTexture, cabinetTexture, glowTexture, pvTexture } from "./textures";

/** Tonmaquette: warmweißer Kalk, matt. Slate nur für Schnitt/Rahmen/PV. */
export function createMaterials(pvAspect: number) {
  const plaster = new THREE.MeshStandardMaterial({ color: "#e8e9e4", roughness: 0.93, metalness: 0 });
  const interior = new THREE.MeshStandardMaterial({ color: "#eff0eb", roughness: 0.95, metalness: 0 });
  const roof = new THREE.MeshStandardMaterial({ color: "#d3d4cf", roughness: 0.95, metalness: 0 });
  const pad = new THREE.MeshStandardMaterial({ color: "#e3e4de", roughness: 1, metalness: 0 });
  const slate = new THREE.MeshStandardMaterial({ color: "#24272e", roughness: 0.82, metalness: 0 });
  const frame = new THREE.MeshStandardMaterial({ color: "#2b2e36", roughness: 0.6, metalness: 0.2 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#b4bfcf",
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.3,
    envMapIntensity: 1.4,
    depthWrite: false,
  });

  const pvTex = pvTexture(4, 3, pvAspect);
  const pvSide = new THREE.MeshStandardMaterial({ color: "#aeb2b9", roughness: 0.5, metalness: 0.5 });
  const pvTop = new THREE.MeshPhysicalMaterial({
    map: pvTex,
    roughness: 0.3,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6,
  });
  // BoxGeometry-Reihenfolge: +x, -x, +y, -y, +z, -z
  const pv = [pvSide, pvSide, pvTop, pvSide, pvSide, pvSide];

  const cabTex = cabinetTexture();
  const doorTex = cabinetDoorTexture();
  const cabSide = new THREE.MeshStandardMaterial({ color: "#3a3e48", roughness: 0.7, metalness: 0.2 });
  const cabFront = new THREE.MeshStandardMaterial({ map: cabTex, roughness: 0.6, metalness: 0.1 });
  const cab = [cabSide, cabSide, cabSide, cabSide, cabFront, cabSide];
  const doorFront = new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.4, metalness: 0.35 });
  const door = [cabSide, cabSide, cabSide, cabSide, doorFront, cabSide];

  const car = new THREE.MeshPhysicalMaterial({
    color: "#f3f3ef",
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
  });
  const carGlass = new THREE.MeshStandardMaterial({ color: "#20242c", roughness: 0.25, metalness: 0.2 });
  const cable = new THREE.MeshStandardMaterial({ color: "#2a2d34", roughness: 0.6 });
  const led = new THREE.MeshBasicMaterial({ color: new THREE.Color("#f2a20c"), toneMapped: false });
  const contour = (o = 0) =>
    new THREE.LineBasicMaterial({ color: "#c51c84", transparent: true, opacity: o, depthWrite: false });
  const contours = { pv: contour(), verteiler: contour(), wallbox: contour(), netz: contour() };

  const lamp = new THREE.MeshStandardMaterial({
    color: "#f4f4ef",
    roughness: 0.5,
    emissive: new THREE.Color("#f2a20c"),
    emissiveIntensity: 0,
  });

  const glowTex = glowTexture();
  const glow = new THREE.MeshBasicMaterial({
    map: glowTex,
    color: new THREE.Color("#f6a628"),
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const status = new THREE.MeshBasicMaterial({ color: "#c51c84", toneMapped: false });

  return { plaster, interior, roof, pad, slate, frame, glass, pv, pvTop, cab, door, car, carGlass, cable, led, contours, lamp, glow, status, textures: [pvTex, cabTex, doorTex, glowTex] };
}
export type Materials = ReturnType<typeof createMaterials>;
