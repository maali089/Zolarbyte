"use client";

import { useEffect, useRef, useState } from "react";

type Anchor = { left: number; top: number };

/**
 * Energiehaus im Einstieg: spielt einmal den kurzen Ablauf
 * (Licht → Solarmodule → Wechselrichter → Speicher → Wärmepumpe) und bleibt
 * dann ruhig mit einzelnen Energieimpulsen. Pausiert außerhalb des Bildschirms.
 * Die Geometrie kommt fertig vom Server (children), hier liegt nur die Steuerung.
 */
export function HeroHouse({
  children,
  ratio,
  anchors,
}: {
  children: React.ReactNode;
  ratio: string;
  anchors: { pv: Anchor; battery: Anchor; hp: Anchor };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [skipped, setSkipped] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = window.setTimeout(() => setIntroDone(true), 6000);
    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => el.classList.toggle("is-paused", !e.isIntersecting), { threshold: 0.02 });
      io.observe(el);
    }
    return () => {
      window.clearTimeout(t);
      io?.disconnect();
    };
  }, []);

  const at = (a: Anchor) => ({ left: `${a.left}%`, top: `${a.top}%` });

  return (
    <div ref={ref} className={`house house--hero${skipped ? " is-skipped" : ""}`} style={{ aspectRatio: ratio }}>
      {children}
      <ul className="house__tags" aria-hidden="true">
        <li style={at(anchors.pv)} className="house__tag t-pv">
          Photovoltaik
        </li>
        <li style={at(anchors.battery)} className="house__tag t-bat">
          Stromspeicher
        </li>
        <li style={at(anchors.hp)} className="house__tag t-hp">
          Wärmepumpe
        </li>
      </ul>
      {!introDone && !skipped ? (
        <button type="button" className="house__skip" onClick={() => setSkipped(true)}>
          Animation überspringen
        </button>
      ) : null}
    </div>
  );
}
