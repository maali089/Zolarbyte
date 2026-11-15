"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DAY_END, DAY_START, daylight, formatHour, stageFocus, type StageFocus } from "@/lib/daylight";
import { HouseStageLazy } from "./HouseStageLazy";
import { PRESETS, type PresetId } from "./presets";

export interface StageLabProps {
  preset?: PresetId;
  hour?: number;
  labels?: boolean;
  transparent?: boolean;
  hero?: boolean;
  mask?: boolean;
}

/** Weicher Auslauf an allen vier Bildrändern (Renderings) */
const FEATHER = {
  WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 7%)",
  maskImage: "linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 7%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as const;

const FOCI: StageFocus[] = ["overview", "pv", "verteiler", "wallbox", "netz"];

/**
 * Interne Prüfansicht: Szene in 100vh, Slider setzt die Tageszeit, Buttons den Fokus.
 * Mit `preset` (Query ?preset=…&hour=…&labels=0|1&transparent=1) rendert sie eine feste
 * Ansicht ohne Bedienelemente – Grundlage für scripts/render-stage.mjs.
 */
export function StageLab({ preset, hour, labels = true, transparent = false, hero = false, mask = false }: StageLabProps) {
  const [h, setH] = useState(() => hour ?? daylight.get());
  const [focus, setFocus] = useState<StageFocus>(() => stageFocus.get());

  useEffect(() => {
    if (hour !== undefined) daylight.set(hour);
  }, [hour]);

  const night = h > 19 || h < 6.2;
  if (preset) {
    return (
      <div
        className="stage-lab-frame"
        style={{ position: "fixed", inset: 0, zIndex: 100, background: transparent ? "transparent" : night ? "#17121f" : "#f1f2ee", ...(mask ? FEATHER : {}) }}
      >
        <HouseStageLazy preset={preset} labels={labels} layout={hero ? "hero" : "centered"} />
      </div>
    );
  }
  const ink = night ? "#f3eff5" : "#15171c";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: night ? "#17121f" : "#f1f2ee", transition: "background 0.6s" }}>
      <HouseStageLazy />
      <div style={{ position: "absolute", left: 16, top: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FOCI.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={focus === f}
            onClick={() => {
              stageFocus.set(f);
              setFocus(f);
            }}
            style={{
              font: "600 12px/1 system-ui",
              padding: "8px 12px",
              border: `1px solid ${ink}`,
              background: focus === f ? "#c51c84" : "transparent",
              color: focus === f ? "#fff" : ink,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <label style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", gap: 12, alignItems: "center", font: "600 14px/1 system-ui", color: ink }}>
        <span style={{ minWidth: 48 }}>{formatHour(h)}</span>
        <input
          type="range"
          min={DAY_START}
          max={DAY_END}
          step={0.05}
          value={h}
          aria-label="Tageszeit"
          style={{ flex: 1 }}
          onChange={(e) => {
            const v = Number(e.target.value);
            setH(v);
            daylight.set(v);
          }}
        />
      </label>
    </div>
  );
}

/** Liest ?preset=<id>&hour=<h>&labels=0|1&transparent=1 aus der URL. */
export function StageLabFromQuery() {
  const q = useSearchParams();
  const p = q.get("preset");
  const preset = p && p in PRESETS ? (p as PresetId) : undefined;
  const hourRaw = q.get("hour");
  const hour = hourRaw !== null && Number.isFinite(Number(hourRaw)) ? Number(hourRaw) : preset ? PRESETS[preset].hour : undefined;
  return <StageLab preset={preset} hour={hour} labels={q.get("labels") !== "0"} transparent={q.get("transparent") === "1"} hero={q.get("shift") === "1"} mask={q.get("mask") === "1"} />;
}
