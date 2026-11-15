import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClosingInquiry, PageHead } from "@/components/sections/Blocks";
import { FoerderCheck } from "@/components/foerder/FoerderCheck";
import { features, isPreview } from "@/lib/site";

export const metadata: Metadata = {
  title: "Förder-Check: Photovoltaik, Speicher, Wallbox",
  description:
    "Welche Förderung passt zu Ihrer Photovoltaikanlage, Ihrem Speicher oder Ihrer Wallbox? Der Förder-Check von Zolarbyte zeigt Programme mit Quelle und Datenstand.",
  alternates: { canonical: "/foerderung" },
};

export default function FoerderungPage() {
  if (!features.foerdercheck && !isPreview) notFound();
  return (
    <>
      <PageHead
        title={"Welche Förderung\npasst zu Ihnen?"}
        lead="Sechs kurze Schritte, am Ende Ihr Überblick: Vergütung, Steuervorteile, Kredit und Netzentgelt – jeweils mit amtlicher Quelle und Stand. Ohne Anmeldung, ohne Datenspeicherung."
        crumbs={[{ href: "/foerderung", label: "Förder-Check" }]}
      />
      <section className="section fc-section" aria-label="Förder-Check" data-ground="day">
        <div className="container">
          {!features.foerdercheck ? (
            <div className="notice" role="note">
              <span>
                <strong>Vorschau:</strong> Förderdaten aus Recherche mit offiziellen Quellen. Vor Veröffentlichung von
                Zolarbyte prüfen und freigeben lassen.
              </span>
            </div>
          ) : null}
          <FoerderCheck />
        </div>
      </section>
      <ClosingInquiry topic="photovoltaik" />
    </>
  );
}
