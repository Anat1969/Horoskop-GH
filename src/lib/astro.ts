// חישובים אסטרונומיים בקוד, בלי שרת.
// מקור: Jean Meeus, Astronomical Algorithms, 1998 (נוסחת דיוק נמוך לשמש, שגיאה < 0.01°).
// גבולות קבוצות הכוכבים לאורך המילקה: גבולות IAU, 1930 (Delporte), באורך אקליפטי J2000.
// שני הגבולות של דגים כוילו לחישובי מאוס: כניסה לדגים ב-68 לפנה"ס ולדלי ב-2597.

export const PRECESSION_ARCSEC_PER_YEAR = 50.29; // נקיפת השוויונות
export const PRECESSION_CYCLE = 360 * 3600 / PRECESSION_ARCSEC_PER_YEAR; // כ-25,770 שנה

export function julianDay(d: Date) { return d.getTime() / 86400000 + 2440587.5; }

/** אורך אקליפטי טרופי של השמש, במעלות (0 = נקודת השוויון האביבי). */
export function sunLongitude(d: Date) {
  const n = julianDay(d) - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
  return (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g) + 720) % 360;
}

/** קבוצות הכוכבים שהשמש עוברת בהן, ברוחב האמיתי שלהן (כולל נושא הנחש). */
export interface Constellation { id: string; he: string; en: string; from: number; to: number }
export const CONSTELLATIONS: Constellation[] = [
  { id: 'pisces', he: 'דגים', en: 'Pisces', from: 351.66, to: 28.88 },
  { id: 'aries', he: 'טלה', en: 'Aries', from: 28.88, to: 53.4 },
  { id: 'taurus', he: 'שור', en: 'Taurus', from: 53.4, to: 90.1 },
  { id: 'gemini', he: 'תאומים', en: 'Gemini', from: 90.1, to: 118.3 },
  { id: 'cancer', he: 'סרטן', en: 'Cancer', from: 118.3, to: 138.2 },
  { id: 'leo', he: 'אריה', en: 'Leo', from: 138.2, to: 174.2 },
  { id: 'virgo', he: 'בתולה', en: 'Virgo', from: 174.2, to: 217.8 },
  { id: 'libra', he: 'מאזניים', en: 'Libra', from: 217.8, to: 241.0 },
  { id: 'scorpio', he: 'עקרב', en: 'Scorpius', from: 241.0, to: 247.7 },
  { id: 'ophiuchus', he: 'נושא הנחש', en: 'Ophiuchus', from: 247.7, to: 266.3 },
  { id: 'sagittarius', he: 'קשת', en: 'Sagittarius', from: 266.3, to: 299.7 },
  { id: 'capricorn', he: 'גדי', en: 'Capricornus', from: 299.7, to: 327.9 },
  { id: 'aquarius', he: 'דלי', en: 'Aquarius', from: 327.9, to: 351.66 },
];
export function span(c: Constellation) { return (c.to - c.from + 360) % 360; }
export function constellationAt(lonJ2000: number) {
  const x = ((lonJ2000 % 360) + 360) % 360;
  return CONSTELLATIONS.find((c) => (x - c.from + 360) % 360 < span(c))!;
}

/** הזזת נקודת השוויון ביחס לכוכבים, במעלות, בשנה נתונה ביחס ל-2000. */
export function precessionShift(year: number) { return (year - 2000) * PRECESSION_ARCSEC_PER_YEAR / 3600; }

/** היכן נמצאת נקודת השוויון האביבי בין הכוכבים בשנה נתונה. */
export function equinoxConstellation(year: number) { return constellationAt(-precessionShift(year)); }

/** השנה שבה נקודת השוויון חוצה גבול, בחיפוש לינארי. */
export function nextAgeChange(year: number) {
  const now = equinoxConstellation(year).id;
  for (let y = year; y < year + 30000; y++) if (equinoxConstellation(y).id !== now) return { year: y - 1, into: equinoxConstellation(y) }; // שנת החצייה
  return null;
}
export function prevAgeChange(year: number) {
  const now = equinoxConstellation(year).id;
  for (let y = year; y > year - 30000; y--) if (equinoxConstellation(y - 1).id !== now) return y;
  return null;
}

export const SIGN_ORDER = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
export function sunSignId(d: Date) { return SIGN_ORDER[Math.floor(sunLongitude(d) / 30)]; }
/** הקבוצה שבה השמש נמצאת בפועל היום (המרה מאורך של התאריך ל-J2000). */
export function sunConstellation(d: Date) { return constellationAt(sunLongitude(d) - precessionShift(d.getFullYear() + d.getMonth() / 12)); }

export function fmtYear(y: number) { return y <= 0 ? `${(1 - y).toLocaleString('he-IL')} לפנה"ס` : y.toLocaleString('he-IL').replace(/,/g, ''); }
