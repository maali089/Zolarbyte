import type { PartKey, WireId } from "./layout";
import type { StageFocus } from "@/lib/daylight";

export type PresetId =
  | "overview"
  | "hero"
  | "pv"
  | "verteiler"
  | "wallbox"
  | "netz"
  | "photovoltaik"
  | "e-mobilitaet"
  | "elektroinstallation"
  | "kundendienst"
  | "pruefung"
  | "schulungen";

export interface Preset {
  /** Kamera-Ziel (m), Azimut/Elevation (Grad), sichtbare Höhe (m). `span: 0` = Gesamtansicht mit Seitenverhältnis-Rahmung. */
  target: [number, number, number];
  az: number;
  el: number;
  span: number;
  hl: PartKey | null;
  lit?: ReadonlyArray<WireId>;
  labels: "all" | "active";
  doorOpen?: number;
  /** Standard-Tageszeit für Renderings */
  hour: number;
}

const OV: Preset = { target: [4.7, 3.5, -0.8], az: 52, el: 13, span: 0, hl: null, labels: "all", hour: 12 };

export const PRESETS: Record<PresetId, Preset> = {
  overview: OV,
  hero: OV,
  pv: { target: [0.2, 6.0, 1.6], az: 36, el: 22, span: 10.4, hl: "pv", labels: "active", hour: 9 },
  verteiler: { target: [2.2, 2.7, -1.8], az: 56, el: 11, span: 10.6, hl: "verteiler", labels: "active", hour: 12.5 },
  wallbox: { target: [8.9, 1.2, -5.3], az: 56, el: 11, span: 6.6, hl: "wallbox", labels: "active", hour: 17 },
  netz: { target: [4.6, 3.0, 0.2], az: 48, el: 11, span: 11.5, hl: "netz", labels: "active", hour: 20.75 },
  photovoltaik: { target: [1.4, 3.6, 0.8], az: 30, el: 22, span: 14.8, hl: "pv", labels: "active", hour: 11.5 },
  "e-mobilitaet": { target: [9.3, 1.3, -5.2], az: 56, el: 11, span: 8.6, hl: "wallbox", labels: "active", hour: 17 },
  elektroinstallation: { target: [1.4, 3.1, 0.0], az: 58, el: 11, span: 13.4, hl: "verteiler", labels: "active", hour: 14.5 },
  kundendienst: { target: [4.3, 0.55, -1.2], az: 60, el: 15, span: 8.2, hl: "verteiler", lit: ["wohnen"], labels: "active", hour: 12 },
  pruefung: { target: [4.3, 0.55, -1.2], az: 60, el: 15, span: 8.2, hl: "verteiler", labels: "active", doorOpen: 1, hour: 12 },
  schulungen: { target: [4.2, 3.4, -1.0], az: 46, el: 19, span: 0, hl: null, labels: "all", hour: 12 },
};

export const FOCUS_PRESET: Record<StageFocus, PresetId> = {
  overview: "overview",
  pv: "pv",
  verteiler: "verteiler",
  wallbox: "wallbox",
  netz: "netz",
};

export const LIT_WIRES: Record<PartKey, ReadonlyArray<WireId>> = {
  pv: ["pv"],
  verteiler: ["zuleitung", "wohnen", "zimmer1", "zimmer2"],
  wallbox: ["wallbox"],
  netz: ["netz", "zuleitung"],
};
