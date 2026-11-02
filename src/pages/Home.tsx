import { useState } from 'react';
import { Wheel } from '../components/Wheel';
import { Purpose } from '../components/Purpose';
import { ELEMENTS } from '../data/meta';
import { Rich } from '../lib/rich';
import { go } from '../lib/route';
import { byId } from '../lib/relations';
import { sunConstellation, sunSignId } from '../lib/astro';
import { load } from '../lib/store';

export function Home() {
  const [actEl, setActEl] = useState<string | null>(null);
  const now = new Date();
  const sun = byId[sunSignId(now)];
  const con = sunConstellation(now);
  const quiz = load<{ top?: string } | null>('quizResult', null);
  const mine = quiz?.top ? byId[quiz.top] : null;
  const date = now.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });
  return (
    <>
      <section className="hero">
        <div className="rise" style={{ display: 'grid', gap: 16 }}>
          <span className="label">12 מבנים · 4 יסודות · 3 אופנים</span>
          <h1>מזל הוא <em>כתובת</em>,<br />לא גזר דין.</h1>
          <Rich className="explain" text={'**12 דרכים** לגיטימיות להיות בעולם. לכל אחת כוח, צל וגשר אל האחרות.\nהמטרה: ==לזהות את שלך, ולדעת מתי לעבור לאחר.=='} />
          <div className="cta">
            <button className="press btn btn-primary" onClick={() => go('quiz')}>{mine ? 'לאבחון מחדש' : 'גלו את המבנה שלכם'}</button>
            <button className="press btn" onClick={() => go('atlas')}>אטלס 12 המבנים</button>
            {mine && <button className="press btn btn-brass" onClick={() => go('sign/' + mine.id)}>המבנה שלי: {mine.n}</button>}
          </div>
          <a href="#/sky" className="press today card" style={{ textDecoration: 'none' }}>
            <span className="label" style={{ flex: '0 0 auto' }}>היום, {date}</span>
            <Rich as="span" text={`השמש **במזל ${sun.n.replace(/[֑-ׇ]/g, '')}**, ובשמיים עצמם **בקבוצת ${con.he}**. למה?`} />
          </a>
        </div>
        <div className="hero-wheel rise" style={{ animationDelay: '120ms' }}>
          <Wheel onPick={(id) => go('sign/' + id)} activeEl={actEl} spin />
        </div>
      </section>

      <Purpose why={'להכיר **12 דרכי פעולה**, במקום תווית אחת קבועה.'} how={'מתחילים **באבחון**, או לוחצים על מזל בגלגל.'} get={'מבנה מוביל, **קשרים** לאחרים, ותרגול גמישות.'} />

      <section aria-label="מקרא היסודות" onMouseLeave={() => setActEl(null)}>
        <div className="legend">
          {ELEMENTS.map((e) => (
            <div key={e.key} className={'legend-item' + (actEl === e.key ? ' on' : actEl ? ' off' : '')} style={{ borderColor: e.color }}
              onMouseEnter={() => setActEl(e.key)} onFocus={() => setActEl(e.key)} tabIndex={0}>
              <span className="label">{e.verb}</span>
              <div><b>{e.he}</b><span className="en">{e.en}</span></div>
              <Rich text={e.line} className="src" />
            </div>
          ))}
        </div>
      </section>

      <section className="pst">
        <div className="tone tone-problem"><h3>הבעיה</h3><Rich text={'הורוסקופ רגיל נותן **תווית קבועה**.\nהיא מסבירה התנהגות, ולא משנה אותה.'} /></div>
        <div className="tone tone-solution"><h3>הפתרון</h3><Rich text={'כל מזל הוא **מבנה פעולה**: יסוד ואופן.\nמזהים את שלך, ומתרגלים לעבור לאחר.'} /></div>
        <div className="tone tone-insight"><h3>התובנה</h3><Rich text={'==גמישות היא הכישרון.==\nהמבנה שלך הוא נקודת מוצא, לא כלוב.'} /></div>
      </section>

      <section>
        <div className="section-title"><h2>מפת התוכן</h2><span className="label">שישה כלים, לולאה אחת: זיהוי, הבנה, קשר, תרגול</span></div>
        <div className="grid map-grid">
          {[
            ['atlas', '12', 'אטלס המבנים', 'מטריצה אחת של **4 יסודות × 3 אופנים** מסבירה את כולם.'],
            ['quiz', '12', 'אבחון עצמי', '**12 שאלות**, ומדד שמראה כמה הפרופיל שלך ברור.'],
            ['bond', '66', 'קשרים', 'כל זוג מבנים הוא **זווית**. **66** זוגות, ומפה למעגל שלך.'],
            ['flex', '10', 'סימולטור גמישות', '**10 מצבים** מהחיים. איזה מבנה כל רגע דורש?'],
            ['sky', '30°', 'השמיים היום', 'הכוכבים זזו **מזל שלם** מאז שהמזלות נקבעו.'],
            ['read', '1,500', 'כתבה: מתחנה בשמיים לתחנה בנפש', 'מבית אלפא ועד יפו. **1,500 שנות** גלגל מזלות בארץ.'],
          ].map(([p, n, t, l], i) => (
            <a key={p} href={'#/' + p} className="press map-card card rise" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="big">{n}</span><h3>{t}</h3><Rich text={l} className="src" />
            </a>
          ))}
        </div>
      </section>

      <section className="card quote-wrap lift">
        <span className="label">מן המקורות</span>
        <p className="quote">"רבי יוחנן אמר: אין מזל לישראל."</p>
        <Rich text={'==המזל מתאר נטייה. הבחירה נשארת אצלך.==\nזה הבסיס לכל האפליקציה: מבנה, לא גורל.'} />
        <span className="src">תלמוד בבלי, מסכת שבת, דף קנו עמוד א</span>
      </section>
      <p className="src" style={{ textAlign: 'center' }}>מקור השראה: פסיפס גלגל המזלות בבית הכנסת <strong>בית אלפא</strong><span className="en">Beit Alpha</span>, המאה ה-6.</p>
    </>
  );
}
