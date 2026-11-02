import { SIGNS, type ElementKey, type Sign } from '../data/content';
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

// ---------- קשרים: ניתוח זוג ----------
export type Kind = 'flow' | 'tension' | 'neutral';
export function kindOf(deg: number): Kind { return deg === 60 || deg === 120 ? 'flow' : deg === 90 || deg === 150 || deg === 180 ? 'tension' : 'neutral'; }
export const KIND_LABEL: Record<Kind, string> = { flow: 'זרימה', tension: 'מתח מצמיח', neutral: 'שכנות' };

const EP: Record<string, string> = {
  'fire|fire': 'שתי אש: **הרבה תנועה**, מעט עצירה. מי מאט?',
  'earth|earth': 'שתי אדמות: **יציבות עמוקה**, וסכנת קיפאון.',
  'air|air': 'שני אווירים: **שיחה בלי סוף**, ומעט מעשה.',
  'water|water': 'שני מים: **הבנה בלי מילים**, וסכנת הצפה משותפת.',
  'air|fire': 'אוויר מזין אש: **רעיון שמדליק פעולה**.',
  'earth|water': 'מים מזינים אדמה: **רגש שנותן לצמוח**.',
  'earth|fire': 'אש ואדמה: **דחף מול סבלנות**. אחד ממהר, השני בונה.',
  'fire|water': 'אש ומים: **התלהבות מול עומק**. אחד מאיץ, השני מרגיש.',
  'air|earth': 'אוויר ואדמה: **רעיון מול מעשה**. אחד מדמיין, השני מבצע.',
  'air|water': 'אוויר ומים: **מחשבה מול רגש**. אחד מסביר, השני מרגיש.',
};
export function elementPair(a: ElementKey, b: ElementKey) { return EP[[a, b].sort().join('|')]; }

const MODE_VERB: Record<string, string> = { 'בכורה': 'מתחיל', 'קבוע': 'מחזיק', 'משתנה': 'מתאים' };
export function modePair(a: Sign, b: Sign) {
  if (a.mo === b.mo) return `אותו קצב: שניכם **${MODE_VERB[a.mo]}ים**. מתחרים על אותו תפקיד.`;
  return `קצבים שונים: ${plainName(a)} **${MODE_VERB[a.mo]}**, ${plainName(b)} **${MODE_VERB[b.mo]}**. חלוקת תפקידים טבעית.`;
}
export const PRACTICE: Record<number, string> = {
  0: 'חלקו תפקידים: אחד מוביל השבוע, השני מבקר. בשבוע הבא מתחלפים.',
  30: 'כל אחד מלמד את השני דבר אחד שהוא עושה בלי מאמץ.',
  60: 'התחילו פרויקט קטן יחד. כאן הזרימה הכי קלה.',
  90: 'לפני ויכוח, כל אחד מנסח במשפט אחד מה השני מנסה לשמור עליו.',
  120: 'הזמינו אדם שלישי, מיסוד אחר, שיגיד לכם מה שניכם לא רואים.',
  150: 'פעם בשבוע שאלו: "איך אתה רואה את זה?" והקשיבו, בלי לתקן.',
  180: 'החליפו תפקידים ליום אחד: כל אחד פועל כמו השני.',
};
export function plainName(s: Sign) { return s.n.replace(/[֑-ׇ]/g, ''); }
export function analyze(a: Sign, b: Sign) {
  const r = relation(a, b);
  const bridgeAB = a.bridge.find((x) => plainName(byName(x.to)) === plainName(b));
  const bridgeBA = b.bridge.find((x) => plainName(byName(x.to)) === plainName(a));
  return {
    r, kind: kindOf(r.deg),
    el: elementPair(a.elc, b.elc), mo: modePair(a, b),
    aGives: `${plainName(a)} מביא **${a.strengths[0]}** ו**${a.strengths[1]}**.\nזה מה ש${plainName(b)} צריך: ${b.growth}`,
    bGives: `${plainName(b)} מביא **${b.strengths[0]}** ו**${b.strengths[1]}**.\nזה מה ש${plainName(a)} צריך: ${a.growth}`,
    stuck: `**${a.shadows[0]}** של ${plainName(a)} פוגש **${b.shadows[0]}** של ${plainName(b)}.`,
    practice: bridgeAB?.advice ?? bridgeBA?.advice ?? PRACTICE[r.deg],
    practiceSrc: bridgeAB ? `גשר של ${plainName(a)}` : bridgeBA ? `גשר של ${plainName(b)}` : `תרגול ל${r.name}`,
  };
}
