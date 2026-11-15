"use client";

import { useReducedMotionPref } from "@/lib/hooks/useReducedMotionPref";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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
  houseStart,
  anchors,
}: {
  children: React.ReactNode;
  ratio: string;
  /** Anteil links vom Haus (0–1), daraus ergibt sich der mobile Ausschnitt */
  houseStart: number;
  anchors: { pv: Anchor; battery: Anchor; hp: Anchor; wallbox: Anchor };
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

  // Räumliche Kamerabewegung beim Herausscrollen: Szene kippt nach hinten und kommt näher
  const reduce = useReducedMotionPref();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 30%", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 70]);

  return (
    <motion.div
      ref={ref}
      className={`house house--hero${skipped ? " is-skipped" : ""}`}
      style={{
        aspectRatio: ratio,
        ["--house-start" as string]: houseStart,
        ...(reduce ? {} : { rotateX, scale, y, transformPerspective: 1400, transformOrigin: "50% 100%" }),
      }}
    >
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
        <li style={at(anchors.wallbox)} className="house__tag t-wb">
          Wallbox
        </li>
      </ul>
      {!introDone && !skipped ? (
        <button type="button" className="house__skip" onClick={() => setSkipped(true)}>
          Animation überspringen
        </button>
      ) : null}
    </motion.div>
  );
}
