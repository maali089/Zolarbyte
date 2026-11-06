import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPreview } from "@/lib/site";
import { PvConcept } from "./PvConcept";

export const metadata: Metadata = {
  title: "Rechner – Konzept (intern)",
  robots: { index: false, follow: false },
};

export default function RechnerKonzeptPage() {
  // Nur in der internen Vorschau erreichbar
  if (!isPreview) notFound();

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow eyebrow--light">Interne Vorschau · Konzept</p>
          <h1>Rechner-Komponente</h1>
          <p>
            Vorbereitete Bedienung für einen späteren Rechner. Diese Seite ist nicht verlinkt und nicht für die
            Öffentlichkeit bestimmt.
          </p>
        </div>
      </section>
      <section className="section" style={{ background: "var(--grey)" }}>
        <div className="container">
          <div className="notice" role="note" style={{ maxWidth: "48rem", marginBottom: "2rem" }}>
            <span>
              <strong>Konzept – keine Berechnung.</strong> Zweck, verbindliche Eingaben und Ergebnislogik des Rechners
              sind noch nicht festgelegt. Die Schritte unten sind ein Beispiel für einen möglichen Photovoltaik-Rechner
              und zeigen nur die Bedienung: Fortschritt, Zurück ohne Datenverlust, Validierung, Zusammenfassung und
              Übergabe an die Projektanfrage. Es werden keine Preise, Erträge, Ersparnisse oder Förderungen berechnet.
            </span>
          </div>
          <PvConcept />
        </div>
      </section>
    </>
  );
}
