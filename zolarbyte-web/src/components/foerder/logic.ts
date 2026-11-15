import { programme, type Programm, type Vorhaben } from "@/lib/foerderung";

export type Answers = {
  vorhaben: Vorhaben[];
  ort: "karlsfeld" | "dachau" | "muenchen" | "bayern" | "";
  gebaeude: "efh" | "mfh" | "gewerbe" | "";
  rolle: "selbst" | "vermietet" | "unternehmen" | "";
  groesse: "bis10" | "bis30" | "bis100" | "offen" | "";
  einspeisung: "teil" | "voll" | "offen" | "";
  start: "2026" | "2027" | "offen" | "";
  stand: "offen" | "angebot" | "beauftragt" | "";
  kredit: "ja" | "nein" | "offen" | "";
};

export const EMPTY: Answers = {
  vorhaben: [],
  ort: "",
  gebaeude: "",
  rolle: "",
  groesse: "",
  einspeisung: "",
  start: "",
  stand: "",
  kredit: "",
};

export type ResultItem = {
  p: Programm;
  /** Konkreter Satz / Kernaussage für diese Antworten */
  detail?: string;
  /** Wichtiger Hinweis (z. B. Frist, Einschränkung) */
  hinweis?: string;
  status: "passt" | "pruefen" | "nicht-mehr";
};

/** EEG-Sätze (Inbetriebnahme 1.8.–31.12.2026), Quelle: Bundesnetzagentur, Stand 14.11.2026 */
const EEG = {
  teil: { bis10: "7,70 ct/kWh", bis40: "6,66 ct/kWh", bis100: "5,44 ct/kWh" },
  voll: { bis10: "12,22 ct/kWh", bis100: "10,24 ct/kWh" },
};

function eegDetail(a: Answers): { detail?: string; hinweis?: string; status: ResultItem["status"] } {
  if (a.start === "2027")
    return {
      status: "pruefen",
      hinweis: "Für Inbetriebnahmen ab 1.1.2027 ist die Neuregelung noch nicht beschlossen – Sätze stehen noch nicht fest.",
    };
  const voll = a.einspeisung === "voll";
  const g = a.groesse;
  let detail: string | undefined;
  if (g === "bis10") detail = voll ? `${EEG.voll.bis10} (Volleinspeisung)` : `${EEG.teil.bis10} für eingespeisten Überschuss`;
  else if (g === "bis30")
    detail = voll
      ? `bis 10 kW ${EEG.voll.bis10}, darüber anteilig ${EEG.voll.bis100} (Volleinspeisung)`
      : `bis 10 kW ${EEG.teil.bis10}, darüber anteilig ${EEG.teil.bis40}`;
  else if (g === "bis100")
    detail = voll
      ? `bis 10 kW ${EEG.voll.bis10}, darüber anteilig ${EEG.voll.bis100} (Volleinspeisung)`
      : `bis 10 kW ${EEG.teil.bis10} · 10–40 kW ${EEG.teil.bis40} · 40–100 kW ${EEG.teil.bis100}`;
  else detail = `Teileinspeisung ab ${EEG.teil.bis100} bis ${EEG.teil.bis10}, Volleinspeisung ${EEG.voll.bis100} bis ${EEG.voll.bis10} – je nach Größe`;
  return {
    status: a.start === "offen" ? "pruefen" : "passt",
    detail: `${detail} · 20 Jahre fest`,
    hinweis:
      a.start === "offen"
        ? "Gilt für Inbetriebnahme bis 31.12.2026. Danach greift eine noch nicht beschlossene Neuregelung."
        : "Gilt für Inbetriebnahme bis 31.12.2026.",
  };
}

export function buildResults(a: Answers): ResultItem[] {
  const out: ResultItem[] = [];
  const has = (v: Vorhaben) => a.vorhaben.includes(v);
  const wohn = a.gebaeude === "efh" || a.gebaeude === "mfh";
  const privat = a.rolle === "selbst" || a.rolle === "vermietet";
  const beauftragt = a.stand === "beauftragt";
  const get = (id: string) => programme.find((p) => p.id === id)!;

  if (has("pv")) {
    const e = eegDetail(a);
    out.push({ p: get("eeg"), ...e });
  }

  if ((has("pv") || has("speicher")) && wohn) {
    out.push({
      p: get("nullsteuer"),
      detail: "0 % Umsatzsteuer auf Module, Wechselrichter, Speicher und Installation",
      status: a.groesse === "bis100" ? "pruefen" : "passt",
      hinweis: a.groesse === "bis100" ? "Über 30 kWp: Voraussetzungen im Einzelfall prüfen." : undefined,
    });
  }

  if (has("pv")) {
    out.push({
      p: get("est"),
      detail: "Einnahmen aus der Anlage bleiben einkommensteuerfrei",
      status: a.groesse === "bis100" ? "pruefen" : "passt",
      hinweis: a.groesse === "bis100" ? "Grenze: 30 kWp je Wohn-/Gewerbeeinheit, max. 100 kWp je Person." : undefined,
    });
  }

  const kfwPassend = (has("pv") || has("speicher") || has("zaehler")) && (privat || a.rolle === "unternehmen") && a.gebaeude !== "gewerbe";
  if (kfwPassend && a.kredit !== "nein") {
    out.push({
      p: get("kfw270"),
      detail: "Bis zu 100 % der Kosten als Förderkredit über die Hausbank",
      status: beauftragt ? "nicht-mehr" : "passt",
      hinweis: beauftragt
        ? "Antrag nur vor Vorhabenbeginn – bei bereits beauftragtem Vorhaben in der Regel ausgeschlossen."
        : "Antrag bei der Hausbank stellen, bevor Sie den Auftrag vergeben.",
    });
  }

  if (has("pv") && a.rolle === "selbst" && wohn) {
    out.push({
      p: get("handwerker"),
      detail: "20 % der Arbeitskosten, höchstens 1.200 € im Jahr",
      status: a.kredit === "ja" ? "pruefen" : "passt",
      hinweis:
        a.kredit === "ja"
          ? "Nicht für Maßnahmen, die mit öffentlich gefördertem Kredit finanziert werden – mit KfW-Kredit in der Regel ausgeschlossen."
          : undefined,
    });
  }

  if (has("wallbox") || has("speicher")) {
    out.push({
      p: get("14a"),
      detail: has("wallbox") ? "Wallbox über 4,2 kW: reduziertes Netzentgelt" : "Speicher mit Netzbezug über 4,2 kW: reduziertes Netzentgelt",
      status: "passt",
    });
  }

  if ((has("pv") || has("speicher")) && (a.gebaeude === "gewerbe" || a.rolle === "unternehmen") && a.kredit !== "nein") {
    out.push({
      p: get("lfa"),
      detail: "Förderkredit für Unternehmen und Freiberufler in Bayern",
      status: beauftragt ? "nicht-mehr" : "passt",
      hinweis: "Antrag über die Hausbank.",
    });
  }

  const order = { passt: 0, pruefen: 1, "nicht-mehr": 2 };
  return out.sort((x, y) => order[x.status] - order[y.status]);
}
