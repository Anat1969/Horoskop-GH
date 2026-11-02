import type { ReactNode } from 'react';
import type { ElementKey, ModeKey } from '../data/content';
import { EL, MO } from '../data/meta';
import { Icon, type IconName } from './Icon';
import { Rich } from '../lib/rich';

// דקדוק חזותי: כל סוג מידע נראה תמיד אותו דבר. ראו דף "מקרא".
const EL_ICON: Record<ElementKey, IconName> = { fire: 'fire', earth: 'earth', air: 'air', water: 'water' };
const MO_ICON: Record<ModeKey, IconName> = { 'בכורה': 'cardinal', 'קבוע': 'fixed', 'משתנה': 'mutable' };
export const elIcon = (e: ElementKey) => EL_ICON[e];
export const moIcon = (m: ModeKey) => MO_ICON[m];

/** יסוד: אייקון בצבע היסוד ושם. */
export function ElTag({ el, name = true, size = 16 }: { el: ElementKey; name?: boolean; size?: number }) {
  return <span className="tag"><Icon n={EL_ICON[el]} size={size} color={EL[el].color} label={name ? undefined : EL[el].he} />{name && EL[el].he}</span>;
}
/** אופן: אייקון אפור ושם. */
export function ModeTag({ mo, name = true, size = 16 }: { mo: ModeKey; name?: boolean; size?: number }) {
  return <span className="tag"><Icon n={MO_ICON[mo]} size={size} color="var(--g-600)" label={name ? undefined : MO[mo].he} />{name && MO[mo].he}</span>;
}
/** פרמטר: תווית במונוספייס מעל ערך מודגש. */
export function Param({ label, children, icon }: { label: string; children: ReactNode; icon?: IconName }) {
  return <div className="param"><span className="label">{icon && <Icon n={icon} size={13} />}{label}</span><span className="param-v">{children}</span></div>;
}
/** ציטוט: מירכאות, דובר ומקור קטן ואפור. */
export function Quote({ text, src, original }: { text: string; src: string; original?: string }) {
  return (
    <figure className="g-quote">
      <Icon n="quote" size={22} color="var(--g-400)" />
      <blockquote>"{text}"</blockquote>
      {original && <p className="src"><span className="label">תרגום</span> · "{original}"</p>}
      <figcaption className="src">{src}</figcaption>
    </figure>
  );
}
/** הסבר לכפתורים חבויים: סימן שאלה ושורה אפורה. */
export function Hint({ children }: { children: ReactNode }) {
  return <p className="hint"><Icon n="tip" size={14} />{children}</p>;
}
/** עלייה או ירידה. */
export function Trend({ dir, children }: { dir: 'up' | 'down'; children: ReactNode }) {
  return <span className={'trend ' + dir}><Icon n={dir} size={14} />{children}</span>;
}
/** הפכים: שני צדדים עם חץ דו־כיווני. */
export function Opp({ a, b }: { a: ReactNode; b: ReactNode }) {
  return <span className="opp"><span>{a}</span><Icon n="opposite" size={16} color="var(--g-500)" /><span>{b}</span></span>;
}
/** מסלול: שלבים ממוספרים. */
export function Steps({ items }: { items: string[] }) {
  return <ol className="steps">{items.map((t, i) => <li key={i}><span className="step-n num">{i + 1}</span><Rich as="span" text={t} /></li>)}</ol>;
}
