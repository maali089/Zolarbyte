"use client";

import { useEffect, useState } from "react";
import { ContactIcon } from "@/components/ContactIcon";
import { site, whatsappHref } from "@/lib/site";

/**
 * Dauerhafte Kontaktknöpfe unten rechts (WhatsApp, E-Mail).
 * Tritt zurück, solange ein Formularfeld bearbeitet wird – dann liegt
 * die Bildschirmtastatur ohnehin über diesem Bereich.
 */
export function FloatingContact() {
  const [typing, setTyping] = useState(false);

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

  return (
    <nav className={`fab${typing ? " is-hidden" : ""}`} aria-label="Schnellkontakt">
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
