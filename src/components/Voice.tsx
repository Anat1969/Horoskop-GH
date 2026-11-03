import { useRef, useState } from 'react';

// הקלטה ותמלול לכל שדה כתיבה (Claude-GH, סעיף 2.11). התמלול נכנס לשדה תוך כדי דיבור.
type Rec = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: (e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void; onerror: (e: { error: string }) => void; onend: () => void };
const Ctor = (typeof window !== 'undefined' && ((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition)) as (new () => Rec) | undefined;
let active: (() => void) | null = null;

export function VoiceButton({ value, onText }: { value: string; onText: (v: string) => void }) {
  const rec = useRef<Rec | null>(null);
  const [on, setOn] = useState(false);
  const [note, setNote] = useState('');
  const click = () => {
    if (!Ctor) { setNote('הדפדפן הזה לא מתמלל. אפשר ללחוץ על המיקרופון במקלדת של הטלפון ולהכתיב.'); return; }
    if (rec.current) { rec.current.stop(); return; }
    active?.();
    const r = new Ctor(); r.lang = 'he-IL'; r.continuous = true; r.interimResults = true;
    const base = value ? value.replace(/\s*$/, ' ') : '';
    r.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; onText((base + t).replace(/\s+/g, ' ').trimStart()); };
    r.onerror = (e) => setNote(e.error === 'not-allowed' ? 'אין הרשאה למיקרופון. אפשר לאשר בסרגל הכתובת של הדפדפן.' : 'התמלול נעצר. אפשר לנסות שוב.');
    r.onend = () => { rec.current = null; active = null; setOn(false); setNote(''); };
    rec.current = r; active = () => r.stop();
    try { r.start(); setOn(true); setNote('מקליטה ומתמללת. לחיצה נוספת עוצרת.'); } catch { rec.current = null; setNote('לא הצלחתי להפעיל הקלטה. אפשר לנסות שוב.'); }
  };
  return (
    <div className="voice">
      <button type="button" className={'press voice-btn' + (on ? ' on' : '')} aria-pressed={on} onClick={click} data-tip="הקלטה: דיבור שנכנס לשדה כטקסט">
        <span className="voice-dot" aria-hidden="true" />{on ? 'עצירה' : 'הקלטה'}
      </button>
      <span className="voice-note" aria-live="polite">{note}</span>
    </div>
  );
}
