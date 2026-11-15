import { LOGO_PATHS, LOGO_STROKE, LOGO_VIEWBOX } from "@/components/Logo";

/**
 * Prüfmarke: Übergabe „mit Dokumentation“ als offizielles Zeichen.
 * Keine Siegel- oder Zertifikatsbehauptung – nur Betriebsbezeichnung.
 */
export function Stamp({
  className = "",
  uid = "stamp-ring",
  reveal = false,
}: {
  className?: string;
  uid?: string;
  reveal?: boolean;
}) {
  const text = "Elektrotechnik · Meisterbetrieb · Karlsfeld · ";
  return (
    <svg
      className={`stamp ${className}`}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      data-stamp={reveal ? "" : undefined}
    >
      <defs>
        <path id={uid} d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
      </defs>
      <circle cx="100" cy="100" r="96" className="stamp__ring" />
      <circle cx="100" cy="100" r="56" className="stamp__ring stamp__ring--inner" />
      <text className="stamp__text">
        <textPath href={`#${uid}`} textLength="462">
          {text.toUpperCase()}
        </textPath>
      </text>
      <svg x="64" y="64" width="72" height="72" viewBox={LOGO_VIEWBOX}>
        <g fill="none" stroke="currentColor" strokeWidth={LOGO_STROKE} strokeLinecap="round" strokeLinejoin="round">
          <path d={LOGO_PATHS.rays} />
          <path d={LOGO_PATHS.arc} />
          <path d={LOGO_PATHS.bolt} />
        </g>
      </svg>
    </svg>
  );
}
