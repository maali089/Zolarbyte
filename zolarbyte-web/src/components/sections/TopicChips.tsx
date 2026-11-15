"use client";

import { useRouter } from "next/navigation";

export const HERO_TOPICS = [
  { slug: "photovoltaik", label: "Photovoltaik" },
  { slug: "waermepumpe", label: "Wärmepumpe" },
  { slug: "stromspeicher", label: "Speicher" },
  { slug: "wallbox", label: "Wallbox & E-Auto" },
  { slug: "elektroinstallation", label: "Elektroinstallation" },
  { slug: "stoerung", label: "Störung" },
] as const;

/** Startet den Anfrage-Assistenten mit vorgewähltem Anliegen. */
export function startInquiry(slug: string, push: (href: string) => void) {
  if (document.getElementById("anfrage")) {
    window.dispatchEvent(new CustomEvent("zb:inquiry", { detail: { topic: slug } }));
  } else {
    push(`/kontakt?anliegen=${encodeURIComponent(slug)}`);
  }
}

export function TopicChips({ labelledBy }: { labelledBy: string }) {
  const router = useRouter();
  return (
    <ul className="chips" aria-labelledby={labelledBy}>
      {HERO_TOPICS.map((t, i) => (
        <li key={t.slug} style={{ "--i": i } as React.CSSProperties}>
          <button
            type="button"
            className={`chip${t.slug === "stoerung" ? " chip--urgent" : ""}`}
            onClick={() => startInquiry(t.slug, router.push)}
          >
            <span className="chip__dot" aria-hidden="true" />
            {t.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
