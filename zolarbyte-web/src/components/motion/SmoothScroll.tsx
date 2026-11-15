"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const lw = () => window as unknown as { __lenis?: Lenis };

let locked = false;

/** Scroll für Menü-Overlays sperren/freigeben. Wirkt auch ohne Lenis (reduced motion). */
export function lockScroll(next: boolean) {
  locked = next;
  if (typeof window === "undefined") return;
  const lenis = lw().__lenis;
  if (lenis) {
    if (next) lenis.stop();
    else lenis.start();
  } else {
    document.documentElement.style.overflow = next ? "hidden" : "";
  }
}

/**
 * Lenis auf dem echten Dokument (sticky + motion useScroll funktionieren unverändert).
 * Anker-Offset kommt aus `scroll-padding-top` (Lenis liest es selbst).
 * Elemente mit `data-lenis-prevent` scrollen nativ.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: true });
      lw().__lenis = lenis;
      if (locked) {
        document.documentElement.style.overflow = "";
        lenis.stop();
      }
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
      delete lw().__lenis;
      if (locked) document.documentElement.style.overflow = "hidden";
    };
    const sync = () => (mq.matches ? stop() : start());

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash) return;
    const lenis = lw().__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
