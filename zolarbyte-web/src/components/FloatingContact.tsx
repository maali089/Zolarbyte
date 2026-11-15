"use client";

import { useEffect, useRef, useState } from "react";
import { ContactIcon } from "@/components/ContactIcon";
import { site, whatsappHref } from "@/lib/site";

/** Was nie unter den Knöpfen liegen darf */
const INTERACTIVE = "a[href], button, input, select, textarea, summary, label, [role='button']";

/**
 * Dauerhafte Kontaktknöpfe unten rechts (WhatsApp, E-Mail).
 * Sie treten kurz zurück, wenn genau darunter ein Link, Knopf oder Formularfeld
 * liegt oder gerade getippt wird – und erscheinen wieder, sobald der Platz frei ist.
 */
export function FloatingContact() {
  const [typing, setTyping] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const rects = useRef<DOMRect[]>([]);

  useEffect(() => {
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && t.matches("input:not([type=checkbox]):not([type=radio]), textarea, select");
    const onIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    let frame = 0;

    // Lage der Knöpfe merken, solange sie sichtbar sind (versteckt verschieben sie sich leicht)
    const measure = () => {
      if (!nav.classList.contains("is-hidden")) {
        rects.current = [...nav.querySelectorAll("a")].map((a) => a.getBoundingClientRect());
      }
    };

    const check = () => {
      frame = 0;
      measure();
      let hit = false;
      for (const r of rects.current) {
        const pts = [
          [r.left + r.width / 2, r.top + r.height / 2],
          [r.left + 6, r.top + 6],
          [r.right - 6, r.top + 6],
          [r.left + 6, r.bottom - 6],
          [r.right - 6, r.bottom - 6],
        ];
        for (const [x, y] of pts) {
          const under = document.elementsFromPoint(x, y).find((el) => !nav.contains(el));
          if (under?.closest(INTERACTIVE) && !under.closest(".site-header")) {
            hit = true;
            break;
          }
        }
        if (hit) break;
      }
      setBlocked(hit);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("click", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("click", schedule);
    };
  }, []);

  return (
    <nav ref={ref} className={`fab${typing || blocked ? " is-hidden" : ""}`} aria-label="Schnellkontakt">
      <a href={whatsappHref} target="_blank" rel="noopener" className="fab__btn fab__btn--wa">
        <ContactIcon kind="whatsapp" />
        <span className="fab__label">WhatsApp</span>
        <span className="visually-hidden"> – öffnet WhatsApp mit vorbereiteter Nachricht an {site.project.phone}</span>
      </a>
      <a href={`mailto:${site.project.email}`} className="fab__btn fab__btn--mail">
        <ContactIcon kind="mail" />
        <span className="fab__label">E-Mail</span>
        <span className="visually-hidden"> an {site.project.email}</span>
      </a>
    </nav>
  );
}
