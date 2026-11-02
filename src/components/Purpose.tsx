import { Rich } from '../lib/rich';
import { Icon } from './Icon';

// מטרת הדף: למה הוא קיים, מה עושים בו, ומה יוצא ממנו. אותו מבנה בכל הדפים.
export function Purpose({ why, how, get }: { why: string; how: string; get: string }) {
  return (
    <section className="purpose rise" aria-label="מטרת הדף">
      <div><span className="label"><Icon n="why" size={14} />למה הדף הזה</span><Rich text={why} /></div>
      <div><span className="label"><Icon n="how" size={14} />מה עושים כאן</span><Rich text={how} /></div>
      <div><span className="label"><Icon n="get" size={14} />מה יוצא מזה</span><Rich text={get} /></div>
    </section>
  );
}
