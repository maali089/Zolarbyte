/** Einfache Linien-Symbole für Kontaktwege; das WhatsApp-Zeichen als vereinfachte Sprechblase mit Hörer */
export function ContactIcon({ kind }: { kind: "mail" | "phone" | "whatsapp" }) {
  if (kind === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="contact-icon">
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <path d="m3.6 6.6 8.4 6.6 8.4-6.6" />
      </svg>
    );
  }
  if (kind === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="contact-icon">
        <path d="M8 3.6 9.9 7.4a1.2 1.2 0 0 1-.3 1.4L8.2 10.2a11.6 11.6 0 0 0 5.6 5.6l1.4-1.4a1.2 1.2 0 0 1 1.4-.3l3.8 1.9a1.2 1.2 0 0 1 .6 1.3l-.6 2.6a1.9 1.9 0 0 1-2 1.5A18.2 18.2 0 0 1 2.6 5.6a1.9 1.9 0 0 1 1.5-2l2.6-.6A1.2 1.2 0 0 1 8 3.6z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="contact-icon contact-icon--wa">
      <path d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L3 21l4.4-1.1A9.2 9.2 0 1 0 12 2.8z" />
      <path d="M8.9 7.6c.3-.3.8-.3 1 .1l.9 1.9c.1.3 0 .6-.2.8l-.6.6a6.6 6.6 0 0 0 3 3l.6-.6c.2-.2.5-.3.8-.2l1.9.9c.4.2.4.7.1 1l-.6.7c-.5.5-1.3.7-2 .4a10 10 0 0 1-5.2-5.2c-.3-.7-.1-1.5.4-2z" className="contact-icon__fill" />
    </svg>
  );
}
