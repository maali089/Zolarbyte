"use client";

import { useEffect, useRef } from "react";
import { LOGO_PATHS, LOGO_STROKE } from "@/components/Logo";
import "./hero-scene.css";

/*
 * Markenillustration für den Einstieg: Netzanschluss → Verteilung →
 * Beleuchtung + Photovoltaik → Sonne-Blitz-Symbol.
 * Die Animation läuft rein über CSS. Ohne CSS-Animation (reduzierte Bewegung,
 * Fehler) zeigt das SVG automatisch den aktivierten Endzustand.
 */

type Wire = {
  id: string;
  d: string;
  /** Start der Aktivierung in Sekunden */
  delay: number;
  /** Dauer der Aktivierung in Sekunden */
  dur: number;
  /** Startverzögerung des langsamen Ruheimpulses, falls vorhanden */
  idle?: number;
};

const WIRES: Wire[] = [
  { id: "feed", d: "M36 508H350Q360 508 360 498V444", delay: 0.35, dur: 1.0, idle: 6 },
  { id: "light", d: "M292 302H266Q256 302 256 292V114Q256 104 246 104H70", delay: 1.85, dur: 0.85, idle: 10 },
  { id: "solar", d: "M428 346H557Q567 346 567 336V332", delay: 1.85, dur: 0.7, idle: 14 },
  { id: "brand", d: "M369 214V158", delay: 3.15, dur: 0.45 },
];

const CORDS = [
  { x: 78, y: 168 },
  { x: 138, y: 188 },
  { x: 198, y: 168 },
];

const ROWS = [258, 302, 346, 390];

/** Hervorgehobene Schaltgeräte: [Reihe, Position] */
const HIGHLIGHTS: Array<[number, number]> = [
  [1, 0],
  [1, 1],
  [2, 4],
  [2, 5],
  [2, 6],
];

const PANELS = [0, 1, 2].flatMap((c) =>
  [0, 1].map((r) => ({ x: 470 + c * 66, y: 238 + r * 44 })),
);

const t = (s: number) => `${s}s`;

function shade(x: number, y: number) {
  return `M${x - 22} ${y + 22}C${x - 22} ${y + 8} ${x - 12} ${y} ${x} ${y}C${x + 12} ${y} ${x + 22} ${y + 8} ${x + 22} ${y + 22}Z`;
}

function cone(x: number, y: number) {
  return `M${x - 18} ${y + 24}L${x - 44} 470H${x + 44}L${x + 18} ${y + 24}Z`;
}

export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);

  // Animationen außerhalb des sichtbaren Bereichs pausieren
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle("is-paused", !entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="scene">
      <svg
        className="scene__svg"
        viewBox="0 0 720 560"
        role="img"
        aria-labelledby="scene-title"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="scene-title">
          Illustration: Strom fließt vom Netzanschluss über die Verteilung zur Beleuchtung und zu den Solarmodulen.
        </title>
        <defs>
          <pattern id="zb-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.9" fill="#2a2a33" />
          </pattern>
          <linearGradient id="zb-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd6a0" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffd6a0" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="zb-halo">
            <stop offset="0" stopColor="#ffe2b8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffe2b8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="zb-panel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f34c96" stopOpacity="0.16" />
            <stop offset="1" stopColor="#c71585" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="zb-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="zb-fade" cx="0.5" cy="0.5" r="0.55">
            <stop offset="0.55" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="zb-fade-mask" maskContentUnits="objectBoundingBox">
            <rect width="1" height="1" fill="url(#zb-fade)" />
          </mask>
          <clipPath id="zb-panels-clip">
            {PANELS.map((p) => (
              <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width="62" height="40" rx="2" />
            ))}
          </clipPath>
        </defs>

        {/* Raster & Boden */}
        <rect className="scene__detail" width="720" height="540" fill="url(#zb-dots)" mask="url(#zb-fade-mask)" />
        <line x1="20" y1="472" x2="700" y2="472" stroke="#34343f" strokeWidth="2" />
        <g className="scene__detail" stroke="#26262e" strokeWidth="1.5">
          {Array.from({ length: 42 }, (_, i) => (
            <line key={i} x1={28 + i * 16} y1="476" x2={20 + i * 16} y2="484" />
          ))}
        </g>

        {/* Leitungen – Grundzustand */}
        <g fill="none" stroke="#34343f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {WIRES.map((w) => (
            <path key={w.id} d={w.d} />
          ))}
          {CORDS.map((c) => (
            <path key={c.x} d={`M${c.x} 104V${c.y}`} strokeWidth="2" />
          ))}
        </g>

        {/* ---------- 03 Beleuchtung ---------- */}
        <g className="scene__lights">
          {CORDS.map((c, i) => (
            <g key={c.x}>
              <path
                className="zb-on"
                d={cone(c.x, c.y)}
                fill="url(#zb-cone)"
                style={{ animationDelay: t(2.75 + i * 0.12) }}
              />
              <circle
                className="zb-on"
                cx={c.x}
                cy={c.y + 25}
                r="26"
                fill="url(#zb-halo)"
                style={{ animationDelay: t(2.75 + i * 0.12) }}
              />
            </g>
          ))}
        </g>
        <rect x="40" y="92" width="196" height="7" rx="3.5" fill="#2b2b34" />
        {CORDS.map((c, i) => (
          <g key={c.x}>
            <path d={shade(c.x, c.y)} fill="#24242c" stroke="#4a4a57" strokeWidth="1.5" />
            <circle cx={c.x} cy={c.y + 25} r="6" fill="#2e2e37" />
            <circle
              className="zb-on"
              cx={c.x}
              cy={c.y + 25}
              r="6"
              fill="#ffdcaa"
              style={{ animationDelay: t(2.75 + i * 0.12) }}
            />
          </g>
        ))}

        {/* ---------- 02 Verteilung ---------- */}
        <rect x="300" y="444" width="20" height="28" rx="3" fill="#24242c" />
        <rect x="400" y="444" width="20" height="28" rx="3" fill="#24242c" />
        <rect x="292" y="214" width="136" height="230" rx="10" fill="#1c1c23" stroke="#4a4a57" strokeWidth="2" />
        <rect
          className="zb-flash"
          x="292"
          y="214"
          width="136"
          height="230"
          rx="10"
          fill="none"
          stroke="#c71585"
          strokeWidth="2"
          style={{ animationDelay: t(1.3) }}
        />
        <rect x="336" y="220" width="48" height="6" rx="3" fill="#3a3a46" />
        <rect x="304" y="232" width="112" height="196" rx="4" fill="#16161c" stroke="#2e2e38" />
        {/* Kabeldurchführungen */}
        <rect x="286" y="296" width="6" height="12" rx="1.5" fill="#3a3a46" />
        <rect x="428" y="340" width="6" height="12" rx="1.5" fill="#3a3a46" />
        {ROWS.map((yc, r) => (
          <g key={yc}>
            <line x1="308" y1={yc} x2="412" y2={yc} stroke="#2e2e38" strokeWidth="2" />
            {r === 0 ? (
              <>
                <rect x="312" y={yc - 12} width="25" height="24" rx="2" fill="#2c2c35" />
                <rect x="320" y={yc - 4} width="9" height="8" rx="1.5" fill="#4d4d5a" />
              </>
            ) : null}
            {Array.from({ length: 7 }, (_, i) => i)
              .filter((i) => r !== 0 || i >= 2)
              .map((i) => (
                <g key={i}>
                  <rect x={312 + i * 14} y={yc - 12} width="11" height="24" rx="2" fill="#2a2a33" />
                  <rect x={315 + i * 14} y={yc - 3.5} width="5" height="7" rx="1" fill="#4d4d5a" />
                </g>
              ))}
          </g>
        ))}
        {/* Hauptschalter + ausgewählte Stromkreise */}
        <g fill="#f34c96">
          <g className="zb-on" style={{ animationDelay: t(1.35) }}>
            <rect x="320" y={ROWS[0] - 4} width="9" height="8" rx="1.5" />
            <circle cx="324.5" cy={ROWS[0] - 8} r="1.6" />
          </g>
          {HIGHLIGHTS.map(([r, i], n) => (
            <g key={`${r}-${i}`} className="zb-on" style={{ animationDelay: t(1.45 + n * 0.08) }}>
              <rect x={315 + i * 14} y={ROWS[r] - 3.5} width="5" height="7" rx="1" />
              <circle cx={317.5 + i * 14} cy={ROWS[r] - 8} r="1.5" />
            </g>
          ))}
        </g>

        {/* ---------- 04 Photovoltaik ---------- */}
        <rect x="497" y="322" width="6" height="150" rx="2" fill="#2b2b34" />
        <rect x="631" y="322" width="6" height="150" rx="2" fill="#2b2b34" />
        <line x1="503" y1="446" x2="631" y2="372" stroke="#2b2b34" strokeWidth="3" strokeLinecap="round" />
        <rect x="465" y="233" width="204" height="94" rx="5" fill="#15161d" stroke="#3a3a46" strokeWidth="1.5" />
        {PANELS.map((p) => (
          <g key={`${p.x}-${p.y}`}>
            <rect x={p.x} y={p.y} width="62" height="40" rx="2" fill="#1b1d28" stroke="#4a4a57" strokeWidth="1" />
            <g stroke="#2a2d3b" strokeWidth="0.8">
              {[1, 2, 3, 4, 5].map((k) => (
                <line key={k} x1={p.x + (62 / 6) * k} y1={p.y + 2} x2={p.x + (62 / 6) * k} y2={p.y + 38} />
              ))}
              <line x1={p.x + 2} y1={p.y + 20} x2={p.x + 60} y2={p.y + 20} />
            </g>
          </g>
        ))}
        <g className="zb-on" style={{ animationDelay: t(2.6) }}>
          {PANELS.map((p) => (
            <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width="62" height="40" rx="2" fill="url(#zb-panel)" />
          ))}
        </g>
        <g clipPath="url(#zb-panels-clip)">
          <g className="zb-sheen" style={{ animationDelay: t(2.7) }}>
            <rect x="380" y="220" width="70" height="120" fill="url(#zb-sheen)" transform="skewX(-22)" />
          </g>
        </g>
        <rect x="559" y="322" width="16" height="11" rx="2" fill="#2c2c35" stroke="#4a4a57" />
        <circle className="zb-on" cx="567" cy="327.5" r="1.8" fill="#f34c96" style={{ animationDelay: t(2.55) }} />

        {/* Netzanschluss */}
        <circle cx="36" cy="508" r="9" fill="#141419" stroke="#4a4a57" strokeWidth="2" />
        <circle className="zb-on" cx="36" cy="508" r="3.5" fill="#f34c96" style={{ animationDelay: t(0.2) }} />

        {/* Leitungen – aktiviert (Glanz + Linie), dann Impulse */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {WIRES.map((w) => (
            <path
              key={`g-${w.id}`}
              className="zb-draw scene__glow"
              d={w.d}
              pathLength={1}
              stroke="#c71585"
              strokeWidth="10"
              style={{ animationDelay: t(w.delay), animationDuration: t(w.dur) }}
            />
          ))}
          {WIRES.map((w) => (
            <path
              key={`a-${w.id}`}
              className="zb-draw"
              d={w.d}
              pathLength={1}
              stroke="#d81b8c"
              strokeWidth="3"
              style={{ animationDelay: t(w.delay), animationDuration: t(w.dur) }}
            />
          ))}
          {CORDS.map((c, i) => (
            <path
              key={`c-${c.x}`}
              className="zb-draw"
              d={`M${c.x} 104V${c.y}`}
              pathLength={1}
              stroke="#d81b8c"
              strokeWidth="2"
              style={{ animationDelay: t(2.5 + i * 0.1), animationDuration: t(0.3) }}
            />
          ))}
          {WIRES.map((w) => (
            <path
              key={`p-${w.id}`}
              className="zb-pulse"
              d={w.d}
              pathLength={1}
              stroke="#ff8cc0"
              strokeWidth="5"
              style={{ animationDelay: t(w.delay), animationDuration: t(w.dur) }}
            />
          ))}
          {WIRES.filter((w) => w.idle).map((w) => (
            <path
              key={`i-${w.id}`}
              className="zb-idle"
              d={w.d}
              pathLength={1}
              stroke="#f34c96"
              strokeWidth="4"
              style={{ animationDelay: t(w.idle!) }}
            />
          ))}
        </g>

        {/* ---------- Sonne-Blitz-Symbol ---------- */}
        <g transform="translate(260.3 -7.1) scale(0.36)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g className="zb-logo" stroke="#c71585" strokeWidth={LOGO_STROKE} style={{ animationDelay: t(3.55) }}>
            <path d={LOGO_PATHS.rays} />
            <path d={LOGO_PATHS.arc} />
            <path d={LOGO_PATHS.bolt} />
          </g>
          <g stroke="#ffb3d6" strokeWidth={LOGO_STROKE}>
            <path className="zb-trace" d={LOGO_PATHS.bolt} pathLength={1} style={{ animationDelay: t(3.55) }} />
            <path className="zb-trace" d={LOGO_PATHS.arc} pathLength={1} style={{ animationDelay: t(3.8) }} />
          </g>
        </g>

        {/* Beschriftung */}
        <g className="scene__label">
          <text x="54" y="537">01 Netzanschluss</text>
          <text x="282" y="438" textAnchor="end">02 Verteilung</text>
          <text x="40" y="78">03 Beleuchtung</text>
          <text x="465" y="222">04 Photovoltaik</text>
        </g>
      </svg>
    </div>
  );
}
