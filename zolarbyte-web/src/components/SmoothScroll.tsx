"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Weiches Scrollen (Lenis) – nur mit Maus/Trackpad am Desktop.
 * Touch-Geräte und „Bewegung reduzieren“ behalten das normale Scrollen.
 * Sprunglinks (#anfrage …) berücksichtigen die feste Kopfzeile.
 */
export function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const header = () => (document.querySelector(".site-header") as HTMLElement | null)?.offsetHeight ?? 72;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      wheelMultiplier: 1,
      anchors: { offset: -header() - 16 },
      // eigene Scrollbereiche (Menü, Auswahllisten) nicht abfangen
      prevent: (node) => !!node.closest?.("[data-lenis-prevent], .site-nav, select"),
    });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
}
