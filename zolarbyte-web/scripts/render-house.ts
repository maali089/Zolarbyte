/**
 * Vorschau des Energiehauses als PNG (ohne Browser).
 * Aufruf: node scripts/render-house.ts [ausgabe.png] [day|evening]
 */
import sharp from "sharp";
import { buildHouseSvg, HERO, VIEW_H, VIEW_W } from "../src/components/house/geometry.ts";

const out = process.argv[2] ?? "house-preview.png";
const evening = process.argv[3] === "evening";
const hero = process.argv[4] === "hero";

const style = `
.flow__base{stroke:#c71c84;stroke-width:2;opacity:.45}
.flow__pulse{stroke:#ff5cb8;stroke-width:3.2;stroke-dasharray:6 94;stroke-dashoffset:-40}
.f-grid .flow__base{stroke-dasharray:5 6;opacity:.35;stroke:#d9d9df}
.f-grid .flow__pulse{display:none}
.heat__line{stroke:#f0a868;stroke-width:2.4;stroke-dasharray:0.1 7;stroke-linecap:round}
.heat__env{stroke:#9fd3e6;stroke-width:1.6;stroke-dasharray:0.1 6;opacity:.8}
.hl{display:none}
.h-night{opacity:${evening ? 0.55 : 0}}
.h-lamp{opacity:${evening ? 1 : 0.5}}
.h-glow{opacity:${evening ? 0.85 : 0}}
.h-sheen{opacity:0}
`;

const vb = hero ? HERO.viewBox : `0 0 ${VIEW_W} ${VIEW_H}`;
const [, , vw, vh] = vb.split(" ").map(Number);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${vw * 1.4}" height="${vh * 1.4}"><style>${style}</style><rect x="-5000" y="-5000" width="10000" height="10000" fill="#050506"/>${buildHouseSvg("p-", { backdrop: hero })}</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`geschrieben: ${out} (${VIEW_W}×${VIEW_H}, ${(svg.length / 1024).toFixed(1)} KB SVG)`);
