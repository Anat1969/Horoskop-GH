import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

// service worker רק כשהבסיס הוא השורש (Vercel), לא בתצוגת raw.githack.
if ('serviceWorker' in navigator && import.meta.env.PROD && import.meta.env.BASE_URL === '/') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
