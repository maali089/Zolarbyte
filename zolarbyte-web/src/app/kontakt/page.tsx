import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { getMailConfig } from "@/lib/mail";
import { isPreview, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt & Projektanfrage",
  description:
    "Projekt anfragen bei Zolarbyte, Ihrem Elektrotechnik-Meisterbetrieb in Karlsfeld bei München – per Formular, Telefon oder E-Mail.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  const { configured } = getMailConfig();

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow eyebrow--light">Kontakt</p>
          <h1>Projekt anfragen</h1>
          <p>
            Beschreiben Sie kurz Ihr Vorhaben oder Ihr Problem. Wir melden uns persönlich bei Ihnen – oder Sie rufen
            uns direkt an.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div>
            <h2 className="visually-hidden">Anfrageformular</h2>
            <ContactForm mailConfigured={configured} previewNote={isPreview} />
          </div>

          <aside className="contact-aside" aria-label="Direkter Kontakt">
            <div className="contact-block">
              <h2>Allgemeiner Kontakt</h2>
              <p>
                <a href={site.general.phoneHref}>{site.general.phone}</a>
                <br />
                <a href={`mailto:${site.general.email}`}>{site.general.email}</a>
              </p>
            </div>
            <div className="contact-block">
              <h2>Vertrieb &amp; neue Projekte</h2>
              <p>
                {site.sales.name}, {site.sales.role}
                <br />
                <a href={site.sales.phoneHref}>{site.sales.phone}</a>
                <br />
                <a href={`mailto:${site.sales.email}`}>{site.sales.email}</a>
              </p>
            </div>
            <div className="contact-block">
              <h2>Adresse</h2>
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
