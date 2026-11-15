"use client";

import { useEffect, useRef } from "react";
import { daylight, dusk, stageFocus, type StageFocus } from "@/lib/daylight";
import { HOUSE_SVG_INNER } from "./house-svg";
import { TAGS, VIEWS } from "./views";
import "./energy-house.css";

type Box = [number, number, number, number];

const LABEL =
  "Beispielhafte Darstellung eines Wohnhauses mit Photovoltaik auf dem Dach, einem Technikraum im Schnitt mit Zählerschrank, Wechselrichter und Speicher sowie einer Garage mit Wallbox, an der ein Auto lädt. Linien zeigen, wie der Strom fließt.";

/**
 * Isometrisches Energiehaus der Bühne. Die Kamera fährt per viewBox zum Fokus der
 * aktiven Tagesphase, die Tageszeit (Scroll) schaltet Abendlicht und Flussrichtung.
 * Kein WebGL: reines SVG + CSS, Animationen pausieren außerhalb des Viewports.
 */
export function EnergyHouse({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tagRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let view: Box = [...VIEWS[stageFocus.get()]];
    let raf = 0;

    /** Beschriftungen auf die aktuelle Kamera projizieren (preserveAspectRatio: meet). */
    const placeTags = () => {
      const w = svg.clientWidth;
      const h = svg.clientHeight;
      if (!w || !h) return;
      const [vx, vy, vw, vh] = view;
      const s = Math.min(w / vw, h / vh);
      const ox = (w - vw * s) / 2;
      const oy = (h - vh * s) / 2;
      TAGS.forEach((t, i) => {
        const el = tagRefs.current[i];
        if (!el) return;
        const x = ox + (t.x - vx) * s;
        const y = oy + (t.y - vy) * s;
        const inside = x > 8 && x < w - 8 && y > 40 && y < h - 4;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.dataset.inside = inside ? "true" : "false";
      });
    };

    const setView = (b: Box) => {
      view = b;
      svg.setAttribute("viewBox", b.map((n) => n.toFixed(1)).join(" "));
      placeTags();
    };

    const fly = (to: Box) => {
      cancelAnimationFrame(raf);
      if (reduce) {
        setView([...to]);
        return;
      }
      const from: Box = [...view];
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 900);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        setView(from.map((v, i) => v + (to[i] - v) * e) as Box);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const onFocus = (f: StageFocus) => {
      root.dataset.focus = f;
      fly(VIEWS[f]);
    };

    const onHour = (h: number) => {
      const evening = dusk(h) > 0.5 ? "evening" : "day";
      if (root.dataset.time !== evening) root.dataset.time = evening;
    };

    setView(view);
    root.dataset.focus = stageFocus.get();
    onHour(daylight.get());
    const unFocus = stageFocus.subscribe(onFocus);
    const unDay = daylight.subscribe(onHour);

    // Aufbau-Animation beim ersten Erscheinen (Flüsse zeichnen sich, Komponenten leuchten auf)
    let introT = 0;
    if (!reduce) {
      root.classList.add("is-intro");
      introT = window.setTimeout(() => root.classList.remove("is-intro"), 5600);
    }

    const ro = new ResizeObserver(placeTags);
    ro.observe(svg);

    const io = new IntersectionObserver(([e]) => root.classList.toggle("is-paused", !e.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(introT);
      unFocus();
      unDay();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className={`ehouse ${className}`} data-focus="overview" data-time="day">
      <svg
        ref={svgRef}
        className="ehouse__svg"
        viewBox={VIEWS.overview.join(" ")}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={LABEL}
        focusable="false"
        dangerouslySetInnerHTML={{ __html: HOUSE_SVG_INNER }}
      />
      <ul className="ehouse__tags" aria-hidden="true">
        {TAGS.map((t, i) => (
          <li
            key={t.id}
            ref={(el) => {
              tagRefs.current[i] = el;
            }}
            className="ehouse__tag"
            data-tag={t.id}
          >
            <span>{t.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
