/** Kamera als SVG-viewBox [x, y, w, h] im Koordinatensystem des Hauses (Gesamtansicht 0 -64.8 1000 666.7). */
export type Box = [number, number, number, number];

/**
 * Fokus = Kamera + Hervorhebung. Bühnen-Fokus (overview, pv, verteiler, wallbox, netz)
 * und je eine Ansicht pro Leistung (Leistungs-IDs aus content.ts).
 */
export const VIEWS: Record<string, Box> = {
  overview: [-60, -70, 1060, 706.7],
  pv: [116.9, -17.6, 366.5, 244.3],
  verteiler: [354.8, 239.7, 304.7, 203.1],
  wallbox: [639.8, 296.6, 315.4, 210.3],
  netz: [250, 210, 470, 313.3],
  // Leistungen
  photovoltaik: [96, -40, 410, 273.3],
  "e-mobilitaet": [600, 270, 380, 253.3],
  elektroinstallation: [330, 215, 345, 230],
  kundendienst: [60, 150, 620, 413.3],
  pruefung: [418, 262, 162, 108],
  schulungen: [-20, -64.8, 1040, 693.3],
};

/** Welche Hervorhebung (data-focus im CSS) zu welcher Ansicht gehört. */
export const HIGHLIGHT: Record<string, string> = {
  overview: "overview",
  pv: "pv",
  verteiler: "verteiler",
  wallbox: "wallbox",
  netz: "netz",
  photovoltaik: "pv",
  "e-mobilitaet": "wallbox",
  elektroinstallation: "verteiler",
  kundendienst: "netz",
  pruefung: "pruefung",
  schulungen: "overview",
};

/** Beschriftungen: Ankerpunkt im Haus (SVG-Koordinaten) und Fokus, zu dem sie gehören. */
export const TAGS: Array<{ id: string; label: string; x: number; y: number }> = [
  { id: "pv", label: "Photovoltaik", x: 296, y: 64 },
  { id: "verteiler", label: "Zählerschrank", x: 481, y: 286 },
  { id: "wallbox", label: "Wallbox", x: 769, y: 380 },
  { id: "netz", label: "Netzanschluss", x: 384, y: 425 },
];
