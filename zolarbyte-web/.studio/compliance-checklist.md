# Compliance Checklist – Zolarbyte (Redesign „Sonnenbahn“)

**Keine Rechtsberatung.** Technische Fakten, Entwurfsstand, juristisch zu bestätigende Punkte markiert.
Projekt: Zolarbyte · Verantwortlicher laut `src/lib/site.ts`: Zolarbyte Elektrotechnik Meisterbetrieb, Nußbaumstraße 4, 85757 Karlsfeld · Stand: 2026-11-14 · Geprüft von: compliance-reviewer (Dev-Server localhost:3100, kein Produktivstand)

## 1 Dienste-Inventur

| Dienst | Zweck | Daten | Rechtsgrundlage (Vorschlag) | Consent? | AVV / Drittland | Quelle |
|---|---|---|---|---|---|---|
| Hosting | Auslieferung, Logfiles | IP, Zeit, URL, Referrer, User-Agent | Art. 6 (1) f | nein | **[FEHLT: Anbieter, Standort, AVV]** – Vercel nur Annahme, nicht eingetragen | kein `vercel.json`/Deploy-Beleg im Repo |
| Resend (`api.resend.com`, nur serverseitig) | Zustellung der Anfragen per E-Mail | Name, E-Mail, Telefon, Anliegen, Objektart, Zeitraum, PLZ/Ort, Zusatz, Nachricht | Art. 6 (1) b / f | nein | AVV **[FEHLT]**; US-Anbieter → [JURISTISCH PRÜFEN: DPF-Zertifizierung auf dataprivacyframework.gov, sonst SCC; Datenregion] | `src/lib/mail.ts:63` |
| Empfängerpostfach (`CONTACT_RECIPIENT`) | Eingang der Anfragen | wie oben | Art. 6 (1) b / f | nein | **[FEHLT: Mail-Anbieter, Empfängeradresse, AVV]** (Env nicht im Repo) | `mail.ts:10` |
| sessionStorage `zb-inquiry-v1` | Zwischenstand Assistent | Schritt, Eingaben, Startzeit `t` | § 25 (2) Nr. 2 TDDDG; Art. 6 (1) b/f | nein | – | `InquiryAssistant.tsx:174,233` |
| sessionStorage `zb-calculator-handoff` | Übergabe Rechner → Assistent | Leistung, Nachricht | wie oben | nein | – | `StepWizard.tsx:114`; Rechner derzeit `features.calculator=false`, nur `/intern` – bei Freischaltung in Datenschutz ergänzen |
| Schriften Schibsted Grotesk, Barlow Semi Condensed | Darstellung | – | – | nein | lokal ausgeliefert (`next/font/google`, Build-Zeit) | `layout.tsx:2`; Laufzeit: 0 Requests an Google (s. u.) |
| Lenis, motion, three/@react-three/fiber, Canvas, Cursor | Darstellung | keine | – | nein | npm-Pakete, clientseitig, keine externen Assets | `package.json`; Netzwerkprotokoll |
| Externe Links (HWK München, gesetze-im-internet.de) | Impressum | – (erst nach Klick) | – | nein | nur Verlinkung | `impressum/page.tsx:63,69` |
| JSON-LD `<script>` | SEO | – | – | nein | inline, lokal | `page.tsx:51` |

Nicht gefunden: Cookies, localStorage, Analytics/Tag-Manager, iframes, Karten, Videos, Social-Embeds, Newsletter, CDNs, Consent-Tool.

**Requests vor Interaktion/Consent (Playwright/Chromium, frisches Profil):** `/`, `/kontakt`, `/datenschutz`, `/impressum` (je networkidle + Scroll): ausschließlich Host `localhost:3100`; 0 externe Hosts; 0 Cookies; localStorage leer; keine Requests an fonts.googleapis.com/gstatic. (In `/datenschutz` und `/impressum` lädt zusätzlich `/__nextjs_font/geist-latin.woff2` – lokaler Next-Dev-Overlay-Font, nur Dev, nicht Produktion.) Script: `/private/tmp/claude-501/-Users-paul-Documents-Kunden-Seiten-zolar-bytes/a1c5dd86-6704-44d4-a94c-4295912abadd/scratchpad/req.cjs`. Nach Deploy auf der Live-URL wiederholen (Hoster-Header/Cookies).

## 2 Consent-Entscheidung

**Kein Banner nötig.** Begründung: Keine Cookies, keine Drittanbieter-Requests im Browser, kein Tracking. Die einzige Endgerätespeicherung (sessionStorage) dient allein dem vom Nutzer gewünschten Anfrage-Assistenten und ist daher nach § 25 Abs. 2 Nr. 2 TDDDG einwilligungsfrei [JURISTISCH PRÜFEN]. Resend wird nur serverseitig beim Absenden angesprochen, kein Browser-Zugriff.
**Einschränkung (Befund):** Der Assistent schreibt `zb-inquiry-v1` bereits beim Seitenaufruf (Startseite und Kontakt) ohne Nutzeraktion – gemessen: Key vorhanden vor jedem Klick, danach `step`/`values`. Inhalt vor Eingabe leer, die Argumentation trägt, sauberer wäre aber Schreiben erst nach der ersten Eingabe (`InquiryAssistant.tsx:229-236`, `hydrated`-Effekt). Empfehlung an frontend-engineer. Datenschutztext ist so formuliert, dass er beide Varianten trägt.

## 3 Checkliste

| # | Punkt | Status | Nachweis | Jur. |
|---|---|---|---|---|
| 2.1 | Impressum/Datenschutz im Footer | PASS | `Footer.tsx:51,54` | nein |
| 2.2 | Impressum vollständig | BLOCKED | Abschnitt 4 | ja |
| 2.4 | Keine veraltete OS-Plattform | PASS | nicht im Impressum | ja |
| 2.5 | Datenschutz ohne Banner erreichbar | PASS | 200 auf `/datenschutz` | nein |
| 2.6 | Datenschutz deckt Inventur ab | PASS (Entwurf) | Abschnitte 3–11; offene Angaben im Vorschau-Hinweis | ja |
| 2.7 | Verantwortlicher, Rechte, Beschwerde BayLDA | PASS (Entwurf) / DSB offen | Abschnitt 1–2 | ja |
| 2.8 | Keine Requests/Cookies vor Zustimmung | PASS | Request-Liste oben | nein |
| 2.11 | Kein Consent nötig begründet | PASS (Entwurf) | Abschnitt 2 | ja |
| 2.12 | Datenminimierung Formular, Hinweis auf DSE | PASS | `InquiryAssistant.tsx:647-650`; Pflicht: Name, E-Mail, Anliegen | ja |
| 2.13 | TLS, Weiterleitung dokumentiert | PASS (Entwurf) / Löschfrist FEHLT | DSE 4–5 | nein |
| 2.14 | Spam-Schutz ohne Drittanbieter | PASS | Honeypot + `t` ≥ 3 s, `route.ts` | nein |
| 2.17 | Externe Medien | NOT_APPLICABLE | keine Embeds | – |
| 2.18 | Externe Skripte/CDNs | PASS | 0 externe Hosts | nein |
| 2.19 | Fonts lokal | PASS | 0 Requests an Google; 4 woff2 unter `/_next/static/media` | nein |
| 2.20 | Font-Lizenzen | PASS (Hinweis) | OFL-Datei für Schibsted vorhanden (`_og/OFL.txt`); Barlow (OFL) Nachweis in Asset-Liste ergänzen | ja |
| 2.21 | AVV Hoster/Resend/Mail | BLOCKED | durch Auftraggeber | ja |
| 2.22 | Serverregion | BLOCKED | Hoster offen | nein |
| 2.23 | Drittland Resend | BLOCKED | DPF-Prüfung offen | ja |
| 2.24 | BFSG anwendbar? | siehe 5 | Einstufung durch Auftraggeber | ja |
| 2.26–2.31 | Shop-Pflichten | NOT_APPLICABLE | kein Online-Vertragsschluss | – |

## 4 Impressum (`src/app/impressum/page.tsx`) – nur geprüft, nicht geändert

Vorhanden: Name/Anschrift, Vertretung (Elzat Ablet), Telefon, E-Mail, Handwerksrolle/Kammer/Betriebsnummer, HwO-Link, Haftung für Links.
Offen:
1. **Rechtsform** fehlt (`legalName` ohne Zusatz; „Geschäftsführer“ in `site.ts` deutet auf Gesellschaft, GmbH/UG/Einzelunternehmen unbestätigt). Bei Gesellschaft: vollständige Firma mit Rechtsformzusatz, Vertretungsberechtigte mit Funktion, Registergericht + Handelsregisternummer (§ 5 Abs. 1 DDG).
2. **Gesetzliche Berufsbezeichnung + verleihender Staat** (Elektrotechnikermeister, Bundesrepublik Deutschland) fehlt – ggf. Bezug auf Handwerksordnung belassen [JURISTISCH PRÜFEN].
3. **USt-IdNr.** (falls vorhanden) fehlt.
4. **Verbraucherschlichtung** (§ 36 VSBG): Aussage fehlt.
5. § 18 Abs. 2 MStV-Block: nur nötig bei journalistisch-redaktionellen Inhalten – Seite hat keinen Blog; prüfen, ob entfallen kann.
6. Betriebsnummer „7216270“, Kammeradresse, Geschäftsführer stammen aus altem Impressum – Bestätigung durch Kunden (`site.ts` selbst markiert „vor Veröffentlichung bestätigen“).
7. Aufsichtsbehörde: HWK ist Kammer; ob eine Aufsichtsbehörde nach § 5 Abs. 1 Nr. 3 DDG zu nennen ist, juristisch klären.

## 5 Barrierefreiheit

**BFSG-Einordnung (keine Rechtsberatung):** Das BFSG erfasst u. a. Dienstleistungen im elektronischen Geschäftsverkehr für Verbraucher (Vertragsschluss über die Website). Diese Website ist eine Informations- und Anfrageseite; Verträge werden nicht online geschlossen, der Assistent sendet nur eine Anfrage. Zusätzlich greift für Dienstleistungen die Kleinstunternehmen-Ausnahme (< 10 Beschäftigte und ≤ 2 Mio. € Umsatz/Bilanzsumme) – **[FEHLT: Beschäftigtenzahl/Umsatz]**. Wahrscheinlich nicht anwendbar, Einstufung durch Auftraggeber/Rechtsberatung. WCAG 2.2 AA bleibt als Qualitätsmaßstab sinnvoll.

**A11y-Blick `src/components/assistant/*` (nur Code gelesen, kein Screenreader-Test):**
- Gut: Labels mit `htmlFor`, `aria-invalid`/`aria-describedby` für Fehler, `fieldset`/`legend` für Anliegen, Fokus auf Schritt-Überschrift, Fehlerfokus aufs erste Feld, `aria-live`-Status, sichtbare Fokusrahmen (3 px), Pflichtfelder erklärt, autocomplete (name/email/tel/postal-code), Honeypot `aria-hidden` + `tabIndex=-1`.
- Befund 1 (mittel): Auswahl eines Anliegens springt bei Mausklick nach Timer automatisch zu Schritt 2 (`onTopicClick`, ~Z. 248-262). Tastatur nicht betroffen, aber unerwartete Kontextänderung bei Auswahl (WCAG 3.2.2) – Rückgängig/Zurück ist vorhanden; ggf. nur mit Hinweistext oder deaktivierbar.
- Befund 2 (gering): Fortschritt „Schritt x von 3“ ist `aria-hidden`, der Live-Text liegt separat als `visually-hidden`; per Screenreader testen, ob Schrittwechsel sinnvoll angesagt wird.
- Befund 3 (gering): `SunCursor` blendet den Systemcursor aus (`cursor: none !important`), nur bei `hover:hover`, `pointer:fine` und ohne `prefers-reduced-motion`. Für Nutzer mit großem/kontrastreichem Systemcursor nachteilig – Abschaltmöglichkeit oder Beschränkung auf Elemente erwägen.
- Nicht geprüft: Kontraste, Zielgrößen, Screenreader, Tastaturdurchlauf im Browser.

## 6 Launch-Blocker
1. Hosting-Anbieter, Standort, AVV festlegen und in DSE Abschnitt 3 benennen.
2. Resend: Firmierung, DPF/SCC, AVV, Region; Mail-Anbieter des Empfängerpostfachs; `CONTACT_RECIPIENT`/`CONTACT_FROM`/`RESEND_API_KEY` in Produktion setzen (sonst Formular nicht funktionsfähig, 503).
3. Löschfrist für Anfragen vom Betrieb.
4. Impressum-Lücken (Abschnitt 4), juristische Prüfung von Impressum und DSE.
5. Nach Deploy: Request-/Cookie-Test auf Live-URL wiederholen; Production-Modus (`NEXT_PUBLIC_SITE_MODE=production`) prüfen, dass Vorschau-Hinweise verschwinden und die Texte vollständig sind.
6. DSB-Pflicht prüfen (Anzahl Personen mit ständiger automatisierter Verarbeitung).

## 7 Vorgeschlagene Gate-Stati
compliance.inventory PASS · compliance.consent PASS (Entwurf, jur. Bestätigung) · compliance.privacy-policy BLOCKED (Hoster/Resend/Löschfrist) · compliance.imprint BLOCKED · compliance.fonts PASS · compliance.bfsg NOT_VERIFIED (Einstufung offen)
