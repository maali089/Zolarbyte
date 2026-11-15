"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Part = "pv" | "storage" | "heat" | "wb" | "all";
type Time = "day" | "evening";
type Anchor = { left: number; top: number };

export type PartInfo = {
  id: Part;
  name: string;
  /** kurze Zeile im Index */
  short: string;
  deliverables?: string[];
  more: { href: string; label: string };
  ask: { href: string; label: string };
  text: Record<Time, { title: string; text: string }>;
};

const ORDER: Part[] = ["pv", "storage", "heat", "wb", "all"];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Energiehaus: Auswahl eines Bausteins fährt die Ansicht an die Stelle im Haus
 * (Animation des SVG-Ausschnitts), die Erklärung steht direkt daneben.
 * Kein Scroll-Eingriff; bei reduzierter Bewegung springt die Ansicht.
 */
export function EnergyHouse({
  children,
  views,
  markers,
  parts,
}: {
  children: React.ReactNode;
  views: Record<Part, string>;
  markers: Record<Exclude<Part, "all">, Anchor>;
  parts: PartInfo[];
}) {
  const [part, setPart] = useState<Part>("all");
  const [time, setTime] = useState<Time>("day");
  const stage = useRef<HTMLDivElement>(null);
  const current = useRef<number[]>(views.all.split(" ").map(Number));
  const raf = useRef(0);

  // Pausieren außerhalb des sichtbaren Bereichs
  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-paused", !e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Kamerafahrt zum gewählten Ausschnitt
  useEffect(() => {
    const svg = stage.current?.querySelector("svg");
    if (!svg) return;
    const from = current.current;
    const to = views[part].split(" ").map(Number);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cancelAnimationFrame(raf.current);
    if (reduce) {
      current.current = to;
      svg.setAttribute("viewBox", to.join(" "));
      return;
    }
    const start = performance.now();
    const dur = 750;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const k = ease(t);
      const v = from.map((a, i) => a + (to[i] - a) * k);
      current.current = v;
      svg.setAttribute("viewBox", v.map((n) => n.toFixed(1)).join(" "));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [part, views]);

  const info = parts.find((p) => p.id === part)!;
  const copy = info.text[time];

  return (
    <div className="ehouse">
      <div
        ref={stage}
        className="ehouse__stage house house--explorer"
        data-focus={part}
        data-time={time}
      >
        {children}

        {part === "all"
          ? (Object.keys(markers) as Array<keyof typeof markers>).map((k) => {
              const p = parts.find((x) => x.id === k)!;
              const i = ORDER.indexOf(k) + 1;
              return (
                <button
                  key={k}
                  type="button"
                  className="ehouse__marker"
                  style={{ left: `${markers[k].left}%`, top: `${markers[k].top}%` }}
                  onClick={() => setPart(k)}
                >
                  <span aria-hidden="true">{String(i).padStart(2, "0")}</span>
                  <span className="visually-hidden">{p.name} heranholen</span>
                </button>
              );
            })
          : null}

        <div className="ehouse__hud" aria-hidden="true">
          <span>Ansicht</span> {info.name} · {time === "day" ? "Tagsüber" : "Abends"}
        </div>

        <div className="ehouse__time" role="group" aria-label="Tageszeit der Darstellung">
          <button type="button" aria-pressed={time === "day"} onClick={() => setTime("day")}>
            Tag
          </button>
          <button type="button" aria-pressed={time === "evening"} onClick={() => setTime("evening")}>
            Abend
          </button>
        </div>

        {part !== "all" ? (
          <button type="button" className="ehouse__back" onClick={() => setPart("all")}>
            Ganzes Haus
          </button>
        ) : null}
      </div>

      <div className="ehouse__side">
        <ol className="ehouse__index" aria-label="Bausteine im Energiehaus">
          {ORDER.map((id, i) => {
            const p = parts.find((x) => x.id === id)!;
            return (
              <li key={id}>
                <button type="button" aria-pressed={part === id} onClick={() => setPart(id)}>
                  <span className="ehouse__no" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ehouse__name">{p.name}</span>
                  <span className="ehouse__short">{p.short}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="ehouse__panel" aria-live="polite">
          <h3 className="ehouse__title">{copy.title}</h3>
          <p className="ehouse__text">{copy.text}</p>
          {info.deliverables ? (
            <ul className="ehouse__does" aria-label="Das übernehmen wir">
              {info.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
          <p className="ehouse__links">
            <Link href={info.more.href} className="text-link">
              {info.more.label}
            </Link>
            <Link href={info.ask.href} className="ehouse__ask">
              {info.ask.label}
            </Link>
          </p>
          <ul className="legend" aria-label="Legende">
            <li>
              <span className="legend__line legend__line--power" aria-hidden="true" />
              Strom
            </li>
            <li>
              <span className="legend__line legend__line--heat" aria-hidden="true" />
              Wärme
            </li>
            <li>
              <span className="legend__line legend__line--grid" aria-hidden="true" />
              Netz
            </li>
          </ul>
          <p className="ehouse__note">Schematische Darstellung ohne Messwerte.</p>
        </div>
      </div>
    </div>
  );
}
