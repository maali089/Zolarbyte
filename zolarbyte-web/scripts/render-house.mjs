#!/usr/bin/env node
/**
 * Rendert Standbilder des Energiehauses (src/components/house) als transparente WebP nach public/renders/<id>.webp
 * – für Mega-Menü und Querverweise, wo ein animiertes SVG zu schwer wäre.
 * Kein Dev-Server nötig. Voraussetzung: `cwebp` installiert.
 *
 *   node scripts/render-house.mjs
 *   PLAYWRIGHT=/pfad/zu/node_modules node scripts/render-house.mjs
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pwRoot = process.env.PLAYWRIGHT ?? "/Users/paul/Documents/chauffeur/node_modules";
const { chromium } = createRequire(join(pwRoot, "x.js"))("playwright");

const svgSrc = readFileSync(join(root, "src/components/house/house-svg.ts"), "utf8");
const inner = svgSrc.slice(svgSrc.indexOf("`") + 1, svgSrc.lastIndexOf("`"));
const css = readFileSync(join(root, "src/components/house/energy-house.css"), "utf8");
const viewsSrc = readFileSync(join(root, "src/components/house/views.ts"), "utf8");

/** VIEWS/HIGHLIGHT aus views.ts lesen (einfaches Parsen der Literale). */
function record(name) {
  const block = viewsSrc.slice(viewsSrc.indexOf(`export const ${name}`));
  const body = block.slice(block.indexOf("{", block.indexOf("=")) + 1, block.indexOf("};"));
  const out = {};
  for (const m of body.matchAll(/^\s*"?([\w-]+)"?:\s*(\[[^\]]+\]|"[^"]+")/gm)) out[m[1]] = JSON.parse(m[2]);
  return out;
}
const VIEWS = record("VIEWS");
const HIGHLIGHT = record("HIGHLIGHT");

const ids = ["photovoltaik", "e-mobilitaet", "elektroinstallation", "kundendienst", "pruefung", "schulungen"];
const [W, H] = [800, 600]; // ×2 = 1600×1200

const html = (id) => `<!doctype html><html><head><style>
:root{--magenta:#c51c84;--kalk:#f1f2ee;--schiefer:#15171c;--rule:rgba(21,23,28,.14);--ease-out:cubic-bezier(.16,1,.3,1);--ease-in-out:cubic-bezier(.65,0,.35,1)}
html,body{margin:0;background:transparent}
.wrap{width:${W}px;height:${H}px}
${css}
.ehouse *, .ehouse { animation: none !important; transition: none !important; }
</style></head><body><div class="wrap"><div class="ehouse" data-focus="${HIGHLIGHT[id]}" data-time="day">
<svg class="ehouse__svg" viewBox="${VIEWS[id].join(" ")}" preserveAspectRatio="xMidYMid meet">${inner}</svg>
</div></div></body></html>`;

const tmp = mkdtempSync(join(tmpdir(), "zb-house-"));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
for (const id of ids) {
  const file = join(tmp, `${id}.html`);
  writeFileSync(file, html(id));
  await page.goto(`file://${file}`);
  const png = join(tmp, `${id}.png`);
  await page.locator(".wrap").screenshot({ path: png, omitBackground: true });
  const out = join(root, "public/renders", `${id}.webp`);
  execFileSync("cwebp", ["-quiet", "-q", "84", "-alpha_q", "90", png, "-o", out]);
  unlinkSync(png);
  console.log("✓", out.replace(root + "/", ""));
}
await browser.close();
