import { useState } from 'react';
import { SIGNS, type Sign } from '../data/content';
import { allFrom, byId, harmonyColor, metrics, plainName, relation } from '../lib/relations';
import { ASPECT_ICON, Icon } from './Icon';
import { Glyph } from './Glyph';
import { ElTag } from './Grammar';

const rad = (d: number) => (d * Math.PI) / 180;
const pt = (lon: number, r: number): [number, number] => [-r * Math.cos(rad(lon)), r * Math.sin(rad(lon))];
const mid = (id: string) => SIGNS.findIndex((s) => s.id === id) * 30 + 15;

/** מקרא הסקאלה: מהמותח לזורם. */
export function HarmonyKey() {
  const steps: [number, string][] = [[-1.5, 'מתח חזק'], [-1, 'מתח'], [0, 'ניטרלי'], [1.5, 'זרימה'], [2, 'זרימה חזקה']];
  return (
    <div className="hkey" aria-label="מקרא טיב הקשר">
      {steps.map(([h, t]) => <span key={t}><i style={{ background: harmonyColor(h) }} />{t}</span>)}
      <span className="src">עובי הקו: עוצמה</span>
    </div>
  );
}

/** קורנת יחסים: מבנה אחד מול כל אחד עשר האחרים. צבע = טיב, עובי = עוצמה. */
export function RelRadial({ a, onPick }: { a: Sign; onPick?: (id: string) => void }) {
  const [hov, setHov] = useState<string | null>(null);
  const list = allFrom(a);
  const [ax, ay] = pt(mid(a.id), 150);
  return (
    <svg viewBox="-260 -260 520 520" role="img" aria-label={`${plainName(a)} מול כל המזלות`} style={{ width: '100%', height: 'auto', direction: 'ltr', display: 'block' }}>
      <circle r="250" fill="#fff" stroke="var(--g-200)" />
      {[50, 100, 150].map((r) => <circle key={r} r={r} fill="none" stroke="var(--g-150)" />)}
      {list.map(({ s, m }) => {
        const [x, y] = pt(mid(s.id), 150);
        const on = hov === s.id;
        return <path key={s.id} d={`M${ax},${ay} Q0,0 ${x},${y}`} fill="none" stroke={harmonyColor(m.harmony)} strokeWidth={1 + m.intensity * 2.2} opacity={hov && !on ? 0.15 : 0.95} strokeLinecap="round" style={{ transition: 'opacity .15s' }} />;
      })}
      {SIGNS.map((s) => {
        const [x, y] = pt(mid(s.id), 150), [lx, ly] = pt(mid(s.id), 205);
        const self = s.id === a.id, m = self ? null : metrics(a, s);
        return (
          <g key={s.id} onMouseEnter={() => setHov(s.id)} onMouseLeave={() => setHov(null)} onClick={() => !self && onPick?.(s.id)}
            role={!self && onPick ? 'button' : undefined} tabIndex={!self && onPick ? 0 : undefined} aria-label={self ? undefined : `${plainName(a)} ו${plainName(s)}: ${relation(a, s).name}`}
            onKeyDown={(e) => { if (e.key === 'Enter' && !self) onPick?.(s.id); }} style={{ cursor: !self && onPick ? 'pointer' : 'default' }}>
            <title>{self ? plainName(s) : `${plainName(s)} · ${relation(a, s).name} ${relation(a, s).deg}° · לחיצה לניתוח`}</title>
            <circle cx={x} cy={y} r={self ? 26 : 19} fill={self ? `var(--${s.elc})` : '#fff'} stroke={`var(--${s.elc})`} strokeWidth={self ? 0 : 2} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={self ? 24 : 18} fill={self ? `var(--${s.elc}-on)` : `var(--${s.elc})`} fontFamily="var(--glyph)">{s.sym + '︎'}</text>
            <text x={lx} y={ly - 8} textAnchor="middle" fontSize="13" fontWeight={hov === s.id ? 500 : 300} style={{ direction: 'rtl' }}>{plainName(s)}</text>
            {m && <text x={lx} y={ly + 9} textAnchor="middle" fontSize="11" fill="var(--g-600)" fontFamily="var(--mono)">{relation(a, s).deg}°</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** פסי טיב מתפצלים: מהזורם ביותר למותח ביותר. */
export function RelBars({ a, onPick }: { a: Sign; onPick?: (id: string) => void }) {
  return (
    <ol className="relbars">
      <li className="relbars-head" aria-hidden="true"><span /><span className="src" style={{ display: 'flex', justifyContent: 'space-between' }}><span>מותח</span><span>זורם</span></span><span /><span className="src">עוצמה</span></li>
      {allFrom(a).map(({ s, r, m }) => (
        <li key={s.id}>
          <button className="relbar-row" onClick={() => onPick?.(s.id)} data-tip={`${r.name}: ${r.rule}`}>
            <span className="rb-name"><Glyph sym={s.sym} color={`var(--${s.elc})`} size={16} /> {plainName(s)}</span>
            <span className="rb-track">
              <span className="rb-axis" />
              <span className="rb-bar" style={{ background: harmonyColor(m.harmony), width: `${Math.abs(m.harmony) / 2 * 50}%`, [m.harmony >= 0 ? 'left' : 'right']: '50%' } as React.CSSProperties} />
            </span>
            <span className="rb-asp"><Icon n={ASPECT_ICON[r.deg]} size={15} />{r.name}</span>
            <span className="rb-int" aria-label={`עוצמה ${m.intensity} מתוך 2`}>{[0, 1, 2, 3].map((k) => <i key={k} className={k < m.intensity * 2 ? 'on' : ''} />)}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

/** מטריצת 12×12: כל 66 הקשרים במבט אחד. */
export function RelMatrix({ a, b, onPick }: { a?: string; b?: string; onPick: (a: string, b: string) => void }) {
  const [hov, setHov] = useState<[string, string] | null>(null);
  return (
    <div className="matrix-wrap">
      <table className="relmatrix" aria-label="מטריצת הקשרים">
        <thead><tr><th />{SIGNS.map((s) => <th key={s.id} className={hov?.[1] === s.id ? 'on' : ''} title={plainName(s)}><Glyph sym={s.sym} color={`var(--${s.elc})`} size={15} /></th>)}</tr></thead>
        <tbody>
          {SIGNS.map((r) => (
            <tr key={r.id}>
              <th className={hov?.[0] === r.id ? 'on' : ''}><span className="rm-name">{plainName(r)}</span> <Glyph sym={r.sym} color={`var(--${r.elc})`} size={15} /></th>
              {SIGNS.map((c) => {
                const self = r.id === c.id, rel = relation(r, c), m = metrics(r, c);
                const sel = (a === r.id && b === c.id) || (a === c.id && b === r.id);
                return (
                  <td key={c.id} onMouseEnter={() => setHov([r.id, c.id])} onMouseLeave={() => setHov(null)}>
                    {self ? <span className="rm-self" style={{ background: `var(--${r.elc})` }} /> : (
                      <button className={'rm-cell' + (sel ? ' sel' : '') + (hov && (hov[0] === r.id || hov[1] === c.id) ? ' hl' : '')}
                        style={{ background: harmonyColor(m.harmony) }} aria-label={`${plainName(r)} ו${plainName(c)}: ${rel.name}`} title={`${plainName(r)} · ${plainName(c)}: ${rel.name} ${rel.deg}°`}
                        onClick={() => onPick(r.id, c.id)}>
                        <Icon n={ASPECT_ICON[rel.deg]} size={12} color={Math.abs(m.harmony) >= 1.5 ? '#fff' : '#111'} />
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** מדדי זוג: ארבעה מדדים גרפיים במקום פסקה. */
export function PairMeters({ a, b }: { a: Sign; b: Sign }) {
  const m = metrics(a, b);
  const dots = (v: number, max: number, color: string) => <span className="dots">{Array.from({ length: max }, (_, k) => <i key={k} style={{ background: k < v ? color : undefined }} />)}</span>;
  return (
    <div className="meters">
      <div className="meter">
        <span className="label">טיב</span>
        <div className="div-track"><span className="rb-axis" /><span className="rb-bar" style={{ background: harmonyColor(m.harmony), width: `${Math.abs(m.harmony) / 2 * 50}%`, [m.harmony >= 0 ? 'left' : 'right']: '50%' } as React.CSSProperties} /></div>
        <span className="src">{m.harmony > 0 ? 'זורם' : m.harmony < 0 ? 'מותח' : 'ניטרלי'}</span>
      </div>
      <div className="meter"><span className="label">עוצמה</span>{dots(m.intensity * 2, 4, 'var(--black)')}<span className="src">{m.intensity >= 2 ? 'סוערת' : m.intensity >= 1 ? 'בינונית' : 'שקטה'}</span></div>
      <div className="meter"><span className="label">דמיון</span><span className="sim">
        <span className={a.elc === b.elc ? 'on' : ''}><ElTag el={a.elc} name={false} size={14} />יסוד</span>
        <span className={a.mo === b.mo ? 'on' : ''}>אופן</span></span><span className="src">{m.similarity}/2</span></div>
      <div className="meter"><span className="label">השלמה</span>{dots(m.complement, 2, 'var(--pos)')}<span className="src">{m.complement === 2 ? 'משלימים' : m.complement === 1 ? 'חלקית' : 'חופפים'}</span></div>
    </div>
  );
}
export { byId };
