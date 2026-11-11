# Zolarbyte – Website-Relaunch

Next.js 16 (App Router, TypeScript), statisch vorgerendert. Keine externen Dienste, keine Cookies, Schriften lokal ausgeliefert.

## Starten

```bash
npm install
npm run build
npm start          # http://localhost:3000
```

Entwicklung: `npm run dev`

## Modi

| Variable | Wirkung |
| --- | --- |
| `NEXT_PUBLIC_SITE_MODE` nicht gesetzt | **Interne Vorschau**: Vorschau-Leiste, Entwurfshinweise in Impressum/Datenschutz/Formular, `noindex`, `/intern/rechner` erreichbar |
| `NEXT_PUBLIC_SITE_MODE=production` | Öffentliche Fassung: keine Hinweise, Indexierung erlaubt, `/intern/*` liefert 404 |

Formularversand: siehe `.env.example` (Resend). Ohne Konfiguration meldet das Formular ehrlich „nicht gesendet“.

## Wo was liegt

- `src/lib/site.ts` – Unternehmensdaten, Kontakte, Schalter (Förderrechner an; Referenzen, Partner, Kundenstimmen aus)
- `src/lib/content.ts` – Schwerpunkte Photovoltaik, Wärmepumpe, Stromspeicher; ergänzende Elektrotechnik; Ablauf, FAQ
- `src/components/house/` – Energiehaus: `geometry.ts` (3D-Modell in Metern + Perspektiv-Projektion → SVG beim Build), `house.css` (Intro, Tag/Abend, Auswahl), `EnergyExplorer.tsx` (interaktive Erklärung)
- `src/lib/foerderung/regeln-458.ts` – **Förderregeln KfW 458 mit Quellen und Gültigkeit (Stand 11.11.2026)**
- `src/lib/foerderung/berechnung.ts` + `.test.ts` – Berechnung und Tests (`npm test`)
- `src/lib/foerderung/pv-info.ts` – Hinweise PV/Speicher mit Quellen
- `docs/foerderrechner-quellen.md` – vollständige Recherche mit Originalzitaten; `docs/referenzen-analyse.md`
- `scripts/render-house.ts` – Energiehaus als PNG prüfen (`npm run render:house -- datei.png [evening]`)
- `next.config.ts` – Weiterleitungen (alte WordPress-Adressen, /intern/rechner → /foerderrechner)

## Förderregeln aktualisieren

Bei neuen KfW-Merkblättern: Werte in `regeln-458.ts` anpassen (mit Quelle), `STAND` ändern, Tests anpassen, `npm test`.
Offen angekündigt: Änderungen „ab 1. Quartal 2027“ (Grundförderung 15 % + EU-Bonus) – erst einpflegen, wenn das Startdatum offiziell feststeht.

## Vor dem Livegang offen

- Original-Logo als Vektordatei (SVG/PDF/AI) inkl. Wortmarke
- Impressum: Rechtsform, vertretungsberechtigte Person, Berufsbezeichnung, ggf. USt-IdNr., Verbraucherschlichtung
- Datenschutz: Hosting-Anbieter und Versanddienst benennen, rechtlich prüfen
- Empfängeradresse und Zugang für den Formularversand
- Wärmepumpe: Rollenverteilung bei der heizungstechnischen Installation und wer die KfW-„Bestätigung zum Antrag“ ausstellt
- Name der Meisterin/des Meisters, Team-, Montage- und Projektfotos, Referenzen, Partner
- Wallbox, E-Check-Bezeichnung, Öffnungszeiten, WhatsApp-Nummer
