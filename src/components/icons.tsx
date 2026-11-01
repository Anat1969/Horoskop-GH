// סט אייקוני קו אחד: 24×24, קו 1.75.
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const IconPrev = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;
export const IconNext = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>;
export const IconX = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const IconPlay = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>;
export const IconPause = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>;
export const IconReset = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" /></svg>;
export const IconCopy = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><rect x="8" y="8" width="12" height="12" /><path d="M16 8V4H4v12h4" /></svg>;
export const IconPrint = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M7 9V3h10v6M7 17H4v-8h16v8h-3M7 14h10v7H7z" /></svg>;
export const IconSearch = () => <svg viewBox="0 0 24 24" {...P} aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg>;

/** אייקון האפליקציה: אסטרולב. בלי טקסט. */
export function AppMark({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="am-b" cx="35%" cy="30%"><stop offset="0" stopColor="#f1d38a" /><stop offset="1" stopColor="#a8822f" /></radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#0c1128" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="url(#am-b)" strokeWidth="3" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="#d8b25a" strokeWidth="1" strokeDasharray="2 3" />
      <ellipse cx="32" cy="36" rx="17" ry="9" fill="none" stroke="#d8b25a" strokeWidth="1.5" transform="rotate(-23.4 32 32)" />
      <path d="M32 6v52M6 32h52" stroke="#d8b25a" strokeWidth=".8" opacity=".6" />
      <circle cx="44" cy="27" r="3.4" fill="#ffe36b" />
    </svg>
  );
}
