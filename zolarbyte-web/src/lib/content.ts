export type Service = {
  id: string;
  title: string;
  short: string;
  /** Ein Satz für die Leistungsliste */
  lead: string;
  /** Slug des Anfrage-Assistenten */
  topic: string;
  text: string;
  points: string[];
  /** Headline der Leistungsseite */
  headline: string;
  /** SEO-Title (ohne „– Zolarbyte“) und Description der Leistungsseite */
  seoTitle: string;
  seoDescription: string;
  /** Verwandte Leistungen (IDs) – „gehört zusammen“ */
  related: string[];
};

/**
 * Leistungen laut bisheriger Website, sprachlich überarbeitet. Reihenfolge: Energie-Themen zuerst (Schwerpunkt Hausbesitzer).
 * Keine zusätzlichen Angebote ergänzen, solange sie nicht bestätigt sind.
 */
export const services: Service[] = [
  {
    id: "photovoltaik",
    headline: "Strom vom Dach, sauber im Haus angekommen.",
    seoTitle: "Photovoltaik in Karlsfeld: Montage & Anschluss",
    seoDescription: "Photovoltaik vom Elektro-Meisterbetrieb in Karlsfeld bei München: Montage, elektrischer Anschluss und Einbindung in Ihre Hausinstallation. Jetzt anfragen.",
    related: ["e-mobilitaet", "elektroinstallation"],
    lead: "Montage, elektrischer Anschluss und Einbindung in Ihre Hausinstallation – damit der Strom vom Dach im Haus ankommt.",
    topic: "photovoltaik",
    title: "Photovoltaik & Solaranlagen",
    short: "Photovoltaik",
    text: "Wir montieren Photovoltaikanlagen und binden sie fachgerecht in Ihre Elektroinstallation ein. So erzeugen Sie Strom vom eigenen Dach und nutzen ihn direkt im Haus.",
    points: ["Montage", "Elektrischer Anschluss", "Einbindung in die Hausinstallation"],
  },
  {
    id: "e-mobilitaet",
    headline: "Laden zu Hause – mit einer Installation, die mitkommt.",
    seoTitle: "E-Mobilität & Wallbox: Beratung in Karlsfeld",
    seoDescription: "E-Mobilität zu Hause: Wir prüfen, was Ihre Elektroinstallation fürs Laden leisten muss, und denken Wallbox und Photovoltaik zusammen. Meisterbetrieb in Karlsfeld.",
    related: ["photovoltaik", "elektroinstallation"],
    lead: "Wir prüfen, was Ihre Installation für das Laden zu Hause leisten muss, und denken E-Auto und Photovoltaik zusammen.",
    topic: "wallbox",
    title: "E-Mobilität",
    short: "E-Mobilität",
    text: "Wer elektrisch fährt, braucht eine Installation, die mitkommt. Wir beraten Sie, was Ihre Elektroanlage dafür leisten muss und wie sich E-Mobilität sinnvoll mit Photovoltaik verbinden lässt.",
    points: ["Beratung", "Prüfung der bestehenden Installation", "Zusammenspiel mit Photovoltaik"],
  },
  {
    id: "elektroinstallation",
    headline: "Die Leitungen hinter allem.",
    seoTitle: "Elektroinstallation & Montage in Karlsfeld",
    seoDescription: "Elektroinstallation, Montagearbeiten und Wartung vom Elektrotechnik-Meisterbetrieb Zolarbyte in Karlsfeld bei München – sorgfältig und nach geltenden Normen.",
    related: ["kundendienst", "pruefung"],
    lead: "Hausinstallation, Montagearbeiten und Wartung – sorgfältig und nach den geltenden Normen.",
    topic: "elektroinstallation",
    title: "Elektroinstallation & Montage",
    short: "Installation",
    text: "Wir installieren und montieren elektrische Anlagen sorgfältig und nach den geltenden Normen – von der Hausinstallation bis zu einzelnen Montagearbeiten. Auch die regelmäßige Wartung Ihrer Anlage übernehmen wir.",
    points: ["Hausinstallation", "Montagearbeiten", "Wartung"],
  },
  {
    id: "kundendienst",
    headline: "Wenn etwas nicht mehr läuft.",
    seoTitle: "Elektriker-Kundendienst & Störung in Karlsfeld",
    seoDescription: "Strom weg, Sicherung fliegt? Zolarbyte sucht die Ursache systematisch, behebt die Störung und dokumentiert sauber. Elektro-Meisterbetrieb in Karlsfeld.",
    related: ["elektroinstallation", "pruefung"],
    lead: "Strom weg, Sicherung fliegt? Wir suchen die Ursache systematisch, beheben sie und dokumentieren sauber.",
    topic: "stoerung",
    title: "Kundendienst & Störungsbehebung",
    short: "Kundendienst",
    text: "Fällt der Strom aus oder arbeitet ein Teil der Anlage nicht mehr zuverlässig, suchen wir die Ursache systematisch und beheben die Störung – schnell, kompetent und sauber dokumentiert.",
    points: ["Fehlersuche", "Reparatur", "Instandsetzung"],
  },
  {
    id: "pruefung",
    headline: "Geprüft, gemessen, dokumentiert.",
    seoTitle: "E-Check & Prüfung nach DGUV V3 in Karlsfeld",
    seoDescription: "Elektrische Prüfungen nach VDE und DGUV Vorschrift 3: Anlagen- und Geräteprüfung mit normgerechtem Prüfprotokoll vom Meisterbetrieb in Karlsfeld bei München.",
    related: ["elektroinstallation", "kundendienst"],
    lead: "Anlagen- und Geräteprüfung nach VDE und DGUV Vorschrift 3 – mit normgerechtem Prüfprotokoll.",
    topic: "pruefung",
    title: "E-Check & elektrische Prüfungen",
    short: "Prüfung",
    text: "Wir prüfen Installationen und Geräte fachgerecht nach den aktuellen VDE-Bestimmungen und nach DGUV Vorschrift 3. Die Messergebnisse erhalten Sie in einer normgerechten Dokumentation.",
    points: ["Anlagenprüfung", "Geräteprüfung", "Messung & Protokoll"],
  },
  {
    id: "schulungen",
    headline: "Elektrotechnik, verständlich weitergegeben.",
    seoTitle: "Schulungen Elektrotechnik – Zolarbyte Karlsfeld",
    seoDescription: "Schulungen im Bereich Elektrotechnik vom Meisterbetrieb Zolarbyte aus Karlsfeld bei München. Inhalte und Termine stimmen wir mit Ihnen ab.",
    related: ["pruefung", "elektroinstallation"],
    lead: "Wissen aus der Elektrotechnik, weitergegeben vom Meisterbetrieb – Inhalte und Termine nach Absprache.",
    topic: "schulung",
    title: "Schulungen",
    short: "Schulungen",
    text: "Wir geben unser Wissen weiter: Zolarbyte bietet Schulungen im Bereich Elektrotechnik an. Sprechen Sie uns zu Inhalten und Terminen an.",
    points: ["Elektrotechnik", "Inhalte nach Absprache"],
  },
];

export const steps = [
  {
    title: "Anfrage",
    time: "Tag 1",
    text: "Sie schildern Ihr Vorhaben – über den Assistenten, per Telefon oder E-Mail.",
  },
  {
    title: "Beratung vor Ort",
    time: "Termin",
    text: "Wir sehen uns Ihre Anlage persönlich an und klären, was passt.",
  },
  {
    title: "Angebot & Planung",
    time: "Plan",
    text: "Ein nachvollziehbares Angebot. Umfang, Komponenten und Termine stimmen wir gemeinsam ab.",
  },
  {
    title: "Umsetzung & Übergabe",
    time: "Fertig",
    text: "Normgerecht ausgeführt, geprüft und mit Dokumentation übergeben.",
  },
];

/** Die vier Momente der „Ein Tag am Haus“-Erzählung (rein illustrativ, keine Messwerte). */
export const dayPhases: Array<{ hour: number; focus: "pv" | "verteiler" | "wallbox" | "netz"; title: string; text: string }> = [
  {
    hour: 9,
    focus: "pv",
    title: "Morgens arbeitet das Dach.",
    text: "Sobald Licht auf die Module fällt, entsteht Strom. Wir montieren die Anlage und schließen sie fachgerecht an.",
  },
  {
    hour: 12.5,
    focus: "verteiler",
    title: "Mittags verteilt der Zählerschrank.",
    text: "Der Strom fließt über Ihre Hausinstallation dorthin, wo er gebraucht wird – abgesichert nach VDE.",
  },
  {
    hour: 17,
    focus: "wallbox",
    title: "Abends lädt das Auto mit.",
    text: "Wir prüfen, was Ihre Installation für das Laden zu Hause leisten muss, und denken Wallbox und Photovoltaik zusammen.",
  },
  {
    hour: 20.75,
    focus: "netz",
    title: "Nachts übernimmt das Netz.",
    text: "Ohne Sonne kommt der Strom aus dem Netz. Die Installation dahinter muss beides können – das ist unser Handwerk.",
  },
];

/** `services`: auf welchen Leistungsseiten die Frage erscheint (leer = überall). */
export const faqs: Array<{ q: string; a: string; services?: string[] }> = [
  {
    q: "Was bedeutet „Meisterbetrieb“ bei Zolarbyte?",
    a: "Zolarbyte ist als Elektrotechnik-Meisterbetrieb bei der Handwerkskammer für München und Oberbayern eingetragen. Ihre Anlage wird also von einem Fachbetrieb geplant, ausgeführt und geprüft, der die handwerklichen und rechtlichen Anforderungen erfüllt.",
  },
  {
    services: ["photovoltaik", "e-mobilitaet"],
    q: "Ist Zolarbyte nur für Photovoltaik zuständig?",
    a: "Nein. Photovoltaik ist ein Leistungsbereich von mehreren. Wir übernehmen ebenso Elektroinstallationen, Montagearbeiten, Wartung, Störungsbehebung, elektrische Prüfungen, Beratung zur E-Mobilität und Schulungen.",
  },
  {
    services: ["pruefung", "kundendienst", "elektroinstallation"],
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

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const faqsFor = (id: string) => faqs.filter((f) => !f.services || f.services.includes(id));

/**
 * Partner laut bisheriger Website (Stand 01/2023). Aktualität und Logo-Freigabe offen →
 * öffentlich erst mit features.partners = true. Hersteller: noch keine bestätigte Liste.
 */
export type Partner = {
  id: string;
  name: string;
  kind: "partner" | "hersteller";
  logo: string;
  width: number;
  height: number;
};

export const partners: Partner[] = [
  { id: "sick", name: "SICK", kind: "partner", logo: "/partners/sick.webp", width: 153, height: 62 },
  { id: "fuwa", name: "FUWA", kind: "partner", logo: "/partners/fuwa.webp", width: 225, height: 115 },
  { id: "ekd", name: "Energiekonzepte Deutschland", kind: "partner", logo: "/partners/ekd.webp", width: 344, height: 89 },
  { id: "fe", name: "FE Energiesysteme", kind: "partner", logo: "/partners/fe.webp", width: 253, height: 156 },
  { id: "gruenauer", name: "Grünauer GmbH", kind: "partner", logo: "/partners/gruenauer.webp", width: 1024, height: 406 },
  { id: "kolping", name: "Die Kolping Akademie", kind: "partner", logo: "/partners/kolping.webp", width: 246, height: 90 },
];
