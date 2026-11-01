import { Fragment, type ReactNode } from 'react';

// טקסט עשיר: **מודגש**, ==תובנה==, מספרים מודגשים אוטומטית, ושורה חדשה לכל \n.
const NUM = /(\d[\d,.]*)/g;
function nums(text: string, key: string): ReactNode[] {
  return text.split(NUM).map((p, i) =>
    /^\d/.test(p) ? <bdi key={key + i} className="num">{p}</bdi> : <Fragment key={key + i}>{p}</Fragment>,
  );
}
function inline(text: string, k = ''): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|==[^=]+==)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...nums(text.slice(last, m.index), k + 't' + i));
    const t = m[0];
    if (t.startsWith('**')) out.push(<strong key={k + 'b' + i}>{nums(t.slice(2, -2), k + 'bn' + i)}</strong>);
    else out.push(<mark key={k + 'm' + i}>{nums(t.slice(2, -2), k + 'mn' + i)}</mark>);
    last = m.index + t.length; i++;
  }
  if (last < text.length) out.push(...nums(text.slice(last), k + 'end'));
  return out;
}
export function Rich({ text, as: Tag = 'p', className }: { text: string; as?: 'p' | 'div' | 'span' | 'h2' | 'h3'; className?: string }) {
  const lines = text.split('\n');
  return (
    <Tag className={className}>
      {lines.map((l, i) => (
        <Fragment key={i}>{inline(l, 'l' + i)}{i < lines.length - 1 && <br />}</Fragment>
      ))}
    </Tag>
  );
}
