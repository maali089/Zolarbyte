/**
 * Sonne-Blitz-Zeichen von Zolarbyte.
 *
 * Die Pfade sind an die gelieferte Logo-Datei (Zeichen auf Schwarz, 1600 × 552 px)
 * angepasst: Koordinaten = Bildpunkte der Vorlage. Abweichung zur Vorlage liegt
 * im Bereich der JPEG-Kantenunschärfe (93 % Flächendeckung, kein sichtbarer Versatz).
 * Sobald eine Original-Vektordatei vorliegt, hier ersetzen.
 */
export const LOGO = {
  viewBox: "92 92 370 370",
  stroke: 28.3,
  color: "#C71C84",
  /** Mittelpunkt der Sonne in Vorlage-Koordinaten */
  center: { x: 275.9, y: 276.4 },
  /** Die sechs sichtbaren Strahlen, exakt wie in der Vorlage */
  rays: "M198.9 401.8L188.4 420M149.2 350.6L130.8 360.4M129.9 276.8L108.5 276.7M150.4 198.9L133.3 188.6M203.1 148.1L192.5 130.7M276.7 129.8L276.7 108.5",
  /**
   * Verdeckte Ergänzung im gleichen 30°-Raster – nur für die Drehung.
   * Liegt immer im ausgeblendeten Bereich.
   */
  hiddenRays:
    "M350.2 149.4L360.5 131.7M403.7 203.5L421.5 193.4M423 277.2L443.5 277.3M402.9 350.6L420.6 360.9M348.8 404.1L358.9 421.9M275.1 423.4L275 443.9",
  arc: "M261.4 371.8A96.4 96.4 0 0 1 266.4 180.5",
  bolt: "M434.5 284.3L444.5 271.6C447.7 249.7 433.2 246.3 419 246.9L375.4 246.9L445 130.2L360.4 130L273.1 281Q274.8 314.1 302.2 315.1L336.8 315L293.2 436Q296.8 454.4 315.4 434.7L388.1 339.8",
} as const;

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: LOGO.stroke,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Unbewegtes Zeichen (Footer, Druck, Fallback) */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox={LOGO.viewBox}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <g {...strokeProps}>
        <path d={LOGO.rays} />
        <path d={LOGO.arc} />
        <path d={LOGO.bolt} />
      </g>
    </svg>
  );
}

/**
 * Animiertes Zeichen aus drei deckungsgleichen Ebenen:
 * 1. Maske (fest): lässt nur den linken Sonnenbereich durch.
 * 2. Strahlen (drehen sich innerhalb der Maske um den Sonnenmittelpunkt).
 * 3. Bogen + Blitz (fest, oben). Der Bogen ist kreisrund und sieht gedreht identisch aus.
 */
export function AnimatedMark({ className, ...rest }: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`mark${className ? ` ${className}` : ""}`} aria-hidden="true" {...rest}>
      <span className="mark__sun">
        <svg className="mark__rays" viewBox={LOGO.viewBox} focusable="false">
          <g {...strokeProps}>
            <path d={LOGO.rays} />
            <path d={LOGO.hiddenRays} />
          </g>
        </svg>
      </span>
      <svg className="mark__fixed" viewBox={LOGO.viewBox} focusable="false">
        <g {...strokeProps}>
          <path d={LOGO.arc} />
          <path d={LOGO.bolt} />
        </g>
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={`wordmark${className ? ` ${className}` : ""}`}>Zolarbyte Energy</span>;
}
