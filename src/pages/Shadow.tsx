import { useMemo, useState, type ReactNode } from 'react';
import { Purpose } from '../components/Purpose';
import { Hint, Param, Steps } from '../components/Grammar';
import { Icon } from '../components/Icon';
import { ShadowScene, hasWebGL } from '../components/ShadowScene';
import { VoiceButton } from '../components/Voice';
import { Rich } from '../lib/rich';
import { setQuery, type Route } from '../lib/route';
import { useStored } from '../lib/store';
import { ASHDOD, KEY_DATES, declination, latitudeFromStick, noonAltitude, overhangDepth, shadedFraction, shadowLength, solarNoonClock, sunPosition } from '../lib/sun';

// ספר הצל: שלושה ניסויים בתבנית נבא, בדוק, הוכח. בהשראת Every Joule (iamtechartist.com).
const f1 = (n: number) => n.toFixed(1);
const R = Math.PI / 180;
type Stamps = Record<'l1' | 'l2' | 'l3', boolean>;

function Zone({ n, title, children, locked }: { n: number; title: string; children: ReactNode; locked?: string }) {
  return (
    <section className={'zone' + (locked ? ' locked' : '')} aria-label={`${n}. ${title}`}>
      <header className="zone-h"><span className="step-n num">{n}</span><h3>{title}</h3></header>
      {locked ? <p className="src">{locked}</p> : children}
    </section>
  );
}
function Stamp({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={'stamp' + (on ? ' on' : '')} aria-label={`${label}: ${on ? 'הושג' : 'עוד לא'}`}>
      <svg viewBox="0 0 60 60" width="46" height="46" aria-hidden="true">
        <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth=".8" strokeDasharray="2 2" />
        <circle cx="30" cy="30" r="6" fill="currentColor" />
        {Array.from({ length: 8 }, (_, i) => { const a = i * 45 * R; return <line key={i} x1={30 + Math.cos(a) * 9} y1={30 + Math.sin(a) * 9} x2={30 + Math.cos(a) * 15} y2={30 + Math.sin(a) * 15} stroke="currentColor" strokeWidth="1.6" />; })}
      </svg>
      <span>{label}</span>
    </span>
  );
}

/** חתך צד: המגדל, זווית השמש והצל, עם המספרים על השרטוט. */
function SideSection({ h, alt }: { h: number; alt: number }) {
  const L = shadowLength(h, alt), Lc = Math.min(L, 40);
  const W = 520, H = 220, base = 180, s = 380 / 45, x0 = 440;
  const top = base - h * s, tipX = x0 - Lc * s;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="section" role="img" aria-label={`חתך: שמש בגובה ${f1(alt)} מעלות, צל של ${Number.isFinite(L) ? f1(L) : 'אינסוף'} מטר`} style={{ direction: 'ltr' }}>
      <line x1="10" y1={base} x2={W - 10} y2={base} stroke="#111" />
      <rect x={x0} y={top} width={14} height={h * s} fill="#fff" stroke="#111" />
      <line x1={tipX} y1={base} x2={x0} y2={base} stroke="#111" strokeWidth="5" opacity=".18" />
      {alt > 0.5 && <line x1={tipX} y1={base} x2={x0 + 14} y2={top} stroke="var(--fire)" strokeDasharray="5 4" />}
      {alt > 0.5 && <path d={`M${tipX + 46},${base} A46,46 0 0 0 ${tipX + 46 * Math.cos(alt * R)},${base - 46 * Math.sin(alt * R)}`} fill="none" stroke="var(--fire)" />}
      <text x={tipX + 52} y={base - 10} fontSize="13" fill="var(--fire)" fontFamily="var(--mono)">{f1(alt)}°</text>
      <text x={x0 + 22} y={top + (h * s) / 2} fontSize="13" fontFamily="var(--mono)" style={{ direction: 'rtl' }} textAnchor="end">{h} מ'</text>
      <text x={(tipX + x0) / 2} y={base + 22} textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="var(--mono)">{Number.isFinite(L) ? `${f1(L)} מ'` : 'אין שמש'}{L > 40 ? ' (חתוך)' : ''}</text>
      <text x="14" y="20" fontSize="12" fill="#6e6e6e" textAnchor="end" style={{ direction: 'rtl' }}>צפון</text>
      <text x={W - 14} y="20" fontSize="12" fill="#6e6e6e" textAnchor="start" style={{ direction: 'rtl' }}>דרום, השמש</text>
    </svg>
  );
}

/** חתך סוכך: חלון בחזית דרומית, קרן קיץ וקרן חורף. */
function OverhangSection({ depth, w }: { depth: number; w: number }) {
  const summer = noonAltitude(ASHDOD.lat, KEY_DATES[2].date), winter = noonAltitude(ASHDOD.lat, KEY_DATES[0].date);
  const s = 110, wallX = 330, sill = 200, head = sill - w * s, oX = wallX + depth * s;
  const shS = shadedFraction(depth, w, summer), shW = shadedFraction(depth, w, winter);
  const ray = (alt: number, color: string, dash: string) => {
    const y0 = head + depth * s * Math.tan(alt * R); // נקודת הפגיעה בזכוכית
    const yHit = Math.min(sill, y0), floorX = wallX - (230 - sill) / Math.tan(alt * R);
    const x1 = oX + 90, y1 = head - 90 * Math.tan(alt * R);
    return <g><line x1={x1} y1={y1} x2={oX} y2={head} stroke={color} strokeDasharray={dash} />
      {yHit < sill && <line x1={wallX} y1={yHit} x2={Math.max(20, floorX)} y2={230} stroke={color} strokeDasharray={dash} opacity=".7" />}</g>;
  };
  return (
    <svg viewBox="0 0 520 250" className="section" role="img" aria-label={`סוכך בעומק ${Math.round(depth * 100)} סנטימטר`} style={{ direction: 'ltr' }}>
      <rect x="20" y="230" width="490" height="4" fill="#111" />
      <rect x={wallX} y="40" width="16" height="190" fill="#f1f1f1" stroke="#111" />
      <rect x={wallX} y={head} width="16" height={w * s} fill="#eaf2fa" stroke="var(--air)" />
      <rect x={wallX} y={head} width="16" height={w * s * shS} fill="var(--fire)" opacity=".25" />
      <rect x={wallX + 16} y={head - 8} width={Math.max(2, depth * s)} height="8" fill="#111" />
      {ray(summer, 'var(--fire)', '')}
      {ray(winter, 'var(--earth)', '6 4')}
      <text x={wallX + 22} y={head - 14} fontSize="13" fontFamily="var(--mono)" textAnchor="end" style={{ direction: 'rtl' }}>{Math.round(depth * 100)} ס"מ</text>
      <text x={wallX - 8} y={(head + sill) / 2} textAnchor="start" fontSize="12" fontFamily="var(--mono)" style={{ direction: 'rtl' }}>{w} מ'</text>
      <text x="30" y="60" fontSize="13" textAnchor="end" style={{ direction: 'rtl' }} fill="var(--fire)">קרן קיץ, {f1(summer)}°</text>
      <text x="30" y="80" fontSize="13" textAnchor="end" style={{ direction: 'rtl' }} fill="var(--earth)">קרן חורף, {f1(winter)}°</text>
      <text x="30" y="215" fontSize="12" fill="#6e6e6e" textAnchor="end" style={{ direction: 'rtl' }}>פנים החדר</text>
      <text x="500" y="215" fontSize="12" fill="#6e6e6e" textAnchor="start" style={{ direction: 'rtl' }}>חוץ, דרום</text>
      <title>{`מוצל בקיץ: ${Math.round(shS * 100)}%. מוצל בחורף: ${Math.round(shW * 100)}%.`}</title>
    </svg>
  );
}

/** כדור הארץ של ארטוסתנס: קרניים מקבילות, שתי ערים, זווית אחת. */
function EarthSection() {
  const cx = 170, cy = 140, r = 110, a = 7.2 * 3; // הזווית מוגדלת פי 3 לקריאה
  const syene = [cx + r, cy], alex = [cx + r * Math.cos(-a * R), cy + r * Math.sin(-a * R)];
  return (
    <svg viewBox="0 0 520 280" className="section" role="img" aria-label="ניסוי ארטוסתנס: קרני שמש מקבילות וזווית של 7.2 מעלות" style={{ direction: 'ltr' }}>
      {[40, 80, 120, 160, 200, 240].map((y) => <line key={y} x1="510" y1={y} x2="300" y2={y} stroke="var(--fire)" strokeDasharray="6 5" opacity=".7" />)}
      <text x="505" y="24" textAnchor="start" fontSize="12" fill="var(--fire)" style={{ direction: 'rtl' }}>קרני השמש: מקבילות</text>
      <circle cx={cx} cy={cy} r={r} fill="#fafafa" stroke="#111" />
      <line x1={cx} y1={cy} x2={syene[0]} y2={syene[1]} stroke="#111" strokeDasharray="3 3" />
      <line x1={cx} y1={cy} x2={alex[0]} y2={alex[1]} stroke="#111" strokeDasharray="3 3" />
      <path d={`M${cx + 40},${cy} A40,40 0 0 0 ${cx + 40 * Math.cos(-a * R)},${cy + 40 * Math.sin(-a * R)}`} fill="none" stroke="var(--fire)" strokeWidth="1.5" />
      <text x={cx + 48} y={cy - 6} fontSize="13" fill="var(--fire)" fontFamily="var(--mono)">7.2°</text>
      <circle cx={syene[0]} cy={syene[1]} r="4" fill="#111" /><text x={syene[0] + 8} y={syene[1] + 18} fontSize="13" style={{ direction: 'rtl' }} textAnchor="end">סיינה: בלי צל</text>
      <line x1={alex[0]} y1={alex[1]} x2={alex[0] + 22 * Math.cos(-a * R)} y2={alex[1] + 22 * Math.sin(-a * R)} stroke="#111" strokeWidth="3" />
      <text x={alex[0] + 30} y={alex[1] - 18} fontSize="13" textAnchor="end" style={{ direction: 'rtl' }}>אלכסנדריה: מקל וצל</text>
      <text x="20" y="270" fontSize="12" fill="#6e6e6e" textAnchor="end" style={{ direction: 'rtl' }}>הזווית מוגדלת פי 3 לקריאה.</text>
    </svg>
  );
}

const CITIES = [ASHDOD, { he: 'תל אביב', en: 'Tel Aviv', lat: 32.08, lon: 34.78 }, { he: 'ירושלים', en: 'Jerusalem', lat: 31.77, lon: 35.21 }, { he: 'חיפה', en: 'Haifa', lat: 32.79, lon: 34.99 }, { he: 'באר שבע', en: 'Beersheba', lat: 31.25, lon: 34.79 }, { he: 'אילת', en: 'Eilat', lat: 29.56, lon: 34.95 }];

export function Shadow({ route }: { route: Route }) {
  const lesson = (['1', '2', '3'].includes(route.q.get('l') ?? '') ? route.q.get('l') : '1') as '1' | '2' | '3';
  const [stamps, setStamps] = useStored<Stamps>('shadow:stamps', { l1: false, l2: false, l3: false });
  const earn = (k: keyof Stamps) => { if (!stamps[k]) setStamps({ ...stamps, [k]: true }); };
  const webgl = useMemo(() => hasWebGL(), []);

  // שיעור 1
  const [guess, setGuess] = useStored<number>('shadow:l1:guess', 8);
  const [locked, setLocked] = useStored<boolean>('shadow:l1:locked', false);
  const [lifted, setLifted] = useState(false);
  const [dateId, setDateId] = useState('dec');
  const [hour, setHour] = useState(12);
  const date = dateId === 'today' ? new Date() : KEY_DATES.find((k) => k.id === dateId)!.date;
  const pos = sunPosition(ASHDOD.lat, date, hour);
  const decNoon = noonAltitude(ASHDOD.lat, KEY_DATES[0].date), junNoon = noonAltitude(ASHDOD.lat, KEY_DATES[2].date);
  const truth = shadowLength(10, decNoon);
  const err = Math.abs(guess - truth) / truth;
  // שיעור 2
  const [pick2, setPick2] = useStored<number | null>('shadow:l2:pick', null);
  const [depth, setDepth] = useState(0.6);
  const need = overhangDepth(1.5, junNoon);
  // שיעור 3
  const [pick3, setPick3] = useStored<number | null>('shadow:l3:pick', null);
  const [stick, setStick] = useState(100);
  const [shadow, setShadow] = useState(() => Math.round(shadowLength(100, noonAltitude(ASHDOD.lat, new Date()))));
  const [mDate, setMDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [city, setCity] = useState('Ashdod');
  const [log, setLog] = useStored<{ d: string; lat: number; city: string; err: number }[]>('shadow:l3:log', []);
  const [note, setNote] = useStored<string>('shadow:l3:note', '');
  const md = new Date(mDate + 'T10:00:00Z');
  const meas = latitudeFromStick(stick, shadow, md);
  const cityObj = CITIES.find((c) => c.en === city)!;
  const latErr = meas.lat - cityObj.lat;
  const angle3 = ASHDOD.lat - declination(KEY_DATES[1].date);

  const tabs: [string, string][] = [['1', 'הצל של אשדוד'], ['2', 'הסוכך'], ['3', 'ארטוסתנס']];
  return (
    <>
      <header className="page-head rise">
        <span className="label">ניסוי · ספר הצל</span>
        <h1>הצל יודע איפה אתם.</h1>
        <Rich className="explain" text={'שלושה ניסויים: **נבא**, **בדוק**, **הוכח**.\n==אותה שמש מחשבת צל של בניין, עומק של סוכך, ואת היקף כדור הארץ.=='} />
      </header>
      <Purpose why={'לגלות במו ידיך איך **זווית השמש** קובעת את העיר.'} how={'מנחשים, מרימים את השרטוט **מהדף**, ומודדים מקל **בחצר**.'} get={'שלוש **חותמות**, ותחושה של אדריכלית: הצל הוא חומר תכנון.'} />

      <div className="book-top">
        <div className="chapters" role="tablist" aria-label="שיעורים">
          {tabs.map(([k, t]) => (
            <button key={k} role="tab" aria-selected={lesson === k} className={'press chapter' + (lesson === k ? ' on' : '')} onClick={() => setQuery({ l: k })}>
              <span className="num">{k}</span>{t}
            </button>
          ))}
        </div>
        <div className="stamps" aria-label="חותמות">
          <Stamp on={stamps.l1} label="צל" /><Stamp on={stamps.l2} label="סוכך" /><Stamp on={stamps.l3} label="ארטוסתנס" />
        </div>
      </div>

      {lesson === '1' && (
        <article className="book">
          <div className="page-text">
            <Zone n={1} title="נבא">
              <Rich text={`מגדל בגובה **10** מ' ב**אשדוד** (קו רוחב **31.8°**).\nבצהרי **21 בדצמבר**, כמה מטר יהיה הצל שלו?`} />
              <label className="label" htmlFor="g1">הניחוש שלי: <bdi className="num">{f1(guess)}</bdi> מ'</label>
              <input id="g1" type="range" min={0} max={30} step={0.5} value={guess} disabled={locked} onChange={(e) => setGuess(Number(e.target.value))} className="range" />
              <div className="row">
                <button className="press btn btn-primary" disabled={locked} onClick={() => setLocked(true)}>נעילת הניחוש</button>
                {locked && <button className="press btn" onClick={() => { setLocked(false); setLifted(false); }}>ניחוש חדש</button>}
              </div>
            </Zone>
            <Zone n={2} title="בדוק" locked={locked ? undefined : 'קודם נועלים ניחוש. ניחוש לפני הסבר נזכר טוב יותר.'}>
              <button className="press btn btn-primary" onClick={() => { setLifted(true); setDateId('dec'); setHour(12); if (err <= 0.2) earn('l1'); }}>
                <Icon n="up" size={16} />הרמת המגדל מהדף
              </button>
              {lifted && (
                <>
                  <div className={'tone ' + (err <= 0.2 ? 'tone-solution' : 'tone-problem')}>
                    <h3>{err <= 0.2 ? 'קרוב! חותמת' : 'רחוק מהתוצאה'}</h3>
                    <Rich text={`ניחשת **${f1(guess)}** מ'. הצל בפועל: **${f1(truth)}** מ'. סטייה של **${Math.round(err * 100)}%**.`} />
                  </div>
                  <span className="label">עכשיו לשחק בזמן</span>
                  <div className="chips date-chips" role="group" aria-label="תאריך">
                    {KEY_DATES.map((k) => <button key={k.id} className="press chip-btn" aria-pressed={dateId === k.id} onClick={() => setDateId(k.id)}>{k.he}</button>)}
                    <button className="press chip-btn" aria-pressed={dateId === 'today'} onClick={() => setDateId('today')}>היום</button>
                  </div>
                  <label className="label" htmlFor="hr">שעה לפי השמש: <bdi className="num">{hour === 12 ? '12:00 (צהריים)' : `${Math.floor(hour)}:${hour % 1 ? '30' : '00'}`}</bdi></label>
                  <input id="hr" type="range" min={6} max={18} step={0.5} value={hour} onChange={(e) => setHour(Number(e.target.value))} className="range" />
                  <Hint>12:00 לפי השמש הוא הצהריים האמיתי. בשעון ישראל, ב{dateId === 'today' ? 'יום הזה' : KEY_DATES.find((k) => k.id === dateId)?.he}: <bdi className="num">{solarNoonClock(date)}</bdi>.</Hint>
                  <div className="params3">
                    <Param label="גובה השמש" icon="sky"><bdi className="num">{f1(pos.alt)}°</bdi></Param>
                    <Param label="כיוון" icon="map">{Math.abs(pos.az) < 3 ? 'דרום' : pos.az > 0 ? 'דרום־מערב' : 'דרום־מזרח'}</Param>
                    <Param label="אורך הצל" icon="tendency"><bdi className="num">{Number.isFinite(shadowLength(10, pos.alt)) ? f1(shadowLength(10, pos.alt)) + " מ'" : '—'}</bdi></Param>
                  </div>
                </>
              )}
            </Zone>
            <Zone n={3} title="הוכח" locked={lifted ? undefined : 'נפתח אחרי שמרימים את המגדל.'}>
              <Steps items={[
                `גובה השמש בצהריים: **90°** פחות **31.8°**, ועוד נטיית השמש (**−23.4°** בחורף): **${f1(decNoon)}°**.`,
                `אורך הצל: **10** חלקי tan(**${f1(decNoon)}°**): **${f1(truth)}** מ'.`,
                `בקיץ השמש ב-**${f1(junNoon)}°**, והצל **${f1(shadowLength(10, junNoon))}** מ'.`,
              ]} />
              <div className="tone tone-insight"><h3>תובנה</h3><p><mark>בצהרי החורף הצל ארוך פי {Math.round(truth / shadowLength(10, junNoon))} מבקיץ.</mark></p></div>
              <div className="tone tone-action"><h3>ובעיר</h3><Rich text={`בניין של **10** קומות (**30** מ') מטיל בצהרי החורף צל של **${Math.round(shadowLength(30, decNoon))}** מ'.\nזה רוחב של רחוב, ועוד שורת בתים.`} /></div>
            </Zone>
          </div>
          <div className="page-draw">
            <span className="label"><Icon n="sky" size={14} /> {dateId === 'today' ? 'היום' : KEY_DATES.find((k) => k.id === dateId)?.he}, שעה {hour === 12 ? '12:00' : hour} לפי השמש</span>
            {webgl && <ShadowScene alt={pos.alt} az={pos.az} height={10} lifted={lifted} label={`מגדל וצל, שמש בגובה ${f1(pos.alt)} מעלות`} />}
            <SideSection h={10} alt={pos.alt} />
            <Hint>{webgl ? 'גרירה מסובבת את הדף · גלגלת מקרבת · ' : ''}הקו הכתום: הקרן שעוברת בראש המגדל ונוחתת בקצה הצל.</Hint>
          </div>
        </article>
      )}

      {lesson === '2' && (
        <article className="book">
          <div className="page-text">
            <Zone n={1} title="נבא">
              <Rich text={`חלון בגובה **1.5** מ' בחזית **דרומית** באשדוד.\nכמה עמוק צריך להיות סוכך מעליו, כדי שבצהרי **21 ביוני** כל החלון יהיה בצל?`} />
              <div className="options">
                {[0.2, 0.6, 1, 1.5].map((v) => (
                  <button key={v} className={'press option' + (pick2 === v ? (Math.abs(v - need) < 0.1 ? ' right' : ' wrong') : '')} aria-pressed={pick2 === v}
                    onClick={() => { setPick2(v); if (Math.abs(v - need) < 0.1) earn('l2'); }}>{v < 1 ? `${Math.round(v * 100)} ס"מ` : `${v} מ'`}</button>
                ))}
              </div>
              {pick2 != null && <div className={'tone ' + (Math.abs(pick2 - need) < 0.1 ? 'tone-solution' : 'tone-problem')}><h3>{Math.abs(pick2 - need) < 0.1 ? 'נכון! חותמת' : 'לא בדיוק'}</h3><Rich text={`העומק הנדרש: **${Math.round(need * 100)}** ס"מ בלבד.`} /></div>}
            </Zone>
            <Zone n={2} title="בדוק" locked={pick2 != null ? undefined : 'קודם בוחרים תשובה.'}>
              <label className="label" htmlFor="dp">עומק הסוכך: <bdi className="num">{Math.round(depth * 100)}</bdi> ס"מ</label>
              <input id="dp" type="range" min={0} max={1.2} step={0.02} value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="range" />
              <div className="params3">
                <Param label="מוצל בצהרי הקיץ" icon="solution"><bdi className="num">{Math.round(shadedFraction(depth, 1.5, junNoon) * 100)}%</bdi></Param>
                <Param label="שמש בחורף" icon="sky"><bdi className="num">{Math.round((1 - shadedFraction(depth, 1.5, decNoon)) * 100)}%</bdi></Param>
                <Param label="קרן חורף בחדר" icon="tendency"><bdi className="num">{f1(2.3 / Math.tan(decNoon * R))}</bdi> מ'</Param>
              </div>
              <Hint>הזיזו את הסרגל וראו בחתך: הכתום הוא קרן הקיץ, המקווקו הוא קרן החורף.</Hint>
            </Zone>
            <Zone n={3} title="הוכח" locked={pick2 != null ? undefined : 'נפתח אחרי הניחוש.'}>
              <Steps items={[`עומק = גובה החלון חלקי tan(גובה השמש בקיץ).`, `**1.5** חלקי tan(**${f1(junNoon)}°**): **${Math.round(need * 100)}** ס"מ.`, `אותו סוכך מצל בחורף רק **${Math.round(shadedFraction(need, 1.5, decNoon) * 100)}%** מהחלון.`]} />
              <div className="tone tone-insight"><h3>תובנה</h3><p><mark>בדרום, סוכך קטן מספיק. השמש עושה את העבודה.</mark></p></div>
              <div className="tone tone-problem"><h3>המגבלה</h3><Rich text={'זה נכון לצהריים ולחזית **דרומית**.\nבמערב השמש נמוכה אחר הצהריים, וסוכך אופקי לא עוזר. שם צריך הצללה **אנכית**.'} /></div>
              <div className="tone tone-action"><h3>פעולה</h3><p>בדקו חלון בבית: לאיזה כיוון הוא פונה, ומה יש מעליו?</p></div>
            </Zone>
          </div>
          <div className="page-draw">
            <span className="label"><Icon n="hierarchy" size={14} /> חתך: חזית דרומית, צהריים</span>
            <OverhangSection depth={depth} w={1.5} />
          </div>
        </article>
      )}

      {lesson === '3' && (
        <article className="book">
          <div className="page-text">
            <Zone n={1} title="נבא">
              <Rich text={'**ארטוסתנס** (Eratosthenes), כ-**240** לפנה"ס, מדד את כדור הארץ בעזרת צל של מקל.\nבצהרי **20 במרץ**, באיזו זווית ייפול הצל של מקל זקוף באשדוד?'} />
              <div className="options">
                {[0, 15, 32, 45].map((v) => (
                  <button key={v} className={'press option' + (pick3 === v ? (Math.abs(v - angle3) < 3 ? ' right' : ' wrong') : '')} aria-pressed={pick3 === v}
                    onClick={() => { setPick3(v); if (Math.abs(v - angle3) < 3) earn('l3'); }}><bdi className="num">{v}°</bdi></button>
                ))}
              </div>
              {pick3 != null && <div className={'tone ' + (Math.abs(pick3 - angle3) < 3 ? 'tone-solution' : 'tone-problem')}><h3>{Math.abs(pick3 - angle3) < 3 ? 'נכון! חותמת' : 'לא בדיוק'}</h3><Rich text={`ביום השוויון, זווית הצל שווה לקו הרוחב: **${f1(angle3)}°**.`} /></div>}
            </Zone>
            <Zone n={2} title="בדוק: מדידה בחצר" locked={pick3 != null ? undefined : 'קודם בוחרים תשובה.'}>
              <Rich text={`מעמידים מקל זקוף, ומודדים את הצל **כשהוא הכי קצר**.\nבתאריך שבחרתם, זה בשעה **${solarNoonClock(md)}** בשעון ישראל.`} />
              <div className="form3">
                <label>מקל (ס"מ)<input type="number" inputMode="decimal" min={1} value={stick} onChange={(e) => setStick(Number(e.target.value) || 1)} /></label>
                <label>צל (ס"מ)<input type="number" inputMode="decimal" min={1} value={shadow} onChange={(e) => setShadow(Number(e.target.value) || 1)} /></label>
                <label>תאריך<input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} /></label>
                <label>עיר להשוואה<select value={city} onChange={(e) => setCity(e.target.value)}>{CITIES.map((c) => <option key={c.en} value={c.en}>{c.he}</option>)}</select></label>
              </div>
              <div className="params3">
                <Param label="גובה השמש שמדדתם" icon="sky"><bdi className="num">{f1(meas.alt)}°</bdi></Param>
                <Param label="קו הרוחב שלכם" icon="map"><bdi className="num">{f1(meas.lat)}°</bdi></Param>
                <Param label={`סטייה מ${cityObj.he}`} icon="tendency"><bdi className="num">{latErr >= 0 ? '+' : ''}{f1(latErr)}°</bdi> <span className="src">(<bdi className="num">{Math.round(Math.abs(latErr) * 111)}</bdi> ק"מ)</span></Param>
              </div>
              <button className="press btn" onClick={() => { setLog([{ d: mDate, lat: meas.lat, city: cityObj.he, err: latErr }, ...log].slice(0, 20)); if (Math.abs(latErr) < 2) earn('l3'); }}>שמירת המדידה</button>
              {log.length > 0 && <ol className="journal">{log.map((m, i) => <li key={i}><span className="label">{m.d} · {m.city}</span><p><bdi className="num">{f1(m.lat)}°</bdi>, סטייה <bdi className="num">{f1(m.err)}°</bdi></p></li>)}</ol>}
              <Hint>איך נבדק: זווית השמש מהיחס מקל לצל, ועוד נטיית השמש בתאריך (Meeus). מעלה אחת היא כ-111 ק"מ.</Hint>
            </Zone>
            <Zone n={3} title="הוכח">
              <Steps items={['בסיינה, בצהרי היום הארוך, השמש עמדה בדיוק מעל הראש: **בלי צל**.', 'באלכסנדריה, באותה שעה, הצל נטה **7.2°**: חלק אחד מתוך **50** של מעגל.', 'המרחק בין הערים, **5,000** סטדיונים, כפול **50**: **250,000** סטדיונים.']} />
              <div className="tone tone-insight"><h3>תובנה</h3><p><mark>מקל, צל ומעלה אחת מספיקים כדי למדוד עולם.</mark></p></div>
              <Rich className="src" text={'**250,000** סטדיונים הם בקירוב **39,000** עד **46,000** ק"מ, לפי אורך הסטדיון. היום: **40,075** ק"מ.'} />
              <label className="label" htmlFor="nt">מה הפתיע אותך?</label>
              <textarea id="nt" value={note} onChange={(e) => setNote(e.target.value)} placeholder="משפט אחד. נשמר אוטומטית." />
              <VoiceButton value={note} onText={setNote} />
            </Zone>
          </div>
          <div className="page-draw">
            <span className="label"><Icon n="cultures" size={14} /> ארטוסתנס: שתי ערים, קרניים מקבילות</span>
            <EarthSection />
            <Rich className="src" text={'את הניסוי מתאר **קלאומדס** (Cleomedes), "על התנועה המעגלית של גרמי השמיים", המאה ה-1 או ה-2 לספירה. הכתבים של ארטוסתנס עצמו לא שרדו.'} />
          </div>
        </article>
      )}

      <section className="card">
        <span className="label">מקורות והשראה</span>
        <ol className="credits-list">
          <li>Jean Meeus, Astronomical Algorithms, 1998: מיקום השמש ונטייתה.</li>
          <li>קלאומדס (Cleomedes), על התנועה המעגלית של גרמי השמיים: התיאור של ניסוי ארטוסתנס.</li>
          <li>השראה: Every Joule, ספר פיזיקה תלת־ממדי, iamtechartist.com, 2026.</li>
        </ol>
      </section>
    </>
  );
}
