// בורר אחיד: "הכול" מאפס, כל לחיצה מחליפה, "+" מוסיף ו"−" מסיר. לחיצה על הבחירה היחידה מחזירה ל"הכול".
export interface Opt { key: string; label: string; color?: string }
export function Chooser({ label, opts, value, onChange }: { label: string; opts: Opt[]; value: string[]; onChange: (v: string[]) => void }) {
  const all = value.length === 0;
  return (
    <div className="chips" role="group" aria-label={label}>
      <span className="label" style={{ marginInlineEnd: 4 }}>{label}</span>
      <button className="chip" aria-pressed={all} onClick={() => onChange([])}>הכול</button>
      {opts.map((o) => {
        const on = value.includes(o.key);
        return (
          <span className="chip-group" key={o.key}>
            <button className="chip" aria-pressed={on} onClick={() => onChange(on && value.length === 1 ? [] : [o.key])}>
              {o.color && <span className="dot" style={{ background: o.color }} />}{o.label}
            </button>
            {!all && (
              <button className="chip chip-add" aria-label={(on ? 'הסרת ' : 'הוספת ') + o.label}
                onClick={() => onChange(on ? value.filter((k) => k !== o.key) : [...value, o.key])}>{on ? '−' : '+'}</button>
            )}
          </span>
        );
      })}
    </div>
  );
}
