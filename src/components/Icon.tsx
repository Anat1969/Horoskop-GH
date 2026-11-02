// שפת אייקונים אחת: קו 1.75, 24×24. אייקון רק כשהוא מקודד רעיון.
const C = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
export const PATHS = {
  // יסודות: המשולשים האלכימיים
  fire: 'M12 4L20.5 19H3.5Z',
  water: 'M3.5 5H20.5L12 20Z',
  air: 'M12 4L20.5 19H3.5Z M7 14H17',
  earth: 'M3.5 5H20.5L12 20Z M7 10H17',
  // אופנים
  cardinal: 'M12 20V5 M7 10l5-5 5 5 M6 20h12',
  fixed: 'M5 5h14v14H5z M12 12h.01',
  mutable: 'M3 12c3-6 6-6 9 0s6 6 9 0',
  // היבטים (זוויות)
  a0: C(10, 14, 4.5) + ' M13.5 10.5L19 4',
  a30: 'M6 7l6 7 6-7 M6 19h12',
  a60: 'M12 4v16 M5.1 8l13.8 8 M5.1 16l13.8-8',
  a90: 'M6 6h12v12H6z',
  a120: 'M12 5l7.5 13h-15z',
  a150: 'M6 17l6-7 6 7 M6 5h12',
  a180: C(7, 17, 3) + ' ' + C(17, 7, 3) + ' M9.2 14.8l5.6-5.6',
  // סוגי מידע
  quote: 'M10 7H5v5h5z M10 12c0 3-1.5 5-5 6 M19 7h-5v5h5z M19 12c0 3-1.5 5-5 6',
  insight: 'M12 3l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z',
  problem: 'M12 4l9 15H3z M12 10v4 M12 16.6v.4',
  solution: C(12, 12, 8.5) + ' M8 12.2l2.8 2.8L16 9.2',
  action: 'M13 3L5 14h6l-1 7 8-11h-6z',
  explain: C(12, 12, 8.5) + ' M12 11v5.5 M12 7.6v.4',
  param: 'M4 7h10 M18 7h2 M16 4.5v5 M4 17h4 M12 17h8 M10 14.5v5',
  map: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z' + ' ' + C(12, 10, 2.2),
  path: C(5, 18, 1.6) + ' ' + C(12, 9, 1.6) + ' ' + C(19, 15, 1.6) + ' M6.2 16.8l4.6-6.6 M13.4 10l4.3 3.8',
  hierarchy: 'M9 3h6v5H9z M3 16h6v5H3z M15 16h6v5h-6z M12 8v4 M6 16v-4h12v4',
  up: 'M12 19V5 M6 11l6-6 6 6',
  down: 'M12 5v14 M6 13l6 6 6-6',
  opposite: 'M4 8.5h16 M16 4.5l4 4-4 4 M20 15.5H4 M8 11.5l-4 4 4 4',
  relation: C(9, 12, 5.5) + ' ' + C(15, 12, 5.5),
  tendency: 'M3 17l6-6 4 4 8-8 M15 7h6v6',
  button: 'M5 5l6 14 2-6 6-2z',
  emphasis: 'M7 4.5h6a3.75 3.75 0 0 1 0 7.5H7z M7 12h7a3.75 3.75 0 0 1 0 7.5H7z',
  tip: C(12, 12, 9) + ' M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7 M12 17v.4',
  // ניווט
  atlas: 'M4 4h16v16H4z M4 9.33h16 M4 14.67h16 M9.33 4v16 M14.67 4v16',
  quiz: C(12, 12, 9) + ' M15.5 8.5l-2.1 4.9-4.9 2.1 2.1-4.9z',
  bond: C(9, 12, 5.5) + ' ' + C(15, 12, 5.5),
  flex: 'M4 12a8 8 0 0 1 14-5.3 M18 3v4h-4 M20 12a8 8 0 0 1-14 5.3 M6 21v-4h4',
  sky: C(12, 12, 3.2) + ' M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9L7 7 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1',
  read: 'M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z M20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z',
  cultures: C(12, 12, 9) + ' M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18',
  key: 'M4 5h4v4H4z M11 7h9 M4 15h4v4H4z M11 17h9',
  why: C(12, 12, 8.5) + ' ' + C(12, 12, 4.5) + ' M12 12h.01',
  how: C(5, 18, 1.6) + ' ' + C(12, 9, 1.6) + ' ' + C(19, 15, 1.6) + ' M6.2 16.8l4.6-6.6 M13.4 10l4.3 3.8',
  get: C(12, 12, 8.5) + ' M8 12.2l2.8 2.8L16 9.2',
  time: C(12, 12, 8.5) + ' M12 7v5l3 2',
  person: C(12, 8, 3.5) + ' M5 20c1-4 4-6 7-6s6 2 7 6',
} as const;
export type IconName = keyof typeof PATHS;

export function Icon({ n, size = 18, color, label, className }: { n: IconName; size?: number; color?: string; label?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={'ico ' + (className ?? '')} style={{ color, flex: '0 0 auto' }}
      fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d={PATHS[n]} />
    </svg>
  );
}
export const ASPECT_ICON: Record<number, IconName> = { 0: 'a0', 30: 'a30', 60: 'a60', 90: 'a90', 120: 'a120', 150: 'a150', 180: 'a180' };
