import { SIGNS } from '../data/content';
import { kindOf, relation, byId, type Kind } from '../lib/relations';

// גלגל קשרים: 12 מבנים, ומיתרים בין מבנים. סוג הקו = סוג הקשר.
const rad = (d: number) => (d * Math.PI) / 180;
const pt = (lon: number, r: number): [number, number] => [-r * Math.cos(rad(lon)), r * Math.sin(rad(lon))];
const mid = (id: string) => SIGNS.findIndex((s) => s.id === id) * 30 + 15;
function arc(a0: number, a1: number, r0: number, r1: number) {
  const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0);
  return `M${x0},${y0} A${r1},${r1} 0 0 0 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 1 ${x3},${y3}Z`;
}
export const KIND_STYLE: Record<Kind, { w: number; dash?: string; c: string }> = {
  flow: { w: 2.2, c: '#111' },
  tension: { w: 1.6, dash: '7 5', c: '#111' },
  neutral: { w: 1.2, dash: '1.5 4', c: '#6e6e6e' },
};
export interface Person { id: string; name: string; sign: string }

export function BondWheel({ picks = [], people = [], links, onPick, label }: { picks?: string[]; people?: Person[]; links?: [string, string][]; onPick?: (id: string) => void; label: string }) {
  const L = links ?? (picks.length === 2 ? [[picks[0], picks[1]] as [string, string]] : []);
  const stack: Record<string, number> = {};
  return (
    <svg viewBox="-300 -300 600 600" role="img" aria-label={label} style={{ direction: 'ltr', width: '100%', height: 'auto', display: 'block' }}>
      <circle r="290" fill="#fff" stroke="#111" strokeWidth="1" />
      {SIGNS.map((s, i) => {
        const a0 = i * 30, a1 = a0 + 30, on = picks.includes(s.id);
        const [gx, gy] = pt(a0 + 15, 258), [nx, ny] = pt(a0 + 15, 226);
        return (
          <g key={s.id} role={onPick ? 'button' : undefined} tabIndex={onPick ? 0 : undefined} aria-label={s.n} aria-pressed={onPick ? on : undefined}
            onClick={() => onPick?.(s.id)} onKeyDown={(e) => { if (e.key === 'Enter') onPick?.(s.id); }} style={{ cursor: onPick ? 'pointer' : 'default' }}>
            <path d={arc(a0, a1, 204, 286)} fill={on ? '#111' : `var(--${s.elc})`} opacity={picks.length && !on ? 0.35 : 1} stroke="#fff" strokeWidth="2" style={{ transition: 'opacity .2s, fill .2s' }} />
            <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize="22" fill={on ? '#fff' : `var(--${s.elc}-on)`} fontFamily="var(--glyph)">{s.sym + '︎'}</text>
            <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight={on ? 500 : 300} fill={on ? '#fff' : `var(--${s.elc}-on)`} style={{ direction: 'rtl' }}>{s.n.replace(/[֑-ׇ]/g, '')}</text>
          </g>
        );
      })}
      <circle r="204" fill="#fafafa" stroke="#111" strokeWidth=".75" />
      {L.map(([a, b], k) => {
        const ka = kindOf(relation(byId[a], byId[b]).deg), st = KIND_STYLE[ka];
        if (a === b) { const [x, y] = pt(mid(a), 184); return <circle key={k} cx={x} cy={y} r="14" fill="none" stroke={st.c} strokeWidth={st.w} strokeDasharray={st.dash} />; }
        const [x1, y1] = pt(mid(a), 198), [x2, y2] = pt(mid(b), 198);
        return <path key={k} d={`M${x1},${y1} Q0,0 ${x2},${y2}`} fill="none" stroke={st.c} strokeWidth={st.w} strokeDasharray={st.dash} opacity={L.length > 1 ? 0.75 : 1} />;
      })}
      {picks.length === 2 && (() => {
        const r = relation(byId[picks[0]], byId[picks[1]]);
        return (<g><circle r="46" fill="#fff" stroke="#111" strokeWidth=".75" />
          <text y="-8" textAnchor="middle" fontSize="22" fontWeight="300" fontFamily="var(--mono)">{r.deg}°</text>
          <text y="16" textAnchor="middle" fontSize="13" fontWeight="300" style={{ direction: 'rtl' }}>{r.name}</text></g>);
      })()}
      {people.map((p) => {
        const k = (stack[p.sign] = (stack[p.sign] ?? 0) + 1) - 1;
        const [x, y] = pt(mid(p.sign), 186 - k * 20);
        return (<g key={p.id}><circle cx={x} cy={y} r="4" fill="#111" />
          <text x={x} y={y - 9} textAnchor="middle" fontSize="12" fontWeight="400" style={{ direction: 'rtl', paintOrder: 'stroke', stroke: '#fafafa', strokeWidth: 3 }}>{p.name}</text></g>);
      })}
    </svg>
  );
}
