import { SIGNS, type Sign } from '../data/content';

// חיפוש עברי: התאמה בתחילת מילה, גם אחרי אותיות שימוש. מילה עד 3 אותיות חייבת להיות שלמה.
const strip = (s: string) => s.replace(/[֑-ׇ]/g, '').toLowerCase();
const PREFIX = '(?:^|[\\s\\-־\'"(])[הובכלמש]{0,2}';
export function matches(text: string, q: string) {
  const t = strip(text), w = strip(q.trim());
  if (!w) return false;
  const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(PREFIX + esc + (w.length <= 3 ? '(?=$|[\\s.,;:!?־\\-])' : ''), 'i');
  return re.test(t);
}
export interface Hit { sign: Sign; field: string; snippet: string }
const FIELDS: [keyof Sign, string][] = [['n', 'שם'], ['en', 'שם'], ['pl', 'כוכב שולט'], ['kw', 'מילת מפתח'], ['core', 'מהות'], ['strengths', 'כוח'], ['shadows', 'צל'], ['growth', 'צמיחה'], ['myth', 'מיתוס'], ['sci', 'שמיים'], ['month', 'חודש עברי']];
export function search(q: string): Hit[] {
  if (strip(q).trim().length < 2) return [];
  const out: Hit[] = [];
  for (const s of SIGNS) {
    for (const [f, label] of FIELDS) {
      const v = s[f];
      const arr = Array.isArray(v) ? (v as string[]) : [String(v)];
      const hit = arr.find((x) => typeof x === 'string' && matches(x.replace(/\*\*/g, ''), q));
      if (hit) { out.push({ sign: s, field: label, snippet: hit.replace(/\*\*/g, '').slice(0, 70) }); break; }
    }
  }
  return out;
}
