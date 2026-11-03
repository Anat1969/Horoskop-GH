import { useEffect, useState } from 'react';
import { SIGNS } from '../data/content';
import { EL, MO } from '../data/meta';
import { Purpose } from '../components/Purpose';
import { Glyph } from '../components/Glyph';
import { HarmonyKey, RelBars, RelRadial } from '../components/RelViz';
import { ElTag, Hint, ModeTag } from '../components/Grammar';
import { ASPECT_ICON, Icon } from '../components/Icon';
import { IconCopy, IconNext, IconPrev, IconX } from '../components/icons';
import { Rich } from '../lib/rich';
import { go } from '../lib/route';
import { byId, byName, harmonyColor, metrics, relation } from '../lib/relations';
import { useStored } from '../lib/store';
import { CopyButton } from '../components/CopyButton';
import { VoiceButton } from '../components/Voice';

interface Entry { d: string; thought: string; did: boolean }
const plain = (n: string) => n.replace(/[֑-ׇ]/g, '');

export function SignPage({ id }: { id: string }) {
  const s = byId[id] ?? SIGNS[0];
  const i = SIGNS.indexOf(s);
  const prev = SIGNS[(i + 11) % 12], next = SIGNS[(i + 1) % 12];
  const c = `var(--${s.elc})`;
  const [journal, setJournal] = useStored<Entry[]>('journal:' + s.id, []);
  const [draft, setDraft] = useStored<string>('draft:' + s.id, '');
  const [did, setDid] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea')) return;
      if (e.key === 'ArrowRight') go('sign/' + prev.id);
      if (e.key === 'ArrowLeft') go('sign/' + next.id);
      if (e.key === 'Escape') go('atlas');
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [prev.id, next.id]);
  useEffect(() => { window.scrollTo({ top: 0 }); setDid(false); }, [id]);

  const post = `${s.tip}\n\n${s.core}\n\nקצה הצמיחה: ${s.growth}\n\nושאלה אחת להיום: ${s.ref}\n\nמקדש הכוכבים: 12 מבנים, אף אחד מהם אינו גורל.`;
  const record = () => {
    if (!draft.trim() && !did) return;
    setJournal([{ d: new Date().toLocaleDateString('he-IL'), thought: draft.trim(), did }, ...journal]);
    setDraft(''); setDid(false);
  };

  return (
    <article className="sign" style={{ ['--c' as string]: c }} key={s.id}>
      <div className="ops no-print" role="toolbar" aria-label="ניווט בין המבנים">
        <Hint>מקשי החצים: המבנה הקודם והבא · Esc: חזרה לאטלס</Hint>
        <button className="press icon-btn" data-tip={'הקודם: ' + plain(prev.n)} aria-label={'הקודם: ' + plain(prev.n)} onClick={() => go('sign/' + prev.id)}><IconPrev /></button>
        <span className="label"><bdi className="num">{i + 1}</bdi> / <bdi className="num">12</bdi></span>
        <button className="press icon-btn" data-tip={'הבא: ' + plain(next.n)} aria-label={'הבא: ' + plain(next.n)} onClick={() => go('sign/' + next.id)}><IconNext /></button>
        <button className="press icon-btn" data-tip="סגירה וחזרה לאטלס" aria-label="חזרה לאטלס" onClick={() => go('atlas')}><IconX /></button>
      </div>

      <header className="sign-hero sky rise">
        <div className="sign-glyph"><Glyph sym={s.sym} color={c} size={120} /></div>
        <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
          <span className="hero-tags"><ElTag el={s.elc} /><ModeTag mo={s.mo} /><span className="tag"><Icon n="time" size={16} color="var(--g-600)" />{s.month}</span></span>
          <h1>{s.n}<span className="en">{s.en}</span></h1>
          <p className="sign-core">{s.core}</p>
          <p className="explain">{s.tip}</p>
        </div>
      </header>

      <Purpose why={'להכיר מבנה אחד **לעומק**: כוח, צל וכיוון צמיחה.'} how={'קוראים, עונים על **שאלת ההשתקפות**, ורושמים ביומן.'} get={'פעולה אחת להיום, וגשר אל מבנה **אחר**.'} />

      <div className="sign-body">
        <div className="sign-main">
          <section className="duo">
            <div className="tone tone-solution"><h3>כוחות</h3><ul className="list">{s.strengths.map((x) => <li key={x}><strong>{x}</strong></li>)}</ul></div>
            <div className="tone tone-problem"><h3>צללים</h3><ul className="list">{s.shadows.map((x) => <li key={x}><strong>{x}</strong></li>)}</ul></div>
          </section>
          <div className="tone tone-insight"><h3>קצה הצמיחה</h3><p className="growth"><mark>{s.growth}</mark></p></div>

          <section>
            <div className="section-title"><h2>גשרים אל מבנים אחרים</h2><span className="label">כל גשר: הכלל, המשמעות, והפעולה</span></div>
            <a href={'#/bond?a=' + s.id} className="press btn" style={{ marginBottom: 16 }}>ניתוח קשר עם כל מבנה אחר</a>
            <div className="bridges">
              {s.bridge.map((b) => {
                const t = byName(b.to), r = relation(s, t);
                return (
                  <div key={b.to} className="card bridge">
                    <div className="who">
                      <strong>{plain(s.n)}</strong><span className="arrow">← לומד מ ←</span>
                      <a href={`#/bond?a=${s.id}&b=${t.id}`} className="press-link" title="ניתוח הקשר"><strong>{plain(t.n)}</strong></a>
                    </div>
                    <div className="label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon n={ASPECT_ICON[r.deg]} size={16} color={harmonyColor(metrics(s, t).harmony)} />{r.name} · {r.rule}</div>
                    <Rich text={r.meaning} className="src" />
                    <div className="tone tone-action" style={{ marginTop: 8 }}><h3>פעולה להיום</h3><p>{b.advice}</p></div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card">
            <div className="section-title"><h2>{plain(s.n)} מול כל המזלות</h2><span className="label">צבע: טיב · עובי: עוצמה</span></div>
            <div className="all-rel">
              <RelRadial a={s} onPick={(id) => go(`bond?a=${s.id}&b=${id}`)} />
              <div><RelBars a={s} onPick={(id) => go(`bond?a=${s.id}&b=${id}`)} /><HarmonyKey /><Hint>לחיצה על מזל או על שורה פותחת ניתוח מלא של הקשר.</Hint></div>
            </div>
          </section>

          <section className="duo">
            <div className="card sky"><span className="label"><Icon n="sky" size={14} /> בשמיים</span><Rich text={s.sci} /></div>
            <div className="card sky"><span className="label"><Icon n="read" size={14} /> במיתוס</span><Rich text={s.myth} /></div>
          </section>

          <section className="card loop">
            <div className="section-title"><h2>לולאה: מחשבה, מעשה, רישום</h2></div>
            <p className="reflect">"{s.ref}"</p>
            <label className="label" htmlFor="th">מחשבה</label>
            <textarea id="th" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="מה עולה לך? משפט אחד מספיק." />
            <VoiceButton value={draft} onText={setDraft} />
            <label className="did"><input type="checkbox" checked={did} onChange={(e) => setDid(e.target.checked)} /> <span><strong>מעשה:</strong> ביצעתי היום את פעולת הגשר</span></label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="press btn btn-primary" onClick={record} disabled={!draft.trim() && !did}>רישום ביומן</button>
              <span className="saved">{draft ? 'הטיוטה נשמרת אוטומטית' : ''}</span>
            </div>
            {journal.length > 0 ? (
              <ol className="journal">{journal.map((j, k) => (
                <li key={k}><span className="label">{j.d}{j.did ? ' · בוצע' : ''}</span><p>{j.thought || 'פעולת הגשר בוצעה.'}</p></li>
              ))}</ol>
            ) : <p className="src">היומן ריק. הרישום הראשון יופיע כאן, ויישמר במכשיר הזה.</p>}
          </section>
        </div>

        <aside className="sign-side">
          <div className="card lift summary">
            <span className="label">תקציר בפורמט קבוע</span>
            <dl>
              <dt>יסוד</dt><dd><strong><ElTag el={s.elc} /></strong> · {EL[s.elc].verb}</dd>
              <dt>אופן</dt><dd><strong><ModeTag mo={s.mo} /></strong> <span className="src">{MO[s.mo].term}</span></dd>
              <dt>כוכב שולט</dt><dd><strong>{s.pl}</strong></dd>
              <dt>תאריכי המזל</dt><dd><strong>{s.trop}</strong></dd>
              <dt>השמש בקבוצה עצמה</dt><dd><strong>{s.astro}</strong> <a href="#/sky" className="src">למה שונה?</a></dd>
              <dt>חודש עברי</dt><dd><strong>{s.month}</strong> <span className="src">ספר יצירה</span></dd>
              <dt>מילות מפתח</dt><dd>{s.kw.join(' · ')}</dd>
            </dl>
          </div>
          <div className="card haiku">
            <span className="label"><Icon n="insight" size={14} /> הייקו</span>
            <p className="haiku-lines">{s.haiku.map((l) => <span key={l}>{l}</span>)}</p>
            <p className="src">{s.hk}</p>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label">פוסט מוכן לשיתוף</span>
              <CopyButton text={post} icon={<IconCopy />} />
            </div>
            <p className="post">{post}</p>
          </div>
        </aside>
      </div>
    </article>
  );
}
