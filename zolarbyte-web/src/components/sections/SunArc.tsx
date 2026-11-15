"use client";

import { useEffect, useRef, useState } from "react";
import { DAY_END, DAY_START, arcProgress, daylight, formatHour, localHourBerlin } from "@/lib/daylight";

/** Punkt auf dem Bogen (0…1) in Prozent der Fläche. Halbe Sinuskurve wie eine Sonnenbahn. */
export function arcPoint(p: number, amp = 1) {
  return { x: p * 100, y: 100 - Math.sin(p * Math.PI) * 92 * amp };
}

function pathFor(amp: number, from = 0, to = 1, steps = 64) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const p = from + ((to - from) * i) / steps;
    const { x, y } = arcPoint(p, amp);
    d += `${i === 0 ? "M" : "L"}${(x * 10).toFixed(1)} ${(y * 4).toFixed(1)}`;
  }
  return d;
}

const SUMMER = pathFor(1);
// Geisterbahn: Winterbogen, kürzer und flacher (Ruhezustand bewusst gezeichnet)
const WINTER = pathFor(0.5, 0.17, 0.83);
const TICKS = [6, 9, 12, 15, 18, 21];

/**
 * Sonnenbahn (Sommerbogen 6–21 Uhr) mit ziehbarer Sonne.
 * Die Sonne ist ein Slider: Ziehen, Pfeiltasten oder Pos1/Ende ändern die Tageszeit.
 */
export function SunArc({
  interactive = true,
  onUserSet,
  initialHour = 12,
}: {
  interactive?: boolean;
  onUserSet?: (h: number) => void;
  /** Stand vor der Hydration (Server-Render), damit die Sonne nicht oben links steht. */
  initialHour?: number;
}) {
  const p0 = arcProgress(initialHour);
  const pt0 = arcPoint(p0);
  const boxRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);
  const travelRef = useRef<SVGPathElement>(null);
  const dragging = useRef(false);
  const [now, setNow] = useState<number | null>(null);

  // Markierung „jetzt“: echte Uhrzeit in Deutschland (nur Client, nur bei Tageslicht)
  useEffect(() => {
    const h = localHourBerlin();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Uhrzeit ist nur im Client bekannt
    if (h >= 6 && h <= 21) setNow(h);
  }, []);

  useEffect(() => {
    const render = (h: number) => {
      const p = arcProgress(h);
      const { x, y } = arcPoint(p);
      const sun = sunRef.current;
      if (sun) {
        sun.style.left = `${x}%`;
        sun.style.top = `${y}%`;
        sun.setAttribute("aria-valuenow", h.toFixed(2));
        sun.setAttribute("aria-valuetext", `${formatHour(h)} Uhr`);
        sun.dataset.below = h < 6 || h > 21 ? "1" : "0";
      }
      if (readRef.current) readRef.current.textContent = formatHour(h);
      if (travelRef.current) travelRef.current.setAttribute("d", p > 0.001 ? pathFor(1, 0, p, Math.max(2, Math.round(p * 64))) : "M0 400");
    };
    render(daylight.get());
    return daylight.subscribe(render);
  }, []);

  const setFromPointer = (clientX: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const p = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    const h = 6 + p * 15;
    if (onUserSet) onUserSet(h);
    else daylight.set(h);
  };

  return (
    <div className="arc" ref={boxRef}>
      <svg className="arc__svg" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <line className="arc__horizon" x1="0" y1="399" x2="1000" y2="399" vectorEffect="non-scaling-stroke" />
        <path className="arc__ghost" d={WINTER} vectorEffect="non-scaling-stroke" />
        <path className="arc__path" d={SUMMER} vectorEffect="non-scaling-stroke" />
        <path ref={travelRef} className="arc__travel" d="M0 400" vectorEffect="non-scaling-stroke" />
      </svg>

      {TICKS.map((t) => {
        const { x, y } = arcPoint(arcProgress(t));
        return (
          <span key={t} className="arc__tick" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">
            <span className="arc__tick-label tech">{t}</span>
          </span>
        );
      })}

      {now !== null ? (
        <span
          className="arc__now"
          style={{ left: `${arcPoint(arcProgress(now)).x}%`, top: `${arcPoint(arcProgress(now)).y}%` }}
          aria-hidden="true"
        >
          <span className="arc__now-label tech">Jetzt {formatHour(now)}</span>
        </span>
      ) : null}

      <div
        ref={sunRef}
        className="arc__sun"
        style={{ left: `${pt0.x}%`, top: `${pt0.y}%` }}
        data-below={initialHour < 6 || initialHour > 21 ? "1" : "0"}
        role={interactive ? "slider" : undefined}
        tabIndex={interactive ? 0 : -1}
        aria-label="Tageszeit – Sonne verschieben"
        aria-valuemin={DAY_START}
        aria-valuemax={DAY_END}
        aria-hidden={interactive ? undefined : true}
        data-cursor={interactive ? "Ziehen" : undefined}
        onPointerDown={(e) => {
          if (!interactive) return;
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          (e.currentTarget as HTMLElement).classList.add("is-dragging");
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromPointer(e.clientX);
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          (e.currentTarget as HTMLElement).classList.remove("is-dragging");
        }}
        onPointerCancel={(e) => {
          dragging.current = false;
          (e.currentTarget as HTMLElement).classList.remove("is-dragging");
        }}
        onKeyDown={(e) => {
          if (!interactive) return;
          const h = daylight.get();
          let next: number | null = null;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") next = h + 0.5;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = h - 0.5;
          if (e.key === "Home") next = 6;
          if (e.key === "End") next = 21;
          if (next !== null) {
            e.preventDefault();
            const clamped = Math.min(21.25, Math.max(6, next));
            if (onUserSet) onUserSet(clamped);
            else daylight.set(clamped);
          }
        }}
      >
        <span className="arc__sun-disc" />
        <span className="arc__read tech" ref={readRef} aria-hidden="true">
          {formatHour(initialHour)}
        </span>
      </div>
    </div>
  );
}
