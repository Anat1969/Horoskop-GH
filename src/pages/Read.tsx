import { Purpose } from '../components/Purpose';
import { Mosaic } from '../components/Mosaic';
import { CopyButton } from '../components/CopyButton';
import { IconCopy, IconPrint } from '../components/icons';
import { Rich } from '../lib/rich';

const POST = `גלגל המזלות הכי מפורסם בארץ נמצא על רצפה.

בבית הכנסת בבית אלפא, במאה ה-6, הניחו אומנים 12 מזלות בפסיפס, בשמות עבריים, סביב שמש.
המתפללים דרכו עליהם בכל בוקר.

זו לא הייתה אמונה בגורל. התלמוד כבר אמר: "אין מזל לישראל".
הגלגל היה לוח שנה: עונות, חודשים, קצב.

ככה אני קוראת היום מזלות: לא כמי שאני, אלא כמבנה שאני יכולה להיכנס אליו ולצאת ממנו.
טלה כשצריך להתחיל. שור כשצריך להחזיק. דגים כשצריך להרגיש.

איזה מבנה הרגע שלכם דורש היום?`;

export function Read() {
  return (
    <article className="feature">
      <header className="feature-hero">
        <div className="feature-art"><Mosaic /></div>
        <div className="feature-title">
          <span className="label">כתבה · ידע · כ-6 דקות קריאה</span>
          <h1>מזל: מתחנה בשמיים<br />לתחנה בנפש</h1>
          <p className="deck">איך גלגל של 12 עבר מבבל, דרך רצפת בית כנסת בעמק, אל סמטאות יפו ואל השאלה מי אנחנו.</p>
          <span className="src">איור בהשראת פסיפס בית אלפא, נבנה בקוד. לא צילום.</span>
        </div>
      </header>

      <Purpose why={'להעמיק ב**היסטוריה** של המזלות בארץ ובשפה.'} how={'קוראים, ומעתיקים **פוסט** מוכן לשיתוף.'} get={'הקשר תרבותי: **מתחנה בשמיים** לתחנה בנפש.'} />

      <div className="feature-body">
        <blockquote className="epigraph">
          <p>"הַשָּׁמַיִם מְסַפְּרִים כְּבוֹד אֵל, וּמַעֲשֵׂה יָדָיו מַגִּיד הָרָקִיעַ."</p>
          <cite className="src">תהלים יט, ב</cite>
        </blockquote>

        <p className="dropcap">המילה <strong>מזל</strong> לא התחילה כ"הצלחה". במקרא היא מופיעה ברבים, <strong>"מַזָּלוֹת"</strong>, ברשימת צבא השמיים שהמלך יאשיהו ביער מבית המקדש. <span className="src">מלכים ב כג, ה</span></p>
        <p>מקורה באכדית, <strong>manzaltu</strong>: <mark>עמדה, תחנה</mark>. מזל הוא המקום שבו כוכב עומד. כתובת בשמיים, לא תכונה של אדם. <span className="src">Brown-Driver-Briggs, Hebrew Lexicon, 1906</span></p>

        <h2>גלגל על הרצפה</h2>
        <p>בשנת <strong>1928</strong> חפרו חברי קיבוץ חפציבה תעלת השקיה בעמק, ונתקלו בפסיפס. אלעזר ליפא סוקניק חשף אותו שנה אחר כך: רצפת בית הכנסת של <strong>בית אלפא</strong> <span className="en">Beit Alpha</span>, מהמאה ה-<strong>6</strong>.</p>
        <p>במרכז: הליוס, אל השמש, במרכבה. סביבו <strong>12</strong> מזלות, כל אחד עם שמו העברי: טלה, שור, תאומים. בפינות ארבע תקופות השנה, בשמות החודשים <strong>ניסן, תמוז, תשרי וטבת</strong>. האומנים חתמו בשמם: <strong>מריאנוס ובנו חנינא</strong>.</p>

        <figure className="pull">
          <p>"רבי חנינא אומר: מזל מחכים, מזל מעשיר, ויש מזל לישראל.<br />רבי יוחנן אמר: אין מזל לישראל."</p>
          <figcaption className="src">תלמוד בבלי, שבת קנו ע"א</figcaption>
        </figure>

        <p>שני החכמים לא התווכחו אם יש כוכבים. הם התווכחו <strong>אם הכוכבים מחליטים</strong>. הפסיפס עונה בדרך של אדריכלים: הגלגל מונח <strong>על הרצפה</strong>, מתחת לרגלי המתפללים, לא בכיפה מעליהם.</p>
        <div className="tone tone-insight"><h3>תובנה (פרשנות)</h3><p><mark>הגלגל היה לוח שנה מתחת לרגליים, לא גורל מעל הראש.</mark></p></div>

        <h2>מזל כחודש, וחודש כאות</h2>
        <p><strong>ספר יצירה</strong> מצמיד לכל מזל חודש עברי ואות: טלה לניסן, שור לאייר, וכך עד דגים לאדר. הגלגל הופך <strong>לשעון של שנה</strong>. מזל אינו מי שאתה. הוא <mark>מתי</mark> אתה.</p>
        <p>זה מתיישב עם האסטרונומיה. בגלל נקיפת ציר כדור הארץ, הכוכבים זזו מאז <strong>30°</strong>, מזל שלם. אבל טלה עדיין פותח את האביב. <a href="#/sky">המזל מודד עונה, לא מקום.</a></p>

        <h2>דוגמה מהעיר: יפו</h2>
        <div className="split">
          <div className="card">
            <span className="label">יפו העתיקה <span className="en">Old Jaffa</span></span>
            <p>בסמטאות של <strong>יפו העתיקה</strong> כל רחוב נקרא על שם מזל: סמטת מזל דגים, סמטת מזל תאומים. <mark>המזל חוזר להיות כתובת.</mark></p>
            <p className="src">שילוט רחובות, עיריית תל אביב-יפו</p>
          </div>
          <div className="card">
            <span className="label">הכלל · המשמעות · היישום</span>
            <p><strong>הכלל:</strong> גלגל מחלק מרחב וזמן ליחידות שאפשר לנווט בהן.</p>
            <p><strong>המשמעות:</strong> המזל הוא מערכת התמצאות, כמו שמות רחובות.</p>
            <p><strong>היישום:</strong> שאלו "איפה אני עכשיו בגלגל?", ולא "מי אני לנצח?".</p>
          </div>
        </div>

        <figure className="pull">
          <p>"הקוסמוס נמצא בתוכנו. אנחנו עשויים מחומר של כוכבים."</p>
          <figcaption className="src"><span className="label">תרגום</span> · "The cosmos is within us. We are made of star-stuff." · קרל סייגן (Carl Sagan), Cosmos, 1980</figcaption>
        </figure>

        <p>מקדש הכוכבים בנוי על אותה קריאה. <strong>12</strong> מבנים, <strong>4</strong> יסודות ו-<strong>3</strong> אופנים, כשפה לרגעים. האבחון מזהה איפה אתם עומדים. הסימולטור מתרגל מעבר. <mark>הגמישות היא הכישרון.</mark></p>

        <section className="haiku card">
          <span className="label">הייקו</span>
          <p className="haiku-lines"><span>פסיפס בעמק</span><span>אבנים קטנות בעיגול</span><span>השמש מתחת לרגל</span></p>
          <p className="src">מה ההייקו מאיר: הסדר הגדול נבנה מאבנים קטנות, ומונח איפה שהולכים.</p>
        </section>

        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="label">פוסט מוכן לשיתוף · <bdi className="num">{POST.split(/\s+/).length}</bdi> מילים</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <CopyButton text={POST} icon={<IconCopy />} />
              <button className="press btn no-print" style={{ padding: '6px 12px' }} onClick={() => window.print()}><IconPrint />הדפסה</button>
            </div>
          </div>
          <p className="post">{POST}</p>
        </section>

        <footer className="credits">
          <span className="label">מקורות וקרדיטים</span>
          <ol>
            <li>תהלים יט, ב · מלכים ב כג, ה · איוב לח, לא.</li>
            <li>תלמוד בבלי, מסכת שבת, דף קנו עמוד א.</li>
            <li>ספר יצירה, פרק ה: שתים עשרה פשוטות, מזלות וחודשים.</li>
            <li>E. L. Sukenik, The Ancient Synagogue of Beth Alpha, Jerusalem, 1932.</li>
            <li>Brown, Driver, Briggs, A Hebrew and English Lexicon of the Old Testament, 1906, ערך מזלות.</li>
            <li>Carl Sagan, Cosmos, 1980.</li>
            <li>Jean Meeus, Astronomical Algorithms, 1998.</li>
          </ol>
          <Rich className="src" text={'האיור בראש הכתבה נבנה בקוד ב-SVG, בהשראת הפסיפס. הוא לא שחזור מדויק.'} />
        </footer>
      </div>
    </article>
  );
}
