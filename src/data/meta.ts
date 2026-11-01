import type { ElementKey, ModeKey } from './content';

export interface ElementMeta { key: ElementKey; he: string; en: string; color: string; verb: string; line: string }
export const ELEMENTS: ElementMeta[] = [
  { key: 'fire', he: 'אש', en: 'Fire', color: 'var(--fire)', verb: 'מניע', line: 'אנרגיה שהופכת רצון **לפעולה**.' },
  { key: 'earth', he: 'אדמה', en: 'Earth', color: 'var(--earth)', verb: 'מבסס', line: 'חומר שהופך רעיון **למבנה** שנשאר.' },
  { key: 'air', he: 'אוויר', en: 'Air', color: 'var(--air)', verb: 'מקשר', line: 'מחשבה שמחברת בין אנשים **ורעיונות**.' },
  { key: 'water', he: 'מים', en: 'Water', color: 'var(--water)', verb: 'מכיל', line: 'רגש שמרגיש את מה שעוד **לא נאמר**.' },
];
export const EL = Object.fromEntries(ELEMENTS.map((e) => [e.key, e])) as Record<ElementKey, ElementMeta>;

export interface ModeMeta { key: ModeKey; he: string; term: string; line: string }
export const MODES: ModeMeta[] = [
  { key: 'בכורה', he: 'מתחיל', term: 'אופן קרדינלי', line: 'פותח עונה. **יוזם** את מה שעוד לא קיים.' },
  { key: 'קבוע', he: 'מחזיק', term: 'אופן קבוע', line: 'לב העונה. **מעמיק** ושומר על מה שהתחיל.' },
  { key: 'משתנה', he: 'מתאים', term: 'אופן משתנה', line: 'סוף העונה. **מסתגל** ומכין את המעבר.' },
];
export const MO = Object.fromEntries(MODES.map((m) => [m.key, m])) as Record<ModeKey, ModeMeta>;
