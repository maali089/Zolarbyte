"use client";

import { StepWizard, type WizardStep } from "@/components/calculator/StepWizard";

/** Beispielschritte – nur Konzept, keine verbindliche Datengrundlage. */
const PV_STEPS: WizardStep[] = [
  {
    id: "plz",
    kind: "text",
    title: "Wo steht das Gebäude?",
    help: "Die Postleitzahl genügt.",
    label: "Postleitzahl",
    pattern: /^\d{5}$/,
    patternMessage: "Bitte geben Sie eine fünfstellige Postleitzahl ein.",
  },
  {
    id: "gebaeude",
    kind: "choice",
    title: "Um welches Gebäude geht es?",
    options: [
      { value: "efh", label: "Einfamilienhaus" },
      { value: "mfh", label: "Mehrfamilienhaus" },
      { value: "gewerbe", label: "Gewerbe" },
      { value: "sonstiges", label: "Sonstiges" },
    ],
  },
  {
    id: "verbrauch",
    kind: "number",
    title: "Wie hoch ist Ihr jährlicher Stromverbrauch?",
    help: "Den Wert finden Sie auf Ihrer letzten Jahresabrechnung.",
    label: "Stromverbrauch pro Jahr",
    unit: "kWh",
    min: 500,
    max: 200000,
  },
  {
    id: "dach",
    kind: "choice",
    title: "Wie viel Dachfläche steht etwa zur Verfügung?",
    options: [
      { value: "s", label: "Unter 20 m²" },
      { value: "m", label: "20 bis 40 m²" },
      { value: "l", label: "40 bis 70 m²" },
      { value: "xl", label: "Über 70 m²" },
      { value: "unbekannt", label: "Weiß ich nicht" },
    ],
  },
  {
    id: "ausrichtung",
    kind: "choice",
    title: "Wohin ist die Dachfläche ausgerichtet?",
    options: [
      { value: "sued", label: "Süden" },
      { value: "ostwest", label: "Osten / Westen" },
      { value: "nord", label: "Norden" },
      { value: "flach", label: "Flachdach" },
      { value: "unbekannt", label: "Weiß ich nicht" },
    ],
  },
  {
    id: "verschattung",
    kind: "choice",
    title: "Gibt es Verschattung?",
    help: "Zum Beispiel durch Bäume, Nachbargebäude oder Gauben.",
    options: [
      { value: "keine", label: "Keine", description: "Das Dach liegt den ganzen Tag frei." },
      { value: "teilweise", label: "Teilweise", description: "Zu bestimmten Tageszeiten." },
      { value: "stark", label: "Stark", description: "Große Teile sind oft im Schatten." },
      { value: "unbekannt", label: "Weiß ich nicht" },
    ],
  },
];

export function PvConcept() {
  return (
    <StepWizard
      steps={PV_STEPS}
      handoff={{
        service: "Photovoltaik & Solaranlagen",
        intro: "Ich interessiere mich für eine Photovoltaikanlage. Meine Angaben:",
      }}
      renderResult={() => (
        <p className="wizard__help">
          Konzeptansicht: An dieser Stelle erscheint später das Ergebnis, sobald Berechnungsgrundlage und Zweck
          festgelegt sind. Bis dahin können Sie Ihre Angaben direkt in eine Projektanfrage übernehmen.
        </p>
      )}
    />
  );
}
