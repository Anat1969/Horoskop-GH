import { SIGNS } from '../data/content';

// איור בהשראת פסיפס גלגל המזלות בבית אלפא (המאה ה-6): ריבוע, גלגל של 12, שמש במרכז, וארבע תקופות בפינות.
// זה איור שנבנה בקוד, לא צילום של הפסיפס.
const rad = (d: number) => (d * Math.PI) / 180;
const p = (a: number, r: number) => [Math.cos(rad(a)) * r, Math.sin(rad(a)) * r];
function seg(a0: number, a1: number, r0: number, r1: number) {
  const [x0, y0] = p(a0, r1), [x1, y1] = p(a1, r1), [x2, y2] = p(a1, r0), [x3, y3] = p(a0, r0);
  return `M${x0},${y0} A${r1},${r1} 0 0 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 0 ${x3},${y3}Z`;
}
const SEASONS: [string, number, number][] = [['ניסן', 1, -1], ['תמוז', -1, -1], ['תשרי', -1, 1], ['טבת', 1, 1]];
export function Mosaic() {
  return (
    <svg viewBox="-320 -320 640 640" role="img" aria-label="איור בהשראת פסיפס גלגל המזלות בבית אלפא" style={{ width: '100%', height: '100%', direction: 'ltr' }}>
      <defs>
        <pattern id="tess" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#000" opacity=".16" /></pattern>
        <pattern id="tess2" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><rect width="6" height="6" fill="#fff" opacity=".07" /></pattern>
      </defs>
      <rect x="-320" y="-320" width="640" height="640" fill="#c9b48a" />
      <rect x="-320" y="-320" width="640" height="640" fill="url(#tess)" />
      <rect x="-300" y="-300" width="600" height="600" fill="none" stroke="#5a3b1f" strokeWidth="8" />
      {SEASONS.map(([n, sx, sy]) => (
        <g key={n} transform={`translate(${sx * 250},${sy * 250})`}>
          <circle r="40" fill="#8a5a2c" /><circle r="40" fill="url(#tess2)" />
          <text textAnchor="middle" dominantBaseline="central" fill="#f5e9cf" fontSize="18" fontFamily="var(--serif)" fontWeight="700" style={{ direction: 'rtl' }}>{n}</text>
        </g>
      ))}
      <circle r="232" fill="#6b4425" />
      {SIGNS.map((s, i) => {
        const a0 = -90 - i * 30 - 15, a1 = a0 + 30, mid = a0 + 15;
        const [tx, ty] = p(mid, 178);
        let rot = (((mid + 90) % 360) + 360) % 360; if (rot > 90 && rot < 270) rot -= 180;
        return (
          <g key={s.id}>
            <path d={seg(a0, a1, 124, 226)} fill={`var(--${s.elc})`} opacity=".78" stroke="#3a2412" strokeWidth="3" />
            <path d={seg(a0, a1, 124, 226)} fill="url(#tess)" />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize="17" fill="#fff8e6" fontFamily="var(--serif)" fontWeight="700"
              transform={`rotate(${rot} ${tx} ${ty})`} style={{ direction: 'rtl' }}>{s.n.replace(/[֑-ׇ]/g, '')}</text>
          </g>
        );
      })}
      <circle r="120" fill="#20264f" stroke="#3a2412" strokeWidth="4" />
      <circle r="120" fill="url(#tess2)" />
      {Array.from({ length: 16 }, (_, i) => { const [x1, y1] = p(i * 22.5, 44), [x2, y2] = p(i * 22.5, 86); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffe36b" strokeWidth="5" strokeLinecap="square" />; })}
      <circle r="36" fill="#ffe36b" /><circle r="36" fill="url(#tess)" />
    </svg>
  );
}
