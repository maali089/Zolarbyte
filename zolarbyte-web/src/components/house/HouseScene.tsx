"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { HOUSE_SVG_INNER } from "./house-svg";
import { HIGHLIGHT, TAGS, VIEWS, type Box } from "./views";
import "./energy-house.css";

const DEFAULT_LABEL =
  "Beispielhafte Darstellung eines Wohnhauses mit Photovoltaik auf dem Dach, einem Technikraum im Schnitt mit Zählerschrank, Wechselrichter und Speicher sowie einer Garage mit Wallbox, an der ein Auto lädt. Linien zeigen, wie der Strom fließt.";

/**
 * Isometrisches Energiehaus (SVG). Wechselt `view`, fährt die Kamera per viewBox dorthin;
 * Energieflüsse, Lüfter und Modulglanz laufen per CSS und pausieren außerhalb des Viewports.
 */
export function HouseScene({
  view,
  time = "day",
  tags = false,
  intro = false,
  className = "",
  label = DEFAULT_LABEL,
}: {
  view: string;
  time?: "day" | "evening";
  tags?: boolean;
  intro?: boolean;
  className?: string;
  label?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tagRefs = useRef<Array<HTMLLIElement | null>>([]);
  const camRef = useRef<Box>(VIEWS[view] ?? VIEWS.overview);
  const rafRef = useRef(0);
  const placeRef = useRef<() => void>(() => {});

  // Eindeutige Gradient-IDs je Instanz (mehrere Häuser auf einer Seite)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const inner = useMemo(() => HOUSE_SVG_INNER.replace(/he-/g, `h${uid}-`), [uid]);

  // Beschriftungen, Pause außerhalb des Viewports, Aufbau-Animation
  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;

    placeRef.current = () => {
      if (!tags) return;
      const w = svg.clientWidth;
      const h = svg.clientHeight;
      if (!w || !h) return;
      const [vx, vy, vw, vh] = camRef.current;
      const s = Math.min(w / vw, h / vh);
      const ox = (w - vw * s) / 2;
      const oy = (h - vh * s) / 2;
      TAGS.forEach((t, i) => {
        const el = tagRefs.current[i];
        if (!el) return;
        const x = ox + (t.x - vx) * s;
        const y = oy + (t.y - vy) * s;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.dataset.inside = x > 8 && x < w - 8 && y > 40 && y < h - 4 ? "true" : "false";
      });
    };
    placeRef.current();

    const ro = new ResizeObserver(() => placeRef.current());
    ro.observe(svg);
    const io = new IntersectionObserver(([e]) => root.classList.toggle("is-paused", !e.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(root);

    let introT = 0;
    if (intro && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("is-intro");
      introT = window.setTimeout(() => root.classList.remove("is-intro"), 5600);
    }
    return () => {
      ro.disconnect();
      io.disconnect();
      window.clearTimeout(introT);
      cancelAnimationFrame(rafRef.current);
    };
  }, [tags, intro]);

  // Kamerafahrt bei Fokuswechsel
  useEffect(() => {
    const svg = svgRef.current;
    const to = VIEWS[view] ?? VIEWS.overview;
    if (!svg) return;
    const apply = (b: Box) => {
      camRef.current = b;
      svg.setAttribute("viewBox", b.map((n) => n.toFixed(1)).join(" "));
      placeRef.current();
    };
    cancelAnimationFrame(rafRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply([...to]);
      return;
    }
    const from: Box = [...camRef.current];
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 900);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      apply(from.map((v, i) => v + (to[i] - v) * e) as Box);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [view]);

  const initial = VIEWS[view] ?? VIEWS.overview;

  return (
    <div ref={rootRef} className={`ehouse ${className}`} data-focus={HIGHLIGHT[view] ?? "overview"} data-time={time}>
      <svg
        ref={svgRef}
        className="ehouse__svg"
        viewBox={initial.join(" ")}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        focusable="false"
        dangerouslySetInnerHTML={{ __html: inner }}
      />
      {tags ? (
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
      ) : null}
    </div>
  );
}
