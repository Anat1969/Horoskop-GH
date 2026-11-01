// סימן מזל כטקסט (לא כאמוג'י): בורר וריאציה U+FE0E.
export function Glyph({ sym, color, size = 22 }: { sym: string; color?: string; size?: number }) {
  return <span className="glyph" style={{ color, fontSize: size }} aria-hidden="true">{sym + '︎'}</span>;
}
