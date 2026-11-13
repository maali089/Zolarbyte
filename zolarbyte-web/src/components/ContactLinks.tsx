import { site, whatsappHref } from "@/lib/site";
import { ContactIcon } from "@/components/ContactIcon";

/** Projektkontakt als drei klare Wege: E-Mail, Telefon, WhatsApp */
export function ContactLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`contact-links ${className}`.trim()}>
      <li>
        <a href={`mailto:${site.project.email}`} className="contact-links__item contact-links__item--mail">
          <ContactIcon kind="mail" />
          <span>
            <span className="contact-links__k">E-Mail</span>
            {site.project.email}
          </span>
        </a>
      </li>
      <li>
        <a href={site.project.phoneHref} className="contact-links__item">
          <ContactIcon kind="phone" />
          <span>
            <span className="contact-links__k">Telefon</span>
            {site.project.phone}
          </span>
        </a>
      </li>
      <li>
        <a href={whatsappHref} target="_blank" rel="noopener" className="contact-links__item">
          <ContactIcon kind="whatsapp" />
          <span>
            <span className="contact-links__k">WhatsApp</span>
            Nachricht schreiben
            <span className="visually-hidden"> (öffnet WhatsApp)</span>
          </span>
        </a>
      </li>
    </ul>
  );
}
