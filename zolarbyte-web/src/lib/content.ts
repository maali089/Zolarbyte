export type Service = {
  id: string;
  title: string;
  short: string;
  text: string;
  points: string[];
};

/**
 * Leistungen laut bisheriger Website, sprachlich überarbeitet.
 * Keine zusätzlichen Angebote ergänzen, solange sie nicht bestätigt sind.
 */
export const services: Service[] = [
  {
    id: "elektroinstallation",
    title: "Elektroinstallation & Montage",
    short: "Installation",
    text: "Wir installieren und montieren elektrische Anlagen sorgfältig und nach den geltenden Normen – von der Hausinstallation bis zu einzelnen Montagearbeiten. Auch die regelmäßige Wartung Ihrer Anlage übernehmen wir.",
    points: ["Hausinstallation", "Montagearbeiten", "Wartung"],
  },
  {
    id: "kundendienst",
    title: "Kundendienst & Störungsbehebung",
    short: "Kundendienst",
    text: "Fällt der Strom aus oder arbeitet ein Teil der Anlage nicht mehr zuverlässig, suchen wir die Ursache systematisch und beheben die Störung – schnell, kompetent und sauber dokumentiert.",
    points: ["Fehlersuche", "Reparatur", "Instandsetzung"],
  },
  {
    id: "pruefung",
    title: "E-Check & elektrische Prüfungen",
    short: "Prüfung",
    text: "Wir prüfen Installationen und Geräte fachgerecht nach den aktuellen VDE-Bestimmungen und nach DGUV Vorschrift 3. Die Messergebnisse erhalten Sie in einer normgerechten Dokumentation.",
    points: ["Anlagenprüfung", "Geräteprüfung", "Messung & Protokoll"],
  },
  {
    id: "photovoltaik",
    title: "Photovoltaik & Solaranlagen",
    short: "Photovoltaik",
    text: "Wir montieren Photovoltaikanlagen und binden sie fachgerecht in Ihre Elektroinstallation ein. So erzeugen Sie Strom vom eigenen Dach und nutzen ihn direkt im Haus.",
    points: ["Montage", "Elektrischer Anschluss", "Einbindung in die Hausinstallation"],
  },
  {
    id: "e-mobilitaet",
    title: "E-Mobilität",
    short: "E-Mobilität",
    text: "Wer elektrisch fährt, braucht eine Installation, die mitkommt. Wir beraten Sie, was Ihre Elektroanlage dafür leisten muss und wie sich E-Mobilität sinnvoll mit Photovoltaik verbinden lässt.",
    points: ["Beratung", "Prüfung der bestehenden Installation", "Zusammenspiel mit Photovoltaik"],
  },
  {
    id: "schulungen",
    title: "Schulungen",
    short: "Schulungen",
    text: "Wir geben unser Wissen weiter: Zolarbyte bietet Schulungen im Bereich Elektrotechnik an. Sprechen Sie uns zu Inhalten und Terminen an.",
    points: ["Elektrotechnik", "Inhalte nach Absprache"],
  },
];

export const steps = [
  {
    title: "Anfrage",
    text: "Sie schildern uns Ihr Vorhaben – per Telefon, E-Mail oder über das Formular. Wir melden uns mit einer ersten Einschätzung.",
  },
  {
    title: "Beratung",
    text: "Wir sehen uns die Situation persönlich vor Ort an und klären, welche Lösung zu Ihrer Anlage passt.",
  },
  {
    title: "Planung",
    text: "Sie erhalten ein nachvollziehbares Angebot. Umfang, Komponenten und Termine stimmen wir gemeinsam ab.",
  },
  {
    title: "Umsetzung",
    text: "Wir führen die Arbeiten normgerecht aus, prüfen die Anlage und übergeben sie mit Dokumentation.",
  },
];

export const faqs = [
  {
    q: "Was bedeutet „Meisterbetrieb“ bei Zolarbyte?",
    a: "Zolarbyte ist als Elektrotechnik-Meisterbetrieb bei der Handwerkskammer für München und Oberbayern eingetragen. Ihre Anlage wird also von einem Fachbetrieb geplant, ausgeführt und geprüft, der die handwerklichen und rechtlichen Anforderungen erfüllt.",
  },
  {
    q: "Ist Zolarbyte nur für Photovoltaik zuständig?",
    a: "Nein. Photovoltaik ist ein Leistungsbereich von mehreren. Wir übernehmen ebenso Elektroinstallationen, Montagearbeiten, Wartung, Störungsbehebung, elektrische Prüfungen, Beratung zur E-Mobilität und Schulungen.",
  },
  {
    q: "Was wird bei einer elektrischen Prüfung gemacht?",
    a: "Wir prüfen Leitungen, Schutzeinrichtungen und angeschlossene Geräte durch Sichtprüfung und Messungen nach den einschlägigen VDE-Bestimmungen bzw. DGUV Vorschrift 3. Die Ergebnisse werden in einem Prüfprotokoll dokumentiert.",
  },
  {
    q: "Welche Angaben helfen uns bei Ihrer Anfrage?",
    a: "Eine kurze Beschreibung des Vorhabens, der Ort der Anlage und Ihr Wunschzeitraum. Fotos – etwa vom Zählerschrank oder von der betroffenen Stelle – können Sie uns gern per E-Mail schicken.",
  },
  {
    q: "Wen erreiche ich wofür?",
    a: "Für allgemeine Anfragen und Störungen erreichen Sie uns über die allgemeine Telefonnummer und kontakt@zolarbyte.de. Für Angebote und neue Projekte ist Jörg Mißfeldt, unser Vertriebsleiter, Ihr persönlicher Ansprechpartner.",
  },
];
