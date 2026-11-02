import { useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';
import { CULTURES, NAMES, TRANSMISSION } from '../data/cultures';
import { SIGNS } from '../data/content';
import { Purpose } from '../components/Purpose';
import { Glyph } from '../components/Glyph';
import { Hint, Opp, Param, Quote } from '../components/Grammar';
import { Icon } from '../components/Icon';
import { Rich } from '../lib/rich';
import { fmtYear } from '../lib/astro';

const W = 960, H = 470;
const topo = land110 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land);

// הצבירה במזרח התיכון מקבלת קווי הפניה, כדי שמספר לא יעלה על מספר.
const CALLOUT: Record<string, [number, number]> = { egypt: [-6, 58], babylon: [46, 46], greece: [-72, 10], jewish: [-36, -50], islam: [50, -44] };
const LEFT = new Set(['greece', 'jewish']);
function WorldMap({ act, setAct }: { act: string | null; setAct: (id: string | null) => void }) {
  const { path, pts, grat } = useMemo(() => {
    const box = { type: 'MultiPoint' as const, coordinates: [[-128, 8], [124, 8], [124, 60], [-128, 60]] };
    const proj = geoNaturalEarth1().fitExtent([[20, 20], [W - 20, H - 20]], box).clipExtent([[0, 0], [W, H]]);
    const path = geoPath(proj);
    const pts = Object.fromEntries(CULTURES.map((c) => [c.n, proj([c.lon, c.lat]) as [number, number]]));
    return { path, pts, grat: path(geoGraticule10()) ?? '' };
  }, []);
  const pos = (c: (typeof CULTURES)[number]): [number, number] => { const [x, y] = pts[c.n], o = CALLOUT[c.id]; return o ? [x + o[0], y + o[1]] : [x, y]; };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="מפת התרבויות ומסלולי העברת הידע" style={{ width: '100%', height: 'auto', display: 'block', direction: 'ltr' }}>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#111" /></marker>
        {TRANSMISSION.map(([f, t], i) => { const a = pos(CULTURES[f - 1]), b = pos(CULTURES[t - 1]); return (
          <linearGradient key={i} id={'tg' + i} gradientUnits="userSpaceOnUse" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}>
            <stop offset="0" stopColor="#c8c8c8" /><stop offset="1" stopColor="#111" />
          </linearGradient>); })}
      </defs>
      <rect width={W} height={H} fill="#fafafa" />
      <path d={grat} fill="none" stroke="#ececec" strokeWidth=".6" />
      <path d={path(LAND) ?? ''} fill="#e6e6e6" stroke="#c9c9c9" strokeWidth=".5" />
      {CULTURES.filter((c) => CALLOUT[c.id]).map((c) => { const [x, y] = pts[c.n], [px, py] = pos(c); return (
        <g key={'l' + c.id}><line x1={x} y1={y} x2={px} y2={py} stroke="#9a9a9a" strokeWidth=".8" /><circle cx={x} cy={y} r="2.5" fill="#111" /></g>); })}
      {TRANSMISSION.map(([f, t, label], i) => {
        const [x1, y1] = pos(CULTURES[f - 1]), [x2, y2] = pos(CULTURES[t - 1]);
        const d = Math.hypot(x2 - x1, y2 - y1), mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.max(24, d * 0.3);
        const on = act && (CULTURES[f - 1].id === act || CULTURES[t - 1].id === act);
        const k = 14 / d; // הקו נעצר בשפת העיגול
        return (
          <path key={i} d={`M${x1 + (mx - x1) * k},${y1 + (my - y1) * k} Q${mx},${my} ${x2 - (x2 - mx) * k},${y2 - (y2 - my) * k}`} fill="none" stroke={`url(#tg${i})`} strokeWidth={on ? 2.6 : 1.4}
            markerEnd="url(#arr)" opacity={act && !on ? 0.2 : 0.9}><title>{label}</title></path>
        );
      })}
      {CULTURES.map((c) => {
        const [x, y] = pos(c), on = act === c.id;
        const go = () => document.getElementById('c-' + c.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return (
          <g key={c.id} onMouseEnter={() => setAct(c.id)} onMouseLeave={() => setAct(null)} onClick={go}
            role="button" tabIndex={0} aria-label={`${c.n}. ${c.he}`} style={{ cursor: 'pointer' }} onKeyDown={(e) => { if (e.key === 'Enter') go(); }}>
            <circle cx={x} cy={y} r={on ? 15 : 12} fill={on ? '#111' : '#fff'} stroke="#111" strokeWidth="1.2" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontFamily="var(--mono)" fill={on ? '#fff' : '#111'}>{c.n}</text>
            <text x={LEFT.has(c.id) ? x - 18 : x + 18} y={y + 4} textAnchor={LEFT.has(c.id) ? 'start' : 'end'} fontSize="13" fontWeight={on ? 500 : 300}
              style={{ direction: 'rtl', paintOrder: 'stroke', stroke: '#fafafa', strokeWidth: 4, strokeLinejoin: 'round' }}>{c.he}</text>
          </g>
        );
      })}
    </svg>
  );
}

const T0 = -2200, T1 = 2100;
function Timeline({ act, setAct }: { act: string | null; setAct: (id: string | null) => void }) {
  const TW = 1000, rowH = 26, top = 30;
  const x = (y: number) => TW - 20 - ((y - T0) / (T1 - T0)) * (TW - 40); // הזמן זורם מימין לשמאל
  const ticks = [-2000, -1000, 1, 1000, 2000];
  return (
    <svg viewBox={`0 0 ${TW} ${top + CULTURES.length * rowH + 10}`} role="img" aria-label="ציר זמן של התרבויות" style={{ width: '100%', height: 'auto', display: 'block', direction: 'ltr' }}>
      {ticks.map((t) => (
        <g key={t}><line x1={x(t)} x2={x(t)} y1={18} y2={top + CULTURES.length * rowH} stroke="#e6e6e6" />
          <text x={x(t)} y={12} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill="#6e6e6e">{t === 1 ? '0' : t < 0 ? `${-t} לפנה"ס` : t}</text></g>
      ))}
      <line x1={x(2026)} x2={x(2026)} y1={18} y2={top + CULTURES.length * rowH} stroke="#111" strokeDasharray="2 3" />
      {CULTURES.map((c, i) => {
        const y = top + i * rowH, on = act === c.id;
        return (
          <g key={c.id} onMouseEnter={() => setAct(c.id)} onMouseLeave={() => setAct(null)} opacity={act && !on ? 0.35 : 1} style={{ transition: 'opacity .15s' }}>
            <rect x={x(c.to)} y={y} width={Math.max(4, x(c.from) - x(c.to))} height={rowH - 10} fill={on ? '#111' : '#8f8f8f'} />
            <text x={x(c.from) + 8} y={y + 12} fontSize="12" fontFamily="var(--mono)" fill="#111">{c.n}</text>
            {x(c.to) > 170
              ? <text x={x(c.to) - 8} y={y + 12} textAnchor="start" fontSize="13" fontWeight={on ? 500 : 300} style={{ direction: 'rtl' }}>{c.he}</text>
              : <text x={x(c.from) + 26} y={y + 12} textAnchor="end" fontSize="13" fontWeight={on ? 500 : 300} style={{ direction: 'rtl' }}>{c.he}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export function Cultures() {
  const [act, setAct] = useState<string | null>(null);
  return (
    <>
      <header className="page-head rise">
        <span className="label">תרבויות</span>
        <h1>אותו גלגל, תשע קריאות.</h1>
        <Rich className="explain" text={'כל תרבות הסתכלה על אותם כוכבים, ומדדה בהם **דבר אחר**: שעה, מדינה, אדם, שנה.\n==המזל הוא לא תוכן. הוא מסגרת שכל תרבות ממלאת.=='} />
      </header>
      <Purpose why={'להבין שהמזל הוא **תרגום**: כל תרבות קוראת אותו אחרת.'} how={'מרחפים על **מספר** במפה או בציר, וקוראים את הכרטיס.'} get={'השוואה במבט: **מה** כל תרבות מודדת, ו**איך** הידע נדד.'} />

      <section className="card">
        <div className="section-title"><h2>המפה והמסלול</h2><span className="label"><Icon n="map" size={14} /> מספר: סדר כרונולוגי · חץ: העברת ידע, מבהיר במקור לכהה ביעד</span></div>
        <WorldMap act={act} setAct={setAct} />
        <Hint>ריחוף על מספר מדגיש את התרבות במפה, בציר ובכרטיס. לחיצה גוללת לכרטיס.</Hint>
        <div className="section-title" style={{ marginTop: 20 }}><h2>ציר הזמן</h2><span className="label"><Icon n="time" size={14} /> הזמן זורם מימין לשמאל · קו מקווקו: היום</span></div>
        <Timeline act={act} setAct={setAct} />
      </section>

      <section className="pst">
        <div className="tone tone-insight"><h3>תובנה</h3><Rich text={'==הגלגל נדד מהמדינה, לאדם, ולטור בעיתון.==\nבכל תחנה הוא **הצטמצם**: מ-36 דקאנים למזל שמש אחד.'} /></div>
        <div className="tone tone-neutral"><h3>הפכים</h3><p><Opp a={<span><strong>4</strong> יסודות ביוון</span>} b={<span><strong>5</strong> יסודות בסין</span>} /></p><p><Opp a={<span>גלגל <strong>טרופי</strong> במערב</span>} b={<span>גלגל <strong>סידרי</strong> בהודו</span>} /></p></div>
        <div className="tone tone-problem"><h3>מה המדע מצא</h3><Rich text={'אין קשר בין מזל לאישיות (**Carlson**, **1985**).\nאבל תיאור כללי נשמע אישי: ציון **4.26** מתוך **5**.'} /></div>
      </section>

      <section className="card">
        <div className="section-title"><h2>השוואה במבט</h2><span className="label">מה כל תרבות מודדת בגלגל</span></div>
        <div className="table-wrap">
          <table className="dates cmp">
            <thead><tr><th>#</th><th>תרבות</th><th>מה נמדד</th><th>המערכת</th><th>איך קוראים</th></tr></thead>
            <tbody>{CULTURES.map((c) => (
              <tr key={c.id} className={act === c.id ? 'on' : ''} onMouseEnter={() => setAct(c.id)} onMouseLeave={() => setAct(null)}>
                <td><span className="step-n num">{c.n}</span></td>
                <td><strong>{c.he}</strong><span className="en">{c.en}</span></td>
                <td>{c.measures}</td><td><Rich as="span" text={c.system} /></td><td><Rich as="span" text={c.reads} /></td>
              </tr>))}</tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-title"><h2>אותו מזל, שש שפות</h2><span className="label">השם המקורי, ותרגומו בעברית</span></div>
        <div className="table-wrap">
          <table className="dates names">
            <thead><tr><th>עברית</th><th>יוונית</th><th>לטינית</th><th>בבלית</th><th>ערבית</th><th>סנסקריט</th></tr></thead>
            <tbody>{SIGNS.map((s) => { const n = NAMES[s.id]; return (
              <tr key={s.id} className={s.id === 'virgo' || s.id === 'aquarius' ? 'mark-row' : ''}>
                <td><Glyph sym={s.sym} color={`var(--${s.elc})`} size={16} /> <strong>{s.n}</strong></td>
                <td><span lang="el">{n.gr}</span><span className="src">{n.grHe}</span></td>
                <td>{s.en}</td>
                <td><span className="mono-s">{n.bab}</span><span className="src">{n.babHe}</span></td>
                <td><span lang="ar">{n.ar}</span><span className="src">{n.arHe}</span></td>
                <td><span lang="sa">{n.sa}</span><span className="src">{n.saHe}</span></td>
              </tr>); })}</tbody>
          </table>
        </div>
        <div className="pst" style={{ marginTop: 16 }}>
          <div className="tone tone-insight"><h3>תובנה</h3><Rich text={'==הדימוי עבר עם הידע: אריה הוא אריה מבבל ועד הודו.==\nרוב השמות הם תרגום ישיר.'} /></div>
          <div className="tone tone-neutral"><h3>חריג: בתולה</h3><Rich text={'בבבל **תלם**, בערבית **שיבולת**, ביוון ובהודו **עלמה**.\nאותה עונה: הקציר.'} /></div>
          <div className="tone tone-neutral"><h3>חריג: דלי</h3><Rich text={'עברית וערבית: **כלי**, דלי ודלו.\nיוונית: **אדם** ששופך מים.'} /></div>
        </div>
      </section>

      <section>
        <div className="section-title"><h2>תשע התרבויות</h2><span className="label">כל כרטיס: מקום, זמן, מערכת, מדידה, קריאה ומקור</span></div>
        <div className="culture-grid">
          {CULTURES.map((c) => (
            <article key={c.id} id={'c-' + c.id} className={'card culture' + (act === c.id ? ' on' : '')} onMouseEnter={() => setAct(c.id)} onMouseLeave={() => setAct(null)}>
              <div className="culture-head"><span className="step-n num">{c.n}</span><h3>{c.he}<span className="en">{c.en}</span></h3></div>
              <div className="culture-params">
                <Param label="מקום" icon="map"><strong>{c.place}</strong><span className="en">{c.placeEn}</span></Param>
                <Param label="תקופה" icon="time">{fmtYear(c.from)} עד {c.to >= 2026 ? 'היום' : fmtYear(c.to)}</Param>
                <Param label="טלה אצלם" icon="fire">{c.aries}</Param>
              </div>
              <Param label="המערכת" icon="hierarchy"><Rich as="span" text={c.system} /></Param>
              <Param label="מה נמדד" icon="param">{c.measures}</Param>
              <Param label="איך קוראים" icon="read"><Rich as="span" text={c.reads} /></Param>
              <p className="culture-insight"><Icon n="insight" size={15} /><Rich as="span" text={c.insight} /></p>
              <p className="src">{c.src}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <Quote text="רבי יוחנן אמר: אין מזל לישראל." src="תלמוד בבלי, שבת קנו ע״א" />
        <p className="src" style={{ marginTop: 8 }}>תשע תרבויות, ושאלה אחת שחוזרת בכולן: האם הכוכבים מתארים, או קובעים.</p>
      </section>
    </>
  );
}
