/**
 * Energiehaus – Geometrie und Projektion.
 *
 * Das Haus ist in echten Metern modelliert (x = Traufseite nach rechts, y = Höhe,
 * z = Tiefe nach hinten) und wird mit einer festen Perspektivkamera in ein SVG
 * projiziert. Das läuft beim Build bzw. auf dem Server – im Browser kommt nur
 * fertiges SVG an. Reines TypeScript ohne React, damit es auch im Vorschau-Skript
 * (scripts/render-house.ts) und in Tests direkt läuft.
 */

type V = [number, number, number];
export type Pt = { x: number; y: number };

/* ---------- Kamera ---------- */

const CAM: V = [23, 8.6, -21.5];
const TARGET: V = [6.4, 2.9, 3.2];

const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

const FWD = norm(sub(TARGET, CAM));
const RIGHT = norm(cross([0, 1, 0], FWD));
const UP = cross(FWD, RIGHT);

function raw(p: V): [number, number] {
  const d = sub(p, CAM);
  const zc = dot(d, FWD);
  return [dot(d, RIGHT) / zc, -dot(d, UP) / zc];
}

/* Bildausschnitt: Haus, Anbau, Wärmepumpe und etwas Umgebung */
const FRAME: V[] = [
  [-1.6, 0, -2.4],
  [-1.6, 9.3, 4.25],
  [16.8, 0, -2.6],
  [16.8, 3.2, 6.2],
  [-2.8, 6.5, 6],
  [11.4, 9.2, 4.25],
];

export const VIEW_W = 1000;
const PAD = 26;
const bounds = FRAME.map(raw).reduce(
  (b, [x, y]) => ({ x0: Math.min(b.x0, x), x1: Math.max(b.x1, x), y0: Math.min(b.y0, y), y1: Math.max(b.y1, y) }),
  { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity },
);
const SCALE = (VIEW_W - 2 * PAD) / (bounds.x1 - bounds.x0);
export const VIEW_H = Math.round((bounds.y1 - bounds.y0) * SCALE + 2 * PAD);

const r1 = (n: number) => Math.round(n * 10) / 10;

export function P(p: V): Pt {
  const [x, y] = raw(p);
  return { x: r1((x - bounds.x0) * SCALE + PAD), y: r1((y - bounds.y0) * SCALE + PAD) };
}

export const poly = (pts: V[]) => pts.map((p, i) => `${i ? "L" : "M"}${P(p).x} ${P(p).y}`).join("") + "Z";
export const line = (pts: V[]) => pts.map((p, i) => `${i ? "L" : "M"}${P(p).x} ${P(p).y}`).join("");

/** Prozentuale Lage eines Punkts – für HTML-Beschriftungen über dem SVG */
export function pct(p: V) {
  const q = P(p);
  return { left: r1((q.x / VIEW_W) * 1000) / 10, top: r1((q.y / VIEW_H) * 1000) / 10 };
}

/** Lokales, affines Koordinatensystem einer kleinen Fläche (für drehende Teile) */
function frameMatrix(origin: V, ex: V, ey: V) {
  const o = raw(origin);
  const a = raw([origin[0] + ex[0], origin[1] + ex[1], origin[2] + ex[2]]);
  const b = raw([origin[0] + ey[0], origin[1] + ey[1], origin[2] + ey[2]]);
  const m = [(a[0] - o[0]) * SCALE, (a[1] - o[1]) * SCALE, (b[0] - o[0]) * SCALE, (b[1] - o[1]) * SCALE];
  const O = P(origin);
  return `matrix(${m.map((n) => n.toFixed(2)).join(" ")} ${O.x} ${O.y})`;
}

/* ---------- Licht und Material ---------- */

const LIGHT = norm([-0.55, 0.85, -0.7]);

function hex(c: string) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lit(color: string, normal: V, amb = 0.62) {
  const k = amb + (1 - amb) * Math.max(0, dot(norm(normal), LIGHT));
  const [r, g, b] = hex(color).map((c) => Math.round(Math.min(255, c * k)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const N = {
  front: [0, 0, -1] as V,
  right: [1, 0, 0] as V,
  top: [0, 1, 0] as V,
  roof: norm([0, Math.cos((35 * Math.PI) / 180), -Math.sin((35 * Math.PI) / 180)]),
};

const M = {
  plaster: "#efede8",
  plinth: "#5d5f65",
  roof: "#3a3c42",
  fascia: "#2a2b30",
  frame: "#2c2e34",
  wood: "#9a7656",
  woodDark: "#7d5f45",
  inner: "#dcd8d0",
  floor: "#b8b1a5",
  cut: "#1e1e23",
  device: "#f1f1ef",
  cabinet: "#c9ccd1",
  battery: "#3a3d45",
  hp: "#e6e8ea",
  pave: "#8c8a85",
  pad: "#a3a19b",
};

/* ---------- Bausteine ---------- */

type Part = string;

const path = (d: string, fill: string, extra = "") => `<path d="${d}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;

/** Quader: sichtbar sind Vorderseite (z0), rechte Seite (x1) und Oberseite (y1) */
function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, cls = "") {
  const c = cls ? ` class="${cls}"` : "";
  return `<g${c}>${[
    path(poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]), lit(color, N.top)),
    path(poly([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]]), lit(color, N.right)),
    path(poly([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]), lit(color, N.front)),
  ].join("")}</g>`;
}

/** Fenster in der Vorderfassade (z = Fassadenebene) */
function windowFront(x0: number, x1: number, y0: number, y1: number, z: number, mullions: number[] = [], id = "") {
  const f = 0.07;
  const zf = z - 0.012;
  const parts = [
    path(poly([[x0, y0, zf], [x1, y0, zf], [x1, y1, zf], [x0, y1, zf]]), M.frame),
    path(poly([[x0 + f, y0 + f, zf], [x1 - f, y0 + f, zf], [x1 - f, y1 - f, zf], [x0 + f, y1 - f, zf]]), `url(#${id}glassF)`),
    ...mullions.map((m) =>
      path(poly([[m - 0.035, y0, zf], [m + 0.035, y0, zf], [m + 0.035, y1, zf], [m - 0.035, y1, zf]]), M.frame),
    ),
  ];
  return parts.join("");
}

function windowSide(z0: number, z1: number, y0: number, y1: number, x: number, id = "") {
  const f = 0.07;
  const xf = x + 0.012;
  return [
    path(poly([[xf, y0, z0], [xf, y0, z1], [xf, y1, z1], [xf, y1, z0]]), M.frame),
    path(poly([[xf, y0 + f, z0 + f], [xf, y0 + f, z1 - f], [xf, y1 - f, z1 - f], [xf, y1 - f, z0 + f]]), `url(#${id}glassS)`),
  ].join("");
}

/** Warmes Innenlicht für den Abendzustand */
function glowFront(x0: number, x1: number, y0: number, y1: number, z: number) {
  const f = 0.08;
  const zf = z - 0.015;
  return poly([[x0 + f, y0 + f, zf], [x1 - f, y0 + f, zf], [x1 - f, y1 - f, zf], [x0 + f, y1 - f, zf]]);
}

function glowSide(z0: number, z1: number, y0: number, y1: number, x: number) {
  const f = 0.08;
  const xf = x + 0.015;
  return poly([[xf, y0 + f, z0 + f], [xf, y0 + f, z1 - f], [xf, y1 - f, z1 - f], [xf, y1 - f, z0 + f]]);
}

/** Ziergras: Halme als Kurven, Größe folgt der Perspektive */
function tuft(x: number, z: number, h: number, seed: number, color = "#6d7a5c") {
  const base = P([x, 0, z]);
  const top = P([x, h, z]);
  const px = base.y - top.y;
  const blades: string[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * 2 - 1;
    const jitter = Math.sin(seed * 12.9 + i * 7.3) * 0.18;
    const lean = (t + jitter) * px * 0.55;
    const hh = px * (0.72 + 0.28 * Math.cos(t * 1.4 + seed));
    const bx = base.x + t * px * 0.12;
    blades.push(
      `M${r1(bx)} ${base.y}Q${r1(bx + lean * 0.25)} ${r1(base.y - hh * 0.6)} ${r1(bx + lean)} ${r1(base.y - hh)}`,
    );
  }
  return `<path d="${blades.join("")}" fill="none" stroke="${color}" stroke-width="${r1(Math.max(1, px * 0.05))}" stroke-linecap="round"/>`;
}

/** Strauch: weiche, überlappende Formen */
function shrub(x: number, z: number, r: number, seed: number) {
  const c = P([x, r * 0.8, z]);
  const e = P([x + r, r * 0.8, z]);
  const rp = Math.abs(e.x - c.x) * 1.15;
  const blobs = [
    [0, 0, 1, "#2c3829"],
    [-0.45, 0.18, 0.7, "#27322a"],
    [0.5, 0.15, 0.72, "#313f2e"],
    [0.12, -0.32, 0.62, "#3b4a35"],
  ] as const;
  return blobs
    .map(
      ([dx, dy, s, col], i) =>
        `<ellipse cx="${r1(c.x + dx * rp + Math.sin(seed + i) * 2)}" cy="${r1(c.y + dy * rp)}" rx="${r1(rp * s)}" ry="${r1(rp * s * 0.78)}" fill="${col}"/>`,
    )
    .join("");
}

/* ---------- Maße des Hauses ---------- */

const T35 = Math.tan((35 * Math.PI) / 180);
const S35 = Math.sin((35 * Math.PI) / 180);
const C35 = Math.cos((35 * Math.PI) / 180);
const HW = 11; // Hausbreite (Traufseite)
const HD = 8.5; // Haustiefe
const RZ = HD / 2; // First
const OV = 0.4; // Dachüberstand Traufe
const GV = 0.35; // Dachüberstand Ortgang
const WALL_TOP = 6 - OV * T35 + 0.06; // Wand endet unter der Dachfläche
const EAVE_Y = 6 - OV * T35;
const RIDGE_Y = 6 + RZ * T35;
const TH = 0.24;
const ROOF_LEN = (RZ + OV) / C35;

/** Punkt auf der vorderen Dachfläche: s entlang der Traufe, t hangaufwärts */
const roofPt = (s: number, t: number, lift = 0.03): V => [s, EAVE_Y + t * S35 + lift * C35, -OV + t * C35 - lift * S35];

/* Anbau mit Technikraum (Schnitt an der Vorderseite) */
const AX0 = HW;
const AX1 = 15.6;
const AWALL = 0.3;
const AZ_BACK = 2.2; // Rückwand des Technikraums
const AFLOOR = 0.12;
const ACEIL = 2.78;
const ATOP = 3.05;

/* Wärmepumpe vor der Fassade */
const HP = { x0: 0.75, x1: 1.95, y0: 0.18, y1: 1.08, z0: -1.45, z1: -1.0 };

/* PV-Feld: 2 Reihen × 7 Module hochkant */
const MOD_W = 1.134;
const MOD_H = 1.722;
const GAP = 0.025;
const COLS = 7;
const ROWS = 2;
const PV_S0 = (HW - (COLS * MOD_W + (COLS - 1) * GAP)) / 2;
const PV_T0 = 0.95;

/* ---------- Energiefluss-Pfade (3D) ---------- */

const pvExit: V = roofPt(PV_S0 + COLS * (MOD_W + GAP) - GAP - 0.25, PV_T0, 0.05);

export const FLOW_POINTS = {
  /** PV → Wechselrichter */
  pv: [
    pvExit,
    roofPt(10.75, 0.05, 0.05),
    [10.75, 2.62, -0.06],
    [11.02, 2.62, 0.0],
    [11.02, 2.62, 2.14],
    [12.9, 2.62, 2.14],
    [12.9, 2.08, 2.0],
  ] as V[],
  /** Wechselrichter → Zählerschrank / Verteilung */
  inv: [
    [12.6, 1.62, 1.98],
    [12.27, 1.62, 1.98],
  ] as V[],
  /** Verteilung → Haushalt (Hausinstallation) */
  house: [
    [11.35, 1.95, 2.08],
    [11.02, 1.95, 2.08],
    [11.02, 1.95, 0.0],
    [11.0, 2.9, -0.03],
    [5.9, 2.9, -0.03],
  ] as V[],
  /** Verteilung ↔ Speicher */
  bat: [
    [12.27, 0.62, 1.98],
    [13.5, 0.62, 1.98],
  ] as V[],
  /** Verteilung → Wärmepumpe */
  hp: [
    [11.35, 0.55, 2.08],
    [11.02, 0.55, 2.08],
    [11.02, 0.55, 0.0],
    [10.95, 0.3, -0.04],
    [2.45, 0.3, -0.04],
    [2.45, 0.3, -1.22],
    [HP.x1 + 0.01, 0.5, -1.22],
  ] as V[],
  /** Verteilung ↔ Netz */
  grid: [
    [11.75, 0.42, 1.94],
    [11.75, AFLOOR + 0.01, 1.94],
    [11.75, AFLOOR + 0.01, 0.0],
    [11.75, 0.03, -0.12],
    [11.75, 0.03, -2.3],
    [16.4, 0.03, -2.3],
  ] as V[],
  /** Wärmepumpe → Heizung/Warmwasser (Wärme, nicht Strom) */
  heat: [
    [1.75, 0.82, HP.z1],
    [1.75, 0.82, -0.04],
    [3.05, 0.82, -0.04],
  ] as V[],
};

/** Umweltwärme aus der Außenluft: kurze Wellen, die in das Gerät ziehen */
function envWaves() {
  const lines: string[] = [];
  for (let i = 0; i < 3; i++) {
    const y = 0.42 + i * 0.25;
    const pts: V[] = [];
    for (let k = 0; k <= 12; k++) {
      const x = -1.25 + k * 0.16;
      pts.push([x, y + Math.sin(k * 1.15 + i) * 0.06, -1.25]);
    }
    lines.push(line(pts));
  }
  return lines;
}

/* ---------- Anker für Beschriftungen und Auswahlpunkte ---------- */

export const ANCHORS = {
  pv: pct(roofPt(HW / 2, PV_T0 + MOD_H * 1.05)),
  inverter: pct([12.9, 1.7, 1.98]),
  dist: pct([11.8, 1.4, 1.95]),
  battery: pct([13.92, 1.15, 1.75]),
  hp: pct([1.35, 0.7, -1.45]),
  house: pct([7.4, 3.9, -0.02]),
  grid: pct([16.2, 0.03, -2.3]),
  env: pct([-0.9, 0.95, -1.25]),
};

/* ---------- Szene ---------- */

export function buildHouseSvg(id: string) {
  const o: Part[] = [];

  /* Verläufe */
  const g = (p: V) => P(p);
  const groundC = g([7, 0, 2]);
  o.push(`<defs>
<radialGradient id="${id}ground" cx="${groundC.x}" cy="${groundC.y}" r="${r1(VIEW_W * 0.62)}" gradientUnits="userSpaceOnUse" gradientTransform="translate(${groundC.x} ${groundC.y}) scale(1 0.42) translate(${-groundC.x} ${-groundC.y})">
<stop offset="0" stop-color="#262b25"/><stop offset="0.55" stop-color="#151815"/><stop offset="1" stop-color="#050506" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}glassF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d6a78"/><stop offset="0.45" stop-color="#2a323d"/><stop offset="0.5" stop-color="#3b4553"/><stop offset="1" stop-color="#161b22"/></linearGradient>
<linearGradient id="${id}glassS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#46505c"/><stop offset="0.5" stop-color="#20262e"/><stop offset="1" stop-color="#12161c"/></linearGradient>
<linearGradient id="${id}pv" x1="0" y1="1" x2="0.4" y2="0"><stop offset="0" stop-color="#151b2c"/><stop offset="0.6" stop-color="#1d2640"/><stop offset="1" stop-color="#2a3557"/></linearGradient>
<linearGradient id="${id}sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060c"/><stop offset="1" stop-color="#05060c" stop-opacity="0.7"/></linearGradient>
<linearGradient id="${id}eave" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.32"/></linearGradient>
<radialGradient id="${id}warm"><stop offset="0" stop-color="#ffd7a1"/><stop offset="1" stop-color="#f3a35c"/></radialGradient>
</defs>`);

  /* Boden */
  o.push(`<g class="h-env-ground">`);
  o.push(path(poly([[-14, 0, -14], [30, 0, -14], [30, 0, 22], [-14, 0, 22]]), `url(#${id}ground)`));
  // Terrasse, Weg, Zufahrt
  o.push(path(poly([[5.6, 0.02, -2.7], [10.6, 0.02, -2.7], [10.6, 0.02, 0], [5.6, 0.02, 0]]), "#45433f"));
  for (let i = 1; i < 6; i++) {
    const x = 5.6 + i * 0.83;
    o.push(`<path d="${line([[x, 0.025, -2.7], [x, 0.025, 0]])}" stroke="#46443f" stroke-width="1"/>`);
  }
  o.push(path(poly([[3.25, 0.02, -3.6], [4.55, 0.02, -3.6], [4.55, 0.02, 0], [3.25, 0.02, 0]]), "#3a3936"));
  o.push(path(poly([[11, 0.02, -3.6], [15.6, 0.02, -3.6], [15.6, 0.02, 0], [11, 0.02, 0]]), "#2c2c2a"));
  // Kontaktschatten
  o.push(path(poly([[-0.4, 0.01, -0.35], [15.9, 0.01, -0.35], [15.9, 0.01, 8.9], [-0.4, 0.01, 8.9]]), "#000", 'opacity="0.35"'));
  o.push(`</g>`);

  /* Baum hinten links (dezent, hinter dem Haus) */
  {
    const base = P([-3.4, 0, 3.4]);
    const top = P([-3.4, 6.2, 3.4]);
    const h = base.y - top.y;
    o.push(`<g class="h-plant" opacity="0.9">`);
    o.push(
      `<path d="M${base.x} ${base.y}L${r1(base.x + h * 0.02)} ${r1(base.y - h * 0.55)}M${r1(base.x + h * 0.01)} ${r1(base.y - h * 0.3)}L${r1(base.x - h * 0.12)} ${r1(base.y - h * 0.62)}M${r1(base.x + h * 0.015)} ${r1(base.y - h * 0.4)}L${r1(base.x + h * 0.14)} ${r1(base.y - h * 0.66)}" stroke="#3b342c" stroke-width="${r1(h * 0.025)}" stroke-linecap="round" fill="none"/>`,
    );
    const crowns = [
      [0, 0.72, 0.3, "#223024"],
      [-0.15, 0.66, 0.22, "#1d291f"],
      [0.16, 0.64, 0.22, "#26352a"],
      [0.03, 0.86, 0.2, "#2b3b2d"],
    ] as const;
    for (const [dx, dy, r, c] of crowns) {
      o.push(`<circle cx="${r1(base.x + dx * h)}" cy="${r1(base.y - dy * h)}" r="${r1(r * h)}" fill="${c}"/>`);
    }
    o.push(`</g>`);
  }

  /* Haus: Giebelseite (x = 11) */
  o.push(`<g class="h-house">`);
  o.push(
    path(
      poly([[HW, 0, 0], [HW, 0, HD], [HW, WALL_TOP, HD], [HW, RIDGE_Y - TH, RZ], [HW, WALL_TOP, 0]]),
      lit(M.plaster, N.right),
    ),
  );
  o.push(windowSide(1.4, 2.7, 3.35, 5.0, HW, id));
  o.push(windowSide(5.2, 7.2, 3.35, 5.0, HW, id));
  o.push(windowSide(3.65, 4.85, 6.15, 7.75, HW, id));

  /* Haus: Vorderseite (z = 0) */
  o.push(path(poly([[0, 0, 0], [HW, 0, 0], [HW, WALL_TOP, 0], [0, WALL_TOP, 0]]), lit(M.plaster, N.front)));
  o.push(path(poly([[0, 0, -0.005], [HW, 0, -0.005], [HW, 0.32, -0.005], [0, 0.32, -0.005]]), lit(M.plinth, N.front)));
  // Holzverkleidung Obergeschoss rechts
  o.push(path(poly([[6.6, 2.95, -0.01], [HW, 2.95, -0.01], [HW, WALL_TOP, -0.01], [6.6, WALL_TOP, -0.01]]), lit(M.wood, N.front)));
  {
    const boards: string[] = [];
    for (let x = 6.78; x < HW; x += 0.19) boards.push(line([[x, 2.95, -0.012], [x, WALL_TOP, -0.012]]));
    o.push(`<path d="${boards.join("")}" stroke="${lit(M.woodDark, N.front)}" stroke-width="0.8" opacity="0.7"/>`);
  }
  o.push(windowFront(0.5, 1.5, 1.15, 2.35, 0, [], id));
  // Haustür mit Seitenteil
  o.push(path(poly([[3.3, 0.12, -0.012], [4.4, 0.12, -0.012], [4.4, 2.35, -0.012], [3.3, 2.35, -0.012]]), "#24252a"));
  o.push(path(poly([[4.18, 1.0, -0.016], [4.23, 1.0, -0.016], [4.23, 1.65, -0.016], [4.18, 1.65, -0.016]]), "#b9b9bd"));
  o.push(windowFront(4.45, 4.9, 0.12, 2.35, 0, [], id));
  o.push(windowFront(5.8, 10.4, 0.12, 2.45, 0, [7.33, 8.87], id));
  o.push(windowFront(0.9, 2.5, 3.35, 5.0, 0, [], id));
  o.push(windowFront(3.6, 5.2, 3.35, 5.0, 0, [], id));
  o.push(windowFront(7.4, 10.3, 3.35, 5.0, 0, [8.85], id));
  // Schatten unter Traufe und Ortgang
  o.push(path(poly([[0, WALL_TOP - 0.55, -0.02], [HW, WALL_TOP - 0.55, -0.02], [HW, WALL_TOP, -0.02], [0, WALL_TOP, -0.02]]), `url(#${id}eave)`));
  o.push(`</g>`);

  /* Abendlicht in den Fenstern (Zustand „Abend“) */
  const glows = [
    glowFront(0.5, 1.5, 1.15, 2.35, 0),
    glowFront(4.45, 4.9, 0.12, 2.35, 0),
    glowFront(5.8, 10.4, 0.12, 2.45, 0),
    glowFront(3.6, 5.2, 3.35, 5.0, 0),
    glowFront(7.4, 10.3, 3.35, 5.0, 0),
    glowSide(5.2, 7.2, 3.35, 5.0, HW),
  ];
  const glowMarkup = `<path class="h-glow" d="${glows.join("")}" fill="url(#${id}warm)"/>`;

  /* Dach */
  o.push(`<g class="h-roof">`);
  o.push(
    path(
      poly([[-GV, EAVE_Y, -OV], [HW + GV, EAVE_Y, -OV], [HW + GV, RIDGE_Y, RZ], [-GV, RIDGE_Y, RZ]]),
      lit(M.roof, N.roof),
    ),
  );
  {
    const rows: string[] = [];
    for (let t = 0.33; t < ROOF_LEN; t += 0.33) rows.push(line([roofPt(-GV, t, 0.005), roofPt(HW + GV, t, 0.005)]));
    o.push(`<path d="${rows.join("")}" stroke="#2c2e33" stroke-width="0.7" opacity="0.8"/>`);
  }
  // Traufe (Stirnbrett) und Ortgang
  o.push(path(poly([[-GV, EAVE_Y, -OV], [HW + GV, EAVE_Y, -OV], [HW + GV, EAVE_Y - TH, -OV], [-GV, EAVE_Y - TH, -OV]]), lit(M.fascia, N.front)));
  o.push(
    path(
      poly([[HW + GV, EAVE_Y, -OV], [HW + GV, RIDGE_Y, RZ], [HW + GV, EAVE_Y, HD + OV], [HW + GV, EAVE_Y - TH, HD + OV], [HW + GV, RIDGE_Y - TH, RZ], [HW + GV, EAVE_Y - TH, -OV]]),
      lit(M.fascia, N.right),
    ),
  );
  o.push(`<path d="${line([[-GV, RIDGE_Y + 0.04, RZ], [HW + GV, RIDGE_Y + 0.04, RZ]])}" stroke="#55575d" stroke-width="2.2" stroke-linecap="round"/>`);
  o.push(`</g>`);

  /* PV-Module */
  const modules: string[] = [];
  const cells: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s0 = PV_S0 + c * (MOD_W + GAP);
      const t0 = PV_T0 + r * (MOD_H + GAP);
      modules.push(poly([roofPt(s0, t0), roofPt(s0 + MOD_W, t0), roofPt(s0 + MOD_W, t0 + MOD_H), roofPt(s0, t0 + MOD_H)]));
      for (let k = 1; k < 6; k++) {
        const s = s0 + (MOD_W * k) / 6;
        cells.push(line([roofPt(s, t0 + 0.03, 0.035), roofPt(s, t0 + MOD_H - 0.03, 0.035)]));
      }
      cells.push(line([roofPt(s0 + 0.03, t0 + MOD_H / 2, 0.035), roofPt(s0 + MOD_W - 0.03, t0 + MOD_H / 2, 0.035)]));
    }
  }
  const pvArea = poly([
    roofPt(PV_S0 - 0.03, PV_T0 - 0.03),
    roofPt(PV_S0 + COLS * (MOD_W + GAP) - GAP + 0.03, PV_T0 - 0.03),
    roofPt(PV_S0 + COLS * (MOD_W + GAP) - GAP + 0.03, PV_T0 + ROWS * (MOD_H + GAP) - GAP + 0.03),
    roofPt(PV_S0 - 0.03, PV_T0 + ROWS * (MOD_H + GAP) - GAP + 0.03),
  ]);
  const pvBox = (() => {
    const a = P(roofPt(PV_S0, PV_T0));
    const b = P(roofPt(PV_S0 + COLS * (MOD_W + GAP), PV_T0 + ROWS * (MOD_H + GAP)));
    const c = P(roofPt(PV_S0, PV_T0 + ROWS * (MOD_H + GAP)));
    const d = P(roofPt(PV_S0 + COLS * (MOD_W + GAP), PV_T0));
    return { x0: Math.min(a.x, c.x), x1: Math.max(b.x, d.x), y0: Math.min(c.y, b.y), y1: Math.max(a.y, d.y) };
  })();
  o.push(`<clipPath id="${id}pvclip"><path d="${modules.join("")}"/></clipPath>`);
  o.push(`<g class="h-pv">`);
  o.push(path(pvArea, "#0d0f15"));
  o.push(path(modules.join(""), `url(#${id}pv)`));
  o.push(`<path d="${cells.join("")}" stroke="#0e1220" stroke-width="0.8" opacity="0.85"/>`);
  o.push(
    `<g clip-path="url(#${id}pvclip)"><rect class="h-sheen" x="${r1(pvBox.x0 - 160)}" y="${r1(pvBox.y0 - 20)}" width="120" height="${r1(pvBox.y1 - pvBox.y0 + 40)}" fill="url(#${id}sheen)" transform="skewX(-28)" style="--sweep:${r1(pvBox.x1 - pvBox.x0 + 380)}px"/></g>`,
  );
  o.push(`</g>`);

  /* Anbau: rechte Außenwand (Holz) */
  o.push(`<g class="h-annex">`);
  o.push(path(poly([[AX1, 0, 0], [AX1, 0, 6], [AX1, ACEIL, 6], [AX1, ACEIL, 0]]), lit(M.wood, N.right)));
  {
    const boards: string[] = [];
    for (let z = 0.2; z < 6; z += 0.19) boards.push(line([[AX1 + 0.005, 0, z], [AX1 + 0.005, ACEIL, z]]));
    o.push(`<path d="${boards.join("")}" stroke="${lit(M.woodDark, N.right)}" stroke-width="0.7" opacity="0.75"/>`);
  }
  // Innenraum (Technikraum im Schnitt)
  o.push(path(poly([[AX0, AFLOOR, 0], [AX1 - AWALL, AFLOOR, 0], [AX1 - AWALL, AFLOOR, AZ_BACK], [AX0, AFLOOR, AZ_BACK]]), lit(M.floor, N.top)));
  o.push(path(poly([[AX0, AFLOOR, 0], [AX0, AFLOOR, AZ_BACK], [AX0, ACEIL, AZ_BACK], [AX0, ACEIL, 0]]), lit(M.inner, N.right, 0.55)));
  o.push(path(poly([[AX0, AFLOOR, AZ_BACK], [AX1 - AWALL, AFLOOR, AZ_BACK], [AX1 - AWALL, ACEIL, AZ_BACK], [AX0, ACEIL, AZ_BACK]]), lit(M.inner, N.front, 0.7)));
  o.push(`</g>`);

  /* Zählerschrank / Verteilung */
  o.push(`<g class="h-dist">`);
  o.push(box(11.35, 12.27, 0.42, 2.35, 1.95, AZ_BACK, M.cabinet));
  o.push(`<path d="${line([[11.81, 0.5, 1.945], [11.81, 2.27, 1.945]])}" stroke="#9a9ea5" stroke-width="1"/>`);
  o.push(path(poly([[11.45, 1.55, 1.944], [11.74, 1.55, 1.944], [11.74, 2.05, 1.944], [11.45, 2.05, 1.944]]), "#8d929a"));
  o.push(path(poly([[11.88, 1.55, 1.944], [12.17, 1.55, 1.944], [12.17, 2.05, 1.944], [11.88, 2.05, 1.944]]), "#8d929a"));
  o.push(`</g>`);

  /* Wechselrichter */
  o.push(`<g class="h-inv">`);
  o.push(box(12.6, 13.22, 1.3, 2.08, 2.0, AZ_BACK, M.device));
  o.push(path(poly([[12.74, 1.78, 1.995], [13.06, 1.78, 1.995], [13.06, 1.94, 1.995], [12.74, 1.94, 1.995]]), "#23262c"));
  {
    const led = P([13.11, 1.5, 1.995]);
    o.push(`<circle class="h-inv-led" cx="${led.x}" cy="${led.y}" r="2.4" fill="#c71c84"/>`);
  }
  o.push(`</g>`);

  /* Stromspeicher: vier Module übereinander, Ladeanzeige */
  o.push(`<g class="h-bat">`);
  o.push(box(13.55, 14.28, AFLOOR, 1.98, 1.75, AZ_BACK, M.battery));
  {
    const seams: string[] = [];
    for (let i = 1; i < 4; i++) {
      const y = AFLOOR + ((1.98 - AFLOOR) * i) / 4;
      seams.push(line([[13.55, y, 1.745], [14.28, y, 1.745], [14.28, y, AZ_BACK]]));
    }
    o.push(`<path d="${seams.join("")}" stroke="#23252b" stroke-width="1" fill="none"/>`);
    o.push(path(poly([[13.62, 1.88, 1.744], [14.21, 1.88, 1.744], [14.21, 1.93, 1.744], [13.62, 1.93, 1.744]]), "#2a2c33"));
    // Ladeanzeige: fünf Segmente
    for (let i = 0; i < 5; i++) {
      const y0 = 0.62 + i * 0.2;
      o.push(
        `<path class="h-bat-seg s${i + 1}" d="${poly([[13.86, y0, 1.743], [13.97, y0, 1.743], [13.97, y0 + 0.14, 1.743], [13.86, y0 + 0.14, 1.743]])}" fill="#c71c84"/>`,
      );
    }
  }
  o.push(`</g>`);

  /* Anbau: Dachplatte und Schnittkanten */
  o.push(`<g class="h-annex-top">`);
  o.push(path(poly([[AX0, ATOP, -0.15], [AX1 + 0.15, ATOP, -0.15], [AX1 + 0.15, ATOP, 6.15], [AX0, ATOP, 6.15]]), lit("#4a4c52", N.top)));
  o.push(path(poly([[AX1 + 0.15, ACEIL, -0.15], [AX1 + 0.15, ACEIL, 6.15], [AX1 + 0.15, ATOP, 6.15], [AX1 + 0.15, ATOP, -0.15]]), lit(M.fascia, N.right)));
  const cutFaces = [
    poly([[AX0, ACEIL, -0.15], [AX1 + 0.15, ACEIL, -0.15], [AX1 + 0.15, ATOP, -0.15], [AX0, ATOP, -0.15]]),
    poly([[AX1 - AWALL, 0, 0], [AX1, 0, 0], [AX1, ACEIL, 0], [AX1 - AWALL, ACEIL, 0]]),
    poly([[AX0, -0.05, 0], [AX1, -0.05, 0], [AX1, AFLOOR, 0], [AX0, AFLOOR, 0]]),
  ];
  o.push(path(cutFaces.join(""), M.cut));
  o.push(`<path class="h-cutline" d="${cutFaces.join("")}" fill="none" stroke="#c71c84" stroke-width="1.1" opacity="0.6"/>`);
  o.push(`</g>`);

  /* Wärmepumpe (Außeneinheit) */
  o.push(`<g class="h-hp">`);
  o.push(box(HP.x0 - 0.1, HP.x1 + 0.1, 0, HP.y0, HP.z0 - 0.1, HP.z1 + 0.08, M.pad));
  // Leitungen zur Wand
  o.push(`<path d="${line([[1.35, 0.5, HP.z1], [1.35, 0.5, -0.02]])}${line([[1.55, 0.5, HP.z1], [1.55, 0.5, -0.02]])}" stroke="#202227" stroke-width="3.2" stroke-linecap="round"/>`);
  o.push(box(HP.x0, HP.x1, HP.y0, HP.y1, HP.z0, HP.z1, M.hp));
  // Lüftergitter
  {
    const c: V = [1.2, 0.635, HP.z0 - 0.005];
    const m = frameMatrix(c, [1, 0, 0], [0, 1, 0]);
    o.push(`<g transform="${m}">`);
    o.push(`<circle r="0.355" fill="#2b2e33"/>`);
    o.push(`<circle r="0.355" fill="none" stroke="#c8cbcf" stroke-width="0.03"/>`);
    o.push(
      `<g class="h-fan"><circle r="0.3" fill="none"/><path d="${[0, 1, 2, 3].map((k) => {
        const a = (k * Math.PI) / 2;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const pt = (r: number, d: number) => `${(r * Math.cos(a + d)).toFixed(3)} ${(r * Math.sin(a + d)).toFixed(3)}`;
        return `M${(0.05 * ca).toFixed(3)} ${(0.05 * sa).toFixed(3)}Q${pt(0.22, 0.55)} ${pt(0.3, 0.25)}L${pt(0.28, -0.18)}Q${pt(0.14, -0.05)} ${pt(0.05, 0.4)}Z`;
      }).join("")}" fill="#6a6e75"/><circle r="0.06" fill="#4a4d53"/></g>`,
    );
    o.push(
      `<path d="M-0.355 0H0.355M0 -0.355V0.355" stroke="#9a9ea4" stroke-width="0.012"/><circle r="0.24" fill="none" stroke="#9a9ea4" stroke-width="0.012"/><circle r="0.13" fill="none" stroke="#9a9ea4" stroke-width="0.012"/>`,
    );
    o.push(`</g>`);
  }
  // Seitliche Abdeckung
  o.push(path(poly([[1.66, 0.3, HP.z0 - 0.006], [1.86, 0.3, HP.z0 - 0.006], [1.86, 0.98, HP.z0 - 0.006], [1.66, 0.98, HP.z0 - 0.006]]), lit("#d3d6d9", N.front)));
  o.push(`</g>`);

  /* Pflanzen vorn */
  o.push(`<g class="h-plant">`);
  o.push(shrub(-1.1, 0.1, 0.55, 1));
  o.push(shrub(-1.2, 1.6, 0.7, 2));
  o.push(tuft(2.75, -1.15, 0.75, 1));
  o.push(tuft(5.25, -1.0, 0.65, 2, "#77845f"));
  o.push(tuft(10.85, -0.8, 0.6, 3));
  o.push(tuft(-0.35, -2.0, 0.55, 4, "#77845f"));
  o.push(`</g>`);

  /* Abendzustand: Szene abdunkeln, Fenster leuchten */
  o.push(`<rect class="h-night" x="0" y="0" width="${VIEW_W}" height="${VIEW_H}" fill="url(#${id}night)"/>`);
  o.push(glowMarkup);

  /* Energieflüsse */
  const flow = (key: keyof typeof FLOW_POINTS, cls: string) => {
    const d = line(FLOW_POINTS[key]);
    return `<g class="flow ${cls}"><path class="flow__base" d="${d}" pathLength="100"/><path class="flow__pulse" d="${d}" pathLength="100"/></g>`;
  };
  o.push(`<g class="flows" fill="none" stroke-linecap="round" stroke-linejoin="round">`);
  o.push(flow("grid", "f-grid"));
  o.push(flow("hp", "f-hp"));
  o.push(flow("house", "f-house"));
  o.push(flow("bat", "f-bat"));
  o.push(flow("inv", "f-inv"));
  o.push(flow("pv", "f-pv"));
  // Wärme: andere Linienart (punktiert, warm), eigene Bewegung
  o.push(`<g class="heat"><path class="heat__line" d="${line(FLOW_POINTS.heat)}" pathLength="100"/>`);
  o.push(`<path class="heat__env" d="${envWaves().join("")}"/></g>`);
  o.push(`</g>`);

  /* Hervorhebungen (Umrisse) */
  const hl = (cls: string, d: string) => `<path class="hl ${cls}" d="${d}"/>`;
  o.push(`<g class="hls" fill="none">`);
  o.push(hl("hl-pv", pvArea));
  o.push(
    hl(
      "hl-bat",
      poly([[13.5, AFLOOR - 0.04, 1.7], [14.33, AFLOOR - 0.04, 1.7], [14.33, 2.03, 1.7], [13.5, 2.03, 1.7]]),
    ),
  );
  o.push(hl("hl-inv", poly([[12.55, 1.25, 1.96], [13.27, 1.25, 1.96], [13.27, 2.13, 1.96], [12.55, 2.13, 1.96]])));
  o.push(hl("hl-dist", poly([[11.3, 0.37, 1.9], [12.32, 0.37, 1.9], [12.32, 2.4, 1.9], [11.3, 2.4, 1.9]])));
  o.push(
    hl("hl-hp", poly([[HP.x0 - 0.06, HP.y0 - 0.04, HP.z0 - 0.06], [HP.x1 + 0.06, HP.y0 - 0.04, HP.z0 - 0.06], [HP.x1 + 0.06, HP.y1 + 0.06, HP.z0 - 0.06], [HP.x0 - 0.06, HP.y1 + 0.06, HP.z0 - 0.06]])),
  );
  o.push(`</g>`);

  return o.join("");
}

/* ---------- Bildausschnitte für Detailansichten ---------- */

function cropAround(pts: V[], pad: number, aspect: number) {
  const ps = pts.map(P);
  let x0 = Math.min(...ps.map((p) => p.x)) - pad;
  let x1 = Math.max(...ps.map((p) => p.x)) + pad;
  let y0 = Math.min(...ps.map((p) => p.y)) - pad;
  let y1 = Math.max(...ps.map((p) => p.y)) + pad;
  // auf gewünschtes Seitenverhältnis erweitern
  const w = x1 - x0;
  const h = y1 - y0;
  if (w / h < aspect) {
    const nw = h * aspect;
    x0 -= (nw - w) / 2;
    x1 += (nw - w) / 2;
  } else {
    const nh = w / aspect;
    y0 -= (nh - h) / 2;
    y1 += (nh - h) / 2;
  }
  return `${r1(x0)} ${r1(y0)} ${r1(x1 - x0)} ${r1(y1 - y0)}`;
}

export const CROPS = {
  photovoltaik: cropAround([roofPt(PV_S0, PV_T0), roofPt(PV_S0 + 8.1, PV_T0 + 3.5), roofPt(PV_S0, PV_T0 + 3.5), roofPt(PV_S0 + 8.1, PV_T0)], 30, 4 / 3),
  waermepumpe: cropAround([[HP.x0 - 1.4, 0, HP.z0 - 0.6], [HP.x1 + 1.6, 2.4, 0], [HP.x0 - 1.2, 2.4, 0]], 20, 4 / 3),
  stromspeicher: cropAround([[AX0, 0, 0], [AX1, ATOP, 0], [AX0, ATOP, AZ_BACK], [AX1, 0, -0.2]], 20, 4 / 3),
};
