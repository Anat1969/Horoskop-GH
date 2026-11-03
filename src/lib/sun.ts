// מיקום השמש לניסויי הצל. מקור: Jean Meeus, Astronomical Algorithms, 1998 (דיוק נמוך, מספיק לצל).
import { sunLongitude } from './astro';

export const ASHDOD = { he: 'אשדוד', en: 'Ashdod', lat: 31.8, lon: 34.65 };
export const OBLIQUITY = 23.44; // נטיית ציר כדור הארץ
const R = Math.PI / 180;

/** נטיית השמש (דקלינציה) בתאריך, במעלות. */
export function declination(d: Date) { return Math.asin(Math.sin(OBLIQUITY * R) * Math.sin(sunLongitude(d) * R)) / R; }

/** גובה ואזימוט של השמש. hour: שעה לפי השמש (12 = צהריים אמיתי). אזימוט מהדרום, חיובי למערב. */
export function sunPosition(lat: number, d: Date, hour: number) {
  const dec = declination(d) * R, phi = lat * R, H = (hour - 12) * 15 * R;
  const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
  return { alt: alt / R, az: az / R, dec: dec / R };
}
/** גובה השמש בצהריים: 90 פחות קו הרוחב, ועוד הנטייה. */
export function noonAltitude(lat: number, d: Date) { return 90 - lat + declination(d); }
/** אורך הצל של גוף בגובה h. */
export function shadowLength(h: number, altDeg: number) { return altDeg <= 0.5 ? Infinity : h / Math.tan(altDeg * R); }
/** עומק סוכך שמצל לגמרי על חלון בגובה w, כשהשמש בגובה alt. */
export function overhangDepth(w: number, altDeg: number) { return w / Math.tan(altDeg * R); }
/** כמה מהחלון מוצל (0 עד 1) בסוכך בעומק depth, מעל חלון בגובה w. */
export function shadedFraction(depth: number, w: number, altDeg: number) { return Math.min(1, (depth * Math.tan(altDeg * R)) / w); }
/** קו רוחב מתוך מדידת מקל בצהריים (חצי הכדור הצפוני, שמש בדרום). */
export function latitudeFromStick(stick: number, shadow: number, d: Date) {
  const alt = Math.atan(stick / shadow) / R;
  return { alt, lat: 90 - alt + declination(d) };
}
/** משוואת הזמן, בדקות (קירוב סטנדרטי). */
export function equationOfTime(d: Date) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0), N = Math.floor((d.getTime() - start) / 864e5);
  const B = (360 / 365) * (N - 81) * R;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}
/** שעון ישראל של הצהריים האמיתי באשדוד, בתאריך. */
export function solarNoonClock(d: Date, lon = ASHDOD.lon) {
  const probe = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 10));
  const local = new Date(probe.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const utcAsLocal = new Date(probe.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tz = Math.round((local.getTime() - utcAsLocal.getTime()) / 36e5);
  const minutes = 12 * 60 - (lon - tz * 15) * 4 - equationOfTime(d); // תיקון אורך ומשוואת הזמן
  const hh = Math.floor(minutes / 60), mm = Math.round(minutes % 60);
  return `${hh}:${String(mm).padStart(2, '0')}`;
}
export const KEY_DATES: { id: string; he: string; date: Date }[] = (() => {
  const y = new Date().getFullYear();
  return [
    { id: 'dec', he: '21 בדצמבר', date: new Date(Date.UTC(y, 11, 21, 10)) },
    { id: 'mar', he: '20 במרץ', date: new Date(Date.UTC(y, 2, 20, 10)) },
    { id: 'jun', he: '21 ביוני', date: new Date(Date.UTC(y, 5, 21, 10)) },
    { id: 'sep', he: '22 בספטמבר', date: new Date(Date.UTC(y, 8, 22, 10)) },
  ];
})();
