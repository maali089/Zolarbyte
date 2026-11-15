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
 * Schwerpunkte (vom Auftraggeber bestätigt 11/2026): Photovoltaik, Wärmepumpen, Stromspeicher.
 * Dazu die Elektrotechnik-Leistungen der bisherigen Website. Keine Angebote ergänzen, die nicht bestätigt sind.
 */
export const services: Service[] = [
  {
    id: "photovoltaik",
    headline: "Strom vom Dach, sauber im Haus angekommen.",
    seoTitle: "Photovoltaik in Karlsfeld: Montage & Anschluss",
    seoDescription: "Photovoltaik vom Elektro-Meisterbetrieb in Karlsfeld bei München: Montage, elektrischer Anschluss und Einbindung in Ihre Hausinstallation. Jetzt anfragen.",
    related: ["stromspeicher", "waermepumpe"],
    lead: "Montage, elektrischer Anschluss und Einbindung in Ihre Hausinstallation – damit der Strom vom Dach im Haus ankommt.",
    topic: "photovoltaik",
    title: "Photovoltaik & Solaranlagen",
    short: "Photovoltaik",
    text: "Wir montieren Photovoltaikanlagen und binden sie fachgerecht in Ihre Elektroinstallation ein. So erzeugen Sie Strom vom eigenen Dach und nutzen ihn direkt im Haus.",
    points: ["Montage", "Elektrischer Anschluss", "Einbindung in die Hausinstallation"],
  },
  {
    id: "waermepumpe",
    headline: "Heizen mit Umweltwärme – passend zu Gebäude und Wärmeverteilung.",
    seoTitle: "Wärmepumpe in Karlsfeld: Prüfung & Anschluss",
    seoDescription: "Wärmepumpe vom Elektrotechnik-Meisterbetrieb in Karlsfeld bei München: Prüfung von Gebäude und Heizsystem, elektrische Einbindung, Zusammenspiel mit Photovoltaik und Speicher.",
    related: ["photovoltaik", "stromspeicher"],
    lead: "Wir prüfen Gebäude und Heizsystem, binden die Wärmepumpe elektrisch ein und stimmen sie auf Photovoltaik und Speicher ab.",
    topic: "waermepumpe",
    title: "Wärmepumpe",
    short: "Wärmepumpe",
    text: "Eine Wärmepumpe nutzt Wärme aus der Umgebung und hebt sie mit Strom auf Heiztemperatur. Entscheidend sind Heizlast, Vorlauftemperatur und die vorhandene Wärmeverteilung – deshalb steht am Anfang eine sorgfältige Prüfung, nicht ein Gerätevorschlag. Tagsüber kann ein Teil des Stroms vom eigenen Dach kommen.",
    points: ["Prüfung von Gebäude und Heizsystem", "Elektrische Einbindung und Anschluss", "Abstimmung mit Photovoltaik und Speicher"],
  },
  {
    id: "stromspeicher",
    headline: "Solarstrom vom Mittag für den Abend.",
    seoTitle: "Stromspeicher in Karlsfeld: Auslegung & Installation",
    seoDescription: "Batteriespeicher vom Elektrotechnik-Meisterbetrieb in Karlsfeld bei München: Auslegung nach Verbrauch und Anlage, Nachrüstung bestehender PV-Anlagen, Installation und Einbindung.",
    related: ["photovoltaik", "waermepumpe"],
    lead: "Wir legen den Speicher nach Verbrauch und Anlage aus, prüfen die Nachrüstung und binden ihn sauber ein.",
    topic: "stromspeicher",
    title: "Stromspeicher",
    short: "Speicher",
    text: "Ein Batteriespeicher hält tagsüber erzeugten Überschuss vor und gibt ihn ab, wenn die Sonne nicht mehr scheint. Die Größe richtet sich nach Ihrem Verbrauch, dem Verbrauchszeitpunkt und der Leistung Ihrer PV-Anlage. Speicher, Wechselrichter und Zählerschrank müssen elektrisch zusammenpassen.",
    points: ["Auslegung nach Verbrauch und Anlage", "Nachrüstung an bestehende Anlagen prüfen", "Installation und Einbindung"],
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
    seoDescription: "Elektroinstallation, Montagearbeiten und Wartung vom Elektrotechnik-Meisterbetrieb ZOLARBYTE ENERGY in Karlsfeld bei München – sorgfältig und nach geltenden Normen.",
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
    seoDescription: "Strom weg, Sicherung fliegt? ZOLARBYTE ENERGY sucht die Ursache systematisch, behebt die Störung und dokumentiert sauber. Elektro-Meisterbetrieb in Karlsfeld.",
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
    seoTitle: "Schulungen Elektrotechnik – ZOLARBYTE ENERGY Karlsfeld",
    seoDescription: "Schulungen im Bereich Elektrotechnik vom Meisterbetrieb ZOLARBYTE ENERGY aus Karlsfeld bei München. Inhalte und Termine stimmen wir mit Ihnen ab.",
    related: ["pruefung", "elektroinstallation"],
    lead: "Wissen aus der Elektrotechnik, weitergegeben vom Meisterbetrieb – Inhalte und Termine nach Absprache.",
    topic: "schulung",
    title: "Schulungen",
    short: "Schulungen",
    text: "Wir geben unser Wissen weiter: ZOLARBYTE ENERGY bietet Schulungen im Bereich Elektrotechnik an. Sprechen Sie uns zu Inhalten und Terminen an.",
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

/** Die Momente der „Ein Tag am Haus“-Erzählung (rein illustrativ, keine Messwerte). */
export const dayPhases: Array<{
  hour: number;
  focus: "pv" | "speicher" | "waermepumpe" | "wallbox" | "netz";
  title: string;
  text: string;
}> = [
  {
    hour: 9,
    focus: "pv",
    title: "Morgens arbeitet das Dach.",
    text: "Sobald Licht auf die Module fällt, entsteht Strom. Wir planen die Anlage nach Dach und Verbrauch und schließen sie fachgerecht an.",
  },
  {
    hour: 12.5,
    focus: "speicher",
    title: "Mittags füllt sich der Speicher.",
    text: "Was das Haus gerade nicht braucht, lädt den Speicher im Technikraum – über den Zählerschrank, abgesichert nach VDE.",
  },
  {
    hour: 15.5,
    focus: "waermepumpe",
    title: "Nachmittags heizt die Wärmepumpe mit.",
    text: "Ein Teil ihres Stroms kommt vom eigenen Dach. Ob eine Wärmepumpe zu Ihrem Haus passt, prüfen wir vorher.",
  },
  {
    hour: 17.5,
    focus: "wallbox",
    title: "Abends lädt das Auto mit.",
    text: "Wir prüfen, was Ihre Installation für das Laden zu Hause leisten muss, und denken Wallbox und Photovoltaik zusammen.",
  },
  {
    hour: 20.75,
    focus: "netz",
    title: "Nachts liefert der Speicher.",
    text: "Ist er leer, kommt der Strom wie gewohnt aus dem Netz. Die Installation dahinter muss beides können – das ist unser Handwerk.",
  },
];

/** `services`: auf welchen Leistungsseiten die Frage erscheint (leer = überall). */
export const faqs: Array<{ q: string; a: string; services?: string[] }> = [
  {
    q: "Was bedeutet „Meisterbetrieb“ bei ZOLARBYTE ENERGY?",
    a: "ZOLARBYTE ENERGY ist als Elektrotechnik-Meisterbetrieb bei der Handwerkskammer für München und Oberbayern eingetragen. Ihre Anlage wird also von einem Fachbetrieb geplant, ausgeführt und geprüft, der die handwerklichen und rechtlichen Anforderungen erfüllt.",
  },
  {
    services: ["photovoltaik", "e-mobilitaet", "waermepumpe", "stromspeicher"],
    q: "Ist ZOLARBYTE ENERGY nur für Energiethemen zuständig?",
    a: "Nein. Schwerpunkt sind Photovoltaik, Wärmepumpen und Stromspeicher. Als Elektrotechnik-Meisterbetrieb übernehmen wir ebenso Elektroinstallationen, Montagearbeiten, Wartung, Störungsbehebung, elektrische Prüfungen, Beratung zur E-Mobilität und Schulungen.",
  },
  {
    services: ["waermepumpe"],
    q: "Funktioniert eine Wärmepumpe auch im Altbau?",
    a: "Oft ja, aber nicht automatisch. Es kommt auf Heizlast, Vorlauftemperatur und Heizflächen an. Wir prüfen das vorher und sagen Ihnen offen, wenn zuerst andere Maßnahmen sinnvoll sind.",
  },
  {
    services: ["stromspeicher", "photovoltaik"],
    q: "Kann ich einen Speicher später nachrüsten?",
    a: "In vielen Fällen ja. Es hängt vom vorhandenen Wechselrichter, vom Platz und vom Zählerschrank ab. Schicken Sie uns gern Fotos von Typenschild und Zählerschrank.",
  },
  {
    services: ["stromspeicher"],
    q: "Habe ich mit Speicher Strom bei einem Stromausfall?",
    a: "Nur, wenn das System ausdrücklich für Ersatzstrom ausgelegt und so installiert ist. Bei einem Stromausfall schaltet sich eine netzgekoppelte Anlage aus Sicherheitsgründen ab. Das klären wir bei der Planung.",
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
    a: "Für Projekte und Beratung ist Elzat Ablet, unser Geschäftsinhaber, Ihr Ansprechpartner – telefonisch oder per WhatsApp. Allgemeine Anfragen und Störungen erreichen uns über die allgemeine Telefonnummer und info@zolarbyte.de. Für Angebote ist zudem Jörg Mißfeldt, unser Vertriebsleiter, per E-Mail erreichbar.",
  },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const faqsFor = (id: string) => faqs.filter((f) => !f.services || f.services.includes(id));

/**
 * Partner und Hersteller – vom Auftraggeber bestätigt (13.11.2026), Quellen der Logos: docs/partner-logos.md.
 * `ratio` = Breite/Höhe des Logos. `tile`: dunkle Kachel für Logos, die es offiziell nur hell gibt.
 */
export type Partner = {
  id: string;
  name: string;
  logo: string;
  ratio: number;
  tile?: "dark" | "navy";
};

export const partners: Partner[] = [
  { id: "aiko", name: "AIKO", logo: "/partners/aiko.svg", ratio: 3.81, tile: "dark" },
  { id: "jolywood", name: "Jolywood", logo: "/partners/jolywood.png", ratio: 6.46 },
  { id: "solar-fabrik", name: "Solar Fabrik", logo: "/partners/solar-fabrik.png", ratio: 1 },
  { id: "sigenergy", name: "Sigenergy", logo: "/partners/sigenergy.webp", ratio: 5.14, tile: "dark" },
  { id: "huawei", name: "Huawei", logo: "/partners/huawei.svg", ratio: 4.58 },
  { id: "k2", name: "K2 Systems", logo: "/partners/k2-systems.svg", ratio: 1 },
  { id: "sl-rack", name: "SL Rack", logo: "/partners/sl-rack.svg", ratio: 2.32 },
  { id: "fronius", name: "Fronius", logo: "/partners/fronius.webp", ratio: 3.51 },
  { id: "bosch", name: "Bosch Home Comfort", logo: "/partners/bosch.svg", ratio: 4.46 },
  { id: "vaillant", name: "Vaillant", logo: "/partners/vaillant.svg", ratio: 3.78 },
  { id: "viessmann", name: "Viessmann", logo: "/partners/viessmann.svg", ratio: 4.74 },
  { id: "buderus", name: "Buderus", logo: "/partners/buderus.svg", ratio: 4.93, tile: "navy" },
  { id: "spotmyenergy", name: "SpotmyEnergy", logo: "/partners/spotmyenergy.png", ratio: 2.53 },
  { id: "solar-manager", name: "Solar Manager", logo: "/partners/solar-manager.svg", ratio: 1.27 },
];
