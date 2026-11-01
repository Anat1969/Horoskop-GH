import { useEffect, useState } from 'react';

export interface Route { page: string; arg?: string; q: URLSearchParams }
export function parse(): Route {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const [page = '', arg] = path.split('/');
  return { page: page || 'home', arg, q: new URLSearchParams(qs || '') };
}
export function go(path: string) {
  location.hash = '#/' + path.replace(/^\//, '');
}
export function setQuery(params: Record<string, string | null>) {
  const r = parse();
  for (const [k, v] of Object.entries(params)) v === null || v === '' ? r.q.delete(k) : r.q.set(k, v);
  const qs = r.q.toString();
  history.replaceState(null, '', '#/' + (r.page === 'home' ? '' : r.page) + (r.arg ? '/' + r.arg : '') + (qs ? '?' + qs : ''));
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
export function useRoute() {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => setR(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}
