"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ServiceVisual } from "@/components/sections/ServiceVisual";
import { startInquiry } from "@/components/sections/TopicChips";
import type { Service } from "@/lib/content";

/**
 * Leistungen als aufklappbares Register. Eine Zeile ist offen (Akkordeon); geöffnet zeigt sie
 * Kurzbeschreibung, Schwerpunkte, Rendering (mobil) und die Wege „Zur Leistung“ / „Anfragen“.
 * Desktop: rechts das Rendering der offenen bzw. überfahrenen Leistung.
 */
export function ServiceIndex({ services, headingLevel = 3 }: { services: Service[]; headingLevel?: 2 | 3 }) {
  const [open, setOpen] = useState<string | null>(services[0]?.id ?? null);
  const [hover, setHover] = useState<string | null>(null);
  const router = useRouter();
  const uid = useId();
  const Title = headingLevel === 2 ? "h2" : "h3";
  const shown = hover ?? open ?? services[0]?.id;

  return (
    <div className="svc">
      <ol className="svc__list">
        {services.map((s, i) => {
          const isOpen = open === s.id;
          const panelId = `${uid}-${s.id}`;
          return (
            <li
              key={s.id}
              id={s.id}
              className={`svc__row${isOpen ? " is-open" : ""}${shown === s.id ? " is-active" : ""}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(s.id)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
            >
              <Title className="svc__heading">
                <button
                  type="button"
                  className="svc__toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                >
                  <span className="svc__title">{s.title}</span>
                  <span className="svc__plus" aria-hidden="true" />
                </button>
              </Title>

              <div className="svc__panel" id={panelId} role="region" aria-label={s.title} inert={!isOpen}>
                <div className="svc__panel-inner">
                  <div className="svc__body">
                    <p className="svc__lead">{s.lead}</p>
                    <ul className="svc__points" aria-label={`Schwerpunkte: ${s.title}`}>
                      {s.points.map((p) => (
                        <li key={p} className="tech">
                          {p}
                        </li>
                      ))}
                    </ul>
                    <ServiceVisual id={s.id} className="svc__inline" sizes="(min-width: 1024px) 1px, 90vw" />
                    <div className="svc__actions">
                      <Link href={`/leistungen/${s.id}`} className="btn btn--ghost btn--small" data-cursor="Ansehen">
                        Zur Leistung
                        <svg className="btn__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M4 10h11M11 5l5 5-5 5" />
                        </svg>
                      </Link>
                      <button
                        type="button"
                        className="svc__ask"
                        onClick={() => startInquiry(s.topic, router.push)}
                        aria-label={`${s.title} anfragen`}
                      >
                        Anfragen
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M4 10h11M11 5l5 5-5 5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="svc__plate" aria-hidden="true">
        <div className="svc__plate-inner">
          {services.map((s) => (
            <div key={s.id} className={`svc__frame${s.id === shown ? " is-active" : ""}`}>
              <ServiceVisual id={s.id} className="svc__render" />
            </div>
          ))}
          <p className="svc__caption tech">
            <span className="svc__caption-dot" />
            {services.find((s) => s.id === shown)?.short}
          </p>
        </div>
      </div>
    </div>
  );
}
