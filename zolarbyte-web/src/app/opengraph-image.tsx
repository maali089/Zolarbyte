import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "ZOLARBYTE ENERGY – Vom Dach bis zur Steckdose. Elektrotechnik-Meisterbetrieb in Karlsfeld bei München.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const KALK = "#f1f2ee";
const SCHIEFER = "#15171c";
const SCHIEFER_2 = "#464a53";
const MAGENTA = "#a3126b";
const AMBER = "#f2a20c";

// Schrift liegt im Repo (Schibsted Grotesk, SIL OFL 1.1) – keine Laufzeit-Requests nach außen.
const fontPromise = readFile(join(process.cwd(), "src/app/_og/SchibstedGrotesk-ExtraBold.ttf"));

const gridLines = (() => {
  const step = 60;
  const out: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let x = 0; x <= 1200; x += step) out.push({ key: `v${x}`, x1: x, y1: 0, x2: x, y2: 630 });
  for (let y = 0; y <= 630; y += step) out.push({ key: `h${y}`, x1: 0, y1: y, x2: 1200, y2: y });
  return out;
})();

export default async function Image() {
  const font = await fontPromise;
  // Sonnenbogen: Halbellipse über einer Horizontlinie
  const cx = 600;
  const horizon = 292;
  const rx = 528;
  const ry = 220;
  const t = 0.62; // Position der Sonne auf dem Bogen (0 = links, 1 = rechts)
  const ang = Math.PI * (1 - t);
  const sunX = cx + rx * Math.cos(ang);
  const sunY = horizon - ry * Math.sin(ang);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: KALK,
          fontFamily: "Schibsted Grotesk",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          {gridLines.map((l) => (
            <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={SCHIEFER} strokeOpacity="0.07" strokeWidth="1" />
          ))}
          <line x1="72" y1={horizon} x2="1128" y2={horizon} stroke={SCHIEFER} strokeOpacity="0.32" strokeWidth="2" />
          <path
            d={`M ${cx - rx} ${horizon} A ${rx} ${ry} 0 0 1 ${cx + rx} ${horizon}`}
            fill="none"
            stroke={SCHIEFER}
            strokeWidth="3"
          />
          <circle cx={sunX} cy={sunY} r="46" fill={AMBER} fillOpacity="0.22" />
          <circle cx={sunX} cy={sunY} r="26" fill={AMBER} />
        </svg>

        <div
          style={{
            position: "absolute",
            left: 72,
            top: 326,
            display: "flex",
            flexDirection: "column",
            fontSize: 96,
            lineHeight: 1.02,
            letterSpacing: -3,
            color: SCHIEFER,
            fontWeight: 800,
          }}
        >
          <div style={{ display: "flex" }}>Vom Dach bis zur</div>
          <div style={{ display: "flex", color: MAGENTA }}>Steckdose.</div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 44,
            display: "flex",
            fontSize: 28,
            color: SCHIEFER_2,
            fontWeight: 800,
            letterSpacing: 0.2,
          }}
        >
          ZOLARBYTE ENERGY · Elektrotechnik-Meisterbetrieb · Karlsfeld bei München
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Schibsted Grotesk", data: font, weight: 800, style: "normal" }],
    },
  );
}
