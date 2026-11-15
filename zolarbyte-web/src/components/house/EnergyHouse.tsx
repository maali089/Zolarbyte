"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Part = "pv" | "storage" | "heat" | "wb" | "all";
type Time = "day" | "evening";
type Anchor = { left: number; top: number };

export type PartInfo = {
  id: Part;
  name: string;
  short: string;
  deliverables?: string[];
  more: { href: string; label: string };
  ask: { href: string; label: string };
  text: Record<Time, { title: string; text: string }>;
};

/** Reihenfolge der Erzählung: erst das ganze Haus, dann Baustein für Baustein */
const ORDER: Part[] = ["all", "pv", "storage", "heat", "wb"];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Energiehaus als Scrollytelling: Die Bühne bleibt stehen, die Textschritte
 * ziehen vorbei. Erreicht ein Schritt die Bildmitte, fährt die Kamera
 * (SVG-Ausschnitt) zum passenden Baustein. Natives Scrollen, keine Sperre.
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
  const steps = useRef<Partial<Record<Part, HTMLElement | null>>>({});
  const current = useRef<number[]>(views.all.split(" ").map(Number));
  const raf = useRef(0);

  // Bühne außerhalb des Bildes pausieren
  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-paused", !e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Schritt in der Bildmitte bestimmt den Baustein
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setPart((e.target as HTMLElement).dataset.part as Part);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    Object.values(steps.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Kamerafahrt
  useEffect(() => {
    const svg = stage.current?.querySelector("svg");
    if (!svg) return;
    const from = current.current;
    const to = views[part].split(" ").map(Number);
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = to;
      svg.setAttribute("viewBox", to.join(" "));
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 800);
      const k = ease(t);
      const v = from.map((a, i) => a + (to[i] - a) * k);
      current.current = v;
      svg.setAttribute("viewBox", v.map((n) => n.toFixed(1)).join(" "));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [part, views]);

  /** Zum Schritt scrollen (Klick auf Markierung oder Fortschrittsleiste) */
  const goTo = (id: Part) => {
    const el = document.querySelector<HTMLElement>(`.ehouse__step[data-part="${id}"]`);
    setPart(id);
    if (!el) return;
    const header = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 72;
    const pin = document.querySelector<HTMLElement>(".ehouse__pin");
    const stageH = window.matchMedia("(max-width: 999px)").matches ? (pin?.offsetHeight ?? 0) : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - header - stageH - 16;
    if (window.__lenis) window.__lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const info = parts.find((p) => p.id === part)!;

  return (
    <div className="ehouse">
      <div className="ehouse__pin">
        <div ref={stage} className="ehouse__stage house house--explorer" data-focus={part} data-time={time}>
          {children}

          {part === "all"
            ? (Object.keys(markers) as Array<keyof typeof markers>).map((k) => (
                <button
                  key={k}
                  type="button"
                  className="ehouse__marker"
                  style={{ left: `${markers[k].left}%`, top: `${markers[k].top}%` }}
                  onClick={() => goTo(k)}
                >
                  <span aria-hidden="true">{String(ORDER.indexOf(k)).padStart(2, "0")}</span>
                  <span className="visually-hidden">{parts.find((x) => x.id === k)!.name} ansehen</span>
                </button>
              ))
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

          <ol className="ehouse__progress" aria-label="Bausteine">
            {ORDER.map((id, i) => (
              <li key={id}>
                <button type="button" aria-current={part === id ? "step" : undefined} onClick={() => goTo(id)}>
                  <span aria-hidden="true">{String(i).padStart(2, "0")}</span>
                  <span className="visually-hidden">{parts.find((x) => x.id === id)!.name}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="ehouse__steps">
        {ORDER.map((id, i) => {
          const p = parts.find((x) => x.id === id)!;
          const copy = p.text[time];
          return (
            <article
              key={id}
              ref={(el) => {
                steps.current[id] = el;
              }}
              data-part={id}
              className={`ehouse__step${part === id ? " is-active" : ""}`}
              aria-labelledby={`ehs-${id}`}
            >
              <p className="ehouse__no">
                {String(i).padStart(2, "0")} <span>{p.short}</span>
              </p>
              <h3 id={`ehs-${id}`} className="ehouse__name">
                {p.name}
              </h3>
              <p className="ehouse__title">{copy.title}</p>
              <p className="ehouse__text">{copy.text}</p>
              {p.deliverables ? (
                <ul className="ehouse__does" aria-label="Das übernehmen wir">
                  {p.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              ) : null}
              <p className="ehouse__links">
                <Link href={p.more.href} className="text-link">
                  {p.more.label}
                </Link>
                <Link href={p.ask.href} className="ehouse__ask">
                  {p.ask.label}
                </Link>
              </p>
            </article>
          );
        })}
        <p className="ehouse__note">Schematische Darstellung ohne Messwerte.</p>
      </div>
    </div>
  );
}
