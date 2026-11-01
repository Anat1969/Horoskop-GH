import { useCallback, useEffect, useState } from 'react';

// שמירה אוטומטית ב-localStorage, עם חיווי "נשמר".
const KEY = 'horoskop:v1:';
export function load<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(KEY + k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
export function save(k: string, v: unknown) {
  try { localStorage.setItem(KEY + k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('saved')); } catch { /* מצב פרטי */ }
}
export function useStored<T>(k: string, fallback: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => load(k, fallback));
  useEffect(() => setV(load(k, fallback)), [k]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = useCallback((nv: T) => { setV(nv); save(k, nv); }, [k]);
  return [v, set];
}
