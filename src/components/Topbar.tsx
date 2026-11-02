import { useEffect, useRef, useState } from 'react';
import { AppMark } from './icons';
import { Icon, type IconName } from './Icon';
import { go } from '../lib/route';
import { search } from '../lib/search';
import { Glyph } from './Glyph';
import { load, save } from '../lib/store';

const LINKS: [IconName, string][] = [['atlas', 'אטלס'], ['quiz', 'אבחון'], ['bond', 'קשרים'], ['flex', 'גמישות'], ['sky', 'שמיים'], ['cultures', 'תרבויות'], ['read', 'כתבה']];

export function Topbar({ page }: { page: string }) {
  const [q, setQ] = useState(() => load('q', ''));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const hits = search(q);
  useEffect(() => { save('q', q); }, [q]);
  useEffect(() => {
    const m = document.querySelector('ai-menu') as (HTMLElement & { status?: string }) | null;
    const on = () => { if (m) m.status = 'נשמר'; };
    window.addEventListener('saved', on);
    return () => window.removeEventListener('saved', on);
  }, []);
  const pick = (id: string) => { setOpen(false); go('sign/' + id); };
  return (
    <header className="topbar">
      <div className="topbar-in">
        <a className="brand press-free" href="#/" aria-label="מקדש הכוכבים, לדף הבית">
          <AppMark />
          <span className="brand-name">מקדש הכוכבים</span>
        </a>
        <div className="nav-wrap">
          <nav className="nav" aria-label="ניווט ראשי">
            {LINKS.map(([p, t]) => <a key={p} href={'#/' + p} aria-current={page === p || (p === 'atlas' && page === 'sign') ? 'page' : undefined}><Icon n={p} size={17} />{t}</a>)}
          </nav>
        </div>
        <span className="spacer" />
        <div className="search" role="search">
          <label htmlFor="q" className="sr">חיפוש במבנים</label>
          <input id="q" ref={ref} value={q} placeholder="חיפוש מבנה" autoComplete="off"
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={(e) => { e.currentTarget.select(); setOpen(true); }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setQ(''); setOpen(false); } if (e.key === 'Enter' && hits[0]) pick(hits[0].sign.id); }} />
          {q && <button className="x" aria-label="ניקוי החיפוש" onClick={() => { setQ(''); ref.current?.focus(); }}>×</button>}
          {open && q.trim().length >= 2 && (
            <div className="search-pop" role="listbox">
              <div className="search-count">{hits.length ? `${hits.length} מבנים` : 'אין התאמה. נסו מילה אחרת, למשל "יציבות".'}</div>
              {hits.map((h) => (
                <button key={h.sign.id} role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(h.sign.id)}>
                  <Glyph sym={h.sign.sym} color={`var(--${h.sign.elc})`} size={18} />
                  <span><strong>{h.sign.n}</strong> <span className="src">{h.field}: {h.snippet}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>
        <ai-menu chat="https://claude.ai/code/session_018qeN1BaKWSvn4SaBPPzEcK"></ai-menu>
      </div>
    </header>
  );
}
