"use client";

import { useEffect, useRef } from "react";
import { Stamp } from "@/components/sections/Stamp";
import { steps } from "@/lib/content";

const NODES = [0.125, 0.375, 0.625, 0.875];

function pt(p: number) {
  return { x: p * 1000, y: 260 - Math.sin(p * Math.PI) * 220 };
}

function arcPath(to = 1) {
  const n = Math.max(2, Math.round(64 * to));
  return Array.from({ length: n + 1 }, (_, i) => {
    const { x, y } = pt((i / n) * to);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join("");
}

const ARC = arcPath(1);

/**
 * Ablauf als Tagesbogen: Die Sonne läuft beim Scrollen von der Anfrage
 * bis zur Übergabe; passierte Schritte leuchten, am Ende landet der Prüfstempel.
 */
export function ProcessArc() {
  const ref = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);
  const travelRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.1)));
      el.style.setProperty("--p", p.toFixed(4));
      travelRef.current?.setAttribute("d", p > 0.001 ? arcPath(p) : "M0 262");
      const s = sunRef.current;
      if (s) {
        const { x, y } = pt(p);
        s.style.left = `${x / 10}%`;
        s.style.top = `${(y / 270) * 100}%`;
      }
      const passed = NODES.filter((n) => p >= n - 0.02).length;
      el.dataset.passed = String(passed);
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
  }, []);

  return (
    <div className="proc" ref={ref} data-passed="0">
      <div className="proc__arc" aria-hidden="true">
        <svg viewBox="0 0 1000 270" preserveAspectRatio="none" fill="none">
          <line x1="0" y1="262" x2="1000" y2="262" className="proc__horizon" vectorEffect="non-scaling-stroke" />
          <path d={ARC} className="proc__path" vectorEffect="non-scaling-stroke" />
          <path ref={travelRef} d="M0 262" className="proc__travel" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="proc__sun" ref={sunRef} />
      </div>

      <ol className="proc__steps">
        {steps.map((s, i) => {
          const { x, y } = pt(NODES[i]);
          return (
            <li
              key={s.title}
              className="proc__step"
              data-step={i + 1}
              style={{ "--x": `${x / 10}%`, "--rise": ((262 - y) / 270).toFixed(4) } as React.CSSProperties}
            >
              <span className="proc__node" aria-hidden="true" />
              <h3 className="proc__title">{s.title}</h3>
              <p className="proc__text">{s.text}</p>
              {i === steps.length - 1 ? <Stamp className="proc__stamp" uid="stamp-ring-proc" /> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
