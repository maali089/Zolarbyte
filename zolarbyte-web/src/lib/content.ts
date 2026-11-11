/**
 * Texte der Website. Nur bestätigte Leistungen eintragen.
 * Schwerpunkte (bestätigt 11/2026): Photovoltaik, Wärmepumpen, Stromspeicher.
 * Allgemeine Elektrotechnik bleibt ergänzender Leistungsbereich.
 */

export type EnergyService = {
  id: "photovoltaik" | "waermepumpe" | "stromspeicher";
  href: string;
  name: string;
  /** Ein Satz, der den Nutzen erklärt */
  claim: string;
  short: string;
  /** Was ZOLARBYTE ENERGY konkret übernimmt */
  deliverables: string[];
  sections: Array<{ title: string; text: string }>;
  meister: string;
  combine: string;
  faq: Array<{ q: string; a: string }>;
};

export const energyServices: EnergyService[] = [
  {
    id: "photovoltaik",
    href: "/photovoltaik",
    name: "Photovoltaik",
    claim: "Strom vom eigenen Dach – geplant für Ihr Haus und Ihren Verbrauch.",
    short:
      "Solarmodule erzeugen tagsüber Strom, den Sie direkt im Haus nutzen. Wir planen die Anlage nach Dach, Ausrichtung und Verbrauch.",
    deliverables: ["Planung nach Dach und Verbrauch", "Montage und elektrischer Anschluss", "Inbetriebnahme und Übergabe"],
    sections: [
      {
        title: "Strom erzeugen, wo er gebraucht wird",
        text: "Die Module auf dem Dach wandeln Sonnenlicht in Gleichstrom. Der Wechselrichter macht daraus Wechselstrom für Ihr Hausnetz. Was Sie gerade verbrauchen, kommt dann zuerst vom eigenen Dach.",
      },
      {
        title: "Planung nach Dach, Ausrichtung und Verbrauch",
        text: "Wie groß eine Anlage sinnvoll ist, hängt von der nutzbaren Dachfläche, Ausrichtung und Neigung, möglicher Verschattung und Ihrem Stromverbrauch ab. Wir sehen uns Dach und Zählerschrank an und legen Module und Wechselrichter passend aus.",
      },
      {
        title: "Eigenverbrauch und Einspeisung",
        text: "Strom, den Sie im Haus nutzen, müssen Sie nicht einkaufen. Überschüsse können ins öffentliche Netz eingespeist werden; die Vergütung dafür richtet sich nach dem Erneuerbare-Energien-Gesetz und dem Zeitpunkt der Inbetriebnahme. Wie viel Sie selbst nutzen, hängt stark davon ab, wann Sie Strom brauchen.",
      },
    ],
    meister:
      "Den elektrischen Anschluss, die Einbindung in Zählerschrank und Hausinstallation und die Inbetriebnahme übernimmt ZOLARBYTE ENERGY als Elektrotechnik-Meisterbetrieb – nach den geltenden VDE-Bestimmungen und mit Dokumentation.",
    combine:
      "Mit einem Stromspeicher nutzen Sie Solarstrom auch am Abend. Mit einer Wärmepumpe kann ein Teil der Heizenergie vom eigenen Dach kommen.",
    faq: [
      {
        q: "Lohnt sich eine Anlage auch auf einem Ost-West-Dach?",
        a: "Häufig ja: Ost-West-Anlagen erzeugen über den Tag verteilter, was gut zum Verbrauch passen kann. Ob es für Ihr Dach sinnvoll ist, klären wir nach einem Blick auf Dachfläche, Verschattung und Verbrauch.",
      },
      {
        q: "Gibt es für Photovoltaik einen Zuschuss?",
        a: "Einen allgemeinen bundesweiten Zuschuss für private Photovoltaik-Anlagen gibt es derzeit nicht. Was es gibt, finden Sie auf der Seite zum Förderrechner unter „Photovoltaik und Speicher“ – mit Quellen.",
      },
    ],
  },
  {
    id: "waermepumpe",
    href: "/waermepumpe",
    name: "Wärmepumpe",
    claim: "Heizen mit Umweltwärme – passend zu Gebäude und Wärmeverteilung.",
    short:
      "Eine Wärmepumpe nutzt Wärme aus der Umgebung und hebt sie mit Strom auf Heiztemperatur. Ob und wie das in Ihrem Haus gut funktioniert, prüfen wir vorher.",
    deliverables: ["Prüfung von Gebäude und Heizsystem", "Elektrische Einbindung und Anschluss", "Abstimmung mit Photovoltaik und Speicher"],
    sections: [
      {
        title: "Umweltwärme für Heizung und Warmwasser",
        text: "Eine Luft-Wasser-Wärmepumpe entzieht der Außenluft Wärme – auch im Winter. Mit Hilfe von Strom wird diese Wärme auf die Temperatur gebracht, die Heizung und Warmwasser brauchen. Andere Bauarten nutzen Erdreich oder Grundwasser.",
      },
      {
        title: "Erst das Gebäude, dann das Gerät",
        text: "Entscheidend sind Heizlast, Vorlauftemperatur und die vorhandene Wärmeverteilung – Fußbodenheizung oder Heizkörper. Eine Wärmepumpe ist nicht für jedes Gebäude ohne Weiteres geeignet. Deshalb steht am Anfang eine sorgfältige Prüfung, nicht ein Gerätevorschlag.",
      },
      {
        title: "Mit Photovoltaik kombinieren",
        text: "Tagsüber kann ein Teil des Stroms für die Wärmepumpe vom eigenen Dach kommen. Wie groß dieser Anteil ist, hängt von Jahreszeit, Anlage und Heizbedarf ab – im Winter, wenn am meisten geheizt wird, erzeugt eine PV-Anlage am wenigsten.",
      },
    ],
    meister:
      "Als Elektrotechnik-Meisterbetrieb planen wir den elektrischen Teil: Anschluss, Absicherung, Zählerschrank und Steuerung sowie das Zusammenspiel mit Photovoltaik und Speicher. Welche Arbeiten am Heizsystem in Ihrem Projekt wer ausführt, legen wir vorab transparent fest.",
    combine:
      "Für die Heizungsförderung der KfW (Programm 458) können Sie mit unserem Förderrechner einen voraussichtlichen Zuschuss abschätzen.",
    faq: [
      {
        q: "Funktioniert eine Wärmepumpe auch im Altbau?",
        a: "Oft ja, aber nicht automatisch. Es kommt auf Heizlast, Vorlauftemperatur und Heizflächen an. Wir prüfen das vorher und sagen Ihnen offen, wenn zuerst andere Maßnahmen sinnvoll sind.",
      },
      {
        q: "Wie hoch ist die Förderung?",
        a: "Das hängt von Ihrer Situation ab – etwa Selbstnutzung, alter Heizung und Haushaltseinkommen. Der Förderrechner zeigt eine unverbindliche Orientierung mit allen Annahmen und Quellen.",
      },
    ],
  },
  {
    id: "stromspeicher",
    href: "/stromspeicher",
    name: "Stromspeicher",
    claim: "Solarstrom vom Mittag für den Abend.",
    short:
      "Ein Batteriespeicher hält tagsüber erzeugten Überschuss vor und gibt ihn ab, wenn die Sonne nicht mehr scheint. Die Größe richtet sich nach Verbrauch und Anlage.",
    deliverables: ["Auslegung nach Verbrauch und Anlage", "Nachrüstung an bestehende Anlagen prüfen", "Installation und Einbindung"],
    sections: [
      {
        title: "Solarstrom zeitversetzt nutzen",
        text: "Mittags erzeugt eine PV-Anlage oft mehr, als im Haus gebraucht wird. Der Speicher nimmt diesen Überschuss auf und versorgt abends Ihre Verbraucher. Ist er leer, kommt der Strom wie gewohnt aus dem Netz.",
      },
      {
        title: "Passend dimensioniert",
        text: "Ein zu großer Speicher wird selten voll, ein zu kleiner ist schnell leer. Wir legen die Größe nach Ihrem Verbrauch, dem Verbrauchszeitpunkt und der Leistung Ihrer PV-Anlage aus.",
      },
      {
        title: "Nachrüsten und Wechselrichter",
        text: "Speicher werden entweder über einen Hybrid-Wechselrichter oder mit eigenem Batterie-Wechselrichter angeschlossen. Ob und wie sich eine bestehende Anlage nachrüsten lässt, prüfen wir anhand der vorhandenen Komponenten und des Zählerschranks.",
      },
      {
        title: "Normalbetrieb und Ersatzstrom",
        text: "Im Normalbetrieb arbeitet der Speicher mit dem Netz zusammen. Bei einem Stromausfall schaltet sich eine netzgekoppelte Anlage aus Sicherheitsgründen ab. Eine Ersatz- oder Notstromfunktion ist eine zusätzliche Option, die Speicher, Wechselrichter und Installation unterstützen müssen – sie ist nicht automatisch dabei.",
      },
    ],
    meister:
      "Speicher, Wechselrichter und Zählerschrank müssen elektrisch zusammenpassen. Die Installation, den Anschluss und die Inbetriebnahme übernimmt ZOLARBYTE ENERGY als Elektrotechnik-Meisterbetrieb.",
    combine: "Ein Speicher ergänzt eine Photovoltaik-Anlage. Ohne eigene Erzeugung ist er für Privathaushalte in der Regel nicht sinnvoll.",
    faq: [
      {
        q: "Kann ich einen Speicher später nachrüsten?",
        a: "In vielen Fällen ja. Es hängt vom vorhandenen Wechselrichter, vom Platz und vom Zählerschrank ab. Schicken Sie uns gern Fotos von Typenschild und Zählerschrank.",
      },
      {
        q: "Habe ich mit Speicher Strom bei einem Stromausfall?",
        a: "Nur, wenn das System ausdrücklich für Ersatzstrom ausgelegt und so installiert ist. Das klären wir bei der Planung.",
      },
    ],
  },
];

/** Ergänzende Leistungen (bisheriges Kernangebot, weiterhin erreichbar) */
export const electricalServices = [
  {
    id: "elektroinstallation",
    title: "Elektroinstallation & Montage",
    text: "Installation und Montage elektrischer Anlagen nach den geltenden Normen – von der Hausinstallation bis zu einzelnen Montagearbeiten, inklusive Wartung.",
  },
  {
    id: "kundendienst",
    title: "Kundendienst & Störungsbehebung",
    text: "Fällt etwas aus, suchen wir die Ursache systematisch und beheben die Störung – sauber dokumentiert.",
  },
  {
    id: "pruefung",
    title: "Elektrische Prüfungen",
    text: "Prüfung von Anlagen und Geräten nach den VDE-Bestimmungen und DGUV Vorschrift 3, mit normgerechtem Prüfprotokoll.",
  },
  {
    id: "e-mobilitaet",
    title: "E-Mobilität – Beratung",
    text: "Wir prüfen, was Ihre Elektroinstallation für E-Mobilität leisten muss und wie sie sich mit Photovoltaik verbinden lässt.",
  },
  {
    id: "schulungen",
    title: "Schulungen",
    text: "Schulungen im Bereich Elektrotechnik. Inhalte und Termine nach Absprache.",
  },
];

export const steps = [
  {
    title: "Anfrage",
    text: "Sie sagen uns, worum es geht – Photovoltaik, Wärmepumpe, Speicher oder alles zusammen. Ein paar Angaben zu Gebäude und Standort reichen.",
  },
  {
    title: "Beratung vor Ort",
    text: "Wir sehen uns Dach, Zählerschrank, Heizung und Technikraum an und besprechen, was zu Ihrem Haus und Verbrauch passt.",
  },
  {
    title: "Planung & Angebot",
    text: "Sie erhalten ein nachvollziehbares Angebot mit Komponenten, Ablauf und Terminen. Zu möglichen Förderungen geben wir Hinweise.",
  },
  {
    title: "Umsetzung & Inbetriebnahme",
    text: "Montage, elektrischer Anschluss und Inbetriebnahme in der Verantwortung des Meisterbetriebs – mit Prüfung und Dokumentation.",
  },
];

export const faqs = [
  {
    q: "Was bedeutet „Meisterbetrieb“ bei ZOLARBYTE ENERGY?",
    a: "ZOLARBYTE ENERGY ist als Elektrotechnik-Meisterbetrieb bei der Handwerkskammer für München und Oberbayern eingetragen. Planung, elektrischer Anschluss und Inbetriebnahme Ihrer Energietechnik liegen damit bei einem Fachbetrieb, der die handwerklichen und rechtlichen Anforderungen erfüllt.",
  },
  {
    q: "Muss ich alles auf einmal umsetzen?",
    a: "Nein. Viele beginnen mit Photovoltaik und ergänzen später Speicher oder Wärmepumpe. Wir planen so, dass spätere Erweiterungen elektrisch vorbereitet sind, soweit das sinnvoll ist.",
  },
  {
    q: "Macht mich eine Anlage mit Speicher unabhängig vom Stromnetz?",
    a: "Nicht vollständig. Photovoltaik und Speicher können den Strombezug deutlich senken, besonders im Sommer. Im Winter und bei längeren trüben Phasen bleibt das Netz in aller Regel nötig.",
  },
  {
    q: "Wie genau ist der Förderrechner?",
    a: "Er rechnet mit den offiziellen Bedingungen der KfW-Heizungsförderung (Programm 458) zum angegebenen Stand. Das Ergebnis ist eine unverbindliche Orientierung, keine Förderzusage. Maßgeblich ist allein die Entscheidung der KfW.",
  },
  {
    q: "Welche Angaben helfen bei Ihrer Anfrage?",
    a: "Art des Gebäudes, Ort, ungefährer Stromverbrauch und gegebenenfalls die vorhandene Heizung. Fotos vom Zählerschrank oder vom Dach können Sie uns gern per E-Mail schicken.",
  },
  {
    q: "Machen Sie auch klassische Elektroarbeiten?",
    a: "Ja. Elektroinstallation, Störungsbehebung und elektrische Prüfungen bleiben Teil unseres Angebots – sie sind auch die Grundlage jeder Energieanlage.",
  },
];

export const INTERESTS = [
  { value: "photovoltaik", label: "Photovoltaik" },
  { value: "waermepumpe", label: "Wärmepumpe" },
  { value: "stromspeicher", label: "Stromspeicher" },
  { value: "kombination", label: "Kombination" },
  { value: "elektrotechnik", label: "Elektrotechnik / Sonstiges" },
] as const;

export const BUILDINGS = ["Einfamilienhaus", "Doppel- oder Reihenhaus", "Mehrfamilienhaus", "Gewerbe", "Sonstiges"] as const;

export const STAGES = [
  "Ich informiere mich",
  "Konkrete Planung (nächste Monate)",
  "Bestehende Anlage erweitern",
  "Angebot liegt vor, Zweitmeinung",
] as const;
