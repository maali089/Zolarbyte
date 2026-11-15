import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPreview } from "@/lib/site";
import { LivingGrid } from "@/components/grid/LivingGrid";
import { SunCursor } from "@/components/motion/SunCursor";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Magnetic } from "@/components/motion/Magnetic";
import "@/styles/tokens.css";

export const metadata: Metadata = {
  title: "Labor – Living Grid (intern)",
  robots: { index: false, follow: false },
};

const section = { position: "relative", minHeight: "100vh", padding: "96px 48px" } as const;
const content = { position: "relative", zIndex: 2, maxWidth: 720 } as const;

export default function GridLaborPage() {
  if (!isPreview) notFound();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", color: "var(--schiefer)" }}>
      <SmoothScroll />
      <LivingGrid />
      <SunCursor />
      <section style={{ ...section, background: "var(--kalk)" }}>
        <div style={content}>
          <p style={{ fontFamily: "var(--font-tech)", letterSpacing: ".08em", textTransform: "uppercase" }}>
            Labor · Living Grid
          </p>
          <h1 style={{ fontSize: "clamp(2.5rem,7vw,5rem)", lineHeight: 1, margin: "16px 0" }}>Vom Dach bis zur Steckdose.</h1>
          <p style={{ fontSize: 20 }}>Der Cursor ist ein zweites Licht. Bewegen, schnell wischen, klicken.</p>
          <div style={{ display: "flex", gap: 24, margin: "32px 0", alignItems: "center" }}>
            <Magnetic>
              <a
                href="#nacht"
                data-cursor="Weiter"
                style={{ display: "inline-block", padding: "16px 28px", background: "var(--magenta)", color: "#fff", borderRadius: 999 }}
              >
                Zur Nacht
              </a>
            </Magnetic>
            <a href="tel:+490000" data-cursor="Anrufen" style={{ color: "var(--magenta-ink)" }}>
              Anrufen
            </a>
          </div>
          <input aria-label="Test" placeholder="Eingabe (nativer Cursor)" style={{ padding: 12, width: 280 }} />
        </div>
      </section>
      <section id="nacht" style={{ ...section, background: "var(--nacht)", color: "var(--on-nacht)" }}>
        <div style={content}>
          <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>Abendgrund</h2>
          <p style={{ fontSize: 20 }}>Dasselbe Raster auf Nacht-Aubergine, ohne Umschalten.</p>
          <a href="#" data-cursor="Ziehen" style={{ color: "var(--magenta-hi)" }}>
            Link mit Label
          </a>
        </div>
      </section>
    </div>
  );
}
