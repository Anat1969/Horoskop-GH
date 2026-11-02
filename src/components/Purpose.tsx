import { Rich } from '../lib/rich';

// מטרת הדף: למה הוא קיים, מה עושים בו, ומה יוצא ממנו. אותו מבנה בכל הדפים.
export function Purpose({ why, how, get }: { why: string; how: string; get: string }) {
  return (
    <section className="purpose rise" aria-label="מטרת הדף">
      <div><span className="label">למה הדף הזה</span><Rich text={why} /></div>
      <div><span className="label">מה עושים כאן</span><Rich text={how} /></div>
      <div><span className="label">מה יוצא מזה</span><Rich text={get} /></div>
    </section>
  );
}
