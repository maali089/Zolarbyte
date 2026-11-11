/**
 * Tests Förderrechner KfW 458 – Aufruf: npm test
 *
 * Die erwarteten Beträge wurden unabhängig von dieser Implementierung direkt aus
 * BEG EM 2026 / Merkblatt 458 (Stand 09/2026) berechnet (Recherche vom 11.11.2026)
 * bzw. stammen aus den offiziellen Rechenbeispielen der KfW-Produktseite („Becker“).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, costCapForBuilding, incomeBonusPercent, klimaBonusPercent, type CalcInput } from "./berechnung.ts";

const TODAY = "2026-11-11";

const base: CalcInput = {
  today: TODAY,
  applicationDate: "2026-12-01",
  applicant: "owner",
  projectStarted: "no",
  buildingOldEnough: "yes",
  units: 1,
  mixedUse: false,
  residentialOver50: "yes",
  selfUse: true,
  oldHeating: "gas",
  oldHeatingYear: 2001,
  oldHeatingWorking: "yes",
  fossilRemains: "no",
  newHeating: "wp_air_water",
  costs: 35000,
  nonEligibleCosts: 0,
  income: 38000,
  children: "no",
};

function grant(over: Partial<CalcInput>) {
  const r = calculate({ ...base, ...over });
  assert.equal(r.status, "ok", JSON.stringify(r));
  return r.status === "ok" ? r : (null as never);
}

/* ---------- Beispiele aus der Recherche (unabhängig gerechnet) ---------- */

test("1: Selbstnutzer EFH, Gas 25 J., zvE 38.000, Kosten 35.000 → 70 %-Deckel → 19.600 €", () => {
  const r = grant({});
  assert.equal(r.grant, 19600);
  assert.equal(r.consideredCosts, 28000);
  assert.equal(r.effectiveRate, 70);
  assert.equal(r.capReduction, 1680); // 76 % → 70 %: 6 % von 28.000
  assert.equal(r.remaining, 15400);
});

test("2: Öl, zvE 25.000, Kosten 30.000 → 80 %-Deckel → 22.400 €", () => {
  assert.equal(grant({ oldHeating: "oil", oldHeatingYear: null, income: 25000, costs: 30000 }).grant, 22400);
});

test("3: wie 2, Kosten 20.000 → 16.000 €", () => {
  assert.equal(grant({ oldHeating: "oil", oldHeatingYear: null, income: 25000, costs: 20000 }).grant, 16000);
});

test("4: Gas 15 J., zvE 80.000 → nur Grundförderung 8.400 €", () => {
  assert.equal(grant({ oldHeatingYear: 2011, income: 80000 }).grant, 8400);
});

test("5: Gas 15 J., zvE 48.000 + Kind (eff. 38.000) → 60 % → 16.800 €", () => {
  assert.equal(grant({ oldHeatingYear: 2011, income: 48000, children: "yes" }).grant, 16800);
});

test("6: Gas 22 J., zvE 40.000 + Kind (eff. 30.000) → 80 %-Deckel → 22.400 €", () => {
  assert.equal(grant({ oldHeatingYear: 2004, income: 40000, children: "yes" }).grant, 22400);
});

test("7: Öl, zvE 55.000 + Kind (eff. 45.000) → 56 % → 15.680 €", () => {
  assert.equal(grant({ oldHeating: "oil", income: 55000, children: "yes" }).grant, 15680);
});

test("8: vermietetes EFH, Öl → 30 % → 8.400 €", () => {
  assert.equal(grant({ selfUse: false, oldHeating: "oil" }).grant, 8400);
});

test("9: defekte Gasheizung 25 J., zvE 70.000, Kosten 26.000 → kein Bonus → 7.800 €", () => {
  assert.equal(grant({ oldHeatingWorking: "no", income: 70000, costs: 26000 }).grant, 7800);
});

test("10: KfW-Beispiel Becker: 2 WE, Kosten 41.000, Klimabonus 16 % → 15.580 €", () => {
  const r = grant({ units: 2, costs: 41000, income: null, oldHeating: "oil" });
  assert.equal(r.grant, 15580);
  assert.equal(r.selfUseShare, 20500);
});

test("11: MFH 3 WE, Eigentümer wohnt in einer, Öl, zvE 35.000, Kosten 60.000 → 25.133,33 €", () => {
  const r = grant({ units: 3, costs: 60000, oldHeating: "oil", income: 35000 });
  assert.equal(r.costCap, 58000);
  assert.equal(r.grant, 25133.33);
});

test("14: wie 1, Antrag 15.02.2027 (Höchstbetrag 27.250, Klimabonus 12 %) → 19.075 €", () => {
  const r = grant({ applicationDate: "2027-02-15" });
  assert.equal(r.grant, 19075);
  // angekündigte Änderung 2027 nur als Szenario, nicht als Regel
  assert.ok(r.scenarios.some((s) => s.grant === 15532.5));
});

test("16: Antrag ab 01.08.2028, zvE 45.000, Kosten 30.000 → Deckel 25.000, 40 % → 10.000 €", () => {
  assert.equal(grant({ applicationDate: "2028-08-01", income: 45000, costs: 30000 }).grant, 10000);
});

/* ---------- Einkommensgrenzen direkt unter, an und über ---------- */

test("Einkommensbonus an den Grenzen", () => {
  assert.equal(incomeBonusPercent(29999), 40);
  assert.equal(incomeBonusPercent(30000), 40);
  assert.equal(incomeBonusPercent(30001), 30);
  assert.equal(incomeBonusPercent(40000), 30);
  assert.equal(incomeBonusPercent(40001), 10);
  assert.equal(incomeBonusPercent(50000), 10);
  assert.equal(incomeBonusPercent(50001), 0);
});

test("Obergrenze 80 % gilt bis einschließlich 30.000 €, darüber 70 %", () => {
  const oil = { oldHeating: "oil" as const, costs: 28000 };
  assert.equal(grant({ ...oil, income: 30000 }).grant, 22400); // 86 → 80 %
  assert.equal(grant({ ...oil, income: 30001 }).grant, 19600); // 76 → 70 %
});

test("Familienzuschlag: 60.000 € mit Kind → 10 %, 60.001 € → 0 %", () => {
  const noKlima = { oldHeatingYear: 2015, costs: 28000 };
  assert.equal(grant({ ...noKlima, income: 60000, children: "yes" }).grant, 11200); // 30 + 10
  assert.equal(grant({ ...noKlima, income: 60001, children: "yes" }).grant, 8400);
});

/* ---------- Selbstnutzung gegenüber Vermietung ---------- */

test("Vermietung erhält keine Boni, auch bei niedrigem Einkommen", () => {
  const r = grant({ selfUse: false, oldHeating: "oil", income: 20000 });
  assert.equal(r.grant, 8400);
  assert.equal(r.lines.length, 1);
});

/* ---------- Austauschfälle ---------- */

test("Gasheizung: Alter 19 J. kein Bonus, 21 J. Bonus, genau 20 J. offen", () => {
  const app = { applicationDate: "2026-12-01", income: 80000, costs: 28000 };
  assert.equal(grant({ ...app, oldHeatingYear: 2007 }).grant, 8400);
  assert.equal(grant({ ...app, oldHeatingYear: 2005 }).grant, 12880); // 30 + 16
  const exact = grant({ ...app, oldHeatingYear: 2006 });
  assert.equal(exact.grant, 8400);
  assert.ok(exact.openPoints.some((p) => p.includes("20 Jahren")));
  assert.ok(exact.scenarios.some((s) => s.grant === 12880));
});

test("Öl ohne Altersgrenze; verbleibende Gasheizung schließt Bonus aus", () => {
  const o = { oldHeating: "oil" as const, oldHeatingYear: 2020, income: 80000, costs: 28000 };
  assert.equal(grant(o).grant, 12880);
  assert.equal(grant({ ...o, fossilRemains: "yes" }).grant, 8400);
});

test("Unbekannte Funktionstüchtigkeit → konservativ ohne Bonus, aber Szenario", () => {
  const r = grant({ oldHeating: "oil", oldHeatingWorking: "unknown", income: 80000, costs: 28000 });
  assert.equal(r.grant, 8400);
  assert.ok(r.scenarios.some((s) => s.grant === 12880));
});

/* ---------- Kosten und Höchstbetrag ---------- */

test("Kosten unter, an und über dem Höchstbetrag", () => {
  const plain = { selfUse: false };
  assert.equal(grant({ ...plain, costs: 27999 }).grant, 8399.7);
  assert.equal(grant({ ...plain, costs: 28000 }).grant, 8400);
  assert.equal(grant({ ...plain, costs: 28001 }).grant, 8400);
});

test("Nicht förderfähige Anteile werden abgezogen", () => {
  assert.equal(grant({ selfUse: false, costs: 30000, nonEligibleCosts: 10000 }).grant, 6000);
});

test("Unbekannte Kosten → Höchstbetrag als gekennzeichnete Annahme, kein Restbetrag", () => {
  const r = grant({ costs: null, selfUse: false });
  assert.equal(r.grant, 8400);
  assert.equal(r.costsAssumed, true);
  assert.equal(r.remaining, null);
});

test("Höchstbetrag nach Wohneinheiten", () => {
  assert.equal(costCapForBuilding(1, "2026-12-01"), 28000);
  assert.equal(costCapForBuilding(2, "2026-12-01"), 43000);
  assert.equal(costCapForBuilding(6, "2026-12-01"), 103000);
  assert.equal(costCapForBuilding(7, "2026-12-01"), 111000); // wie KfW-WEG-Beispiel
  assert.equal(costCapForBuilding(8, "2026-12-01"), 119000);
});

/* ---------- Datumswechsel ---------- */

test("Klimabonus und Höchstbetrag wechseln an den Stichtagen", () => {
  assert.equal(klimaBonusPercent("2027-01-31"), 16);
  assert.equal(klimaBonusPercent("2027-02-01"), 12);
  assert.equal(klimaBonusPercent("2027-07-31"), 12);
  assert.equal(klimaBonusPercent("2027-08-01"), 8);
  assert.equal(klimaBonusPercent("2028-07-31"), 4);
  assert.equal(klimaBonusPercent("2028-08-01"), 0);
  assert.equal(costCapForBuilding(1, "2027-01-31"), 28000);
  assert.equal(costCapForBuilding(1, "2027-02-01"), 27250);
  assert.equal(costCapForBuilding(1, "2030-08-01"), 22000);
});

test("Antrag nach Ende der Richtlinie → nicht abgebildet (keine 0 €)", () => {
  const r = calculate({ ...base, applicationDate: "2031-01-02" });
  assert.equal(r.status, "unsupported");
});

test("Antragsdatum unbekannt → heute, als Annahme gekennzeichnet", () => {
  const r = grant({ applicationDate: null });
  assert.equal(r.applicationDate, TODAY);
  assert.equal(r.dateAssumed, true);
});

/* ---------- Fehlende, ungültige und widersprüchliche Eingaben ---------- */

test("Ungültige Eingaben werden abgelehnt", () => {
  const cases: Array<[Partial<CalcInput>, string]> = [
    [{ applicationDate: "2026-01-01" }, "applicationDate"],
    [{ applicationDate: "2026-13-45" }, "applicationDate"],
    [{ units: 0 }, "units"],
    [{ units: 2.5 }, "units"],
    [{ costs: -5 }, "costs"],
    [{ costs: 10000, nonEligibleCosts: 20000 }, "nonEligibleCosts"],
    [{ income: -1 }, "income"],
    [{ oldHeatingYear: 2030 }, "oldHeatingYear"],
  ];
  for (const [over, key] of cases) {
    const r = calculate({ ...base, ...over });
    assert.equal(r.status, "invalid", key);
    assert.ok(r.status === "invalid" && key in r.errors, key);
  }
});

test("Nicht förderfähig: Mieter, GbR, Vorhabenbeginn, junges Gebäude, überwiegend Gewerbe, < 300 €", () => {
  for (const over of [
    { applicant: "tenant" as const },
    { applicant: "gbr_niessbrauch" as const },
    { projectStarted: "yes" as const },
    { buildingOldEnough: "no" as const },
    { mixedUse: true, residentialOver50: "no" as const },
    { costs: 299 },
  ]) {
    assert.equal(calculate({ ...base, ...over }).status, "not_eligible", JSON.stringify(over));
  }
});

test("WEG und unklare Eigentumsformen → Beratung statt Betrag", () => {
  assert.equal(calculate({ ...base, applicant: "weg" }).status, "unsupported");
  assert.equal(calculate({ ...base, applicant: "other" }).status, "unsupported");
});

test("Ohne Einkommensangabe kein Einkommensbonus, Annahme benannt", () => {
  const r = grant({ income: null, oldHeatingYear: 2015 });
  assert.equal(r.grant, 8400);
  assert.ok(r.assumptions.some((a) => a.includes("Einkommen")));
});

test("Zuschuss wird nie mit anderen Positionen addiert (nur Zuschusszeilen)", () => {
  const r = grant({});
  assert.ok(r.lines.every((l) => /Grundförderung|bonus/i.test(l.label)));
});
