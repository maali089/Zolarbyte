"use client";

import { useReducedMotionPref } from "@/lib/hooks/useReducedMotionPref";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Chapter } from "@/components/Chapter";

type Situation = { situation: string; advice: string; action: { href: string; label: string } };

/**
 * Wegweiser als horizontale Strecke: Der Bereich bleibt beim Scrollen stehen,
 * die Ausgangslagen ziehen seitlich vorbei. Die Höhe entspricht genau der
 * seitlichen Strecke – es wird nichts blockiert, nur umgelenkt.
 * Bei reduzierter Bewegung: normale Liste.
 */
export function GuideTrack({ items }: { items: Situation[] }) {
  const outer = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [distance, setDistance] = useState(0);
  const reduce = useReducedMotionPref();

  useEffect(() => {
    // Breite der Strecke aus den Tafeln selbst berechnen (unabhängig vom aktuellen Umbruch)
    const measure = () => {
      const t = track.current;
      const box = sticky.current;
      if (!t || !box) return;
      const cs = getComputedStyle(t);
      const items = [...t.children] as HTMLElement[];
      const gap = parseFloat(cs.columnGap) || 0;
      const total =
        items.reduce((sum, el) => sum + el.offsetWidth, 0) +
        gap * Math.max(0, items.length - 1) +
        parseFloat(cs.paddingLeft) +
        parseFloat(cs.paddingRight);
      setDistance(Math.max(0, Math.round(total - box.clientWidth)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    if (sticky.current) ro.observe(sticky.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, (v) => -v * distance);
  const bar = useTransform(smooth, (v) => `${Math.round(v * 100)}%`);

  const horizontal = !reduce && distance > 0;

  return (
    <section
      ref={outer}
      id="wegweiser"
      className={`ch ch--guide hscroll${horizontal ? " is-horizontal" : ""}${reduce ? " is-static" : ""}`}
      aria-labelledby="guide-title"
      style={horizontal ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div ref={sticky} className="hscroll__sticky">
        <header className="container hscroll__head">
          <Chapter no={2}>Wegweiser</Chapter>
          <h2 id="guide-title" className="ch__title">
            Welche Lösung passt zu Ihrem Haus?
          </h2>
        </header>
        <motion.ol ref={track} className="hscroll__track" style={horizontal ? { x } : undefined}>
          {items.map((s, i) => (
            <li key={s.situation} className="hpanel">
              <span className="hpanel__letter" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <h3 className="hpanel__case">{s.situation}</h3>
              <p className="hpanel__advice">{s.advice}</p>
              <Link href={s.action.href} className="guide__go">
                {s.action.label}
              </Link>
            </li>
          ))}
        </motion.ol>
        <div className="container hscroll__foot" aria-hidden="true">
          <span className="hscroll__hint">Weiterscrollen</span>
          <span className="hscroll__bar">
            <motion.span style={{ width: horizontal ? bar : "100%" }} />
          </span>
        </div>
      </div>
    </section>
  );
}
