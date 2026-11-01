import { SIGNS, type Sign } from '../data/content';
import { SIGN_ORDER } from './astro';

// כל קשר בין מבנים מוסבר בכלל גאומטרי: הזווית ביניהם על הגלגל.
export const byId = Object.fromEntries(SIGNS.map((s) => [s.id, s])) as Record<string, Sign>;
const plain = (n: string) => n.replace(/[֑-ׇ]/g, '');
export const byName = (n: string) => SIGNS.find((s) => plain(s.n) === plain(n))!;
export const idx = (id: string) => SIGN_ORDER.indexOf(id);

export interface Relation { deg: number; name: string; rule: string; meaning: string }
export function relation(a: Sign, b: Sign): Relation {
  const d = Math.min((idx(b.id) - idx(a.id) + 12) % 12, (idx(a.id) - idx(b.id) + 12) % 12) * 30;
  const R: Record<number, Omit<Relation, 'deg'>> = {
    0: { name: 'אותו מבנה', rule: '0°', meaning: 'מראה של עצמך.' },
    30: { name: 'שכנות', rule: '30°, מזל צמוד', meaning: 'השלב הבא בעונה. **מה שחסר לך** נמצא צעד אחד ליד.' },
    60: { name: 'שישית', rule: '60°, יסודות משלימים', meaning: 'שיתוף קל. אש ואוויר, אדמה ומים, **מזינים** זה את זה.' },
    90: { name: 'ריבוע', rule: '90°, אותו אופן, יסוד מתנגש', meaning: '**מתח שמצמיח.** אותה דרך פעולה, מניע הפוך.' },
    120: { name: 'משולש', rule: '120°, אותו יסוד', meaning: 'שפה משותפת. **הבנה בלי הסבר.**' },
    150: { name: 'חמישית', rule: '150°, בלי שום משותף', meaning: 'אין יסוד ואין אופן משותפים. **הלמידה הכי רחוקה.**' },
    180: { name: 'ניגוד', rule: '180°, הצד השני של הגלגל', meaning: '**המראה ההפוכה.** מה שאתה לא, ומה שמשלים אותך.' },
  };
  return { deg: d, ...R[d] };
}
const COMP: Record<string, string> = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };
/** מבנים שמדברים בקלות: אותו יסוד (120°) או יסוד משלים (60°). */
export function easy(s: Sign) {
  return SIGNS.filter((o) => o.id !== s.id && (o.elc === s.elc || (o.elc === COMP[s.elc] && relation(s, o).deg === 60)));
}
