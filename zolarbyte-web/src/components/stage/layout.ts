/**
 * Reine Zahlen-Geometrie des Hausmodells (ohne three) – wird von der 3D-Szene
 * und vom SVG-Poster gemeinsam genutzt, damit beide dasselbe Haus zeigen.
 * Einheiten: Meter. x = Ost, y = oben, z = Süd. Süd ist die PV-Seite.
 */
export type P3 = [number, number, number];

export const H = {
  w: 9, // x -4.5 … 4.5
  d: 6.4, // z -3.2 … 3.2
  t: 0.3,
  plinth: 0.15,
  slabLo: 2.75,
  slabHi: 3.05,
  ceilLo: 5.45,
  eave: 5.6,
  ridge: 8.1,
  roofT: 0.26,
  ovEave: 0.6,
  ovGable: 0.55,
  pitch: (38 * Math.PI) / 180,
} as const;

export const TAN_PITCH = Math.tan(H.pitch);
/** Oberkante der Dachhaut an Stelle z (Nord/Süd symmetrisch). */
export const roofTopY = (z: number) => H.ridge + H.roofT - Math.abs(z) * TAN_PITCH;

export const PV = { x0: -3.6, x1: 3.6, z0: 0.7, z1: 3.0 } as const;

/** Fensterlöcher der Südwand: x0,x1,y0,y1 */
export const SOUTH_WINDOWS: ReadonlyArray<readonly [number, number, number, number]> = [
  [-3.7, -1.5, 0.95, 2.35],
  [2.3, 3.7, 0.95, 2.35],
  [-3.5, -2.3, 3.75, 5.0],
  [-0.6, 0.6, 3.75, 5.0],
  [2.3, 3.5, 3.75, 5.0],
];
export const SOUTH_DOOR = [-0.5, 0.6, H.plinth, 2.4] as const;

/** Verteiler (Zählerschrank) an der Nordwand, Innenseite. */
export const CAB = { x: 3.3, y0: 0.7, y1: 1.85, w: 0.8, d: 0.3, zFront: -2.6 } as const;

export const CARPORT = { x0: 7.2, x1: 10.2, z0: -8.0, z1: -2.6, h: 2.65 } as const;
export const WALLBOX = { x: 9.6, y: 1.25, z: CARPORT.z0 + 0.15 } as const;
export const PEDESTAL = { x: 7.8, z: 1.5 } as const;
export const JUNCTION: P3 = [4.9, 0.07, 1.5];

/** Auto (abstrahiert): Heck zur Nordwand, Bug nach Süden. */
export const CAR = { cx: 8.4, zRear: -7.5, len: 4.4, w: 1.8 } as const;
/** Ladeanschluss hinten rechts (Ostseite). */
export const CAR_PORT: P3 = [CAR.cx + CAR.w / 2 + 0.01, 0.86, CAR.zRear + 0.55];
export const CABLE: ReadonlyArray<P3> = [
  [WALLBOX.x, WALLBOX.y - 0.3, WALLBOX.z + 0.07],
  [WALLBOX.x, 0.62, WALLBOX.z + 0.45],
  [WALLBOX.x - 0.1, 0.42, CAR_PORT[2] + 0.05],
  [CAR_PORT[0] + 0.12, 0.7, CAR_PORT[2]],
  CAR_PORT,
];
/** Steckdosen an der Nordwand-Innenseite: x, y */
export const OUTLETS: ReadonlyArray<readonly [number, number]> = [
  [-0.5, 0.5],
  [1.9, 0.5],
  [0.3, 3.25],
  [2.6, 3.25],
];

const ry = (z: number) => roofTopY(z) + 0.05;
const WZ = -2.82; // Leitungsebene auf der Nordwand-Innenseite

export const LAMPS = {
  wohnen: [1.4, 1.2, -2.84],
  zimmer2: [1.6, 3.7, -2.84],
  zimmer1: [-1.0, 3.4, -2.84],
} as const;

/** Leitungen in Flussrichtung. */
export const WIRES = {
  pv: [
    [3.3, ry(3.05), 3.05],
    [4.58, ry(3.05), 3.05],
    [4.58, 0.07, 3.05],
    [4.9, 0.07, 3.05],
    JUNCTION,
  ],
  netz: [[PEDESTAL.x, 0.07, PEDESTAL.z], JUNCTION],
  zuleitung: [
    JUNCTION,
    [4.9, 0.07, -2.3],
    [4.6, 0.2, -2.3],
    [CAB.x, 0.2, -2.3],
    [CAB.x, 0.2, -2.6],
    [CAB.x, CAB.y0 + 0.02, -2.6],
  ],
  wohnen: [
    [CAB.x - 0.4, 1.2, -2.7],
    [2.5, 1.2, WZ],
    [LAMPS.wohnen[0], 1.2, WZ],
  ],
  zimmer2: [
    [3.55, CAB.y1, -2.72],
    [3.55, 2.1, WZ],
    [3.55, 3.7, WZ],
    [LAMPS.zimmer2[0], 3.7, WZ],
  ],
  zimmer1: [
    [3.3, CAB.y1, -2.72],
    [3.3, 2.1, WZ],
    [3.3, 3.4, WZ],
    [LAMPS.zimmer1[0], 3.4, WZ],
  ],
  wallbox: [
    [CAB.x + 0.4, 0.95, -2.72],
    [3.95, 0.95, WZ],
    [3.95, 0.2, WZ],
    [4.6, 0.2, WZ],
    [4.9, 0.07, WZ],
    [WALLBOX.x, 0.07, WZ],
    [WALLBOX.x, 0.07, CARPORT.z0 + 0.3],
    [WALLBOX.x, 0.9, CARPORT.z0 + 0.3],
    [WALLBOX.x, WALLBOX.y - 0.2, WALLBOX.z + 0.07],
  ],
} as const satisfies Record<string, ReadonlyArray<P3>>;

export type WireId = keyof typeof WIRES;

/** Ankerpunkte der Beschriftungen (Weltkoordinaten) + Textbausteine. */
export type PartKey = "pv" | "verteiler" | "wallbox" | "netz";
export const PARTS: Record<PartKey, { anchor: P3; label: string; side: "l" | "r" }> = {
  pv: { anchor: [-0.6, roofTopY(1.7) + 0.1, 1.7], label: "Photovoltaik-Anlage", side: "l" },
  verteiler: { anchor: [CAB.x, CAB.y1, CAB.zFront], label: "Zählerschrank / Verteiler", side: "r" },
  wallbox: { anchor: [WALLBOX.x, WALLBOX.y + 0.3, WALLBOX.z], label: "Wallbox", side: "l" },
  netz: { anchor: [PEDESTAL.x, 1.3, PEDESTAL.z], label: "Hausanschluss", side: "r" },
};
