"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import "./sun-cursor.css";

const INTERACTIVE = "a, button, [data-cursor]";
const TEXTUAL = "input, textarea, select, [contenteditable]";

/**
 * Amber-Punkt (folgt exakt) + federnder Ring. Nur fine pointer ohne reduced motion;
 * nativer Cursor wird nur über `html.has-sun-cursor` ausgeblendet.
 */
export function SunCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 420, damping: 34, mass: 0.7 });
  const ringY = useSpring(dotY, { stiffness: 420, damping: 34, mass: 0.7 });
  const scale = useSpring(1, { stiffness: 380, damping: 26 });
  const ringEl = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLDivElement>(null);
  const labelX = useSpring(dotX, { stiffness: 300, damping: 30, mass: 0.8 });
  const labelY = useSpring(dotY, { stiffness: 300, damping: 30, mass: 0.8 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const root = document.documentElement;
    let hover = false;
    let down = false;
    let seen = false;

    const applyScale = () => scale.set(down ? (hover ? 1.3 : 0.78) : hover ? 56 / 36 : 1);

    const setHover = (el: Element | null) => {
      const target = el instanceof Element ? el : null;
      const text = target?.closest(TEXTUAL);
      root.dataset.sunHidden = text ? "true" : "false";
      const hit = text ? null : (target?.closest(INTERACTIVE) as HTMLElement | null);
      hover = !!hit;
      ringEl.current?.setAttribute("data-hover", String(hover));
      const label = hit?.getAttribute("data-cursor")?.trim() ?? "";
      const l = labelEl.current;
      if (l) {
        l.textContent = label;
        l.setAttribute("data-on", String(!!label));
        l.style.opacity = label ? "1" : "0";
      }
      applyScale();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!seen) {
        seen = true;
        ringX.jump(e.clientX);
        ringY.jump(e.clientY);
        labelX.jump(e.clientX);
        labelY.jump(e.clientY);
      }
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      root.dataset.sunVisible = "true";
    };
    const onOver = (e: MouseEvent) => setHover(e.target as Element);
    const onDown = () => {
      down = true;
      applyScale();
    };
    const onUp = () => {
      down = false;
      applyScale();
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) root.dataset.sunVisible = "false";
    };

    const enable = () => {
      root.classList.add("has-sun-cursor");
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseover", onOver, { passive: true });
      document.addEventListener("mouseout", onOut);
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      window.addEventListener("blur", onUp);
    };
    const disable = () => {
      root.classList.remove("has-sun-cursor");
      delete root.dataset.sunVisible;
      delete root.dataset.sunHidden;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
      seen = false;
    };
    const sync = () => {
      disable();
      if (mq.matches) enable();
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      disable();
    };
  }, [dotX, dotY, ringX, ringY, labelX, labelY, scale]);

  return (
    <div aria-hidden="true">
      <motion.div ref={ringEl} className="sun-cursor-ring" style={{ x: ringX, y: ringY, scale }} />
      <motion.div ref={labelEl} className="sun-cursor-label" style={{ x: labelX, y: labelY }} />
      <motion.div className="sun-cursor-dot" style={{ x: dotX, y: dotY }} />
    </div>
  );
}
