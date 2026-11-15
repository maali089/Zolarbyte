"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Setzt html[data-ground] nach der Sektion, die gerade unter dem Header liegt
 * (Sektionen tragen data-ground="day" | "dusk" | "night"). Header, Living Grid
 * und Cursor passen sich daran an.
 */
export function GroundObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = 48; // knapp unter dem Header
      const els = document.querySelectorAll<HTMLElement>("[data-ground]");
      let ground = "day";
      for (const el of els) {
        if (el === root) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) ground = el.dataset.ground || "day";
      }
      if (root.dataset.ground !== ground) root.dataset.ground = ground;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
