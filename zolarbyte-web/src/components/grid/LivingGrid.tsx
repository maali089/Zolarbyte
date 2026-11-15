"use client";

import { useEffect, useRef } from "react";
import { createSunField } from "./sun-field";
import "./living-grid.css";

/**
 * Heliostat-Feld als Hintergrund: Module drehen sich zur Sonne (Cursor bzw. Sonnenbogen).
 * Fixe Ebene (z-index 1) über den Sektionsgründen, unter den Inhalten (`position: relative; z-index: 2`).
 * Reagiert auf `html[data-ground="day|dusk|night"]` und den Tageszeit-Store.
 */
export function LivingGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    return createSunField(canvas);
  }, []);

  return <canvas ref={ref} className="living-grid" aria-hidden="true" />;
}
