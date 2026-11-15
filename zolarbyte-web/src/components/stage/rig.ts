import * as THREE from "three";
import { daylight } from "@/lib/daylight";
import { PARTS, WIRES, WireId, type PartKey } from "./layout";
import { dayState } from "./flow";
import { LIT_WIRES, PRESETS, type PresetId } from "./presets";
import type { createMaterials } from "./materials";
import type { createWireMaterial } from "./flow";

export const WIRE_IDS = Object.keys(WIRES) as WireId[];
export const PART_KEYS = Object.keys(PARTS) as PartKey[];
const LAMP_WIRES: WireId[] = ["wohnen", "zimmer2", "zimmer1"];

const AMBER_LOW = new THREE.Color("#ff9d1c");
const SUN_WHITE = new THREE.Color("#fff6ea");
const HEMI_DAY = new THREE.Color("#f3f4f7");
const HEMI_NIGHT = new THREE.Color("#7a7196");
const GROUND_DAY = new THREE.Color("#d8d4c9");
const GROUND_NIGHT = new THREE.Color("#3a3348");
const FILL_DAY = new THREE.Color("#fffcf6");
const FILL_NIGHT = new THREE.Color("#a99fc6");
const AMBER = new THREE.Color("#f2a20c");
const RIGHT = new THREE.Vector3();
const TGT = new THREE.Vector3();
const V = new THREE.Vector3();

export interface RigState {
  shown: number;
  clock: number;
  frames: number;
  px: number;
  py: number;
  sx: number;
  sy: number;
  /** tx, ty, tz, az, el, dist */
  cam: number[];
  vel: number[];
  camInit: boolean;
  preset: PresetId;
  hover: PartKey | null;
  dim: Record<WireId, number>;
  contour: Record<PartKey, number>;
  door: number;
  doorVel: number;
  labelKey: string;
  view: string;
}

export interface RigEnv {
  reduced: boolean;
  mobile: boolean;
  /** Renderings: Kamera/Zustand sofort, keine Drift */
  snap: boolean;
  labels: boolean;
  /** Renderings: Motiv mittig statt in der rechten Bildhälfte */
  centered: boolean;
}

export interface RigCtx {
  dt: number;
  env: RigEnv;
  state: RigState;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  size: { width: number; height: number };
  sun: THREE.DirectionalLight | null;
  fill: THREE.DirectionalLight | null;
  hemi: THREE.HemisphereLight | null;
  lampA: THREE.PointLight | null;
  lampB: THREE.PointLight | null;
  doorPivot: THREE.Object3D | null;
  labels: Record<PartKey, HTMLElement | null>;
  kit: {
    shadowCatcher: THREE.ShadowMaterial;
    m: ReturnType<typeof createMaterials>;
    lampMats: THREE.MeshStandardMaterial[];
    wireMats: Record<WireId, ReturnType<typeof createWireMaterial>>;
  };
}

const zero = <T extends string>(keys: T[], v: number) => Object.fromEntries(keys.map((k) => [k, v])) as Record<T, number>;

export const initialRigState = (preset: PresetId = "overview"): RigState => ({
  shown: daylight.get(),
  clock: 0,
  frames: 0,
  px: 0,
  py: 0,
  sx: 0,
  sy: 0,
  cam: [0, 0, 0, 0, 0, 0],
  vel: [0, 0, 0, 0, 0, 0],
  camInit: false,
  preset,
  hover: null,
  dim: zero(WIRE_IDS, 1),
  contour: zero(PART_KEYS, 0),
  door: 0,
  doorVel: 0,
  labelKey: "",
  view: "",
});

export function setEnvironment(scene: THREE.Scene, tex: THREE.Texture | null) {
  scene.environment = tex;
}

/** Kritisch gedämpfte Feder (SmoothDamp). */
function smooth(s: RigState, i: number, target: number, smoothTime: number, dt: number) {
  const om = 2 / smoothTime;
  const x = om * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = s.cam[i] - target;
  const temp = (s.vel[i] + om * change) * dt;
  s.vel[i] = (s.vel[i] - om * temp) * e;
  s.cam[i] = target + (change + temp) * e;
}

const toRad = THREE.MathUtils.degToRad;

/** Pro-Frame-Aktualisierung von Kamera, Licht, Materialien, Fluss und Beschriftungen. */
export function stepFrame(c: RigCtx) {
  const { env, state: s, camera: cam, scene } = c;
  const dt = Math.min(c.dt, 0.1);
  const pre = PRESETS[s.preset];
  const target = daylight.get();
  if (env.reduced) s.shown = target;
  else {
    s.shown += (target - s.shown) * (1 - Math.exp(-dt * 4.5));
    if (Math.abs(target - s.shown) < 0.002) s.shown = target;
  }
  const st = dayState(s.shown);
  if (!env.reduced) s.clock += dt;
  s.frames += 1;
  const k = (rate: number) => (env.snap ? 1 : 1 - Math.exp(-dt * rate));

  // ---- Kamera ----
  s.sx += (s.px - s.sx) * (1 - Math.exp(-dt * 3));
  s.sy += (s.py - s.sy) * (1 - Math.exp(-dt * 3));
  const aspect = c.size.width / Math.max(1, c.size.height);
  const tanV = Math.tan(toRad(cam.fov) / 2);
  // Querformat: Motivmitte bei ~70 % Breite, Text links bleibt frei; sonst mittig
  const land = env.centered ? 0 : THREE.MathUtils.smoothstep(aspect, 1.0, 1.3);
  const cxFrac = THREE.MathUtils.lerp(0.5, pre.span === 0 ? 0.78 : 0.745, land);
  const wFrac = THREE.MathUtils.lerp(1, pre.span === 0 ? 0.52 : 0.47, land);
  const vw = Math.round(c.size.width);
  const vh = Math.round(c.size.height);
  const viewKey = `${vw}x${vh}:${cxFrac.toFixed(3)}`;
  if (s.view !== viewKey) {
    s.view = viewKey;
    if (cxFrac === 0.5) cam.clearViewOffset();
    else cam.setViewOffset(vw, vh, -(cxFrac - 0.5) * vw, 0, vw, vh);
    cam.updateProjectionMatrix();
  }
  let dist: number;
  let tx = pre.target[0];
  const ty = pre.target[1];
  const tz = pre.target[2];
  if (pre.span === 0) {
    const fitW = THREE.MathUtils.lerp(12.5, 16.5, THREE.MathUtils.smoothstep(aspect, 0.45, 1.1));
    dist = Math.max(13.4 / 2 / tanV, fitW / 2 / (tanV * aspect * wFrac));
    const shiftT = 1 - THREE.MathUtils.smoothstep(aspect, 0.5, 1.2);
    RIGHT.set(Math.cos(toRad(pre.az)), 0, -Math.sin(toRad(pre.az)));
    TGT.set(tx, ty, tz).addScaledVector(RIGHT, -3.0 * shiftT);
    tx = TGT.x;
    s.cam[2] = s.camInit ? s.cam[2] : TGT.z;
    dist = Math.max(dist, 0);
    const want = [TGT.x, ty, TGT.z, pre.az, pre.el, dist];
    applyCam(s, want, env.snap, dt);
  } else {
    dist = Math.max(pre.span / 2 / tanV, (pre.span * 1.15) / 2 / (tanV * aspect * wFrac));
    applyCam(s, [tx, ty, tz, pre.az, pre.el, dist], env.snap, dt);
  }
  const drift = env.reduced || env.snap ? 0 : 1;
  const az = toRad(s.cam[3]) + s.sx * toRad(3) + drift * Math.sin(s.clock * 0.27) * toRad(1);
  const el = toRad(s.cam[4]) - s.sy * toRad(1.8) + drift * Math.sin(s.clock * 0.2) * toRad(0.4);
  TGT.set(s.cam[0], s.cam[1], s.cam[2]);
  const d = s.cam[5];
  cam.position.set(
    TGT.x + d * Math.sin(az) * Math.cos(el),
    TGT.y + d * Math.sin(el),
    TGT.z + d * Math.cos(az) * Math.cos(el),
  );
  cam.lookAt(TGT);
  const far = d * 3;
  const near = d * 0.25;
  if (cam.far !== far || cam.near !== near) {
    cam.near = near;
    cam.far = far;
    cam.updateProjectionMatrix();
  }
  cam.updateMatrixWorld();
  cam.matrixWorldInverse.copy(cam.matrixWorld).invert();

  // ---- Sonne / Licht ----
  const azS = toRad(st.sun.azimuth);
  const altS = toRad(Math.max(st.sun.altitude, 7));
  const sun = c.sun;
  if (sun) {
    sun.position.set(40 * Math.sin(azS) * Math.cos(altS) + 4.7, 40 * Math.sin(altS), -0.8 - 40 * Math.cos(azS) * Math.cos(altS));
    sun.target.position.set(4.7, 3.5, -0.8);
    sun.target.updateMatrixWorld();
    sun.intensity = 5 * Math.pow(st.sun.intensity, 0.9) * THREE.MathUtils.lerp(1, 0.4, st.night);
    const warm = 1 - THREE.MathUtils.smoothstep(st.sun.altitude, 8, 48);
    sun.color.copy(SUN_WHITE).lerp(AMBER_LOW, warm * 0.75);
  }
  if (c.hemi) {
    c.hemi.color.copy(HEMI_DAY).lerp(HEMI_NIGHT, st.night);
    c.hemi.groundColor.copy(GROUND_DAY).lerp(GROUND_NIGHT, st.night);
    c.hemi.intensity = THREE.MathUtils.lerp(0.4, 0.16, st.night);
  }
  if (c.fill) {
    c.fill.color.copy(FILL_DAY).lerp(FILL_NIGHT, st.night);
    c.fill.intensity = THREE.MathUtils.lerp(0.95, 0.09, st.night);
  }
  scene.environmentIntensity = THREE.MathUtils.lerp(0.7, 0.05, st.night);
  c.kit.shadowCatcher.opacity = 0.34 * Math.pow(st.sun.intensity, 0.6);

  // ---- Fokus / Hervorhebung ----
  const eff: PartKey | null = s.hover ?? pre.hl;
  const litSet = new Set<WireId>(eff ? (s.hover ? LIT_WIRES[s.hover] : (pre.lit ?? LIT_WIRES[eff])) : []);
  const powerOf: Record<WireId, number> = {
    pv: st.pv,
    netz: st.grid,
    zuleitung: st.load,
    wohnen: st.load,
    zimmer1: st.load,
    zimmer2: st.load,
    wallbox: st.load * Math.max(0.35, st.charging),
  };
  const t = env.reduced ? 0.55 : s.clock * (env.mobile ? 0.55 : 0.8);
  WIRE_IDS.forEach((id) => {
    const u = c.kit.wireMats[id].uniforms;
    const dimT = !eff ? 1 : litSet.has(id) ? 1 : 0.28;
    s.dim[id] += (dimT - s.dim[id]) * k(5);
    u.uPower.value = powerOf[id];
    u.uNight.value = st.night;
    u.uDim.value = s.dim[id];
    u.uHot.value = eff && litSet.has(id) ? s.dim[id] : 0;
    u.uTime.value = t;
  });
  PART_KEYS.forEach((key) => {
    s.contour[key] += ((eff === key ? 0.95 : 0) - s.contour[key]) * k(6);
    c.kit.m.contours[key].opacity = s.contour[key];
  });

  // ---- Innenlicht + Glimmern beim Eintreffen eines Pulses ----
  c.kit.m.glow.opacity = st.lamps * 0.85;
  c.kit.lampMats.forEach((l, i) => {
    const u = c.kit.wireMats[LAMP_WIRES[i]].uniforms;
    const f = (((u.uLen.value / u.uSpacing.value - u.uTime.value) % 1) + 1) % 1;
    const glim = Math.pow(f, 4.5) * THREE.MathUtils.smoothstep(u.uPower.value, 0.03, 0.3);
    l.emissiveIntensity = st.lamps * 2.2 + glim * 1.7 * (1 - st.lamps * 0.5);
  });
  if (c.lampA) c.lampA.intensity = st.lamps * 6;
  if (c.lampB) c.lampB.intensity = st.lamps * 6;

  // Wallbox-LED: Amber, pulsiert während der Ladung
  const pulse = env.reduced ? 0.85 : 0.55 + 0.45 * Math.sin(s.clock * 3.2);
  c.kit.m.led.color.copy(AMBER).multiplyScalar(0.1 + 0.9 * st.charging * pulse);

  // Schranktür
  const doorT = pre.doorOpen ?? 0;
  if (env.snap) s.door = doorT;
  else {
    const om = 2 / 0.35;
    const x = om * dt;
    const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = s.door - doorT;
    const temp = (s.doorVel + om * change) * dt;
    s.doorVel = (s.doorVel - om * temp) * e;
    s.door = doorT + (change + temp) * e;
  }
  if (c.doorPivot) c.doorPivot.rotation.y = -s.door * 1.9;

  updateLabels(c, eff);
}

function applyCam(s: RigState, want: number[], snap: boolean, dt: number) {
  if (!s.camInit || snap) {
    s.cam = [...want];
    s.vel = [0, 0, 0, 0, 0, 0];
    s.camInit = true;
    return;
  }
  for (let i = 0; i < 6; i++) smooth(s, i, want[i], 0.4, dt);
}

function updateLabels(c: RigCtx, eff: PartKey | null) {
  const { state: s, env } = c;
  const pre = PRESETS[s.preset];
  const w = c.size.width;
  const h = c.size.height;
  const parts: string[] = [];
  PART_KEYS.forEach((key) => {
    const el = c.labels[key];
    if (!el) return;
    const active = pre.hl === key || s.hover === key;
    const showAll = pre.labels === "all" && !env.mobile;
    const visible = env.labels && (active || showAll);
    V.set(...PARTS[key].anchor).project(c.camera);
    const x = (V.x * 0.5 + 0.5) * w;
    const y = (-V.y * 0.5 + 0.5) * h;
    const inView = V.z < 1 && x > 8 && x < w - 8 && y > 8 && y < h - 8;
    const state = visible && inView ? (active ? "active" : "idle") : "hidden";
    parts.push(`${key}:${state}:${x.toFixed(0)}:${y.toFixed(0)}`);
    if (el.dataset.state !== state) el.dataset.state = state;
    if (env.mobile) {
      // Mobil: Pille in der unteren Randleiste (nie über dem Motiv, nie im Sonnenbogen oben),
      // der Leader läuft senkrecht vom Bauteil dorthin.
      const pill = el.lastElementChild as HTMLElement | null;
      if (!el.dataset.pw || el.dataset.pw === "0") el.dataset.pw = String(pill?.offsetWidth ?? 0);
      const pw = Number(el.dataset.pw);
      const lead = Math.max(14, h - 30 - y);
      const px = Math.min(Math.max(x - pw / 2, 6), w - pw - 6) - x;
      el.style.setProperty("--lead", `${lead.toFixed(0)}px`);
      el.style.setProperty("--px", `${px.toFixed(0)}px`);
      if (el.dataset.dir !== "down") el.dataset.dir = "down";
    } else {
      const side = x + 200 > w ? "l" : x - 200 < 0 ? "r" : PARTS[key].side;
      if (el.dataset.side !== side) el.dataset.side = side;
    }
    el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    void eff;
  });
  s.labelKey = parts.join("|");
}

/** Hover-Handler (R3F-Pointer-Events) je Bauteil; setzt Fokus-Highlight und Cursor. */
export function makeHoverProps(
  ref: { current: RigState },
  canvas: HTMLElement,
  enabled: boolean,
  invalidate: () => void,
) {
  const set = (key: PartKey | null) => {
    if (!enabled) return;
    ref.current.hover = key;
    canvas.style.cursor = key ? "pointer" : "";
    invalidate();
  };
  return Object.fromEntries(
    PART_KEYS.map((key) => [
      key,
      {
        onPointerOver: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          set(key);
        },
        onPointerOut: () => set(null),
      },
    ]),
  ) as Record<PartKey, { onPointerOver: (e: { stopPropagation: () => void }) => void; onPointerOut: () => void }>;
}
