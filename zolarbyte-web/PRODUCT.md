# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primär (bestätigt 2026-11-14): private Hausbesitzer im Raum München/Dachau/Karlsfeld, die ihr Haus energetisch weiterentwickeln wollen – Photovoltaik, Ladepunkt fürs E-Auto und eine Elektroinstallation, die das trägt. Sie planen eine größere Investition, vergleichen Betriebe und wollen einem Fachbetrieb vertrauen, bevor sie anfragen.

Sekundär: Menschen mit akuter Störung (Strom weg, Sicherung fliegt) – brauchen sofort Telefon; Vermieter, Betriebe und Hausverwaltungen mit Prüfpflichten (E-Check, DGUV Vorschrift 3); Interessenten an Schulungen.

## Product Purpose

Website eines Elektrotechnik-Meisterbetriebs. Erfolg = qualifizierte Anfragen (Formular/Anfrage-Assistent, Anruf, E-Mail), vor allem für Energie-Projekte am Haus, ohne die Grundleistungen (Installation, Störung, Prüfung) zu verstecken.

## Positioning

Kein reiner Solarverkäufer: ein eingetragener Elektro-Meisterbetrieb, der Photovoltaik, E-Mobilität und die bestehende Hausinstallation als ein elektrisches System plant, anschließt und prüft. Das Fundament ist die normgerechte Installation (VDE), nicht das Modul auf dem Dach.

## Operating Context

Besuch meist mobil (Recherche abends/Wochenende), Vergleich mehrerer Betriebe. Anfrage per Telefon, E-Mail oder Formular; danach persönliche Beratung vor Ort, Angebot, Umsetzung, Übergabe mit Dokumentation/Prüfprotokoll.

## Capabilities and Constraints

- Leistungen (bestätigt, keine weiteren ergänzen): Elektroinstallation & Montage, Kundendienst & Störungsbehebung, E-Check & elektrische Prüfungen (VDE, DGUV V3), Photovoltaik & Solaranlagen, E-Mobilität (Beratung, Prüfung der Installation, Zusammenspiel mit PV), Schulungen.
- Ablauf: Anfrage → Beratung vor Ort → Planung/Angebot → Umsetzung mit Prüfung und Dokumentation.
- Technik: Next.js 16 App Router, statisch vorgerendert; keine externen Dienste, keine Cookies, Schriften lokal. Formularversand über Resend (`/api/contact`), ohne Konfiguration ehrliche Fehlermeldung. Vorschau-/Produktionsmodus über `NEXT_PUBLIC_SITE_MODE`. Weiterleitungen alter WordPress-URLs in `next.config.ts`.
- Kein öffentlicher Rechner mit Preisen/Erträgen/Förderungen (keine Datengrundlage). Öffentliches Conversion-Element: Anfrage-Assistent ohne Preise (bestätigt).
- Offen: E-Check-Markennutzung (ZVEH/Innung), Öffnungszeiten, WhatsApp, Impressum-Details, Empfängeradresse.

## Brand Commitments

- Name „Zolarbyte“ (im Briefing auch „SolarBytes“ genannt – maßgeblich ist der bestehende Name/Domain zolarbyte.de).
- Bildmarke Sonne-Blitz (vorläufig nachgezeichnet, `public/brand/zolarbyte-zeichen-vorlaeufig.svg`), Markenfarbe Magenta ca. #C51C84 aus dem Logo.
- Ansprache „Sie“. Keine KI-Floskeln, keine Superlative.

## Evidence on Hand

- Echt: Adresse Nußbaumstraße 4, 85757 Karlsfeld; HWK München und Oberbayern, Reg.-Nr. 7216270; Kontakte (allgemein, Vertrieb Jörg Mißfeldt, GF Elzat Ablet – laut altem Impressum).
- Nicht vorhanden – nicht erfinden: Referenzprojekte, Projektfotos, Kundenstimmen, Bewertungen, Partnerliste (Stand 2023, nicht freigegeben), Zahlen (Anlagen, kWp, Jahre), Preise, Förderangaben.
- Bildsprache bestätigt: 3D und Grafik, keine KI-Fotos.

## Product Principles

1. Fundament vor Fassade: Elektrik als System zeigen, PV und Wallbox als Teil davon.
2. Zeigen statt behaupten – Mechanismen visualisieren, keine unbelegten Versprechen.
3. Schnellster Weg zum Menschen: Telefon und Anfrage immer in Reichweite, Störung sofort erkennbar.
4. Nur bestätigte Fakten; Fehlendes bleibt weg statt Platzhalterlob.

## Accessibility & Inclusion

WCAG 2.2 AA; prefers-reduced-motion vollständig respektieren; Touch-Geräte ohne Hover-Abhängigkeit; ältere Hausbesitzer als Zielgruppe → gut lesbare Größen, klare Kontraste.
