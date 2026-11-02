import { SIGNS } from '../data/content';
import { ELEMENTS, MODES } from '../data/meta';
import { Purpose } from '../components/Purpose';
import { Chooser } from '../components/Chooser';
import { Hint, elIcon, moIcon } from '../components/Grammar';
import { Icon } from '../components/Icon';
import { SignCard } from '../components/SignCard';
import { Rich } from '../lib/rich';
import { setQuery, type Route } from '../lib/route';
import { load } from '../lib/store';
import { search } from '../lib/search';

export function Atlas({ route }: { route: Route }) {
  const els = route.q.get('el')?.split(',').filter(Boolean) ?? [];
  const mos = route.q.get('mo')?.split(',').filter(Boolean) ?? [];
  const q = load('q', '');
  const hitIds = new Set(search(q).map((h) => h.sign.id));
  const visible = (id: string, elc: string, mo: string) =>
    (!els.length || els.includes(elc)) && (!mos.length || mos.includes(mo)) && (!hitIds.size || hitIds.has(id));
  const shown = SIGNS.filter((s) => visible(s.id, s.elc, s.mo)).length;
  return (
    <>
      <header className="page-head rise">
        <span className="label">אטלס</span>
        <h1>12 מבנים, טבלה אחת.</h1>
        <Rich className="explain" text={'כל מזל הוא מפגש של **יסוד** (מה מניע אותך) ו**אופן** (איך אתה פועל).\n==4 יסודות כפול 3 אופנים: 12 מבנים, אף אחד לא מקרי.=='} />
      </header>
      <Purpose why={'לראות את **כל 12** במבט אחד, ולמה כל מזל נמצא במקומו.'} how={'מסננים לפי **יסוד** ו**אופן**, ולוחצים על מבנה.'} get={'הבנה של **המבנה** שמאחורי המזלות, לא רשימה.'} />
      <div className="card filters">
        <Chooser label="יסוד" opts={ELEMENTS.map((e) => ({ key: e.key, label: e.he, icon: <Icon n={elIcon(e.key)} size={15} color={e.color} /> }))} value={els} onChange={(v) => setQuery({ el: v.join(',') })} />
        <Chooser label="אופן" opts={MODES.map((m) => ({ key: m.key, label: m.he, icon: <Icon n={moIcon(m.key)} size={15} color="var(--g-600)" /> }))} value={mos} onChange={(v) => setQuery({ mo: v.join(',') })} />
        <Hint>לחיצה על יסוד או אופן מציגה רק אותו · <strong>+</strong> מוסיף עוד אחד · <strong>−</strong> מסיר · "הכול" מאפס</Hint>
        <span className="src">מוצגים <bdi className="num">{shown}</bdi> מתוך <bdi className="num">12</bdi>{hitIds.size ? ` · מודגשות התאמות לחיפוש "${q}"` : ''}. השאר מעומעמים, כדי שהמבנה השלם יישאר גלוי.</span>
      </div>
      <section className="matrix" aria-label="מטריצת יסודות ואופנים">
        <div className="corner" />
        {MODES.map((m) => (
          <div className="mh" key={m.key}><span className="label">{m.term}</span><b style={{ fontSize: 20, fontWeight: 400, display: 'flex', gap: 6, alignItems: 'center' }}><Icon n={moIcon(m.key)} size={18} color="var(--g-600)" />{m.he}</b><Rich text={m.line} className="src" /></div>
        ))}
        {ELEMENTS.map((e) => (
          <div key={e.key} style={{ display: 'contents' }}>
            <div className="rh" style={{ borderColor: e.color }}>
              <b style={{ fontSize: 22, fontWeight: 300, display: 'flex', gap: 6, alignItems: 'center' }}><Icon n={elIcon(e.key)} size={20} color={e.color} />{e.he}<span className="en">{e.en}</span></b>
              <Rich text={e.line} className="src" />
            </div>
            {MODES.map((m) => {
              const s = SIGNS.find((x) => x.elc === e.key && x.mo === m.key)!;
              return <SignCard key={s.id} s={s} dim={!visible(s.id, s.elc, s.mo)} i={SIGNS.indexOf(s)} />;
            })}
          </div>
        ))}
      </section>
      <section className="pst">
        <div className="tone tone-neutral"><h3>איך קוראים את הטבלה</h3><Rich text={'**שורה:** אותו יסוד, אותה שפה רגשית.\n**עמודה:** אותו אופן, אותו קצב פעולה.'} /></div>
        <div className="tone tone-insight"><h3>תובנה</h3><Rich text={'==שכנים בעמודה מתנגשים, שכנים בשורה מבינים.==\nכך נולדים הקשרים בין המבנים.'} /></div>
        <div className="tone tone-neutral"><h3>מקור השיטה</h3><Rich text={'ארבעת היסודות: **אמפדוקלס** (Empedocles), כ-**450** לפנה"ס.\nשלושת האופנים: **תלמי** (Ptolemy), טטרביבלוס, כ-**150** לספירה.'} /></div>
      </section>
    </>
  );
}
