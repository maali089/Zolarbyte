/**
 * Fortschritt als Sonnenbahn: dünner Bogen mit drei Punkten.
 * Aktiv = Amber, erledigt = Magenta, offen = Kontur. Erledigte Schritte sind anklickbar (Zurück ohne Datenverlust).
 */
const W = 300;
const H = 76;
// Quadratische Kurve P0(20,64) – Kontrolle(150,-20) – P2(280,64); Scheitel bei y = 22
const POINTS = [
  { x: 20, y: 64 },
  { x: 150, y: 22 },
  { x: 280, y: 64 },
];
const ARC = "M20 64 Q150 -20 280 64";

export function SunArcProgress({
  labels,
  current,
  onGo,
}: {
  labels: string[];
  current: number;
  onGo: (index: number) => void;
}) {
  const progress = current / (labels.length - 1);
  return (
    <div className="as-arc" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="as-arc__svg" aria-hidden="true" focusable="false">
        <path d={ARC} className="as-arc__track" fill="none" pathLength={1} />
        <path
          d={ARC}
          className="as-arc__done"
          fill="none"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
        />
        {POINTS.map((p, i) => (
          <g key={i}>
            <line x1={p.x} y1={p.y + 9} x2={p.x} y2={H} className="as-arc__tick" />
            {i === current ? <circle cx={p.x} cy={p.y} r="12" className="as-arc__halo" /> : null}
            <circle
              cx={p.x}
              cy={p.y}
              r={i === current ? 7 : 5.5}
              className={i === current ? "as-arc__dot is-active" : i < current ? "as-arc__dot is-done" : "as-arc__dot"}
            />
          </g>
        ))}
      </svg>
      <ol className="as-arc__labels">
        {labels.map((label, i) => (
          <li key={label} aria-current={i === current ? "step" : undefined}>
            {i < current ? (
              <button type="button" onClick={() => onGo(i)} aria-label={`Zurück zu Schritt ${i + 1}: ${label}`}>
                <span className="as-arc__num">{i + 1}</span> {label}
              </button>
            ) : (
              <span className={i === current ? "is-current" : undefined}>
                <span className="as-arc__num">{i + 1}</span> {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
