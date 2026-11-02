import { useState } from 'react';
import { SIGNS, type ElementKey } from '../data/content';
import { ELEMENTS } from '../data/meta';
import { BondWheel, type Person } from '../components/BondWheel';
import { HarmonyKey, PairMeters, RelBars, RelMatrix, RelRadial } from '../components/RelViz';
import { ASPECT_ICON, Icon } from '../components/Icon';
import { ElTag, Hint } from '../components/Grammar';
import { Glyph } from '../components/Glyph';
import { Purpose } from '../components/Purpose';
import { IconX } from '../components/icons';
import { Rich } from '../lib/rich';
import { setQuery, type Route } from '../lib/route';
import { analyze, byId, harmonyColor, KIND_LABEL, kindOf, metrics, plainName, relation, type Kind } from '../lib/relations';
import { load, useStored } from '../lib/store';

const ASK: Record<ElementKey, string> = { fire: 'מי יתחיל?', earth: 'מי יחזיק את המבנה?', air: 'מי יחבר בין הרעיונות?', water: 'מי ירגיש את מה שלא נאמר?' };

function SignPicker({ label, value, onPick }: { label: string; value: string; onPick: (id: string) => void }) {
  return (
    <div className="picker" role="group" aria-label={label}>
      <span className="label">{label}</span>
      <div className="picker-row">
        {SIGNS.map((s) => (
          <button key={s.id} className="press picker-btn" aria-pressed={value === s.id} title={plainName(s)} aria-label={plainName(s)} onClick={() => onPick(s.id)}>
            <Glyph sym={s.sym} size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Bond({ route }: { route: Route }) {
  const mine = load<{ top?: string } | null>('quizResult', null)?.top;
  const a = byId[route.q.get('a') ?? ''] ? route.q.get('a')! : mine ?? 'aries';
  const b = byId[route.q.get('b') ?? ''] ? route.q.get('b')! : 'cancer';
  const an = route.q.get('an') || plainName(byId[a]), bn = route.q.get('bn') || plainName(byId[b]);
  const [next, setNext] = useState<'a' | 'b'>('b');
  const A = byId[a], B = byId[b], x = analyze(A, B);
  const [people, setPeople] = useStored<Person[]>('circle', []);
  const [name, setName] = useState('');
  const [sign, setSign] = useState(mine ?? 'aries');

  const pickWheel = (id: string) => { setQuery(next === 'a' ? { a: id, an: null } : { b: id, bn: null }); setNext(next === 'a' ? 'b' : 'a'); };
  const add = () => { if (!name.trim()) return; setPeople([...people, { id: String(Date.now()), name: name.trim(), sign }]); setName(''); };
  const pairs = people.flatMap((p, i) => people.slice(i + 1).map((q) => {
    const r = relation(byId[p.sign], byId[q.sign]);
    return { p, q, r, kind: kindOf(r.deg) };
  })).sort((u, v) => (u.kind === 'tension' ? 0 : u.kind === 'neutral' ? 1 : 2) - (v.kind === 'tension' ? 0 : v.kind === 'neutral' ? 1 : 2));
  const count = (k: Kind) => pairs.filter((x) => x.kind === k).length;
  const elCount = Object.fromEntries(ELEMENTS.map((e) => [e.key, people.filter((p) => byId[p.sign].elc === e.key).length])) as Record<ElementKey, number>;
  const missing = ELEMENTS.filter((e) => people.length >= 2 && elCount[e.key] === 0);

  return (
    <>
      <header className="page-head rise">
        <span className="label">קשרים</span>
        <h1>כל קשר הוא זווית.</h1>
        <Rich className="explain" text={'שני מבנים יושבים על הגלגל במרחק מסוים.\n==המרחק אומר אם הקשר זורם, מותח או משלים.=='} />
      </header>
      <Purpose why={'להבין **למה** קשר מסוים קל, ואחר מתיש.'} how={'בוחרים **שני מבנים**, או בונים **מעגל** של אנשים אמיתיים.'} get={'מה כל צד **נותן**, איפה זה **נתקע**, ותרגול משותף אחד.'} />

      <section className="bond-layout">
        <div className="bond-wheel card">
          <BondWheel picks={[a, b]} onPick={pickWheel} label={`הקשר בין ${an} ל${bn}`} />
          <Hint>לחיצה על מזל בגלגל בוחרת לסירוגין את שני הצדדים. עכשיו: <strong>{next === 'a' ? 'צד א' : 'צד ב'}</strong>.</Hint>
          <HarmonyKey />
        </div>
        <div className="bond-side">
          <SignPicker label={`צד א: ${an}`} value={a} onPick={(id) => setQuery({ a: id, an: null })} />
          <SignPicker label={`צד ב: ${bn}`} value={b} onPick={(id) => setQuery({ b: id, bn: null })} />
          <div className="bond-title">
            <a href={'#/sign/' + a} className="press-link">{an}</a>
            <span className="bond-mid"><Icon n={ASPECT_ICON[x.r.deg]} size={34} color={harmonyColor(metrics(A, B).harmony)} /><strong>{x.r.name}</strong><span className="label">{x.r.rule}</span><span className="src">{KIND_LABEL[x.kind]}</span></span>
            <a href={'#/sign/' + b} className="press-link">{bn}</a>
          </div>
          <PairMeters a={A} b={B} />
          <Rich text={x.r.meaning} className="explain" />
          <div className="duo">
            <div className="tone tone-neutral"><h3>יסודות <ElTag el={A.elc} name={false} /> <ElTag el={B.elc} name={false} /></h3><Rich text={x.el} /></div>
            <div className="tone tone-neutral"><h3>קצב</h3><Rich text={x.mo} /></div>
            <div className="tone tone-solution"><h3>מה {an} נותן</h3><Rich text={x.aGives} /></div>
            <div className="tone tone-solution"><h3>מה {bn} נותן</h3><Rich text={x.bGives} /></div>
          </div>
          <div className="tone tone-problem"><h3>איפה זה נתקע</h3><Rich text={x.stuck} /></div>
          <div className="tone tone-action"><h3>תרגול משותף · {x.practiceSrc}</h3><p><mark>{x.practice}</mark></p></div>
        </div>
      </section>

      <section className="card">
        <div className="section-title"><h2>{an} מול כל המזלות</h2><span className="label">מהזורם ביותר למותח ביותר</span></div>
        <div className="all-rel">
          <RelRadial a={A} onPick={(id) => setQuery({ b: id, bn: null })} />
          <div><RelBars a={A} onPick={(id) => { setQuery({ b: id, bn: null }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /><HarmonyKey /><Hint>ריחוף על שורה מסביר את הזווית. לחיצה טוענת את הזוג למעלה.</Hint></div>
        </div>
      </section>

      <section className="card">
        <div className="section-title"><h2>כל 66 הקשרים</h2><span className="label">שורה וטור: שני מבנים. צבע: טיב. אייקון: הזווית.</span></div>
        <RelMatrix a={a} b={b} onPick={(r, c) => { setQuery({ a: r, b: c, an: null, bn: null }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        <HarmonyKey />
        <div className="pst" style={{ marginTop: 12 }}>
          <div className="tone tone-insight"><h3>תובנה</h3><Rich text={'==הצבע יוצר אלכסונים: אותו יסוד זורם, יסוד שכן מותח.==\nהגלגל בנוי כמו מוזיקה: מרווחים קבועים.'} /></div>
          <div className="tone tone-neutral"><h3>כלל הטיב</h3><Rich text={'**120°** ו-**60°** זורמים. **90°** ו-**180°** מותחים.\nמקור: תלמי, טטרביבלוס. **30°** ו-**150°**: קפלר, 1619.'} /></div>
          <div className="tone tone-problem"><h3>המגבלה</h3><Rich text={'זה טיב של **מבנים**, לא של אנשים.\nקשר מותח הוא לרוב הקשר שמלמד הכי הרבה.'} /></div>
        </div>
      </section>

      <section className="card circle">
        <div className="section-title"><h2>המעגל שלי</h2><span className="label">משפחה, צוות, חברים: מפת הקשרים של קבוצה</span></div>
        <form className="circle-form" onSubmit={(e) => { e.preventDefault(); add(); }}>
          <label className="sr" htmlFor="pn">שם</label>
          <input id="pn" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם, למשל: דנה" maxLength={18} />
          <label className="sr" htmlFor="ps">מזל</label>
          <select id="ps" value={sign} onChange={(e) => setSign(e.target.value)}>
            {SIGNS.map((s) => <option key={s.id} value={s.id}>{plainName(s)}</option>)}
          </select>
          <button className="press btn btn-primary" type="submit" disabled={!name.trim()}>הוספה למעגל</button>
        </form>
        {people.length === 0 ? (
          <p className="src">המעגל ריק. הוסיפו לפחות שני אנשים, והמפה תצייר את כל הקשרים ביניהם. הכול נשמר רק במכשיר הזה.</p>
        ) : (
          <div className="circle-grid">
            <div>
              <BondWheel people={people} links={pairs.map((x) => [x.p.sign, x.q.sign] as [string, string])} label="מפת הקשרים של המעגל" />
              <HarmonyKey />
            </div>
            <div className="circle-side">
              <div className="people">
                {people.map((p) => (
                  <span key={p.id} className="person"><Glyph sym={byId[p.sign].sym} size={15} /> <strong>{p.name}</strong> <span className="src">{plainName(byId[p.sign])}</span>
                    <button className="x-btn" aria-label={'הסרת ' + p.name} data-tip="הסרה מהמעגל" onClick={() => setPeople(people.filter((q) => q.id !== p.id))}><IconX /></button></span>
                ))}
              </div>
              <div>
                <span className="label">איזון היסודות בקבוצה</span>
                {ELEMENTS.map((e) => (
                  <div key={e.key} className="bar-row"><span><span className="swatch" style={{ background: e.color }} />{e.he}</span>
                    <div className="bar"><span style={{ width: `${people.length ? (elCount[e.key] / people.length) * 100 : 0}%`, background: e.color }} /></div>
                    <bdi className="num">{elCount[e.key]}</bdi></div>
                ))}
              </div>
              {missing.length > 0 && (
                <div className="tone tone-problem"><h3>מה חסר בקבוצה</h3>
                  <Rich text={missing.map((e) => `אין **${e.he}**. ${ASK[e.key]}`).join('\n')} /></div>
              )}
              {pairs.length > 0 && (
                <div className="tone tone-insight"><h3>תמונת הקבוצה</h3>
                  <Rich text={`**${pairs.length}** קשרים: **${count('flow')}** זרימה, **${count('tension')}** מתח, **${count('neutral')}** שכנות.\n==${count('tension') > count('flow') ? 'הקבוצה מצמיחה דרך חיכוך. כדאי לתרגל את קשרי המתח קודם.' : 'הקבוצה זורמת. כדאי לחפש מי מאתגר אותה.'}==`} /></div>
              )}
              <ol className="pair-list">
                {pairs.map(({ p, q, r, kind }) => (
                  <li key={p.id + q.id}>
                    <button className="press pair" onClick={() => { setQuery({ a: p.sign, b: q.sign, an: p.name, bn: q.name }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      <Icon n={ASPECT_ICON[r.deg]} size={20} color={harmonyColor(metrics(byId[p.sign], byId[q.sign]).harmony)} label={KIND_LABEL[kind]} />
                      <span><strong>{p.name}</strong> ו<strong>{q.name}</strong></span>
                      <span className="src">{r.name} · {r.deg}°</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>
      <p className="src">הניתוח מבוסס על זוויות הגלגל (היבטים) ועל ארבעת היסודות. הוא מתאר נטייה של מבנים, לא את האנשים עצמם.</p>
    </>
  );
}
