import { useEffect, useState } from 'react';
import { SIGNS } from '../data/content';
import { EL, MO } from '../data/meta';
import { Glyph } from '../components/Glyph';
import { IconCopy, IconNext, IconPrev, IconX } from '../components/icons';
import { Rich } from '../lib/rich';
import { go } from '../lib/route';
import { byId, byName, easy, relation } from '../lib/relations';
import { useStored } from '../lib/store';
import { CopyButton } from '../components/CopyButton';

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
        <button className="press icon-btn" title={'הקודם: ' + plain(prev.n)} aria-label={'הקודם: ' + plain(prev.n)} onClick={() => go('sign/' + prev.id)}><IconPrev /></button>
        <span className="label"><bdi className="num">{i + 1}</bdi> / <bdi className="num">12</bdi></span>
        <button className="press icon-btn" title={'הבא: ' + plain(next.n)} aria-label={'הבא: ' + plain(next.n)} onClick={() => go('sign/' + next.id)}><IconNext /></button>
        <button className="press icon-btn" title="חזרה לאטלס" aria-label="חזרה לאטלס" onClick={() => go('atlas')}><IconX /></button>
      </div>

      <header className="sign-hero sky rise">
        <div className="sign-glyph"><Glyph sym={s.sym} color={c} size={120} /></div>
        <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
          <span className="label">{EL[s.elc].he} · {MO[s.mo].he} · {s.month}</span>
          <h1>{s.n}<span className="en" style={{ color: '#9aa0c3' }}>{s.en}</span></h1>
          <p className="sign-core">{s.core}</p>
          <p style={{ color: '#cfd3ea' }}>{s.tip}</p>
        </div>
      </header>

      <div className="sign-body">
        <div className="sign-main">
          <section className="duo">
            <div className="tone tone-solution"><h3>כוחות</h3><ul className="list">{s.strengths.map((x) => <li key={x}><strong>{x}</strong></li>)}</ul></div>
            <div className="tone tone-problem"><h3>צללים</h3><ul className="list">{s.shadows.map((x) => <li key={x}><strong>{x}</strong></li>)}</ul></div>
          </section>
          <div className="tone tone-insight"><h3>קצה הצמיחה</h3><p className="growth"><mark>{s.growth}</mark></p></div>

          <section>
            <div className="section-title"><h2>גשרים אל מבנים אחרים</h2><span className="label">כל גשר: הכלל, המשמעות, והפעולה</span></div>
            <div className="bridges">
              {s.bridge.map((b) => {
                const t = byName(b.to), r = relation(s, t);
                return (
                  <div key={b.to} className="card bridge">
                    <div className="who">
                      <strong>{plain(s.n)}</strong><span className="arrow">← לומד מ ←</span>
                      <a href={'#/sign/' + t.id} className="press-link" style={{ color: `var(--${t.elc})` }}><strong>{plain(t.n)}</strong></a>
                    </div>
                    <div className="label">{r.name} · {r.rule}</div>
                    <Rich text={r.meaning} className="src" />
                    <div className="tone tone-solution" style={{ marginTop: 8 }}><h3>פעולה להיום</h3><p>{b.advice}</p></div>
                  </div>
                );
              })}
            </div>
            <div className="easy">
              <span className="label">מדברים בקלות (אותו יסוד, או יסוד משלים):</span>
              {easy(s).map((o) => (
                <a key={o.id} href={'#/sign/' + o.id} className="chip" style={{ textDecoration: 'none' }}>
                  <Glyph sym={o.sym} color={`var(--${o.elc})`} size={16} /> {plain(o.n)} <span className="src">{relation(s, o).deg}°</span>
                </a>
              ))}
            </div>
          </section>

          <section className="duo">
            <div className="card sky"><span className="label">בשמיים</span><Rich text={s.sci} /></div>
            <div className="card sky"><span className="label">במיתוס</span><Rich text={s.myth} /></div>
          </section>

          <section className="card loop">
            <div className="section-title"><h2>לולאה: מחשבה, מעשה, רישום</h2></div>
            <p className="reflect">"{s.ref}"</p>
            <label className="label" htmlFor="th">מחשבה</label>
            <textarea id="th" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="מה עולה לך? משפט אחד מספיק." />
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
              <dt>יסוד</dt><dd style={{ color: c }}><strong>{EL[s.elc].he}</strong> · {EL[s.elc].verb}</dd>
              <dt>אופן</dt><dd><strong>{MO[s.mo].he}</strong> <span className="src">{MO[s.mo].term}</span></dd>
              <dt>כוכב שולט</dt><dd><strong>{s.pl}</strong></dd>
              <dt>תאריכי המזל</dt><dd><strong>{s.trop}</strong></dd>
              <dt>השמש בקבוצה עצמה</dt><dd><strong>{s.astro}</strong> <a href="#/sky" className="src">למה שונה?</a></dd>
              <dt>חודש עברי</dt><dd><strong>{s.month}</strong> <span className="src">ספר יצירה</span></dd>
              <dt>מילות מפתח</dt><dd>{s.kw.join(' · ')}</dd>
            </dl>
          </div>
          <div className="card haiku">
            <span className="label">הייקו</span>
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
