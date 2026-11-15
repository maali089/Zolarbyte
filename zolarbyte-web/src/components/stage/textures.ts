import * as THREE from "three";
import { CARPORT, H } from "./layout";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function tex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** PV-Feld: 4 Spalten × 3 Reihen Module, 6×10-Zellraster, schmale Rahmen. */
export function pvTexture(cols: number, rows: number, aspect: number) {
  const W = 2048;
  const Hh = Math.round(W / aspect);
  const { c, g } = canvas(W, Hh);
  g.fillStyle = "#c9ccd1"; // Aluminium-Rahmen / Fuge
  g.fillRect(0, 0, W, Hh);
  const mw = W / cols;
  const mh = Hh / rows;
  const frame = 9;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const x = k * mw + frame;
      const y = r * mh + frame;
      const w = mw - frame * 2;
      const h = mh - frame * 2;
      const grad = g.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, "#26334a");
      grad.addColorStop(1, "#1a2436");
      g.fillStyle = grad;
      g.fillRect(x, y, w, h);
      // Zellen
      const cx = 6;
      const cy = 10;
      const pad = 10;
      const cw = (w - pad * 2) / cx;
      const ch = (h - pad * 2) / cy;
      g.fillStyle = "rgba(60,82,118,0.22)";
      for (let i = 0; i < cx; i++) {
        for (let j = 0; j < cy; j++) {
          g.fillRect(x + pad + i * cw + 1.5, y + pad + j * ch + 1.5, cw - 3, ch - 3);
        }
      }
      // feine Busbars
      g.strokeStyle = "rgba(150,170,205,0.28)";
      g.lineWidth = 1;
      for (let i = 0; i < cx; i++) {
        for (const o of [0.33, 0.66]) {
          const bx = x + pad + i * cw + cw * o;
          g.beginPath();
          g.moveTo(bx, y + pad);
          g.lineTo(bx, y + h - pad);
          g.stroke();
        }
      }
      g.strokeStyle = "rgba(150,170,205,0.4)";
      g.lineWidth = 2;
      for (let i = 0; i <= cx; i++) {
        g.beginPath();
        g.moveTo(x + pad + i * cw, y + pad);
        g.lineTo(x + pad + i * cw, y + h - pad);
        g.stroke();
      }
      for (let j = 0; j <= cy; j++) {
        g.beginPath();
        g.moveTo(x + pad, y + pad + j * ch);
        g.lineTo(x + w - pad, y + pad + j * ch);
        g.stroke();
      }
    }
  }
  return tex(c);
}

/** Himmelsgradient als Equirect für Reflexionen (neutral, kein Netz-HDRI). */
export function skyTexture() {
  const { c, g } = canvas(512, 256);
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#cfd3da");
  grad.addColorStop(0.42, "#ecebea");
  grad.addColorStop(0.5, "#fbf7ee");
  grad.addColorStop(0.56, "#d9d5cb");
  grad.addColorStop(1, "#aaa69c");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 256);
  // heller Sonnenbereich Richtung Süden (u ≈ 0.5 → -z je nach Mapping, bewusst weich)
  const sun = g.createRadialGradient(256, 70, 0, 256, 70, 70);
  sun.addColorStop(0, "rgba(255,244,222,0.95)");
  sun.addColorStop(1, "rgba(255,244,222,0)");
  g.fillStyle = sun;
  g.fillRect(0, 0, 512, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

/** Weicher Glow für Innenlicht-Karten hinter den Fenstern. */
export function glowTexture() {
  const { c, g } = canvas(128, 128);
  const grad = g.createRadialGradient(64, 56, 4, 64, 64, 80);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.75)");
  grad.addColorStop(1, "rgba(255,255,255,0.35)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return tex(c);
}

/** Zählerschrank-Front: dunkle Tür mit Reihen heller Module. */
export function cabinetTexture() {
  const { c, g } = canvas(256, 384);
  g.fillStyle = "#3a3e48";
  g.fillRect(0, 0, 256, 384);
  g.fillStyle = "#23262d";
  g.fillRect(16, 16, 224, 352);
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    const y = 28 + r * 84;
    g.fillStyle = "#4a4f5b";
    g.fillRect(26, y, 204, 70);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = r === 0 ? "#d9dbd6" : "#9a9ea8";
      g.fillRect(34 + i * 32, y + 10, 24, r === 0 ? 50 : 38);
      g.fillStyle = "#15171c";
      g.fillRect(40 + i * 32, y + 16, 12, 6);
    }
  }
  return tex(c);
}

/** Schranktür: Metall mit Sichtfenster auf die (gedimmten) Module. */
export function cabinetDoorTexture() {
  const { c, g } = canvas(256, 384);
  g.fillStyle = "#59606d";
  g.fillRect(0, 0, 256, 384);
  g.fillStyle = "#1b1e25";
  g.fillRect(26, 30, 204, 324);
  for (let r = 0; r < 4; r++) {
    const y = 40 + r * 78;
    g.fillStyle = "#363b47";
    g.fillRect(34, y, 188, 64);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = r === 0 ? "#b9bcb7" : "#7c808a";
      g.fillRect(42 + i * 29, y + 9, 21, r === 0 ? 46 : 34);
    }
  }
  const sheen = g.createLinearGradient(26, 30, 230, 354);
  sheen.addColorStop(0, "rgba(255,255,255,0.22)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  g.fillStyle = sheen;
  g.fillRect(26, 30, 204, 324);
  g.fillStyle = "#c9ccd1";
  g.fillRect(238, 180, 8, 28);
  return tex(c);
}

/**
 * Kontakt-/Ambient-Schatten als weiche Platte: Hausgrundriss, Carport, Sockel.
 * Läuft in transparent aus – kein harter Rand.
 */
export function contactShadow() {
  const sizeX = 36; // m
  const sizeZ = 26;
  const ppm = 28;
  const { c, g } = canvas(sizeX * ppm, sizeZ * ppm);
  const cx = 6; // Mittelpunkt x
  const cz = -1.2;
  const px = (x: number) => (x - (cx - sizeX / 2)) * ppm;
  const pz = (z: number) => (z - (cz - sizeZ / 2)) * ppm;
  const off = 4000;
  const blob = (x0: number, x1: number, z0: number, z1: number, blur: number, a: number) => {
    g.save();
    g.shadowColor = `rgba(34,24,48,${a})`;
    g.shadowBlur = blur * ppm;
    g.shadowOffsetX = off;
    g.fillStyle = "#000";
    g.fillRect(px(x0) - off, pz(z0), (x1 - x0) * ppm, (z1 - z0) * ppm);
    g.restore();
  };
  blob(-H.w / 2 - 0.2, H.w / 2 + 0.4, -H.d / 2 - 0.2, H.d / 2 + 0.3, 1.1, 0.5);
  blob(-H.w / 2, H.w / 2, -H.d / 2, H.d / 2, 0.35, 0.45);
  blob(CARPORT.x0, CARPORT.x1, CARPORT.z0, CARPORT.z1, 0.9, 0.3);
  blob(7.5, 8.1, 1.3, 1.7, 0.3, 0.5);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { texture: t, w: sizeX, d: sizeZ, cx, cz };
}
