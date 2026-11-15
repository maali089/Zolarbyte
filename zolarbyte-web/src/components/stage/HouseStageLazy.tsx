"use client";

import dynamic from "next/dynamic";
import { stageFocus, type StageFocus } from "@/lib/daylight";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import type { PresetId } from "./presets";
import "./stage.css";

const HouseStage = dynamic(() => import("./HouseStage").then((m) => ({ default: m.HouseStage })), {
  ssr: false,
});

class StageBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const LABEL =
  "Modell eines Hauses: Strom fließt von der Photovoltaikanlage über den Verteiler in die Räume und zur Wallbox";

/**
 * Lädt die 3D-Szene erst nach dem ersten Idle bzw. wenn das Element in die Nähe
 * des Viewports kommt. Bis dahin (und ohne WebGL / bei Fehler) steht das gerenderte Poster (hero.webp).
 */
export function HouseStageLazy({
  className,
  preset,
  labels = true,
  layout,
}: {
  className?: string;
  /** Feste Ansicht für Renderings (kein Fokus-Store, kein Poster). */
  preset?: PresetId;
  labels?: boolean;
  layout?: "centered" | "hero";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [focus, setFocus] = useState<StageFocus>("overview");
  useEffect(() => {
    const t = window.setTimeout(() => setFocus(stageFocus.get()), 0);
    const off = stageFocus.subscribe(setFocus);
    return () => {
      window.clearTimeout(t);
      off();
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      if (hasWebGL()) setLoad(true);
      else setFailed(true);
    };
    // Schwache Geräte / Datensparmodus: beim Poster bleiben (identische Komposition)
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2)) return;

    // 3D erst nach der ersten Interaktion laden – hält den Hauptthread beim Seitenstart frei (TBT/INP).
    // Mit feinem Zeiger (Desktop) zusätzlich nach kurzem Leerlauf, damit die Szene ohne Zutun erscheint.
    let near = false;
    let interacted = false;
    const maybe = () => {
      if (near && interacted) go();
    };
    const io = new IntersectionObserver(
      (entries) => {
        near = entries.some((e) => e.isIntersecting);
        maybe();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    const onInteract = () => {
      interacted = true;
      maybe();
    };
    const evts = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;
    evts.forEach((e) => window.addEventListener(e, onInteract, { passive: true, once: true }));
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idle = 0;
    const startIdle = () => {
      if (!fine) return;
      idle = window.setTimeout(() => {
        if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(onInteract, { timeout: 2000 });
        else onInteract();
      }, 2500);
    };
    if (document.readyState === "complete") startIdle();
    else window.addEventListener("load", startIdle, { once: true });
    return () => {
      io.disconnect();
      evts.forEach((e) => window.removeEventListener(e, onInteract));
      window.removeEventListener("load", startIdle);
      window.clearTimeout(idle);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={["house-stage", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={LABEL}
      data-ready={ready && !failed ? "true" : "false"}
      data-focus={focus}
    >
      {preset ? null : (
        <picture>
          <source media="(max-aspect-ratio: 13/10)" srcSet="/renders/hero-mobile.webp" />
          <img
            className="house-stage__poster"
            src="/renders/hero.webp"
            width={1920}
            height={1200}
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="low"
          />
        </picture>
      )}
      {load && !failed ? (
        <div className="house-stage__scene">
          <StageBoundary onError={() => setFailed(true)}>
            <HouseStage onReady={() => setReady(true)} preset={preset} labels={labels} layout={layout} />
          </StageBoundary>
        </div>
      ) : null}
    </div>
  );
}
