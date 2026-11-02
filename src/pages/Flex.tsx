import { SCENARIOS, SIGNS } from '../data/content';
import { ELEMENTS, EL } from '../data/meta';
import { Purpose } from '../components/Purpose';
import { Glyph } from '../components/Glyph';
import { IconNext, IconPrev, IconReset } from '../components/icons';
import { Rich } from '../lib/rich';
import { byId } from '../lib/relations';
import { load, useStored } from '../lib/store';

type Pick = Record<string, string>;
const plain = (n: string) => n.replace(/[֑-ׇ]/g, '');

export function Flex() {
  const [i, setI] = useStored<number>('flexI', 0);
  const [picks, setPicks] = useStored<Pick>('flexPicks', {});
  const mine = load<{ top?: string } | null>('quizResult', null)?.top;
  const sc = SCENARIOS[i];
  const pick = picks[sc.id];
  const verdict = pick ? (sc.best.includes(pick) ? 'best' : sc.ok.includes(pick) ? 'ok' : 'miss') : null;
  const done = SCENARIOS.filter((s) => picks[s.id]);
  const pts = done.reduce((a, s) => a + (s.best.includes(picks[s.id]) ? 2 : s.ok.includes(picks[s.id]) ? 1 : 0), 0);
  const usedEls = new Set(done.filter((s) => s.best.includes(picks[s.id]) || s.ok.includes(picks[s.id])).map((s) => byId[picks[s.id]].elc));
  const ownEl = mine ? byId[mine].elc : null;
  const ownShare = ownEl && done.length ? done.filter((s) => byId[picks[s.id]].elc === ownEl).length / done.length : null;
  const needEl = byId[sc.best[0]].elc;

  return (
    <>
      <header className="page-head rise">
        <span className="label">סימולטור גמישות · מצב <bdi className="num">{i + 1}</bdi> מתוך <bdi className="num">{SCENARIOS.length}</bdi></span>
        <h1>איזה מבנה הרגע הזה דורש?</h1>
        <Rich className="explain" text={'לא "מה הייתי עושה", אלא **מה המצב צריך**.\n==גמישות היא לבחור מבנה שאינו שלך, כשצריך.=='} />
      </header>
      <Purpose why={'לתרגל **מעבר** למבנה שהמצב דורש, גם כשאינו שלך.'} how={'קוראים מצב מהחיים, ובוחרים **מבנה אחד** מתוך 12.'} get={'מד גמישות: כמה **יסודות** אתה יודע להפעיל.'} />
      <div className="flex-layout">
        <section className="card lift scenario rise" key={sc.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span className="label">מצב</span>
            <div className="ops">
              <button className="press icon-btn" aria-label="המצב הקודם" title="המצב הקודם" disabled={i === 0} onClick={() => setI(i - 1)}><IconPrev /></button>
              <button className="press icon-btn" aria-label="המצב הבא" title="המצב הבא" disabled={i === SCENARIOS.length - 1} onClick={() => setI(i + 1)}><IconNext /></button>
            </div>
          </div>
          <h2 className="sc-title">{sc.title}</h2>
          <p className="explain">{sc.body}</p>
          <div className="pickgrid" role="group" aria-label="בחירת מבנה">
            {ELEMENTS.map((e) => (
              <div key={e.key} className="pickcol">
                <span className="label"><span className="swatch" style={{ background: e.color }} />{e.he}</span>
                {SIGNS.filter((s) => s.elc === e.key).map((s) => {
                  const state = pick ? (sc.best.includes(s.id) ? 'best' : sc.ok.includes(s.id) ? 'ok' : s.id === pick ? 'miss' : '') : '';
                  return (
                    <button key={s.id} className={'press pick ' + state} aria-pressed={pick === s.id}
                      onClick={() => setPicks({ ...picks, [sc.id]: s.id })}>
                      <Glyph sym={s.sym} color={e.color} size={20} /> {plain(s.n)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {verdict && (
            <div className={'tone ' + (verdict === 'miss' ? 'tone-problem' : 'tone-solution') + ' rise'}>
              <h3>{verdict === 'best' ? 'מדויק' : verdict === 'ok' ? 'קרוב' : 'פספוס'}</h3>
              <Rich text={`בחרת **${plain(byId[pick!].n)}** (${EL[byId[pick!].elc].he}). המצב דורש **${EL[needEl].he}**: ${sc.best.map((b) => plain(byId[b].n)).join(' או ')}.`} />
            </div>
          )}
          {verdict && <div className="tone tone-insight rise"><h3>תובנה</h3><p>{sc.insight}</p></div>}
          {verdict && i < SCENARIOS.length - 1 && <button className="press btn btn-primary" style={{ justifySelf: 'start' }} onClick={() => setI(i + 1)}>למצב הבא</button>}
        </section>

        <aside className="card flex-side">
          <span className="label">מד הגמישות</span>
          <div className="big-score"><bdi className="num">{pts}</bdi><span className="src"> / <bdi className="num">{SCENARIOS.length * 2}</bdi> נקודות</span></div>
          <p className="src">מדויק = <bdi className="num">2</bdi>, קרוב = <bdi className="num">1</bdi>. נענו <bdi className="num">{done.length}</bdi> מתוך <bdi className="num">{SCENARIOS.length}</bdi>.</p>
          <div className="label" style={{ marginTop: 12 }}>יסודות שהשתמשת בהם נכון</div>
          <div className="el-dots">{ELEMENTS.map((e) => <span key={e.key} className={usedEls.has(e.key) ? 'on' : ''} style={{ ['--c' as string]: e.color }}>{e.he}</span>)}</div>
          <Rich className="src" text={`**${usedEls.size} מתוך 4** יסודות. גמישות מלאה = כל הארבעה.`} />
          {ownShare != null && (
            <div className="tone tone-neutral" style={{ marginTop: 12 }}><h3>הנטייה שלך</h3>
              <Rich text={`בחרת את היסוד שלך (**${EL[ownEl!].he}**) ב-**${Math.round(ownShare * 100)}%** מהמצבים.\n${ownShare > 0.4 ? '==המבנה שלך מושך אותך גם כשהמצב צריך אחר.==' : '==אתה כבר יוצא מהמבנה שלך כשצריך.=='}`} /></div>
          )}
          {!mine && <p className="src" style={{ marginTop: 12 }}><a href="#/quiz">אחרי האבחון</a> יוצג כאן כמה אתה נמשך למבנה שלך.</p>}
          <ol className="sc-list">
            {SCENARIOS.map((s, k) => {
              const p = picks[s.id]; const v = p ? (s.best.includes(p) ? 'best' : s.ok.includes(p) ? 'ok' : 'miss') : '';
              return <li key={s.id}><button className={'chip ' + v} aria-pressed={k === i} onClick={() => setI(k)}><bdi className="num">{k + 1}</bdi> {s.title}</button></li>;
            })}
          </ol>
          <button className="press btn" onClick={() => { setPicks({}); setI(0); }}><IconReset />התחלה מחדש</button>
        </aside>
      </div>
    </>
  );
}
