import type { StageFocus } from "@/lib/daylight";

/** Kamera je Fokus als SVG-viewBox [x, y, w, h] im Koordinatensystem des Hauses. */
export const VIEWS: Record<StageFocus, [number, number, number, number]> = {
  overview: [0, -64.8, 1000, 666.7],
  pv: [116.9, -17.6, 366.5, 244.3],
  verteiler: [354.8, 239.7, 304.7, 203.1],
  wallbox: [639.8, 296.6, 315.4, 210.3],
  netz: [250, 210, 470, 313.3],
};

/** Beschriftungen: Ankerpunkt im Haus (SVG-Koordinaten) und Fokus, zu dem sie gehören. */
export const TAGS: Array<{ id: Exclude<StageFocus, "overview">; label: string; x: number; y: number }> = [
  { id: "pv", label: "Photovoltaik", x: 296, y: 64 },
  { id: "verteiler", label: "Zählerschrank", x: 481, y: 286 },
  { id: "wallbox", label: "Wallbox", x: 769, y: 380 },
  { id: "netz", label: "Netzanschluss", x: 384, y: 425 },
];
