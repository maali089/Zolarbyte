/**
 * Informationen zu Photovoltaik und Speicher – KEIN Rechner.
 * Stand der Prüfung: 11.11.2026. Jede Aussage mit offizieller Quelle.
 * Bei Änderungen (insbesondere EEG 2027) Text und Stand aktualisieren.
 */

export const PV_STAND = "11.11.2026";

type Info = { title: string; text: string[]; sources: Array<{ label: string; url: string }> };

export const PV_INFO: Info[] = [
  {
    title: "Einspeisevergütung (EEG)",
    text: [
      "Für Anlagen mit Inbetriebnahme vom 01.08. bis 31.12.2026 gilt bei Teileinspeisung bis 10 kW eine Vergütung von 7,70 Cent je kWh, bei Volleinspeisung bis 10 kW 12,22 Cent (Werte der Bundesnetzagentur, für größere Anlagen gestaffelt).",
      "Für Anlagen ab 01.01.2027 ist eine Neuregelung im parlamentarischen Verfahren (Gesetzentwurf, Stand: noch nicht beschlossen). Die künftigen Sätze stehen deshalb noch nicht fest.",
      "Bereits geltend: Ohne intelligentes Messsystem ist die Einspeiseleistung kleiner Anlagen auf 60 % begrenzt, und bei negativen Börsenstrompreisen entfällt die Vergütung nach den Regeln des EEG.",
    ],
    sources: [
      { label: "Bundesnetzagentur – EEG-Förderung", url: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/EEG_Foerderung/start.htm" },
      { label: "Bundesregierung – EEG-Novelle (Entwurf)", url: "https://www.bundesregierung.de/breg-de/aktuelles/kabinett-eeg-novelle-netzpaket-strom-2448636" },
      { label: "§ 9 EEG", url: "https://www.gesetze-im-internet.de/eeg_2014/__9.html" },
    ],
  },
  {
    title: "Steuern: 0 % Umsatzsteuer, keine Einkommensteuer",
    text: [
      "Lieferung und Installation von PV-Anlagen und Speichern auf oder an Wohngebäuden sind mit 0 % Umsatzsteuer belegt; bis 30 kWp gelten die Voraussetzungen als erfüllt.",
      "Einnahmen aus PV-Anlagen bis 30 kWp je Wohn- oder Gewerbeeinheit (insgesamt höchstens 100 kWp je Steuerpflichtigem) sind von der Einkommensteuer befreit.",
    ],
    sources: [
      { label: "§ 12 Abs. 3 UStG", url: "https://www.gesetze-im-internet.de/ustg_1980/__12.html" },
      { label: "§ 3 Nr. 72 EStG", url: "https://www.gesetze-im-internet.de/estg/__3.html" },
    ],
  },
  {
    title: "Förderkredit KfW 270",
    text: [
      "Privatpersonen können PV-Anlagen und Speicher über den KfW-Kredit 270 „Erneuerbare Energien – Standard“ finanzieren, wenn ein Teil des Stroms eingespeist wird. Es ist ein Darlehen mit risikoabhängigem Zins, kein Zuschuss.",
    ],
    sources: [
      { label: "KfW-Merkblatt 270", url: "https://www.kfw.de/PDF/Download-Center/F%C3%B6rderprogramme-(Inlandsf%C3%B6rderung)/PDF-Dokumente/6000000178_M_270_EE-Standard.pdf" },
    ],
  },
  {
    title: "Regionale Programme (Karlsfeld, Landkreis Dachau, Bayern)",
    text: [
      "Die Gemeinde Karlsfeld hat derzeit keine eigenen Förderprogramme. Das Landratsamt Dachau bietet keine Förderung für energetische Maßnahmen an. Ein bayerischer Zuschuss für private PV-Anlagen oder Speicher ist auf der Förderseite des Wirtschaftsministeriums derzeit nicht ausgeschrieben.",
      "Das Förderprogramm der Landeshauptstadt München gilt nur für Gebäude in München und nimmt derzeit keine Anträge an.",
    ],
    sources: [
      { label: "Gemeinde Karlsfeld", url: "https://www.karlsfeld.de/foerderprogramme" },
      { label: "Landkreis Dachau", url: "https://www.landkreis-dachau.de/Abfall-Naturschutz-Umwelt/Klimaschutz/F%C3%B6rderungen-im-Landkreis/" },
      { label: "StMWi Bayern", url: "https://www.stmwi.bayern.de/foerderungen/energiefoerderung/" },
      { label: "Stadt München", url: "https://stadt.muenchen.de/infos/foerderprogramm-klimaneutrale-gebaeude.html" },
    ],
  },
];
