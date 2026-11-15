/**
 * Heliostat-Feld: viele kleine Module, die sich wie nachgeführte Solarpaneele
 * zur Lichtquelle drehen. Lichtquelle = Mauszeiger (fine pointer), sonst die
 * Sonne des Sonnenbogens (DOM) bzw. eine virtuelle Sonne nach Tageszeit.
 *
 * Canvas2D, gebündelte Pfade, Feder-Trägheit pro Modul, rAF nur solange sich etwas bewegt.
 * Reduced Motion: statisch ausgerichtet, ohne Animation.
 */
import { arcProgress, daylight, dusk } from "@/lib/daylight";

type Mod = { x: number; y: number; a: number; v: number; boost: number };
type Ripple = { x: number; y: number; t0: number };

const TAU = Math.PI * 2;

function shortest(from: number, to: number) {
  let d = (to - from) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export function createSunField(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const mq = (q: string) => window.matchMedia(q).matches;
  const reduce = mq("(prefers-reduced-motion: reduce)");
  const fine = mq("(hover: hover) and (pointer: fine)");
  const coarse = !fine;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let mods: Mod[] = [];
  let spacing = 44;

  let pointer: { x: number; y: number } | null = null;
  let tapLight: { x: number; y: number; until: number } | null = null;
  const ripples: Ripple[] = [];
  let light = { x: 0, y: 0 };
  let raf = 0;
  let lastDraw = 0;
  let night = document.documentElement.dataset.ground === "night";

  const build = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    spacing = w < 720 ? 44 : 56;
    mods = [];
    const rowH = spacing * 0.866; // gestaffelt wie ein Solarpark
    let row = 0;
    for (let y = rowH / 2; y < h + rowH; y += rowH, row++) {
      const off = row % 2 ? spacing / 2 : 0;
      for (let x = off; x < w + spacing; x += spacing) {
        mods.push({ x, y, a: -Math.PI / 2, v: 0, boost: 0 });
      }
    }
    computeLight();
    // Startausrichtung direkt setzen (kein Einschwingen beim Laden)
    for (const m of mods) m.a = targetAngle(m);
  };

  /** Lichtquelle bestimmen: Zeiger > Tap > Sonne im DOM > virtuelle Sonne. */
  const computeLight = () => {
    const now = performance.now();
    if (pointer) {
      light = pointer;
      return;
    }
    if (tapLight && tapLight.until > now) {
      light = tapLight;
      return;
    }
    const sun = document.querySelector<HTMLElement>(".arc__sun");
    if (sun) {
      const r = sun.getBoundingClientRect();
      if (r.bottom > 0 && r.top < h && r.width > 0) {
        light = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        return;
      }
    }
    const p = arcProgress(daylight.get());
    light = { x: w * (0.08 + p * 0.84), y: h * (0.62 - Math.sin(p * Math.PI) * 0.75) };
  };

  // Modul steht quer zur Lichtrichtung (Fläche zeigt zur Sonne)
  const targetAngle = (m: Mod) => Math.atan2(light.y - m.y, light.x - m.x) + Math.PI / 2;

  const draw = (t: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const evening = dusk(daylight.get());
    const active = pointer !== null || (tapLight !== null && tapLight.until > t);
    // Ohne Zeiger nur Ausrichtung zur Sonne, kaum Farbe – die Bogensonne soll nicht „brennen“
    const reach = active ? Math.max(260, Math.min(w, h) * 0.42) : 150;

    // Weicher Lichtschein an der Lichtquelle
    if (active) {
      const g = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, reach * 0.7);
      g.addColorStop(0, `rgba(242,162,12,${night ? 0.07 : 0.05})`);
      g.addColorStop(1, "rgba(242,162,12,0)");
      ctx.fillStyle = g;
      ctx.fillRect(light.x - reach, light.y - reach, reach * 2, reach * 2);
    }

    // In Bucket-Pfade sortieren: 0..3 neutral (nach Deckkraft), 4 Magenta, 5 Amber
    const buckets: Path2D[] = Array.from({ length: 6 }, () => new Path2D());
    const baseLen = spacing * 0.13;

    for (const m of mods) {
      const dx = light.x - m.x;
      const dy = light.y - m.y;
      const d = Math.hypot(dx, dy);
      const near = Math.max(0, 1 - d / reach); // 0 … 1
      const irr = near * near;
      // Panel von oben: Länge entlang m.a, Tiefe verkürzt sich, je flacher es zur Sonne steht
      const len = baseLen * (1 + irr * 0.55 + m.boost * 0.6);
      const depth = 1.1 + irr * 1.2 + m.boost * 0.8;
      const c = Math.cos(m.a);
      const s = Math.sin(m.a);
      let b: number;
      if (irr + m.boost > 0.55) b = 5;
      else if (irr + m.boost > 0.22) b = 4;
      else b = Math.min(3, Math.floor((near + m.boost) * 4));
      const path = buckets[b];
      const ux = c * len;
      const uy = s * len;
      const vx = -s * depth;
      const vy = c * depth;
      path.moveTo(m.x - ux - vx, m.y - uy - vy);
      path.lineTo(m.x + ux - vx, m.y + uy - vy);
      path.lineTo(m.x + ux + vx, m.y + uy + vy);
      path.lineTo(m.x - ux + vx, m.y - uy + vy);
      path.closePath();
    }

    const neutral = night ? "190,182,204" : "120,120,136";
    // Sehr zurückhaltend: Lesbarkeit hat Vorrang
    const alphas = night ? [0.06, 0.08, 0.11, 0.14] : [0.055, 0.075, 0.1, 0.13];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = `rgba(${neutral},${alphas[i] + evening * 0.03})`;
      ctx.fill(buckets[i]);
    }
    ctx.fillStyle = night ? "rgba(255,107,187,0.26)" : "rgba(197,28,132,0.18)";
    ctx.fill(buckets[4]);
    ctx.fillStyle = night ? "rgba(255,193,74,0.42)" : "rgba(226,146,8,0.32)";
    ctx.fill(buckets[5]);
  };

  const step = (t: number) => {
    raf = 0;
    if (coarse && t - lastDraw < 30) {
      raf = requestAnimationFrame(step);
      return;
    }
    lastDraw = t;
    computeLight();

    // Ripple-Wellen (Klick/Tap)
    for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i].t0 > 1600) ripples.splice(i, 1);

    let moving = ripples.length > 0 || (tapLight !== null && tapLight.until > t);
    for (const m of mods) {
      const da = shortest(m.a, targetAngle(m));
      // Nähe zur Quelle: schnellere Reaktion, Ferne: träge (wirkt wie Masse)
      const d = Math.hypot(light.x - m.x, light.y - m.y);
      const k = 0.05 + Math.max(0, 1 - d / 700) * 0.07;
      m.v = (m.v + da * k) * 0.8;
      m.a += m.v;

      let boost = 0;
      for (const r of ripples) {
        const radius = ((t - r.t0) / 1600) * 900;
        const rd = Math.hypot(m.x - r.x, m.y - r.y) - radius;
        boost += Math.exp(-(rd * rd) / 1800) * (1 - (t - r.t0) / 1600);
      }
      m.boost += (Math.min(1, boost) - m.boost) * 0.35;

      if (Math.abs(m.v) > 0.0006 || Math.abs(da) > 0.004 || m.boost > 0.01) moving = true;
    }

    draw(t);
    if (moving) raf = requestAnimationFrame(step);
  };

  const kick = () => {
    if (reduce) {
      computeLight();
      for (const m of mods) m.a = targetAngle(m);
      draw(performance.now());
      return;
    }
    if (!raf && !document.hidden) raf = requestAnimationFrame(step);
  };

  // ---------- Ereignisse ----------
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    pointer = { x: e.clientX, y: e.clientY };
    kick();
  };
  const onLeave = () => {
    pointer = null;
    kick();
  };
  const onDown = (e: PointerEvent) => {
    if (reduce) return;
    ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    if (e.pointerType !== "mouse") tapLight = { x: e.clientX, y: e.clientY, until: performance.now() + 1400 };
    kick();
  };
  let resizeT = 0;
  const onResize = () => {
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(() => {
      build();
      kick();
      if (!raf) draw(performance.now());
    }, 120);
  };
  const onVisibility = () => {
    if (!document.hidden) kick();
  };
  const groundObserver = new MutationObserver(() => {
    night = document.documentElement.dataset.ground === "night";
    kick();
  });

  build();
  draw(performance.now());
  kick();

  const unsubDay = daylight.subscribe(() => kick());
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  groundObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-ground"] });

  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(resizeT);
    unsubDay();
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("blur", onLeave);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("scroll", kick);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    groundObserver.disconnect();
  };
}
