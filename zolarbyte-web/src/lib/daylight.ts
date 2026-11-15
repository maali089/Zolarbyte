/**
 * Gemeinsamer Tageszeit-Zustand der „Sonnenbahn“.
 * Ein winziger externer Store (kein React-State), damit 3D-Szene, Living Grid
 * und Sonnenbogen pro Frame lesen können, ohne Re-Renders auszulösen.
 *
 * Stunde: Dezimalzahl 5.5 … 21.5 (lokale Uhrzeit, rein illustrativ – keine Ertragsdaten).
 */

export const DAY_START = 5.5;
export const DAY_END = 21.5;

type Listener = (hour: number) => void;

let hour = 12;
const listeners = new Set<Listener>();

export const daylight = {
  get: () => hour,
  set(next: number) {
    const clamped = Math.min(DAY_END, Math.max(DAY_START, next));
    if (clamped === hour) return;
    hour = clamped;
    listeners.forEach((l) => l(hour));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

/** 0 … 1 entlang des Bogens (Sonnenaufgang 6 Uhr, Untergang 21 Uhr). */
export function arcProgress(h: number) {
  return Math.min(1, Math.max(0, (h - 6) / 15));
}

/**
 * Vereinfachte, illustrative Sonnenposition (Sommertag, Süddeutschland grob):
 * azimuth in Grad (90 = Ost, 180 = Süd, 270 = West), altitude in Grad.
 */
export function sunAt(h: number) {
  const p = arcProgress(h);
  const azimuth = 70 + p * 220; // ONO → WNW
  const altitude = Math.sin(p * Math.PI) * 62 - (h < 6 || h > 21 ? 6 : 0);
  // Licht: 0 nachts, 1 mittags; weich an den Rändern
  const intensity = Math.max(0, Math.sin(p * Math.PI)) ** 0.7 * (h < 6 || h > 21 ? 0 : 1);
  return { azimuth, altitude, intensity, progress: p };
}

/** 0 = voller Tag, 1 = Nacht. Dämmerung ab ~18:30. */
export function dusk(h: number) {
  if (h <= 18.5) return h < 6.5 ? Math.min(1, (6.5 - h) / 1) : 0;
  return Math.min(1, (h - 18.5) / 2.5);
}

/** Aktuelle Uhrzeit in Deutschland als Dezimalstunde (nur Client). */
export function localHourBerlin(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const hh = Number(parts.find((p) => p.type === "hour")?.value ?? 12);
    const mm = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return hh + mm / 60;
  } catch {
    return 12;
  }
}

export function formatHour(h: number) {
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/* ---------- Bühnen-Fokus ---------- */

/**
 * Welches Bauteil die 3D-Szene gerade zeigt/hervorhebt.
 * overview = ganzes Haus; pv = Dach/Module; verteiler = Zählerschrank & Leitungen in die Räume;
 * wallbox = Carport/Wallbox/Auto; netz = Hausanschluss/Netz (abends).
 */
export type StageFocus = "overview" | "pv" | "verteiler" | "wallbox" | "netz";

type FocusListener = (f: StageFocus) => void;
let focus: StageFocus = "overview";
const focusListeners = new Set<FocusListener>();

export const stageFocus = {
  get: () => focus,
  set(next: StageFocus) {
    if (next === focus) return;
    focus = next;
    focusListeners.forEach((l) => l(focus));
  },
  subscribe(fn: FocusListener) {
    focusListeners.add(fn);
    return () => {
      focusListeners.delete(fn);
    };
  },
};
