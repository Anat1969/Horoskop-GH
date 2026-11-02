import { QUIZ } from '../data/content';
import { ELEMENTS, MODES } from '../data/meta';
import { Purpose } from '../components/Purpose';
import { Glyph } from '../components/Glyph';
import { ElTag, ModeTag } from '../components/Grammar';
import { Rich } from '../lib/rich';
import { go } from '../lib/route';
import { byId } from '../lib/relations';
import { save, useStored } from '../lib/store';
import { clarityLabel, score } from '../lib/score';

const pct = (x: number, t: number) => (t ? Math.round((x / t) * 100) : 0);

export function Quiz() {
  const [ans, setAns] = useStored<(number | null)[]>('quiz', Array(QUIZ.length).fill(null));
  const [step, setStep] = useStored<number>('quizStep', 0);
  const done = step >= QUIZ.length;
  const choose = (k: number) => {
    const n = [...ans]; n[step] = k; setAns(n);
    const nx = step + 1; setStep(nx);
    if (nx >= QUIZ.length) { const r = score(n); save('quizResult', { top: r.top, el: r.el, d: Date.now() }); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const restart = () => { setAns(Array(QUIZ.length).fill(null)); setStep(0); };

  if (!done) {
    const q = QUIZ[step];
    return (
      <>
        <header className="page-head rise">
          <span className="label">אבחון עצמי · שאלה <bdi className="num">{step + 1}</bdi> מתוך <bdi className="num">12</bdi></span>
          <div className="progress" aria-hidden="true"><span style={{ width: `${(step / QUIZ.length) * 100}%` }} /></div>
          <h1 key={step} className="rise">{q.q}</h1>
          <p className="explain">בחרו את התשובה הראשונה שמרגישה נכונה. אין תשובה טובה או רעה.</p>
        </header>
        {step === 0 && <Purpose why={'לזהות את **המבנה המוביל** שלך, ועד כמה הוא בולט.'} how={'עונים על **12 שאלות**. התשובה הראשונה שמרגישה נכונה.'} get={'דירוג של **12 המבנים**, ומדד אמינות שמסביר את עצמו.'} />}
        <div className="answers" key={'a' + step}>
          {q.opts.map((o, k) => (
            <button key={k} className="press answer rise" style={{ animationDelay: `${k * 60}ms` }} aria-pressed={ans[step] === k} onClick={() => choose(k)}>
              <span className="label">{String.fromCharCode(0x05d0 + k)}</span>{o.text}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="press btn" disabled={step === 0} onClick={() => setStep(step - 1)}>לשאלה הקודמת</button>
          <span className="src" style={{ alignSelf: 'center' }}>התשובות נשמרות במכשיר. אפשר להפסיק ולחזור.</span>
        </div>
      </>
    );
  }

  const r = score(ans);
  const top = byId[r.top];
  const elTotal = Object.values(r.el).reduce((a, b) => a + b, 0);
  const moTotal = Object.values(r.mo).reduce((a, b) => a + b, 0);
  const cl = clarityLabel(r.clarity);
  return (
    <>
      <header className="sky card result-hero rise" style={{ ['--c' as string]: `var(--${top.elc})` }}>
        <div className="sign-glyph"><Glyph sym={top.sym} color={`var(--${top.elc})`} size={96} /></div>
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <span className="label">המבנה המוביל שלך</span>
          <h1 style={{ fontSize: 'clamp(44px,5.5vw,76px)', fontWeight: 100 }}>{top.n}</h1>
          <p className="sign-core">{top.core}</p>
          <div className="cta"><button className="press btn btn-brass" onClick={() => go('sign/' + top.id)}>לדף המבנה</button><button className="press btn" onClick={() => go('bond?a=' + top.id)}>הקשרים שלי</button><button className="press btn" onClick={() => go('flex')}>לתרגול גמישות</button></div>
        </div>
      </header>

      <section className="duo">
        <div className="card">
          <div className="section-title"><h2>יסודות</h2><span className="label">מה מניע אותך</span></div>
          {ELEMENTS.map((e) => (
            <div key={e.key} className="bar-row"><span><ElTag el={e.key} /></span>
              <div className="bar"><span style={{ width: `${pct(r.el[e.key], elTotal)}%`, background: e.color }} /></div>
              <bdi className="num">{pct(r.el[e.key], elTotal)}%</bdi></div>
          ))}
        </div>
        <div className="card">
          <div className="section-title"><h2>אופנים</h2><span className="label">איך אתה פועל</span></div>
          {MODES.map((m) => (
            <div key={m.key} className="bar-row"><span><ModeTag mo={m.key} /></span>
              <div className="bar"><span style={{ width: `${pct(r.mo[m.key], moTotal)}%`, background: 'var(--ink-2)' }} /></div>
              <bdi className="num">{pct(r.mo[m.key], moTotal)}%</bdi></div>
          ))}
          <p className="src" style={{ marginTop: 8 }}>אופן נמדד רק בחלק מהשאלות, ולכן הוא משני ליסוד.</p>
        </div>
      </section>

      <section>
        <div className="section-title"><h2>שלושת המבנים הקרובים</h2><span className="label">ניקוד מתוך הדירוג המלא</span></div>
        <div className="grid">
          {r.ranking.slice(0, 3).map((x, k) => {
            const s = byId[x.id];
            return (
              <a key={x.id} href={'#/sign/' + s.id} className="press card rank" style={{ textDecoration: 'none', borderTop: `4px solid var(--${s.elc})` }}>
                <span className="label">מקום <bdi className="num">{k + 1}</bdi></span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 28, fontWeight: 300 }}><Glyph sym={s.sym} color={`var(--${s.elc})`} size={24} /> {s.n}</span>
                  <bdi className="num" style={{ fontSize: 24 }}>{x.score}</bdi>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="card method">
        <div className="section-title"><h2>כמה הפרופיל אמין?</h2><span className="label">הערכה אוטומטית שמסבירה את עצמה</span></div>
        <div className="metrics">
          <div className="metric"><span className="label">בהירות</span><b className="num">{Math.round(r.clarity * 100)}%</b><strong>{cl.t}</strong><p className="src">{cl.d}</p>
            <p className="src"><strong>חישוב:</strong> (ראשון פחות שני) חלקי ראשון.</p></div>
          <div className="metric"><span className="label">עקביות</span><b className="num">{Math.round(r.consistency * 100)}%</b><strong>תשובות באותו יסוד</strong>
            <p className="src">כמה מהתשובות נשענו בעיקר על היסוד המוביל שלך.</p></div>
          <div className="metric"><span className="label">כיסוי</span><b className="num">{r.answered}/12</b><strong>שאלות שנענו</strong>
            <p className="src">כל שאלה מכסה את ארבעת היסודות.</p></div>
        </div>
        <div className="pst" style={{ marginTop: 16 }}>
          <div className="tone tone-neutral"><h3>על מה זה נשען</h3><Rich text={'טיפולוגיה של **4 יסודות** (אמפדוקלס) ו**3 אופנים** (תלמי).\nכל תשובה נותנת **×2** למזל ו**×1** ליסוד ולאופן.'} /></div>
          <div className="tone tone-problem"><h3>המגבלה</h3><Rich text={'זה כלי **השתקפות**, לא מבחן פסיכומטרי מתוקף.\nהתשובה משקפת את הרגע, לא את הזהות.'} /></div>
          <div className="tone tone-insight"><h3>מה עושים עם זה</h3><Rich text={'==הצל של המבנה שלך הוא מקום התרגול.==\nהסימולטור מראה מתי לעבור למבנה אחר.'} /></div>
        </div>
      </section>
      <button className="press btn" onClick={restart} style={{ justifySelf: 'start' }}>אבחון מחדש</button>
    </>
  );
}
