"use client";

import { useState } from "react";
import { PARTNERS, logoSize, type Partner } from "@/lib/partners";

function List({ copy }: { copy?: boolean }) {
  return (
    <ul className="marquee__list" aria-hidden={copy || undefined} inert={copy || undefined}>
      {PARTNERS.map((p: Partner) => {
        const { w, h } = logoSize(p.ratio);
        return (
          <li key={p.name}>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`marquee__tile marquee__tile--${p.tile ?? "light"}`}
              tabIndex={copy ? -1 : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Herstellerlogos unverändert ausliefern */}
              <img src={p.logo} alt={copy ? "" : p.name} width={w} height={h} loading="lazy" decoding="async" />
              {copy ? null : <span className="visually-hidden"> – offizielle Website (neues Fenster)</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Laufendes Logoband; pausiert bei Zeiger, Fokus oder per Knopf. Bei reduzierter Bewegung statisch. */
export function PartnerMarquee() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={`marquee${paused ? " is-paused" : ""}`}>
      <div className="marquee__viewport">
        <div className="marquee__track">
          <List />
          <List copy />
        </div>
      </div>
      <button type="button" className="marquee__toggle" aria-pressed={paused} onClick={() => setPaused((v) => !v)}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          {paused ? <path d="M4.5 3v10l8-5z" /> : <path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" />}
        </svg>
        {paused ? "Logoband abspielen" : "Logoband anhalten"}
      </button>
    </div>
  );
}
