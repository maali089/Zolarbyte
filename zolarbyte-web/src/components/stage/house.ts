import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CAB,
  CABLE,
  CAR,
  CARPORT,
  OUTLETS,
  WALLBOX,
  H,
  P3,
  PV,
  SOUTH_DOOR,
  SOUTH_WINDOWS,
  TAN_PITCH,
  WIRES,
  WireId,
  roofTopY,
} from "./layout";

/* ---------- Wand mit Öffnungen ---------- */
function wallWithHoles(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  holes: ReadonlyArray<readonly [number, number, number, number]>,
  depth: number,
) {
  const s = new THREE.Shape();
  s.moveTo(x0, y0);
  s.lineTo(x1, y0);
  s.lineTo(x1, y1);
  s.lineTo(x0, y1);
  s.closePath();
  for (const [a, b, c, d] of holes) {
    const p = new THREE.Path();
    p.moveTo(a, c);
    p.lineTo(a, d);
    p.lineTo(b, d);
    p.lineTo(b, c);
    p.closePath();
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  return g;
}

function box(w: number, h: number, d: number, x: number, y: number, z: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

/** Satteldach als Chevron-Profil, entlang x extrudiert. */
function roofGeometry() {
  const zo = H.d / 2 + H.ovEave;
  const yb = (z: number) => H.ridge - Math.abs(z) * TAN_PITCH;
  const s = new THREE.Shape();
  s.moveTo(-zo, yb(zo));
  s.lineTo(0, H.ridge);
  s.lineTo(zo, yb(zo));
  s.lineTo(zo, yb(zo) + H.roofT);
  s.lineTo(0, H.ridge + H.roofT);
  s.lineTo(-zo, yb(zo) + H.roofT);
  s.closePath();
  const len = H.w + H.ovGable * 2;
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  g.rotateY(-Math.PI / 2);
  g.translate(len / 2, 0, 0);
  return g;
}

function gableGeometry(xMax: number) {
  const s = new THREE.Shape();
  const e = 0.02;
  s.moveTo(-H.d / 2 + e, H.eave);
  s.lineTo(H.d / 2 - e, H.eave);
  s.lineTo(0, H.ridge - e * 2);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: H.t, bevelEnabled: false });
  g.rotateY(-Math.PI / 2);
  g.translate(xMax, 0, 0);
  return g;
}

/** Gerundete Polylinie → Rohr. */
function filletPath(pts: ReadonlyArray<P3>, r: number) {
  const v = pts.map((p) => new THREE.Vector3(...p));
  const path = new THREE.CurvePath<THREE.Vector3>();
  let cur = v[0].clone();
  for (let i = 1; i < v.length - 1; i++) {
    const a = v[i - 1];
    const b = v[i];
    const c = v[i + 1];
    const d1 = b.clone().sub(a);
    const d2 = c.clone().sub(b);
    const rr = Math.min(r, d1.length() / 2.2, d2.length() / 2.2);
    const p1 = b.clone().sub(d1.normalize().multiplyScalar(rr));
    const p2 = b.clone().add(d2.normalize().multiplyScalar(rr));
    if (cur.distanceTo(p1) > 1e-4) path.add(new THREE.LineCurve3(cur.clone(), p1));
    path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2));
    cur = p2;
  }
  path.add(new THREE.LineCurve3(cur.clone(), v[v.length - 1].clone()));
  return path;
}

export function wireGeometry(id: WireId, radius = 0.04) {
  const path = filletPath(WIRES[id], 0.2);
  const len = path.getLength();
  const segs = Math.max(24, Math.round(len * 14));
  const g = new THREE.TubeGeometry(path, segs, radius, 8, false);
  return { geometry: g, length: len };
}

export function buildGeometries() {
  const hw = H.w / 2;
  const hd = H.d / 2;
  const roofLen = H.w + H.ovGable * 2;
  void roofLen;

  const south = wallWithHoles(-hw, hw, H.plinth, H.eave, [...SOUTH_WINDOWS, SOUTH_DOOR], H.t);
  south.translate(0, 0, hd - H.t);
  // Nordwand: ein kleines Fenster oben
  const north = wallWithHoles(-hw, hw, H.plinth, H.eave, [[-2.2, -1.0, 3.75, 5.0]], H.t);
  north.translate(0, 0, -hd);

  const west = box(H.t, H.eave - H.plinth, H.d - 0.02, -hw + H.t / 2, (H.eave + H.plinth) / 2, 0);

  const plinth = box(H.w, H.plinth, H.d, 0, H.plinth / 2, 0);
  const slabLen = H.w - H.t; // bis zur Ostkante (offen) – westlich in Wand
  const slab = box(slabLen, H.slabHi - H.slabLo, H.d - H.t * 2, hw - slabLen / 2, (H.slabHi + H.slabLo) / 2, 0);
  const ceil = box(slabLen, H.eave - H.ceilLo, H.d - H.t * 2, hw - slabLen / 2, (H.eave + H.ceilLo) / 2, 0);

  const gableE = gableGeometry(hw);
  const gableW = gableGeometry(-hw + H.t);

  // Poché: Schnittflächen an der Ostkante
  const e = 0.012;
  const cut: THREE.BufferGeometry[] = [
    box(e, H.eave - H.plinth, H.t, hw + e / 2, (H.eave + H.plinth) / 2, hd - H.t / 2), // Südwand
    box(e, H.eave - H.plinth, H.t, hw + e / 2, (H.eave + H.plinth) / 2, -hd + H.t / 2), // Nordwand
    box(e, H.slabHi - H.slabLo, H.d - H.t * 2, hw + e / 2, (H.slabHi + H.slabLo) / 2, 0),
    box(e, H.eave - H.ceilLo, H.d - H.t * 2, hw + e / 2, (H.eave + H.ceilLo) / 2, 0),
    box(e, H.plinth, H.d, hw + e / 2, H.plinth / 2, 0),
  ];

  // PV-Feld
  const pvW = PV.x1 - PV.x0;
  const pvDz = PV.z1 - PV.z0;
  const pvLen = pvDz / Math.cos(H.pitch);
  const pvGeom = new THREE.BoxGeometry(pvW, 0.07, pvLen);
  const pvPos = new THREE.Vector3((PV.x0 + PV.x1) / 2, roofTopY((PV.z0 + PV.z1) / 2) + 0.035, (PV.z0 + PV.z1) / 2);

  // Carport
  const c = CARPORT;
  const cw = c.x1 - c.x0;
  const cd = c.z1 - c.z0;
  const posts = [
    [c.x0 + 0.1, c.z1 - 0.1],
    [c.x1 - 0.1, c.z1 - 0.1],
    [c.x1 - 0.1, c.z0 + 0.1],
    [c.x0 + 0.1, c.z0 + 0.1],
  ].map(([x, z]) => box(0.16, c.h, 0.16, x, c.h / 2, z));
  const cpRoof = box(cw + 0.5, 0.2, cd + 0.5, (c.x0 + c.x1) / 2, c.h + 0.1, (c.z0 + c.z1) / 2);
  const cpBack = box(cw - 0.2, c.h - 0.05, 0.15, (c.x0 + c.x1) / 2, c.h / 2, c.z0 + 0.075);
  const cpPad = box(cw + 0.9, 0.05, cd + 0.9, (c.x0 + c.x1) / 2, 0.025, (c.z0 + c.z1) / 2);
  const pathPad = box(3.0, 0.04, 2.2, 6.9, 0.02, 1.5);

  // Wallbox
  const wallbox = box(0.36, 0.52, 0.14, WALLBOX.x, WALLBOX.y, c.z0 + 0.15 + 0.07);

  // Verteiler
  const cab = box(CAB.w, CAB.y1 - CAB.y0, CAB.d, CAB.x, (CAB.y0 + CAB.y1) / 2, CAB.zFront - CAB.d / 2);

  // Netzanschluss-Säule
  const pedestal = box(0.7, 1.2, 0.45, 7.8, 0.6, 1.5);
  const pedCap = box(0.8, 0.08, 0.55, 7.8, 1.24, 1.5);

  // Anschlussdose Abzweig
  const junction = new THREE.CylinderGeometry(0.17, 0.17, 0.05, 24);
  junction.translate(4.9, 0.045, 1.5);

  // Cabinet-Tür (Scharnier links, Ursprung an der Scharnierkante)
  const doorGeom = new THREE.BoxGeometry(CAB.w, CAB.y1 - CAB.y0, 0.04);
  doorGeom.translate(CAB.w / 2, 0, 0);

  const cable = new THREE.TubeGeometry(filletPath(CABLE, 0.18), 40, 0.022, 8, false);
  const car = buildCar();
  const outlets = buildOutlets();

  const wires = {} as Record<WireId, { geometry: THREE.TubeGeometry; length: number }>;
  (Object.keys(WIRES) as WireId[]).forEach((id) => {
    wires[id] = wireGeometry(id);
  });

  return {
    south, north, west, plinth, slab, ceil, gableE, gableW, cut,
    roof: roofGeometry(),
    pvGeom, pvPos, pvLen, pvW,
    posts, cpRoof, cpBack, cpPad, pathPad, wallbox, cab, pedestal, pedCap, junction,
    wires, doorGeom, cable, car, outlets,
    contours: buildContours(pvGeom, cab, wallbox, pedestal, pedCap),
  };
}

/** Abstrahiertes E-Auto: Seitenprofil extrudiert, Scheiben und Räder angedeutet. */
function buildCar() {
  const L = CAR.len;
  const body = new THREE.Shape();
  body.moveTo(0.35, 0.26);
  body.lineTo(L - 0.35, 0.26);
  body.quadraticCurveTo(L, 0.26, L, 0.6);
  body.lineTo(L, 0.8);
  body.quadraticCurveTo(L, 0.9, L - 0.5, 0.93);
  body.lineTo(L - 1.15, 1.4);
  body.quadraticCurveTo(L - 1.25, 1.47, L - 1.45, 1.47);
  body.lineTo(1.6, 1.47);
  body.quadraticCurveTo(0.95, 1.47, 0.6, 1.0);
  body.lineTo(0.2, 0.92);
  body.quadraticCurveTo(0, 0.88, 0, 0.6);
  body.quadraticCurveTo(0, 0.26, 0.35, 0.26);
  const place = (g: THREE.BufferGeometry, width: number) => {
    g.rotateY(-Math.PI / 2); // Länge → +z
    g.translate(CAR.cx + width / 2, 0, CAR.zRear);
    return g;
  };
  const bodyG = place(
    new THREE.ExtrudeGeometry(body, { depth: CAR.w - 0.07, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 2 }),
    CAR.w - 0.07,
  );
  // Scheiben als dunkles Band, minimal breiter als der Korpus
  const win = new THREE.Shape();
  win.moveTo(0.78, 0.98);
  win.lineTo(1.7, 1.4);
  win.lineTo(L - 1.55, 1.4);
  win.lineTo(L - 1.1, 0.98);
  win.closePath();
  const winG = place(new THREE.ExtrudeGeometry(win, { depth: CAR.w + 0.02, bevelEnabled: false }), CAR.w + 0.02);
  const wheels: THREE.BufferGeometry[] = [];
  for (const zz of [0.85, L - 0.85]) {
    for (const sx of [-1, 1]) {
      const w = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 24);
      w.rotateZ(Math.PI / 2);
      w.translate(CAR.cx + sx * (CAR.w / 2 - 0.08), 0.34, CAR.zRear + zz);
      wheels.push(w);
    }
  }
  const hubs: THREE.BufferGeometry[] = [];
  for (const zz of [0.85, L - 0.85]) {
    for (const sx of [-1, 1]) {
      const hgeo = new THREE.CylinderGeometry(0.19, 0.19, 0.05, 20);
      hgeo.rotateZ(Math.PI / 2);
      hgeo.translate(CAR.cx + sx * (CAR.w / 2 + 0.035), 0.33, CAR.zRear + zz);
      hubs.push(hgeo);
    }
  }
  return { body: bodyG, windows: winG, wheels: mergeGeometries(wheels)!, hubs: mergeGeometries(hubs)! };
}

function buildOutlets() {
  const plates: THREE.BufferGeometry[] = [];
  const dots: THREE.BufferGeometry[] = [];
  const z = -H.d / 2 + H.t - 0.0;
  for (const [x, y] of OUTLETS) {
    plates.push(box(0.14, 0.14, 0.03, x, y, z + 0.015));
    dots.push(box(0.02, 0.045, 0.01, x - 0.03, y, z + 0.034));
    dots.push(box(0.02, 0.045, 0.01, x + 0.03, y, z + 0.034));
  }
  return { plates: mergeGeometries(plates)!, dots: mergeGeometries(dots)! };
}

/** Konturlinien (EdgesGeometry) – um den Mittelpunkt zentriert, Position separat. */
function buildContours(
  pv: THREE.BufferGeometry,
  cab: THREE.BufferGeometry,
  wallbox: THREE.BufferGeometry,
  pedestal: THREE.BufferGeometry,
  pedCap: THREE.BufferGeometry,
) {
  const centered = (geos: THREE.BufferGeometry[]) => {
    const m = mergeGeometries(geos.map((g) => g.clone().toNonIndexed()))!;
    m.computeBoundingBox();
    const c = m.boundingBox!.getCenter(new THREE.Vector3());
    m.translate(-c.x, -c.y, -c.z);
    return { geo: new THREE.EdgesGeometry(m, 30), pos: [c.x, c.y, c.z] as [number, number, number] };
  };
  return {
    pv: { geo: new THREE.EdgesGeometry(pv, 30) },
    verteiler: centered([cab]),
    wallbox: centered([wallbox]),
    netz: centered([pedestal, pedCap]),
  };
}


export type Geometries = ReturnType<typeof buildGeometries>;

/** Fensterrahmen (Schiefer), Glas und Innenlicht-Karten der Südwand + Nordfenster + Tür. */
export function buildWindowParts() {
  const hd = H.d / 2;
  const zMid = hd - H.t / 2;
  const frames: THREE.BufferGeometry[] = [];
  const glass: THREE.BufferGeometry[] = [];
  const glow: THREE.BufferGeometry[] = [];
  const bar = 0.07;
  const fd = 0.1;

  const addWindow = (a: number, b: number, c: number, d: number, z: number, faceZ: number) => {
    const w = b - a;
    const h = d - c;
    const cx = (a + b) / 2;
    const cy = (c + d) / 2;
    frames.push(box(w, bar, fd, cx, c + bar / 2, z));
    frames.push(box(w, bar, fd, cx, d - bar / 2, z));
    frames.push(box(bar, h, fd, a + bar / 2, cy, z));
    frames.push(box(bar, h, fd, b - bar / 2, cy, z));
    frames.push(box(0.045, h - bar, fd * 0.8, cx, cy, z)); // Pfosten
    const gp = new THREE.PlaneGeometry(w - bar, h - bar);
    gp.translate(cx, cy, z);
    glass.push(gp);
    const lp = new THREE.PlaneGeometry(w - bar * 2, h - bar * 2);
    lp.translate(cx, cy, faceZ);
    glow.push(lp);
  };
  for (const [a, b, c, d] of SOUTH_WINDOWS) addWindow(a, b, c, d, zMid, hd - H.t - 0.18);
  addWindow(-2.2, -1.0, 3.75, 5.0, -zMid, -hd + H.t + 0.18);

  // Tür
  const [dx0, dx1, dy0, dy1] = SOUTH_DOOR;
  frames.push(box(dx1 - dx0 - 0.08, dy1 - dy0 - 0.04, 0.06, (dx0 + dx1) / 2, (dy0 + dy1) / 2, hd - 0.1));
  const handle = box(0.04, 0.5, 0.05, dx1 - 0.2, 1.2, hd - 0.05);
  frames.push(handle);

  return {
    frames: mergeGeometries(frames)!,
    glass: mergeGeometries(glass)!,
    glow: mergeGeometries(glow)!,
  };
}
