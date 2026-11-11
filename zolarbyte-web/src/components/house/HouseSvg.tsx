import { buildHouseSvg, VIEW_H, VIEW_W } from "./geometry";

/**
 * Statisches Energiehaus-SVG. Wird auf dem Server bzw. beim Build erzeugt;
 * im Browser liegt nur fertiges Markup vor. Ohne CSS-Animation (reduzierte
 * Bewegung, Fehler) zeigt es automatisch den ruhigen Endzustand.
 */
export function HouseSvg({ id, label, viewBox }: { id: string; label: string; viewBox?: string }) {
  return (
    <svg
      className="house__svg"
      viewBox={viewBox ?? `0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: buildHouseSvg(id) }}
    />
  );
}

export const HOUSE_RATIO = `${VIEW_W} / ${VIEW_H}`;
