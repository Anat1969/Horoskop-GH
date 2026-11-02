import type { ReactNode } from 'react';
import { ELEMENTS, MODES } from '../data/meta';
import { Purpose } from '../components/Purpose';
import { Hint, Opp, Param, Quote, Steps, Trend, elIcon, moIcon } from '../components/Grammar';
import { Icon, type IconName } from '../components/Icon';
import { HarmonyKey } from '../components/RelViz';
import { Rich } from '../lib/rich';

const ASPECTS: [IconName, string, string][] = [
  ['a0', '0°', 'אותו מבנה'], ['a30', '30°', 'שכנות'], ['a60', '60°', 'שישית'], ['a90', '90°', 'ריבוע'],
  ['a120', '120°', 'משולש'], ['a150', '150°', 'חמישית'], ['a180', '180°', 'ניגוד'],
];
const FORMATS: [string, string, ReactNode][] = [
  ['כפתור', 'פעולה. מרובע, עם צל, עולה בריחוף ושוקע בלחיצה.', <button className="press btn" type="button">דוגמה</button>],
  ['בורר', 'בחירה בלי מסגרת. הנבחר שחור ומודגש.', <span className="chips"><button className="chip" aria-pressed="true" type="button">אש</button><button className="chip" type="button">מים</button></span>],
  ['פרמטר', 'תווית במונוספייס מעל ערך.', <Param label="כוכב שולט" icon="sky"><strong>מאדים</strong></Param>],
  ['ציטוט', 'מירכאות, ומקור קטן ואפור.', <Quote text="אין מזל לישראל." src="שבת קנו ע״א" />],
  ['הסבר', 'סימן שאלה ושורה אפורה: איך משתמשים.', <Hint>לחיצה על מזל פותחת את דף המבנה.</Hint>],
  ['הדגשה', 'מילה חשובה בבולד.', <Rich as="span" text="מבנה **פעולה**, לא תווית." />],
  ['תובנה', 'מרקר צהוב. אחת לכל קטע.', <mark>גמישות היא הכישרון.</mark>],
  ['בעיה', 'קופסה אדומה עם משולש אזהרה.', <div className="tone tone-problem"><h3>בעיה</h3><p>תווית קבועה.</p></div>],
  ['פתרון', 'קופסה ירוקה עם סימן וי.', <div className="tone tone-solution"><h3>פתרון</h3><p>מבנה שמתרגלים.</p></div>],
  ['פעולה', 'קופסה שחורה עם ברק: מה עושים היום.', <div className="tone tone-action"><h3>פעולה</h3><p>שאלה אחת לפני שזזים.</p></div>],
  ['עלייה וירידה', 'חץ ירוק למעלה, אדום למטה.', <span style={{ display: 'flex', gap: 16 }}><Trend dir="up">זורם</Trend><Trend dir="down">מותח</Trend></span>],
  ['הפכים', 'שני צדדים וחץ דו־כיווני.', <Opp a="טרופי" b="סידרי" />],
  ['מסלול', 'שלבים ממוספרים לפי סדר.', <Steps items={['**זיהוי**', '**הבנה**', '**תרגול**']} />],
  ['היררכיה', 'שלוש רמות: כותרת, שורת תובנה, הסבר.', <div><h3 style={{ fontSize: 26, fontWeight: 200 }}>כותרת</h3><p style={{ fontSize: 18 }}>שורת תובנה</p><p className="src">משפט הסבר</p></div>],
];
const HIDDEN: [IconName, string, string][] = [
  ['button', 'כפתור A&I בפינה', 'העתקת קישור למצב הנוכחי, התקנה כאפליקציה, ושיחת הפיתוח.'],
  ['atlas', 'לחיצה על מזל בגלגל', 'פותחת את דף המבנה. בדף הקשרים: בוחרת צד א או ב לסירוגין.'],
  ['tip', '+ ו־− ליד בורר', '+ מוסיף בחירה, − מסיר. לחיצה רגילה מחליפה, "הכול" מאפס.'],
  ['path', 'חצים בפינת כרטיס', 'הקודם והבא. גם במקשי החצים במקלדת.'],
  ['solution', 'X', 'סגירה וחזרה לרשימה. גם במקש Esc.'],
  ['time', 'הפעלה ואיפוס בשמיים', 'הזמן רץ 250 שנה בשנייה. איפוס מחזיר לשנה הנוכחית.'],
  ['relation', 'ריחוף על שורה או תא', 'מציג את הזווית והכלל. לחיצה טוענת את הזוג לניתוח.'],
  ['quote', 'העתקה', 'מעתיקה פוסט מוכן לשיתוף.'],
];

export function Key() {
  return (
    <>
      <header className="page-head rise">
        <span className="label">מקרא</span>
        <h1>מקסימום במינימום.</h1>
        <Rich className="explain" text={'כל סוג מידע נראה תמיד אותו דבר: **צבע**, **אייקון** ו**פורמט**.\n==פעם אחת לומדים, ואז קוראים כל דף במבט.=='} />
      </header>
      <Purpose why={'ללמוד את **שפת הסימנים** של האפליקציה, פעם אחת.'} how={'עוברים על **צבע**, **אייקונים**, **פורמטים** ו**כפתורים חבויים**.'} get={'קריאה של כל דף **במבט**, בלי לקרוא כל מילה.'} />

      <section className="key-grid">
        <div className="card">
          <div className="section-title"><h2>צבע</h2><span className="label">צבע אומר משהו, תמיד</span></div>
          <span className="label">נושא: ארבעת היסודות</span>
          <div className="key-row">{ELEMENTS.map((e) => <span key={e.key} className="key-chip"><i style={{ background: e.color }} /><Icon n={elIcon(e.key)} size={16} color={e.color} />{e.he}</span>)}</div>
          <span className="label">משמעות</span>
          <div className="key-row">
            <span className="key-chip"><i style={{ background: 'var(--problem)' }} />בעיה, צל</span>
            <span className="key-chip"><i style={{ background: 'var(--solution)' }} />פתרון, כוח</span>
            <span className="key-chip"><i style={{ background: 'var(--marker)' }} />תובנה</span>
            <span className="key-chip"><i style={{ background: 'var(--black)' }} />פעולה, נבחר</span>
          </div>
          <span className="label">טיב קשר</span>
          <HarmonyKey />
          <p className="src">הבסיס לבן, אפור ושחור. צבע מופיע רק כשהוא מקודד נושא או משמעות.</p>
        </div>
        <div className="card">
          <div className="section-title"><h2>אייקונים</h2><span className="label">קו אחד, רעיון אחד</span></div>
          <span className="label">יסודות: המשולשים האלכימיים</span>
          <div className="key-row">{ELEMENTS.map((e) => <span key={e.key} className="key-ico"><Icon n={elIcon(e.key)} size={26} color={e.color} />{e.he}</span>)}</div>
          <span className="label">אופנים</span>
          <div className="key-row">{MODES.map((m) => <span key={m.key} className="key-ico"><Icon n={moIcon(m.key)} size={26} />{m.he}</span>)}</div>
          <span className="label">קשרים: הזווית על הגלגל</span>
          <div className="key-row">{ASPECTS.map(([n, d, t]) => <span key={n} className="key-ico"><Icon n={n} size={26} /><span>{t}</span><span className="src num">{d}</span></span>)}</div>
          <span className="label">סוגי מידע</span>
          <div className="key-row">{([['quote', 'ציטוט'], ['insight', 'תובנה'], ['problem', 'בעיה'], ['solution', 'פתרון'], ['action', 'פעולה'], ['explain', 'הסבר'], ['map', 'מקום'], ['time', 'זמן']] as [IconName, string][]).map(([n, t]) => <span key={n} className="key-ico"><Icon n={n} size={26} />{t}</span>)}</div>
        </div>
      </section>

      <section className="card">
        <div className="section-title"><h2>פורמטים</h2><span className="label">{FORMATS.length} סוגי מידע, וכל אחד בפורמט קבוע</span></div>
        <div className="formats">
          {FORMATS.map(([t, d, ex]) => (
            <div key={t} className="format"><div><strong>{t}</strong><p className="src">{d}</p></div><div className="format-ex">{ex}</div></div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-title"><h2>כפתורים חבויים</h2><span className="label">מה שלא כתוב עליו, מוסבר כאן</span></div>
        <div className="hidden-list">
          {HIDDEN.map(([n, t, d]) => <div key={t} className="hidden-item"><Icon n={n} size={22} /><div><strong>{t}</strong><p className="src">{d}</p></div></div>)}
        </div>
        <Hint>בכל מקום באפליקציה: ריחוף על כפתור אייקון מציג תווית שחורה עם ההסבר.</Hint>
      </section>
    </>
  );
}
