const ICONS: Record<string, React.ReactNode> = {
  elektroinstallation: (
    <>
      <rect x="7" y="5" width="18" height="22" rx="4" />
      <circle cx="16" cy="16" r="5.5" />
      <path d="M14 14.5v3M18 14.5v3" />
    </>
  ),
  kundendienst: (
    <>
      <path d="M20.5 5.5a6 6 0 0 0-7.6 7.6L5.5 20.5a2.1 2.1 0 0 0 3 3l7.4-7.4a6 6 0 0 0 7.6-7.6l-3.6 3.6-3-3z" />
    </>
  ),
  pruefung: (
    <>
      <path d="M5 21a11 11 0 0 1 22 0" />
      <path d="M16 21l5-6" />
      <circle cx="16" cy="21" r="1.6" />
      <path d="M8 26h16" />
    </>
  ),
  photovoltaik: (
    <>
      <path d="M6 9h20l-3 12H9z" />
      <path d="M16 9v12M7.5 15h17" />
      <path d="M16 21v6M11 27h10" />
    </>
  ),
  "e-mobilitaet": (
    <>
      <path d="M6 20l2-6.5A3 3 0 0 1 10.9 11h10.2a3 3 0 0 1 2.9 2.5L26 20v4H6z" />
      <circle cx="10.5" cy="20.5" r="1.3" />
      <circle cx="21.5" cy="20.5" r="1.3" />
      <path d="M17 4l-3 4h4l-3 4" />
    </>
  ),
  schulungen: (
    <>
      <rect x="5" y="6" width="22" height="14" rx="2" />
      <path d="M12 26l4-6 4 6M10 11h8M10 15h12" />
    </>
  ),
};

export function ServiceIcon({ id }: { id: string }) {
  return (
    <svg
      className="service-icon"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[id]}
    </svg>
  );
}
