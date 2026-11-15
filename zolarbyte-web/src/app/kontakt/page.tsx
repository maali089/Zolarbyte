import type { Metadata } from "next";
import { InquirySlot } from "@/components/sections/Slots";
import { site, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Anfrage & Kontakt in Karlsfeld",
  description:
    "Photovoltaik, Wärmepumpe, Speicher, Wallbox oder Elektroarbeiten anfragen: Schritt für Schritt beim Elektro-Meisterbetrieb ZOLARBYTE ENERGY in Karlsfeld. Oder direkt anrufen.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <section className="page-head" data-ground="day">
        <div className="container">
          <h1>Anfrage starten</h1>
          <p>Ein paar kurze Fragen, eine pro Schritt. Wir melden uns persönlich – oder Sie rufen uns direkt an.</p>
        </div>
        <svg className="page-head__arc" viewBox="0 0 520 200" fill="none" aria-hidden="true">
          <path d="M0 199 C 130 20, 390 20, 520 199" stroke="currentColor" />
          <line x1="0" y1="199" x2="520" y2="199" stroke="currentColor" strokeDasharray="2 6" />
          <circle cx="388" cy="78" r="9" fill="var(--amber)" stroke="none" />
        </svg>
      </section>

      <section className="section contact" data-ground="day">
        <div className="container contact__grid">
          <div className="contact__form">
            <h2 className="visually-hidden">Anfrage-Assistent</h2>
            <InquirySlot tone="day" />
          </div>

          <aside className="contact__aside" aria-label="Direkter Kontakt">
            <div className="contact__block">
              <h2 className="tech">Allgemein &amp; Störungen</h2>
              <a className="contact__phone" href={site.general.phoneHref} data-cursor="Anrufen">
                {site.general.phone}
              </a>
              <a className="link-line" href={`mailto:${site.general.email}`}>
                {site.general.email}
              </a>
            </div>
            <div className="contact__block">
              <h2 className="tech">Projekte &amp; Beratung</h2>
              <p className="contact__name">
                {site.project.name}, {site.project.role}
              </p>
              <a className="contact__phone" href={site.project.phoneHref} data-cursor="Anrufen">
                {site.project.phone}
              </a>
              {whatsappHref ? (
                <a className="link-line" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  Per WhatsApp schreiben
                </a>
              ) : null}
            </div>
            <div className="contact__block">
              <h2 className="tech">Angebote</h2>
              <p className="contact__name">
                {site.sales.name}, {site.sales.role}
              </p>
              <a className="link-line" href={`mailto:${site.sales.email}`}>
                {site.sales.email}
              </a>
            </div>
            <div className="contact__block">
              <h2 className="tech">Adresse</h2>
              <p>
                {site.legalName}
                <br />
                {site.address.street}
                <br />
                {site.address.zip} {site.address.city} bei München
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
