import { useEffect } from 'react';
import { Topbar } from './components/Topbar';
import { useRoute } from './lib/route';
import { Home } from './pages/Home';
import { Atlas } from './pages/Atlas';
import { SignPage } from './pages/Sign';
import { Quiz } from './pages/Quiz';
import { Flex } from './pages/Flex';
import { Sky } from './pages/Sky';
import { Read } from './pages/Read';
import { Bond } from './pages/Bond';
import { Cultures } from './pages/Cultures';
import { Key } from './pages/Key';
import { Shadow } from './pages/Shadow';
import { byId } from './lib/relations';

const TITLES: Record<string, string> = { home: 'מקדש הכוכבים', atlas: 'אטלס', quiz: 'אבחון עצמי', flex: 'סימולטור גמישות', sky: 'השמיים היום', read: 'כתבה', bond: 'קשרים', cultures: 'תרבויות', key: 'מקרא', shadow: 'ספר הצל' };

export function App() {
  const r = useRoute();
  const page = TITLES[r.page] || r.page === 'sign' ? r.page : 'home';
  useEffect(() => {
    const t = page === 'sign' ? byId[r.arg ?? '']?.n.replace(/[֑-ׇ]/g, '') : TITLES[page];
    document.title = page === 'home' ? 'מקדש הכוכבים' : `${t} · מקדש הכוכבים`;
  }, [page, r.arg]);
  useEffect(() => { if (page !== 'sign') window.scrollTo({ top: 0 }); }, [page]);
  return (
    <>
      <Topbar page={page} />
      <main id="main">
        {page === 'home' && <Home />}
        {page === 'atlas' && <Atlas route={r} />}
        {page === 'sign' && <SignPage id={r.arg ?? 'aries'} />}
        {page === 'quiz' && <Quiz />}
        {page === 'flex' && <Flex />}
        {page === 'sky' && <Sky route={r} />}
        {page === 'read' && <Read />}
        {page === 'bond' && <Bond route={r} />}
        {page === 'cultures' && <Cultures />}
        {page === 'key' && <Key />}
        {page === 'shadow' && <Shadow route={r} />}
      </main>
      <footer className="footer">
        <span>מקדש הכוכבים · 12 מבנים, אף אחד מהם אינו גורל.</span>
        <span>כפתור A&I בפינה: העתקת קישור למצב הנוכחי, התקנה כאפליקציה, ושיחת הפיתוח.</span>
        <a href="#/key">מקרא: איך לקרוא את האפליקציה</a>
        <span>הנתונים שלך נשמרים רק במכשיר הזה.</span>
      </footer>
    </>
  );
}
