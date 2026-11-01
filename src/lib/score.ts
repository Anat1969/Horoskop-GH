import { QUIZ, SIGNS, type ElementKey, type ModeKey } from '../data/content';

// חישוב שקוף: לכל תשובה משקל ישיר למזלות (×2), ומשקל עקיף דרך היסוד והאופן (×1).
export interface Result {
  ranking: { id: string; score: number }[];
  el: Record<ElementKey, number>; mo: Record<ModeKey, number>;
  clarity: number; consistency: number; top: string; answered: number;
}
export function score(answers: (number | null)[]): Result {
  const el: Record<ElementKey, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const mo: Record<ModeKey, number> = { 'בכורה': 0, 'קבוע': 0, 'משתנה': 0 };
  const direct: Record<string, number> = {};
  const picksEl: ElementKey[] = [];
  answers.forEach((a, qi) => {
    if (a == null) return;
    const o = QUIZ[qi].opts[a];
    for (const [k, v] of Object.entries(o.el ?? {})) el[k as ElementKey] += v!;
    for (const [k, v] of Object.entries(o.mo ?? {})) mo[k as ModeKey] += v!;
    for (const [k, v] of Object.entries(o.signs ?? {})) direct[k] = (direct[k] ?? 0) + v;
    const main = Object.entries(o.el ?? {}).sort((x, y) => y[1]! - x[1]!)[0];
    if (main) picksEl.push(main[0] as ElementKey);
  });
  const ranking = SIGNS.map((s) => ({ id: s.id, score: (direct[s.id] ?? 0) * 2 + el[s.elc] + mo[s.mo] }))
    .sort((a, b) => b.score - a.score);
  const [a, b] = ranking;
  const clarity = a.score ? (a.score - b.score) / a.score : 0;
  const topEl = (Object.entries(el).sort((x, y) => y[1] - x[1])[0][0]) as ElementKey;
  const consistency = picksEl.length ? picksEl.filter((e) => e === topEl).length / picksEl.length : 0;
  return { ranking, el, mo, clarity, consistency, top: a.id, answered: answers.filter((x) => x != null).length };
}
export function clarityLabel(c: number) {
  if (c >= 0.25) return { t: 'פרופיל ברור', d: 'מבנה אחד בולט בבירור מעל השאר.' };
  if (c >= 0.1) return { t: 'פרופיל מוביל', d: 'מבנה מוביל, עם שכן קרוב שמשפיע.' };
  return { t: 'פרופיל מעורב', d: 'כמה מבנים כמעט שווים. אתה כבר נע ביניהם.' };
}
