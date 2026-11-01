import { useEffect, useRef, useState } from 'react';
import { Wheel } from '../components/Wheel';
import { IconPause, IconPlay, IconX } from '../components/icons';
import { Rich } from '../lib/rich';
import { setQuery, type Route } from '../lib/route';
import { CONSTELLATIONS, equinoxConstellation, fmtYear, nextAgeChange, PRECESSION_CYCLE, precessionShift, prevAgeChange, span, sunConstellation, sunLongitude, sunSignId } from '../lib/astro';
import { byId } from '../lib/relations';

const MIN = -3000, MAX = 4600;
const plain = (n: string) => n.replace(/[֑-ׇ]/g, '');

export function Sky({ route }: { route: Route }) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const [year, setYear] = useState(() => Number(route.q.get('y')) || thisYear);
  const [play, setPlay] = useState(false);
  const raf = useRef(0);
  useEffect(() => { setQuery({ y: year === thisYear ? null : String(Math.round(year)) }); }, [Math.round(year)]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!play) return;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last; last = t;
      setYear((y) => { const n = y + dt * 0.25; if (n >= MAX) { setPlay(false); return MAX; } return n; });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [play]);

  const y = Math.round(year);
  const eq = equinoxConstellation(y);
  const nx = nextAgeChange(y), pv = prevAgeChange(y);
  const sign = byId[sunSignId(now)], con = sunConstellation(now);
  const shift = precessionShift(y);
  const date = now.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
  const ticks = [-3000, -2000, -1000, 1, 1000, 2000, 3000, 4000];

  return (
    <>
      <header className="page-head rise">
        <span className="label">השמיים היום · חישוב חי בדפדפן</span>
        <h1>המזלות נשארו. הכוכבים זזו.</h1>
        <Rich className="explain" text={`ציר כדור הארץ מסתובב כמו סביבון, סיבוב אחד בכל **${Math.round(PRECESSION_CYCLE).toLocaleString('he-IL')}** שנה.\n==לכן תאריכי המזלות כבר לא תואמים את הכוכבים שמאחורי השמש.==`} />
      </header>

      <section className="today-split">
        <div className="card lift today-box">
          <span className="label">היום, {date}</span>
          <div className="who" style={{ fontSize: 'clamp(24px,3vw,34px)' }}>
            <span>מזל <strong>{plain(sign.n)}</strong></span><span className="arrow">אבל השמש בפועל ב</span><strong style={{ color: 'var(--brass)' }}>{con.he}</strong>
          </div>
          <Rich className="src" text={`אורך השמש: **${sunLongitude(now).toFixed(1)}°** מנקודת השוויון. המזל נקבע לפי **30°** קבועות, הקבוצה לפי הכוכבים.`} />
        </div>
        <div className="card today-box">
          <span className="label">ההפרש מאז שנקבעו המזלות</span>
          <div className="big-score"><bdi className="num">{(precessionShift(thisYear) - precessionShift(-129)).toFixed(0)}°</bdi></div>
          <Rich className="src" text={'מאז היפרכוס, כ-**130** לפנה"ס. ==מזל שלם, 30°.=='} />
        </div>
      </section>

      <section className="sky card sky-stage">
        <div className="stage-wheel">
          <Wheel year={y} date={now} active={eq.id} title={`גלגל המזלות בשנת ${fmtYear(y)}`} />
          <div className="clock" aria-live="polite"><span className="label">שנה</span><b className="num">{fmtYear(y)}</b></div>
        </div>
        <div className="stage-side">
          <div className="ops" style={{ justifyContent: 'flex-start' }}>
            <button className="press icon-btn" aria-label={play ? 'עצירה' : 'הפעלת הזמן'} title={play ? 'עצירה' : 'הפעלת הזמן'} onClick={() => { if (year >= MAX) setYear(MIN); setPlay(!play); }}>{play ? <IconPause /> : <IconPlay />}</button>
            <button className="press icon-btn" aria-label="חזרה להיום" title="חזרה להיום" onClick={() => { setPlay(false); setYear(thisYear); }}><IconX /></button>
            <span className="label">הזמן רץ <bdi className="num">250</bdi> שנה בשנייה</span>
          </div>
          <div className="yearbar">
            <input type="range" min={MIN} max={MAX} step={1} value={y} aria-label="בחירת שנה" onChange={(e) => { setPlay(false); setYear(Number(e.target.value)); }} />
            <div className="yticks" aria-hidden="true">
              {ticks.map((t) => <span key={t} style={{ right: `${((t - MIN) / (MAX - MIN)) * 100}%` }}>{t === 1 ? '0' : t < 0 ? `−${-t}` : t}</span>)}
              <span className="now" style={{ right: `${((thisYear - MIN) / (MAX - MIN)) * 100}%` }}>היום</span>
            </div>
          </div>
          <dl className="readout">
            <dt>נקודת השוויון האביבי בקבוצה</dt><dd><strong>{eq.he}</strong><span className="en">{eq.en}</span></dd>
            <dt>מאז</dt><dd><strong>{pv != null ? fmtYear(pv) : '—'}</strong></dd>
            <dt>הקבוצה הבאה</dt><dd><strong>{nx?.into.he}</strong> בשנת <strong>{nx ? fmtYear(nx.year) : '—'}</strong></dd>
            <dt>הזזה מאז 2000</dt><dd><bdi className="num">{shift.toFixed(1)}°</bdi></dd>
          </dl>
          <Rich className="src" text={'**"עידן הדלי"** הוא בדיוק זה: היום שבו נקודת השוויון תעבור מדגים לדלי.\nהעיגול הצהוב: השמש היום. הקו המקווקו: 0°, תחילת טלה.'} />
        </div>
      </section>

      <section className="card">
        <div className="section-title"><h2>תאריכי מזל מול תאריכי כוכבים</h2><span className="label">13 קבוצות, לא 12</span></div>
        <div className="table-wrap">
          <table className="dates">
            <thead><tr><th>קבוצה</th><th>תאריכי המזל</th><th>השמש בקבוצה עצמה</th><th>ימים בקבוצה</th></tr></thead>
            <tbody>
              {CONSTELLATIONS.slice(1).concat(CONSTELLATIONS[0]).map((c) => {
                const s = byId[c.id];
                const days = Math.round(span(c) / 0.9856);
                return (
                  <tr key={c.id} className={c.id === con.id ? 'on' : ''}>
                    <td><strong>{c.he}</strong><span className="en">{c.en}</span></td>
                    <td>{s ? s.trop : <span className="src">אין מזל. הקבוצה ה-13.</span>}</td>
                    <td>{s ? s.astro : '30 בנובמבר עד 17 בדצמבר'}</td>
                    <td><div className="bar inline"><span style={{ width: `${(days / 45) * 100}%`, background: s ? `var(--${s.elc})` : '#6b5ca5' }} /></div><bdi className="num">{days}</bdi></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="pst" style={{ marginTop: 16 }}>
          <div className="tone tone-problem"><h3>הפער</h3><Rich text={'המזלות שווים: **30°** כל אחד. הקבוצות לא: עקרב **7** ימים, בתולה **44**.'} /></div>
          <div className="tone tone-solution"><h3>הקריאה הנכונה</h3><Rich text={'המזל הוא **עונה בשנה**, לא כוכב. טלה = תחילת האביב, תמיד.'} /></div>
          <div className="tone tone-insight"><h3>תובנה</h3><Rich text={'==המזל מודד זמן, לא מקום.==\nלכן הוא שפה של קצב, ולא נבואה.'} /></div>
        </div>
        <p className="src" style={{ marginTop: 12 }}>מקורות: Jean Meeus, Astronomical Algorithms, 1998 · גבולות הקבוצות: IAU, Delporte, 1930 · נקיפת השוויונות: היפרכוס, כ-130 לפנה"ס.</p>
      </section>
    </>
  );
}
