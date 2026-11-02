import { useState } from 'react';
import { SIGNS, type ElementKey } from '../data/content';
import { ELEMENTS } from '../data/meta';
import { BondWheel, KIND_STYLE, type Person } from '../components/BondWheel';
import { Glyph } from '../components/Glyph';
import { Purpose } from '../components/Purpose';
import { IconX } from '../components/icons';
import { Rich } from '../lib/rich';
import { setQuery, type Route } from '../lib/route';
import { analyze, byId, KIND_LABEL, kindOf, plainName, relation, type Kind } from '../lib/relations';
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
function KindKey() {
  return (
    <div className="kind-key" aria-label="מקרא סוגי קשר">
      {(['flow', 'tension', 'neutral'] as Kind[]).map((k) => (
        <span key={k}><svg width="34" height="10" aria-hidden="true"><line x1="0" y1="5" x2="34" y2="5" stroke={KIND_STYLE[k].c} strokeWidth={KIND_STYLE[k].w} strokeDasharray={KIND_STYLE[k].dash} /></svg>{KIND_LABEL[k]}</span>
      ))}
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
          <p className="src" style={{ textAlign: 'center' }}>לחיצה על הגלגל בוחרת את {next === 'a' ? 'הצד הראשון' : 'הצד השני'}.</p>
          <KindKey />
        </div>
        <div className="bond-side">
          <SignPicker label={`צד א: ${an}`} value={a} onPick={(id) => setQuery({ a: id, an: null })} />
          <SignPicker label={`צד ב: ${bn}`} value={b} onPick={(id) => setQuery({ b: id, bn: null })} />
          <div className="bond-title">
            <a href={'#/sign/' + a} className="press-link">{an}</a>
            <span className="bond-mid"><span className="label">{x.r.rule}</span><strong>{x.r.name}</strong><span className="src">{KIND_LABEL[x.kind]}</span></span>
            <a href={'#/sign/' + b} className="press-link">{bn}</a>
          </div>
          <Rich text={x.r.meaning} className="explain" />
          <div className="duo">
            <div className="tone tone-neutral"><h3>יסודות</h3><Rich text={x.el} /></div>
            <div className="tone tone-neutral"><h3>קצב</h3><Rich text={x.mo} /></div>
            <div className="tone tone-solution"><h3>מה {an} נותן</h3><Rich text={x.aGives} /></div>
            <div className="tone tone-solution"><h3>מה {bn} נותן</h3><Rich text={x.bGives} /></div>
          </div>
          <div className="tone tone-problem"><h3>איפה זה נתקע</h3><Rich text={x.stuck} /></div>
          <div className="tone tone-insight"><h3>תרגול משותף · {x.practiceSrc}</h3><p><mark>{x.practice}</mark></p></div>
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
              <KindKey />
            </div>
            <div className="circle-side">
              <div className="people">
                {people.map((p) => (
                  <span key={p.id} className="person"><Glyph sym={byId[p.sign].sym} size={15} /> <strong>{p.name}</strong> <span className="src">{plainName(byId[p.sign])}</span>
                    <button className="x-btn" aria-label={'הסרת ' + p.name} title="הסרה" onClick={() => setPeople(people.filter((q) => q.id !== p.id))}><IconX /></button></span>
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
                      <svg width="28" height="10" aria-hidden="true"><line x1="0" y1="5" x2="28" y2="5" stroke={KIND_STYLE[kind].c} strokeWidth={KIND_STYLE[kind].w} strokeDasharray={KIND_STYLE[kind].dash} /></svg>
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
