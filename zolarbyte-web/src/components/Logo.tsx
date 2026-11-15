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
      <g fill="none" stroke="currentColor" strokeWidth={LOGO_STROKE} strokeLinecap="round" strokeLinejoin="round">
        <path d={LOGO_PATHS.rays} />
        <path d={LOGO_PATHS.arc} />
        <path d={LOGO_PATHS.bolt} />
      </g>
    </svg>
  );
}

/**
 * Strahlen auf dem Sonnenkreis (Mitte 276/281, Abstand 29.6°). Der Kranz dreht sich jeweils um
 * einen Strahlenabstand und beginnt dann von vorn: oben blendet ein Strahl ein, unten einer aus –
 * dadurch wirkt die Drehung endlos, ohne dass Strahlen den Blitz kreuzen.
 */
const RAY_IN = "M350.6 149.7L360.5 132.3";
const RAY_MID = "M276.0 130.0L276.0 110.0M201.4 149.7L191.5 132.3M146.3 203.7L129.1 193.4M125.0 277.8L105.0 277.4M143.2 352.8L125.6 362.3";
const RAY_OUT = "M196.0 409.1L185.4 426.0";

/** Animiertes Zeichen für den Header. Reduzierte Bewegung: Originalzeichen, statisch. */
export function AnimatedLogoMark({ className }: { className?: string }) {
  return (
    <svg className={`logo-anim ${className ?? ""}`} viewBox={LOGO_VIEWBOX} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth={LOGO_STROKE} strokeLinecap="round" strokeLinejoin="round">
        <path className="logo-anim__static" d={LOGO_PATHS.rays} />
        <g className="logo-anim__rays">
          <path className="logo-anim__in" d={RAY_IN} />
          <path d={RAY_MID} />
          <path className="logo-anim__out" d={RAY_OUT} />
        </g>
        <path d={LOGO_PATHS.arc} />
        <path className="logo-anim__bolt" d={LOGO_PATHS.bolt} />
      </g>
    </svg>
  );
}

export function Logo({ animated = true }: { animated?: boolean }) {
  return (
    <span className="logo">
      {animated ? <AnimatedLogoMark className="logo__mark" /> : <LogoMark className="logo__mark" />}
      <span className="logo__word">
        Zolarbyte <span className="logo__suffix">Energy</span>
      </span>
    </span>
  );
}
