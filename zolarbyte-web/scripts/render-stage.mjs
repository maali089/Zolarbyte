#!/usr/bin/env node
/**
 * Rendert Ansichten der Haus-Maquette (src/components/stage) als transparente WebP nach public/renders/.
 * Voraussetzung: Dev-Server läuft (Standard http://localhost:3100) und `cwebp` ist installiert.
 *
 *   node scripts/render-stage.mjs                 # alle Presets
 *   node scripts/render-stage.mjs hero pv         # nur ausgewählte
 *   BASE=http://localhost:3100 PLAYWRIGHT=/pfad/zu/node_modules node scripts/render-stage.mjs
 *
 * Playwright wird aus PLAYWRIGHT (Standard: /Users/paul/Documents/chauffeur/node_modules) geladen,
 * da es im Projekt nicht installiert ist.
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "renders");
const base = process.env.BASE ?? "http://localhost:3100";
const pwRoot = process.env.PLAYWRIGHT ?? "/Users/paul/Documents/chauffeur/node_modules";
const { chromium } = createRequire(join(pwRoot, "x.js"))("playwright");

/** id → { hour (Standard: Preset), size [w,h] in CSS-px (Ausgabe = ×2), labels } */
const JOBS = {
  hero: { size: [960, 600], labels: 0, shift: 1 }, // 1920×1200, Motiv rechts wie auf der Startseite
  "hero-mobile": { size: [500, 500], labels: 0, preset: "hero" },
  photovoltaik: { size: [800, 600], labels: 0, mask: 1 },
  "e-mobilitaet": { size: [800, 600], labels: 0, mask: 1 },
  elektroinstallation: { size: [800, 600], labels: 0, mask: 1 },
  kundendienst: { size: [800, 600], labels: 0, mask: 1 },
  pruefung: { size: [800, 600], labels: 0, mask: 1 },
  schulungen: { size: [800, 600], labels: 1, mask: 1 },
};

const want = process.argv.slice(2);
const ids = want.length ? want : Object.keys(JOBS);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

const HIDE = `
  html,body{background:transparent!important}
  body::before,body::after,html::before,html::after{display:none!important}
  body *{visibility:hidden!important}
  .stage-lab-frame,.stage-lab-frame *{visibility:visible!important}
  nextjs-portal{display:none!important}
`;

for (const id of ids) {
  const job = JOBS[id];
  if (!job) throw new Error(`Unbekannte Ansicht: ${id}`);
  const [w, h] = job.size;
  const png = join(out, `${id}.png`);
  const webp = join(out, `${id}.webp`);
  let ok = false;
  for (let attempt = 0; attempt < 3 && !ok; attempt++) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    await page.goto(`${base}/intern/labor/stage?preset=${job.preset ?? id}&labels=${job.labels}&transparent=1${job.shift ? "&shift=1" : ""}${job.mask ? "&mask=1" : ""}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page.waitForSelector('.house-stage[data-ready="true"]', { timeout: 90000 });
    await page.addStyleTag({ content: HIDE });
    await page.waitForTimeout(2500);
    await page.locator(".stage-lab-frame").screenshot({ path: png, omitBackground: true });
    await ctx.close();
    ok = statSync(png).size > 40_000; // leeres Bild wäre winzig → erneut versuchen
  }
  if (!ok) throw new Error(`Render ${id} blieb leer`);
  // 3× supersampled → auf Zielgröße (2× CSS-Größe) herunterskalieren: glatte Kanten
  execFileSync("cwebp", ["-quiet", "-q", "82", "-alpha_q", "90", "-m", "6", "-resize", String(w * 2), String(h * 2), png, "-o", webp]);
  unlinkSync(png);
  console.log(`${id}.webp  ${(statSync(webp).size / 1024).toFixed(0)} KB`);
}
await browser.close();

writeFileSync(
  join(out, "README.txt"),
  `Renderings der Haus-Maquette (Zolarbyte)\n\nHerkunft: gerendert aus src/components/stage (eigene prozedurale Three.js-Szene, keine Fremdmodelle, keine Fremdtexturen),\nper scripts/render-stage.mjs (Playwright/Chromium, SwiftShader), transparenter Hintergrund, WebP q82.\nRendering mit 3x Supersampling (MSAA + Downscale auf 1600x1200 bzw. Hero 1920x1200), Motiv vollständig inkl. Bodenschatten, nur seitlich/oben weicher Auslauf.\nStand: ${new Date().toISOString().slice(0, 10)}\nNeu erzeugen: Dev-Server starten, dann "node scripts/render-stage.mjs".\n`,
);
