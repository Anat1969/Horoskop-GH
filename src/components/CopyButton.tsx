import { useState, type ReactNode } from 'react';
export function CopyButton({ text, icon, label = 'העתקה' }: { text: string; icon?: ReactNode; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button className="press btn" style={{ padding: '6px 12px' }} onClick={async () => {
      try { await navigator.clipboard.writeText(text); } catch { /* דפדפן בלי הרשאה */ }
      setOk(true); setTimeout(() => setOk(false), 1600);
    }}>{icon}{ok ? 'הועתק' : label}</button>
  );
}
