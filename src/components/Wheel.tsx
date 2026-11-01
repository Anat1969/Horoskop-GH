import { useMemo, useState } from 'react';
import { SIGNS } from '../data/content';
import { CONSTELLATIONS, precessionShift, span, sunLongitude } from '../lib/astro';

// גלגל המזלות כאסטרולב: טבעת חיצונית של 12 מזלות שווים (30°), טבעת פנימית של קבוצות הכוכבים
// ברוחבן האמיתי. ההפרש ביניהן הוא נקיפת השוויונות.
const rad = (d: number) => (d * Math.PI) / 180;
// אורך 0 בצד שמאל, והאורך גדל נגד כיוון השעון, כמו במפת שמיים.
const pt = (lon: number, r: number): [number, number] => [-r * Math.cos(rad(lon)), r * Math.sin(rad(lon))];
function arc(a0: number, a1: number, r0: number, r1: number) {
  const large = (a1 - a0 + 360) % 360 > 180 ? 1 : 0;
  const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0);
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 0 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 1 ${x3},${y3}Z`;
}

interface Props { year?: number; date?: Date; active?: string | null; activeEl?: string | null; onPick?: (id: string) => void; showSun?: boolean; showStars?: boolean; spin?: boolean; title?: string }
export function Wheel({ year, date = new Date(), active, activeEl, onPick, showSun = true, showStars = true, spin = false, title = 'גלגל המזלות וקבוצות הכוכבים' }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const y = year ?? date.getFullYear() + date.getMonth() / 12;
  const shift = precessionShift(y);
  const sun = sunLongitude(date);
  const on = hover ?? active ?? null;
  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => {
    const a = (i * 137.508) % 360, r = 30 + ((i * 53) % 150);
    return { p: pt(a, r), s: 0.4 + ((i * 7) % 10) / 12 };
  }), []);

  return (
    <svg viewBox="-300 -300 600 600" role="img" aria-label={title} style={{ direction: 'ltr', width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <radialGradient id="w-bg"><stop offset="0" stopColor="#1f2752" /><stop offset="1" stopColor="#0a0e22" /></radialGradient>
        <linearGradient id="w-brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1d38a" /><stop offset=".5" stopColor="#b8913b" /><stop offset="1" stopColor="#7b5d1d" /></linearGradient>
      </defs>
      <circle r="296" fill="url(#w-brass)" />
      <circle r="286" fill="url(#w-bg)" />
      {showStars && stars.map((s, i) => <circle key={i} cx={s.p[0]} cy={s.p[1]} r={s.s} fill="#fff" opacity={0.25 + s.s / 2} />)}
      {/* טבעת המזלות */}
      <g className={spin ? 'wheel-in' : undefined}>
        {SIGNS.map((s, i) => {
          const a0 = i * 30, a1 = a0 + 30, mid = a0 + 15;
          const isOn = on === s.id || (!hover && !!activeEl && s.elc === activeEl);
          const [gx, gy] = pt(mid, 252), [nx, ny] = pt(mid, 222);
          return (
            <g key={s.id} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onClick={() => onPick?.(s.id)}
              style={{ cursor: onPick ? 'pointer' : 'default' }} role={onPick ? 'button' : undefined} aria-label={s.n} tabIndex={onPick ? 0 : undefined}
              onKeyDown={(e) => { if (e.key === 'Enter') onPick?.(s.id); }}>
              <path d={arc(a0, a1, 200, 282)} fill={`var(--${s.elc})`}
                opacity={on || (activeEl && !hover) ? (isOn ? 0.95 : 0.28) : 0.62} stroke="#0a0e22" strokeWidth="1.5" style={{ transition: 'opacity .2s' }} />
              <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize="24" fill="#fff" fontFamily="var(--glyph)">{s.sym + '︎'}</text>
              <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="#fff" fontWeight={isOn ? 700 : 500} fontFamily="var(--sans)" style={{ direction: 'rtl' }}>{s.n.replace(/[֑-ׇ]/g, '')}</text>
            </g>
          );
        })}
      </g>
      <circle r="200" fill="none" stroke="url(#w-brass)" strokeWidth="3" />
      {/* טבעת קבוצות הכוכבים, מוזזת לפי השנה */}
      <g>
        {CONSTELLATIONS.map((c) => {
          const a0 = c.from + shift, a1 = a0 + span(c), mid = a0 + span(c) / 2;
          const isOn = on === c.id;
          const [tx, ty] = pt(mid, 168);
          return (
            <g key={c.id}>
              <path d={arc(a0, a1, 140, 196)} fill={c.id === 'ophiuchus' ? '#3a2e5c' : '#1b2350'} opacity={isOn ? 1 : 0.9}
                stroke={isOn ? '#ffe36b' : '#d8b25a'} strokeWidth={isOn ? 2 : 0.8} />
              {span(c) > 9 && <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={span(c) > 20 ? 12 : 10} fill={isOn ? '#ffe36b' : '#cfd3ea'} fontFamily="var(--sans)" style={{ direction: 'rtl' }}>{c.he}</text>}
            </g>
          );
        })}
      </g>
      <circle r="140" fill="none" stroke="url(#w-brass)" strokeWidth="2" />
      {/* קו השוויון האביבי (0°) */}
      <line x1={-286} y1={0} x2={-120} y2={0} stroke="#ffe36b" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x={-118} y={-8} fontSize="11" fill="#ffe36b" fontFamily="var(--mono)">0°</text>
      {/* השמש היום */}
      {showSun && (() => {
        const [sx, sy] = pt(sun, 120), [ex, ey] = pt(sun, 286);
        return (
          <g>
            <line x1={0} y1={0} x2={ex} y2={ey} stroke="#ffe36b" strokeWidth="1.5" opacity=".8" />
            <circle cx={sx} cy={sy} r="12" fill="#ffe36b" />
            <circle cx={sx} cy={sy} r="20" fill="#ffe36b" opacity=".18" />
          </g>
        );
      })()}
      <circle r="60" fill="#0a0e22" stroke="url(#w-brass)" strokeWidth="2" />
      <text y="-8" textAnchor="middle" fontSize="12" fill="#cfd3ea" fontFamily="var(--sans)" style={{ direction: 'rtl' }}>חיצוני: מזלות</text>
      <text y="12" textAnchor="middle" fontSize="12" fill="#cfd3ea" fontFamily="var(--sans)" style={{ direction: 'rtl' }}>פנימי: כוכבים</text>
    </svg>
  );
}
