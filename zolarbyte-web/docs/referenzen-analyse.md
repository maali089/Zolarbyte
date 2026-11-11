# Reference analysis for the Zolarbyte redesign (8 solar/heat-pump installer sites)

Method: Playwright (Chromium, viewport ~930×860). For each site: load, wait about 4 s, sample `document.getAnimations()`, scroll to about 1/3 of the page, wait 2.5 s, sample again, then take screenshots. The DOM was checked for `<video>`, `<canvas>`, Lottie, SVG SMIL, GSAP/ScrollTrigger/THREE globals, Swiper, Webflow, Elementor and sticky containers.
Legend: **(a) observed** = I saw it move, or measured it running in the animation API. **(b) static** = image, photo or rendering. **(c) inferred** = not directly observed.
All texts are summarised in my own words.

---

## 1. pro-ec.de (PEC, Munich)
- **Hero message:** an aggressive price promise ("cheapest electricity") plus "whole-house energy concept". The sub-line names PV, storage, heating and wallbox and anchors the company in Munich.
- **Nav:** a thin black utility bar (FAQ, contact, customer portal, WhatsApp/mail/phone icons). The main bar has only two buttons, "Beratung buchen" (outline) and "Angebot kalkulieren" (orange gradient), plus a burger menu. The mega menu is very long and lists actual module SKUs and kWp packages.
- **CTAs:** "calculate offer" appears about 5×. The "PV configurator" link is secondary.
- **(b) Hero:** a full-bleed drone photo of a real family on a terrace with PV on the roof. ProvenExpert and Trustpilot badges sit at the bottom of the hero.
- **(b) "Haus der Zukunft":** a dark, schematic house illustration with orange line-art. Wires run from PV, battery, heat pump, air-con, hot-water tank and wallbox to a central branded "Dynamic Box". Below it are product cards: a product cut-out on a grey background, a circle-dot headline and a black "learn more" pill.
- **(a) Observed:** 8 orange "+" hotspots on the house with a CSS `pulse` animation running continuously. Each opens a dialog. At this viewport the hotspots were visibly misaligned with the drawing.
- (a) No other motion was measured: no video, canvas, Lottie or GSAP.
- **Products:** the three products are explained as cards with one line each ("which module for my roof", "raise self-consumption", "turn surplus into heat").
- **Trust:** three review platforms with star counts in the hero, "8,000 systems / 80 staff / own warehouse", and a "31-point checklist" lead magnet.
- **Funnel:** a 3-step process (2-minute online savings calculation → home visit → delivery & install). "Offer by e-mail in minutes" is the closing promise.
- **(c) Inferred:** the configurator is a separate app, and they rely heavily on paid traffic and review volume.

## 2. mysolarexpress.de (Osnabrück, nationwide)
- **Hero message:** a question-led headline: "do you want a PV system that really pays off in reality, not just on paper". It promises a direct line to manufacturers with no middleman markup.
- **(b) Hero image:** an AI-looking illustration of a steam locomotive in a jungle. It is off-brand and has nothing to do with energy. A cookie banner covers about 40% of the first view.
- **Nav:** burger only. Items: buy PV, retrofit storage, retrofit heat pump, wallbox, tenant electricity, financing.
- **CTAs:** "configure in 2 minutes", "request offer – free & non-binding", "callback in under 1 minute", "24/7 support". They are many and compete with each other.
- **(a) Observed:** a CSS marquee (logo strip, "known from") scrolling continuously. Webflow IX2 interactions are present (21 `data-w-id` elements). (c) I did not catch them moving, but they are probably fade or slide-ins.
- **(b)/(c)** One Lottie widget (Webflow) and a **Mapbox map** (canvas) of partner locations. There are several YouTube embeds of customer stories ("At home with Mr X").
- **Products:** a long bullet glossary (modules, inverter, battery, EMS, heat pump, hot-water tank, smart home, wallbox, grid connection). The content is complete but reads like a spec sheet, not a story.
- **Copy style:** objection handling with emoji checkmarks ("will it pay off?", "is the subsidy safe?", "what if installation goes wrong?").
- **Trust:** "4.9 stars / 190+ reviews", award and partner badges, "known from" press logos.
- **Funnel:** a 3-step process (configurator request → free on-site consultation & planning → installation). The configurator is an embedded **Reonic** iframe.
- **Takeaway:** good objection handling, but chaotic imagery and too many CTAs.

## 3. pv-gruenauer.de (Grünauer, near Landshut)
- **Hero message:** "your PV solution near Landshut" and a family-run Meisterbetrieb. One CTA: "Unverbindliches Angebot".
- **(b) Hero:** a photo of an installer with a cap, combined with an **isometric illustration** (house with PV, e-car, glowing light bulb, battery) on a dark-green diagonal panel. Badges: Meisterbetrieb seal, IHK seal, ProvenExpert, Google 4.9.
- **Nav:** Start, Lösungen, Förderungen, Referenzen, Jobs, Über uns, FAQ, plus an "Unverbindliches Angebot" button. A "Messekalender" link sits in the top bar.
- **(a) Observed:** **count-up numbers.** They show "0 Jahre" until the section is in view, then reach "20 Jahre" within about 3 s (Webflow IX2, 45 interaction targets).
- **(a) Observed (disruptive):** on load a **job-ad modal** ("we're hiring an Elektromeister") appears on top of the Cookiebot banner. Two overlays come before any content.
- **Products:** PV-centric. Storage and wallbox appear only in the illustration and are not explained.
- **Trust:** real team (contact persons with names and photos), team video interviews, "family-run", "permanently employed install team", "24/7 hotline", reference projects.
- **Funnel:** a 4-step "Weg zu Ihrer Unabhängigkeit" (consultation & concept → order → back-office & detailed planning → installation). Lead magnets: "Kostenlose Förderfindung" and "Wieviel kann ich sparen?".
- **Takeaway:** strongly regional and personal, but the opening pop-ups hurt the first impression.

## 4. solarlandbayern.de (Solarland Bayern, Munich area)
- **Hero message:** a superlative claim ("best-known PV company in Bavaria"), "10,000+ customers" and "15+ years", with planning, installation and grid registration from one source.
- **(a) Observed: background video in the hero** (`webm`, looped, playing). It shows slow close-ups of modules under a dark blue overlay, with yellow/gold accents.
- **Nav:** Leistungen (Privat / Gewerbe / Wärme), Produkte (Module, WR, Speicher, Wallbox, Energiemanager, Heizungsrechner), Anfrage, Über uns, Blog, Kontakt. The mega menu has sub-labels and a yellow "Kontakt" pill.
- **CTAs:** "Kostenloser Beratungstermin" (primary), "Leistungen ansehen", "Solarstrom-Check starten", "Jetzt beraten lassen".
- **(a) Observed:** a review carousel with CSS transitions and a progress bar. No GSAP or Lottie.
- **Products:** service cards (Privat / Gewerbe / Wärme) each list 4 concrete deliverables (on-site visit, roof analysis, installation, grid registration). Storage gets its own section built around the day/evening explanation. The heat pump comes via a **subsidiary** ("perfect duo PV + WP").
- **Trust:** Google 4.6 (423 reviews) in the hero, opening hours in the hero, phone number, "zertifizierter Meisterbetrieb" in the process text, component partners.
- **Funnel:** the separate `/anfrage` page is a **12-step wizard** ("Schritt 1 von 12"), and choosing an option auto-advances. The questions are: purpose (private/commercial/other), persons, annual kWh (slider), monthly cost (slider), roof type, dormers, roof age, roof area, storage wanted, financing, address, then salutation and contact.
- **Takeaway:** a clean, conventional corporate site. The wizard is thorough but long.

## 5. zeo-solar.de (ZEO Solar, Ampfing, all of Bavaria)
- **Hero message:** "PV from the Meisterbetrieb in Bavaria", in all caps. It covers PV + storage + optional heat pump from one source, across Bavaria.
- **(b) Hero:** a photo of the team or installers in front of a branded van, with a dark overlay. An orange **announcement bar** at the top ("request PV offer · secure KfW heat-pump subsidy").
- **Nav:** burger only. The menu is broad: Photovoltaik, Wärmepumpen, Speicher, Module, WR, Wallbox, Montagesystem, Ablauf, Förderung, Garantie, PV-Rechner, Versicherung and 10 location pages (Munich, Dachau, Ingolstadt…).
- **(a) Observed:** only Swiper carousels (references and testimonials) with transitions. A **sticky vertical side tab** "Beratungstermin vereinbaren" sits on the right edge.
- **Products:** 4 knowledge teasers, each phrased as a benefit (modules that last decades, solar power in the evening, heating with your own sun, charging with the sun) and linking to a deep page. The heat pump is explained as "multiplies every kWh into several kWh of heat".
- **Trust:** "Meisterbetrieb" is in the H1. A reference list shows **street + postcode** of real installations across Upper Bavaria (Garching, Dachau, Neubiberg…). Local contact persons, FAQ, testimonials.
- **Funnel:** 4 steps (house data online or by phone → consultation on site, by phone or digital → configuration incl. **3D visualisation & shading analysis** → installation). The inline offer form is short: name, e-mail, address, consumption band (select), phone, "how did you find us". They mention checking the roof via **BayernAtlas**.
- **Takeaway:** strong local SEO and proof, but visually dated.

## 6. sonnenmacher.de (Sonnenmacher, Bavaria)
- **Hero message:** "Energy of the future", a Meisterbetrieb with 10+ years and 20,000 systems, "PV & heat pumps from one source".
- **(a)/(c) Hero:** Elementor background slideshow with **12 slides and the Ken-Burns class** (measured CSS transitions). At my viewport the funnel block was at the top, so I did not see the slideshow itself.
- **Nav:** Produkte (PV, WP, Wallbox, Komplettangebot, EMS, Smart Meter, own module "PEAK", optimiser, cleaning), Unternehmen (team, references, financing, referral, subsidies, downloads, blog, configurator), Karriere, Kontakt, plus a "Jetzt starten" button.
- **Funnel above the fold (observed):** "Jetzt direkt anfragen". Step 1 is 4 big icon tiles (Solaranlage / Wärmepumpe / Komponenten / Beratung) with Zurück/Weiter. Then: where should the system be mounted → how do you heat today → which components → which kind of consultation → contact data. That makes **about 6 steps**.
- **(a) Observed:** a **sketch-style line drawing of a house** (navy ink, orange sun) with 6 orange label hotspots (Photovoltaik, Wärmepumpen, Speicher, Energiemanagement, Smartmeter, Wallboxen). They have a continuous **shadow-pulse** animation (`haShadowPulse`).
- **(b)/(c)** 24 Lottie-related nodes (Elementor Lottie widget). I did not identify which element animates. Product cards use gradient backgrounds (navy / orange) with line icons.
- **(b) Video:** team-member video cards (portrait of an employee with a play button) and project-story videos (`mp4`, autoplay, loop, paused until in view).
- **Products:** short cards with verb labels (generate electricity / heat sustainably / store flexibly / distribute smartly / profit smartly / charge). Dynamic tariffs are presented as a product.
- **Trust:** "20,000 systems", Meisterbetrieb, people on video, ProvenExpert widget (blocked by consent).
- **Takeaway:** the funnel-first homepage and the hotspot house are effective. The visual language is a bit busy.

## 7. solar24.gmbh (SOLAR24, Garching near Munich) – closest in region and audience to Zolarbyte
- **Hero message:** "power from your own roof – also at night". Sub-line: Meisterbetrieb from Garching, planned for your roof, **no down payment**. The heat pump comes from a partner master heating installer.
- **Typography / look:** dark navy, a large **serif display headline**, white outline button, yellow numbered markers. Very editorial and calm, with only 2 `<img>` and the rest SVG.
- **(b) Hero visual:** an **AI-generated dusk photo** of a house (explicitly labelled "KI / Symbolbild"). Numbered hotspots 1–4 (modules, evening/night storage, technology in the basement, heat pump) are connected by thin lines.
- **(a) Observed (on click):** the hotspot tabs swap the explanatory caption below the image and highlight the active number in yellow. There is no autonomous motion: no CSS animation was running and there is no video, canvas or Lottie.
- **Nav:** a burger "Menü" plus one button "Beratung anfragen". Next to the logo sits a tagline ("Mein Strom, meine Wärme"). The menu is organised by **customer situation** ("big system that grows", "compact up to 16 kWh", "PV + WP", "battery too small? we solve it", "off-grid", "end of feed-in tariff").
- **Products:** explained through a **schematic SVG roof layout plan** with dimensions, rails, roof hooks, roof window and cable route. They also explain the method (official 3D building model, laser points from the Bavarian survey office, drone photos). Storage is explained as "midday surplus → evening".
- **Trust:** "no down payment, the invoice comes after installation", an SVG **timeline** (order → delivery → installation → cabling → commissioning, "about 5 weeks"), a personal order page, a **map with clustered orange dots** ("2 of 3 systems within 60 km of Munich"), an insurer confirmation, and an FAQ written as "questions asked at the kitchen table".
- **Funnel:** "Beratung anfragen" leads to a process explained in prose (we call → visit for meter cabinet & storage space → layout plan → itemised offer). Low-pressure. No calculator on the homepage.
- **Takeaway:** the most credible, most "Meister"-like tone. Transparency replaces hype. A model for copy and structure.

## 8. voltovativ.de (Voltovativ, Unterschleißheim) – most advanced motion
- **Stack:** Next.js (turbopack chunks) with Tailwind classes. No global GSAP or THREE (bundled code). A full-viewport **WebGL canvas** inside a sticky container about 6,000 px tall.
- **Hero message:** a three-word all-caps claim ("Energy. Simple. Intelligent.") with coloured full stops (orange/orange/blue). The eyebrow reads "Wärmepumpen · Photovoltaik · Speicher". CTAs: "Jetzt Projekt anfragen" (orange) and "Energielösungen entdecken" (ghost). A scroll hint at the bottom says "scroll to experience the energy system", plus "skip story".
- **(a) Observed intro (about 2.5 s):** a white overlay, then the logo assembles in pieces (blue mark, orange mark, sun, wordmark) with clip-wipes, a light shine sweep and a wave. The overlay wipes out and the hero lines rise in (`hero-rise`, `hero-line`). The mouse "scroll-dot" bounces continuously.
- **(a) Observed scroll story (real-time 3D):** a stylised 3D house with lawn, trees, a timber garage and roof PV, rendered in canvas. No image-sequence frames were loaded on scroll, so it is live rendering. While scrolling, the camera moves through 4 chapters with a sticky text overlay:
  - 01 heat pump (chips: ambient heat / heating / hot water)
  - 02 PV: camera on the roof, and individual modules light up with a **blue outline glow**
  - 03 storage: camera at the garage wall with wallbox, inverter and battery. The battery has a **blue LED level bar**, and **glowing dashed energy pulses run along the walls and ground** (dash positions moved between two screenshots 2 s apart without scrolling)
  - 04 networking
- **(a) Services section:** 4 sticky full-screen panels stacked (each parent about 1,200 px). Each card has a numbered service, 3 bullet deliverables and an own "… anfragen" CTA. The heat-pump card has a second CTA, "Förderung berechnen". A partner logo strip runs as a marquee (`partner-scroll`).
- **"Energiehaus" (interactive SVG, observed):** headline about how energy flows through your home. There are 4 tabs (Wärmeversorgung / Sonnenenergie / Speicherung / Gesamtsystem; the default is the whole system). A flat navy house diagram shows a sun with dashed **orange rays**, a PV roof with an orange outline, an inverter in the garage, a battery with LED bars, a wallbox, a heat pump with "ambient air" wave lines, and **underfloor heating as an orange sine wave**. A small lightning icon sits in a ring as the house hub.
  - 14 SVG paths with `stroke-dasharray 6/14` and a CSS `flow` keyframe (1.6 s linear infinite), so the dashes march along the wires.
  - **Colour code:** orange = sun & heat, blue = electricity, light blue = ambient air.
  - Selecting a tab **dims the irrelevant flows and devices** and pauses their animation. The relevant paths stay lit (e.g. "Speicherung" keeps PV → inverter → battery → house, and the sun rays and heat pump fade).
  - Disclaimer underneath: simplified schematic. Side panel "Alles greift ineinander" with legend chips (Strom / Sonne & Wärme / Umgebungsluft) and animated ring and segment graphics (`ring`, `seg`, `seg-fill`).
- **KfW Förderrechner (walked through completely):**
  - Inline card on a light grid background. The header reads "Schritt X von N · topic", with a % progress bar and Zurück/Weiter. A lock note says the data is only processed in the browser and nothing is stored or sent.
  - **The step count is dynamic.** It shows "1 of 5" at first and grows to "of 7", then "of 8", depending on answers. With my answers it was **8 steps**:
    1. Ownership and use: 6 radio cards (self-occupied owner / owner but rented out / second home / WEG / tenant / other), each with a hint line.
    2. Existing heating to replace: oil, gas, gas floor heating, night storage, coal, biomass, other.
    3. Is it still working? Yes / no / don't know. A hint explains that the speed bonus only applies to working systems.
    4. Taxable household income: 5 bands plus "prefer not to say". A long hint explains which income counts.
    5. Minor children in the household: yes / no. Hint: the income limit rises.
    6. Building: number of residential units (stepper −/+ with presets for single-family, two-family, 3 units) plus "building permit older than 5 years?" yes / no.
    7. Investment cost: a € text field plus a **range slider from 5,000 to 60,000 €**, with a marker for the eligible maximum (28,000 €).
    8. Timeline: an application-date window in 6 half-year bands, because the bonus decreases. Then "already started the project?" yes / no / unsure. The button changes to "Förderung berechnen".
  - **Result:** a big dark card with "expected grant **22,400 €**" in huge type, "= 80 % of eligible costs", and a **stacked colour bar** (base / speed bonus / income bonus, against the 80 % cap). Below it: eligible costs and own share, an itemised table (base 30 %, speed bonus, income bonus, a red line for the deduction from the 80 % cap), a legal disclaimer (KfW leaflet version, no entitlement), and 3 actions: check or change answers / **have the subsidy checked personally** (lead CTA) / recalculate.
- **"Energiecheck" lead form (observed):** one screen with 3 questions (property type, interests as multi-select, project status) and a "0/3" counter. PLZ and message are optional. A **live preview of a pre-written WhatsApp message** fills in as you choose, and the result is sent via WhatsApp.
- **Persistent contact:** floating E-Mail and WhatsApp pills bottom right, "Projekt anfragen" in the header, phone number in the menu.
- **Process:** 4 steps (contact → on-site needs analysis → individual planning → installation, commissioning and maintenance). The positioning line is personal advice instead of anonymous online guides.
- **Trust:** relatively thin. No review count or Meister seal was visible in the hero. Trust comes from craftsmanship of the site, the subsidy expertise and the partners strip.

---

## Cross-site observations
- Real motion is rare. Most "animation" is pulsing hotspots (PEC, Sonnenmacher), count-ups (Grünauer), carousels or marquees, and one hero video (Solarland). Only **Voltovativ** has scroll-driven 3D and animated energy flows.
- The **"explain the house"** pattern appears on 5 of 8 sites (PEC, Grünauer, Sonnenmacher, SOLAR24, Voltovativ): a house with hotspots or wires. The best versions are interactive and state-based (SOLAR24 numbered tabs, Voltovativ flow tabs).
- **Funnels** range from 3 questions (Voltovativ WhatsApp) through about 6 steps (Sonnenmacher) to 12 steps (Solarland). Common questions: purpose or property type, interest, roof (type, age, area), consumption (kWh or €), storage yes/no, financing, timeline, PLZ/address, contact.
- **Trust signals that feel strongest:** Meisterbetrieb + town in the H1 or sub-line (ZEO, SOLAR24, Grünauer), concrete local proof (ZEO street list, SOLAR24 cluster map), process transparency (SOLAR24 no down payment and timeline), and real people (Grünauer, Sonnenmacher).
- **Anti-patterns:** stacked pop-ups on load (Grünauer job modal + cookies), off-topic AI imagery (MySolarExpress), 5+ competing CTAs, mega menus listing SKUs, superlative claims without proof, and hotspots that don't line up at other viewport widths (PEC).

---

## Design principles for Zolarbyte (Elektro-Meisterbetrieb Karlsfeld · PV, Wärmepumpe, Speicher · magenta #C71C84 on black)

1. **Electricians explain the system, not the product.** Make one interactive "Zolarbyte energy house" the centrepiece. Draw it as a black, line-based schematic in your own style, not a 3D clone. Show **magenta flow lines for electricity**, a warm secondary tone for heat, and a cool grey/white for ambient air. Use 3–4 state tabs (Sonne → Haus, Speicher am Abend, Wärmepumpe, Gesamtsystem) that dim what's irrelevant. Adopt the state-based idea; avoid always-on pulsing for its own sake.
2. **Motion must carry meaning.** Animate only energy (dashes flowing along a wire, a battery filling, a count-up of kWh or €), and only while the element is in view. Respect `prefers-reduced-motion` and fall back to a static diagram. No decorative parallax, no logo intro that delays content for 2–3 s.
3. **Make "Meister + Karlsfeld" the first fact, not a footnote.** Put the Meisterbetrieb, the town and the service radius (e.g. Dachau / Munich-North) in the hero sub-line. Back it with one strong local proof element, such as a map of the Landkreis Dachau / Munich region with aggregated installation dots, without exact addresses.
4. **Prefer transparency to superlatives.** Replace "best / cheapest" claims with verifiable promises: a timeline from order to commissioning, what happens at the on-site visit, payment terms, who installs (own electricians). The calm, plain-spoken SOLAR24 tone is the right register for a Meister business.
5. **One primary CTA verb across the whole site.** Choose one, e.g. "Anlage planen lassen", for the magenta button, plus at most one quiet secondary (phone or WhatsApp). Every product section ends in that same CTA, pre-filled with the product context.
6. **Short funnel first, depth later.** Ask 3–5 questions on one screen or in short steps: what you want (PV / storage / WP / combination, multi-select), property type, current heating, PLZ, timing. Then contact. Show visible progress, keep a back button, and auto-advance on single-choice tiles. Roof details, kWh and financing belong in the call or visit, not in a 12-step form.
7. **Calculators earn the lead by giving value first.** If you build a subsidy or savings calculator, show the result in full (big number, a stacked bar of how it is composed, assumptions, disclaimer) *before* asking for contact. Then offer "have it checked by our Meister" as the natural next step. Say clearly what data stays in the browser.
8. **Explain each product with one human sentence and one mechanism.** PV = "your roof makes the midday power", Speicher = "midday surplus for the evening", Wärmepumpe = "one kWh of power becomes several kWh of heat". Add 3 concrete deliverables per product (what Zolarbyte actually does). No component glossaries or SKU lists on the homepage.
9. **Use real imagery, label generated imagery.** Use own team, van, switch-cabinet and rooftop photos, colour-graded dark with magenta accents. If you use renderings or AI visuals, label them as symbolic images (SOLAR24 does this) and never use off-topic fantasy imagery.
10. **Nothing blocks the first view.** Use a compact, non-modal consent bar, no job or promo modals on load, and no stacked overlays. Recruiting gets its own quiet nav item.
11. **Organise navigation by situation, not by catalogue.** Examples: "Neue PV-Anlage", "Speicher nachrüsten", "Heizung ersetzen / Wärmepumpe", "Alles zusammen", plus Über uns / Kontakt. Five top items at most. Location pages can live in the footer for SEO.
12. **Hotspots and diagrams must hold at every breakpoint.** Build the house as a single SVG coordinate system, so labels, wires and hotspots scale together. On mobile, switch to a vertical step list instead of shrinking the diagram. PEC's hotspots drift off the drawing at mid widths.

*Note: Playwright saved snapshots, console logs and screenshots to its default output folder `c:\Users\Bagy\Documents\websites\Zolarbyte\.playwright-mcp\` (the tool would not write to the scratchpad). No project files were modified.*
