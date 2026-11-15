"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Markiert sichtbare Elemente mit data-in (Attribut statt Klasse: React rendert es nicht,
 * daher kein Hydration-Konflikt). Ein einziger IntersectionObserver für alle [data-reveal], .words und [data-draw].
 * Inhalte sind ohne JS sichtbar: Versteckt wird nur unter html.js (Inline-Skript im Layout).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const selector = "[data-reveal], .words, [data-draw], [data-stamp]";
    const t0 = performance.now();
    // Erst markieren, wenn React das Element hydriert hat (sonst Attribut-Konflikt bei
    // später hydrierenden Suspense-Grenzen). Nach 3 s Sicherheitsnetz.
    const isHydrated = (el: Element) =>
      performance.now() - t0 > 3000 || Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
    const pending = new Set<Element>();
    let retry = 0;
    const mark = (el: Element) => {
      if (isHydrated(el)) {
        el.setAttribute("data-in", "");
        pending.delete(el);
        return true;
      }
      pending.add(el);
      if (!retry) retry = window.setTimeout(flush, 60);
      return false;
    };
    const flush = () => {
      retry = 0;
      pending.forEach((el) => mark(el));
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            mark(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    const scan = () => {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.hasAttribute("data-in")) return;
        // SVG-Pfade auf Länge 1 normalisieren, damit dasharray: 1 funktioniert
        if (el.hasAttribute("data-draw")) {
          el.querySelectorAll("path, line, circle, rect, polyline").forEach((p) => {
            if (!p.hasAttribute("pathLength")) p.setAttribute("pathLength", "1");
          });
        }
        io.observe(el);
      });
    };

    // Erst nach Abschluss der Hydration markieren (Seitensegmente hydrieren ggf. später als das Layout)
    const mo = new MutationObserver(() => scan());
    const start = () => {
      scan();
      // Später nachgeladene Inhalte (z. B. Assistent) erfassen
      mo.observe(document.body, { childList: true, subtree: true });
    };
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 120));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = ric(start, { timeout: 600 });

    return () => {
      cic(handle);
      window.clearTimeout(retry);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
