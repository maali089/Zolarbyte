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

- `src/lib/site.ts` – Unternehmensdaten, Kontakte, Feature-Schalter (Rechner, Referenzen, Partner, Kundenstimmen – alle aus)
- `src/lib/content.ts` – Leistungen, Ablauf, FAQ
- `src/components/hero/` – Elektroanimation (SVG + CSS, reduzierte Bewegung = statischer Endzustand)
- `src/components/calculator/StepWizard.tsx` – modulare Rechner-Bedienung ohne Berechnungslogik
- `src/app/intern/rechner` – Konzeptansicht (nur Vorschau)
- `next.config.ts` – Weiterleitungen der alten WordPress-Adressen

## Vor dem Livegang offen

- Original-Logo als Vektordatei (SVG/PDF/AI) inkl. Wortmarke – aktuelles Zeichen ist aus der JPEG-Referenz nachgezeichnet (`public/brand/zolarbyte-zeichen-vorlaeufig.svg`)
- Impressum: Rechtsform, vertretungsberechtigte Person, Berufsbezeichnung, ggf. USt-IdNr., Verbraucherschlichtung
- Datenschutz: Hosting-Anbieter und Versanddienst benennen, rechtlich prüfen
- Empfängeradresse für Formularanfragen
- Nutzung der Bezeichnung „E-Check“ (Marke des ZVEH, Innungsmitgliedschaft) bestätigen
- Rechner: Zweck und Datengrundlage
- Referenzen, Projektfotos, Partner, Kundenstimmen, Öffnungszeiten, WhatsApp-Nummer
