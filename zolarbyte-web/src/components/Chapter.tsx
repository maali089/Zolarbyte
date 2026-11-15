import { LOGO } from "@/components/Logo";

/**
 * Kapitelmarke: die Sonnenstrahlen aus dem Logo als ruhiges Zeichen,
 * dazu Kapitelnummer und Thema. Führt als roter Faden durch die Startseite.
 */
export function Chapter({ no, children }: { no: number; children: React.ReactNode }) {
  return (
    <p className="chapter">
      <svg viewBox="100 100 200 330" aria-hidden="true" focusable="false">
        <path d={LOGO.rays} />
      </svg>
      <span className="chapter__no">{String(no).padStart(2, "0")}</span>
      <span className="chapter__name">{children}</span>
    </p>
  );
}
