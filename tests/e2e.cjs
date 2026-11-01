// בדיקת קצה לקצה מול vite preview. ai-menu נטען מעותק מקומי.
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE || 'http://localhost:4173/';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'desktop'], [390, 844, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, locale: 'he-IL' });
    await ctx.route('**/ai-menu.js', (r) => r.fulfill({ path: path.join(__dirname, 'ai-menu.local.js'), contentType: 'text/javascript' }));
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE); await p.waitForSelector('.hero');
    ok(await p.locator('ai-menu .logo').isVisible(), `${tag}: A&I logo button in the top bar`);
    ok(!(await p.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), `${tag}: no loose dev buttons in the bar`);
    ok((await p.locator('html').getAttribute('dir')) === 'rtl', `${tag}: RTL`);
    // ניווט בכל הדפים, בלי גלילה אופקית
    for (const pg of ['atlas', 'sign/leo', 'quiz', 'flex', 'sky', 'read', '']) {
      await p.goto(BASE + '#/' + pg); await p.waitForTimeout(400);
      const ow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      ok(ow <= 0, `${tag}: no horizontal scroll on #/${pg}`);
    }
    // בורר באטלס: לחיצה מחליפה, "+" מוסיף, מצב בכתובת
    await p.goto(BASE + '#/atlas');
    await p.getByRole('group', { name: 'יסוד' }).getByRole('button', { name: 'אש', exact: true }).click();
    ok(p.url().includes('el=fire'), `${tag}: element chooser writes state to URL`);
    await p.getByRole('button', { name: 'הוספת מים' }).click();
    ok(decodeURIComponent(p.url()).includes('el=fire,water'), `${tag}: "+" adds a second element`);
    await p.reload(); await p.waitForTimeout(300);
    ok(await p.getByRole('group', { name: 'יסוד' }).getByRole('button', { name: 'מים', exact: true }).getAttribute('aria-pressed') === 'true', `${tag}: state survives reload`);
    // חיפוש
    await p.fill('#q', 'ירח'); await p.waitForTimeout(200);
    ok(await p.locator('.search-pop').getByText('סַרְטָן').isVisible(), `${tag}: Hebrew search finds Cancer by "ירח"`);
    await p.keyboard.press('Escape');
    ok((await p.inputValue('#q')) === '', `${tag}: Escape clears search`);
    // דף מבנה: הבא ויומן
    await p.goto(BASE + '#/sign/aries'); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /הבא/ }).first().click();
    await p.waitForFunction(() => location.hash.includes('taurus'));
    ok(true, `${tag}: next goes to Taurus`);
    await p.fill('#th', 'בדיקה'); await p.getByRole('button', { name: 'רישום ביומן' }).click();
    ok(await p.locator('.journal li').count() === 1, `${tag}: journal entry recorded`);
    await p.reload(); await p.waitForTimeout(300);
    ok(await p.locator('.journal li').count() === 1, `${tag}: journal persists after reload`);
    // אבחון מלא
    await p.goto(BASE + '#/quiz'); await p.waitForTimeout(300);
    for (let i = 0; i < 12; i++) { await p.locator('.answer').first().click(); await p.waitForTimeout(80); }
    ok(await p.getByText('המבנה המוביל שלך').isVisible(), `${tag}: quiz yields a result`);
    ok(await p.getByText('כמה הפרופיל אמין?').isVisible(), `${tag}: reliability metrics shown`);
    ok((await p.locator('.result-hero h1').textContent()).includes('טָלֶה'), `${tag}: all-fire answers yield Aries`);
    // גמישות
    await p.goto(BASE + '#/flex'); await p.waitForTimeout(300);
    await p.locator('.pick', { hasText: 'סרטן' }).click();
    ok(await p.getByRole('heading', { name: 'מדויק' }).isVisible(), `${tag}: simulator marks best answer`);
    // שמיים: סרגל שנה
    await p.goto(BASE + '#/sky?y=2600'); await p.waitForTimeout(300);
    ok((await p.locator('.readout').textContent()).includes('דלי'), `${tag}: in 2600 the equinox is in Aquarius`);
    await p.getByRole('button', { name: 'חזרה להיום' }).click();
    ok((await p.locator('.readout').textContent()).includes('דגים'), `${tag}: today the equinox is in Pisces`);
    ok(errs.length === 0, `${tag}: no JS errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  // הפחתת תנועה
  const ctx = await b.newContext({ reducedMotion: 'reduce' });
  await ctx.route('**/ai-menu.js', (r) => r.fulfill({ path: path.join(__dirname, 'ai-menu.local.js'), contentType: 'text/javascript' }));
  const p = await ctx.newPage(); await p.goto(BASE); await p.waitForSelector('.hero');
  ok((await p.locator('.rise').first().evaluate((e) => getComputedStyle(e).animationName)) === 'none', 'reduced motion disables animation');
  // התקנה
  const cdp = await ctx.newCDPSession(p);
  const inst = await cdp.send('Page.getInstallabilityErrors');
  ok(inst.installabilityErrors.length === 0, 'installable: ' + JSON.stringify(inst.installabilityErrors));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})();
