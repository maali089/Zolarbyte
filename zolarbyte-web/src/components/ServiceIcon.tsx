/** Eigene Linien-Icons für die drei Schwerpunkte (1,6er-Strich, runde Enden wie im Logo) */
export function ServiceIcon({ id, className }: { id: "photovoltaik" | "waermepumpe" | "stromspeicher"; className?: string }) {
  return (
    <svg
      className={`service-icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {id === "photovoltaik" ? (
        <>
          <path d="M5 23 9.5 9h17L22 23z" />
          <path d="M7.3 16h17M15.8 9l-2.3 14M21.2 9l-2.4 14M10.4 9 8.2 16" />
          <path d="M14 27h6M17 23v4" />
        </>
      ) : null}
      {id === "waermepumpe" ? (
        <>
          <rect x="4" y="8" width="24" height="16" rx="2" />
          <circle cx="13" cy="16" r="5" />
          <path d="M13 11.5v9M8.5 16h9" />
          <path d="M22 12v8M25 12v8" />
        </>
      ) : null}
      {id === "stromspeicher" ? (
        <>
          <rect x="9" y="5" width="14" height="23" rx="2" />
          <path d="M13 3h6" />
          <path d="M9 13.5h14M9 20.5h14" />
          <path d="M16.8 8.2 14.5 11h3l-2.3 2.8" />
        </>
      ) : null}
    </svg>
  );
}
