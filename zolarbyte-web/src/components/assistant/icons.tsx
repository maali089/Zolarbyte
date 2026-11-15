import type { InquiryTopicSlug } from "./topics";

/** Strich-Icons (24er-Raster, 1.75px Strich, ohne Füllung). */
const PATHS: Record<InquiryTopicSlug, React.ReactNode> = {
  photovoltaik: (
    <>
      <circle cx="18" cy="5.5" r="2.25" />
      <path d="M3 20.5l2.7-9.5H16l2.7 9.5z" />
      <path d="M4.4 15.75h13.2M9.2 11l-.8 9.5M13.2 11l.8 9.5" />
    </>
  ),
  wallbox: (
    <>
      <rect x="5.5" y="3" width="10" height="15" rx="2.25" />
      <path d="M11.2 6.6l-2.2 3.7h3l-2.2 3.7" />
      <path d="M3.5 21h14M15.5 8.5h1.25a1.75 1.75 0 011.75 1.75v5a1.5 1.5 0 003 0V12.5" />
    </>
  ),
  elektroinstallation: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <circle cx="12" cy="12" r="5.25" />
      <circle cx="9.75" cy="12" r="0.9" />
      <circle cx="14.25" cy="12" r="0.9" />
      <path d="M12 6.75v1.5M12 15.75v1.5" />
    </>
  ),
  stoerung: <path d="M13.25 2.5L5 13.75h6.25l-.75 7.75L19 10.25h-6.25z" />,
  pruefung: (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2.25" />
      <path d="M9 4.5V3.25h6V4.5M8.75 13.25l2.5 2.5 4.25-4.75" />
    </>
  ),
  schulung: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4.5M8 20.5h8M7 8.5h6M7 11.75h9" />
    </>
  ),
  sonstiges: (
    <>
      <path d="M4 5.5h16v11H9.5L4.5 20.5z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" strokeWidth="2.6" />
    </>
  ),
};

export function TopicIcon({ slug }: { slug: InquiryTopicSlug }) {
  return (
    <svg
      className="as-icon"
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[slug]}
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="as-check">
      <path d="M3.25 8.5l3 3 6.5-7" />
    </svg>
  );
}
