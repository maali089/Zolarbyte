/**
 * Sonne-Blitz-Symbol, als Vektor nachgezeichnet aus der gelieferten Logo-Datei.
 * Vorläufig: bitte durch die Original-Vektordatei ersetzen, sobald verfügbar.
 */
export const LOGO_PATHS = {
  rays: "M276 109V128M191 127L205 150M131 188L151 199M109 281H130M128 362L150 349M203 399L190 422",
  arc: "M267 184A93 93 0 0 0 260 369",
  bolt: "M434 284L442 270C447 259 440 250 426 250H372L444 130H360L271 297Q266 314 285 314H336L302 442L391 333",
};

export const LOGO_VIEWBOX = "90 90 374 374";
export const LOGO_STROKE = 27;

type MarkProps = {
  className?: string;
  title?: string;
};

export function LogoMark({ className, title }: MarkProps) {
  return (
    <svg
      className={className}
      viewBox={LOGO_VIEWBOX}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={LOGO_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={LOGO_PATHS.rays} />
        <path d={LOGO_PATHS.arc} />
        <path d={LOGO_PATHS.bolt} />
      </g>
    </svg>
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className={`logo logo--${tone}`}>
      <LogoMark className="logo__mark" />
      <span className="logo__word">Zolarbyte</span>
    </span>
  );
}
