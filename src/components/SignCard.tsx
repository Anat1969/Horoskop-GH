import type { Sign } from '../data/content';
import { EL, MO } from '../data/meta';
import { Glyph } from './Glyph';

export function SignCard({ s, dim = false, i = 0 }: { s: Sign; dim?: boolean; i?: number }) {
  const c = `var(--${s.elc})`;
  return (
    <a href={'#/sign/' + s.id} className="press sign-card rise" style={{ animationDelay: `${i * 40}ms`, opacity: dim ? 0.32 : 1, ['--c' as string]: c }}>
      <div className="sc-top">
        <Glyph sym={s.sym} color={c} size={34} />
        <span className="label">{EL[s.elc].he} · {MO[s.mo].he}</span>
      </div>
      <h3>{s.n}<span className="en">{s.en}</span></h3>
      <p className="sc-core">{s.core.split(' — ')[0]}.</p>
      <div className="sc-foot"><span className="src">{s.trop}</span><span className="src">{s.month}</span></div>
    </a>
  );
}
