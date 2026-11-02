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
    for (const pg of ['atlas', 'sign/leo', 'quiz', 'bond', 'flex', 'sky', 'cultures', 'read', 'key', '']) {
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
    // מטרת הדף בכל דף
    for (const pg of ['', 'atlas', 'sign/leo', 'bond', 'flex', 'sky', 'cultures', 'read', 'key']) {
      await p.goto(BASE + '#/' + pg); await p.waitForTimeout(250);
      ok(await p.getByRole('region', { name: 'מטרת הדף' }).isVisible(), `${tag}: purpose block on #/${pg}`);
    }
    // קשרים: זוג
    await p.goto(BASE + '#/bond?a=aries&b=libra'); await p.waitForTimeout(300);
    ok((await p.locator('.bond-mid').textContent()).includes('ניגוד'), `${tag}: Aries-Libra is an opposition`);
    await p.getByRole('group', { name: /צד ב/ }).getByRole('button', { name: 'אריה' }).click();
    ok((await p.locator('.bond-mid').textContent()).includes('משולש'), `${tag}: Aries-Leo is a trine`);
    ok(await p.locator('.tone-action', { hasText: 'תרגול משותף' }).isVisible(), `${tag}: joint practice shown`);
    // קשרים: מעגל
    for (const [n, sg] of [['דנה', 'aries'], ['יואב', 'cancer'], ['מיכל', 'libra']]) {
      await p.fill('#pn', n); await p.selectOption('#ps', sg); await p.getByRole('button', { name: 'הוספה למעגל' }).click();
    }
    ok(await p.locator('.pair').count() === 3, `${tag}: circle of 3 yields 3 pairs`);
    ok(await p.locator('.tone-problem', { hasText: 'מה חסר בקבוצה' }).isVisible(), `${tag}: missing elements reported`);
    await p.locator('.pair').first().click(); await p.waitForTimeout(200);
    ok(decodeURIComponent(p.url()).includes('an='), `${tag}: clicking a pair loads it with names`);
    await p.reload(); await p.waitForTimeout(300);
    ok(await p.locator('.person').count() === 3, `${tag}: circle persists after reload`);
    // לחיצה על מזל בגלגל: בלי מסגרת ריבוע
    await p.goto(BASE + '#/'); await p.waitForTimeout(300);
    const g = p.locator('.hero-wheel g[role=button]').first();
    await g.focus();
    ok((await g.evaluate((e) => getComputedStyle(e).outlineStyle)) === 'none', `${tag}: no square outline on wheel sign`);
    // קשרים: מול כל המזלות ומטריצה
    await p.goto(BASE + '#/bond?a=aries&b=cancer'); await p.waitForTimeout(300);
    ok(await p.locator('.relbar-row').count() === 11, `${tag}: Aries vs all 11 others`);
    ok(await p.locator('.rm-cell').count() === 132, `${tag}: matrix has 132 off-diagonal cells`);
    await p.locator('.rm-cell').nth(5).click(); await p.waitForTimeout(200);
    ok(!p.url().includes('b=cancer'), `${tag}: matrix click loads a new pair`);
    ok(await p.locator('.meters .meter').count() === 4, `${tag}: four pair meters`);
    // דף מבנה: מול כל המזלות
    await p.goto(BASE + '#/sign/leo'); await p.waitForTimeout(300);
    ok(await p.locator('.relbar-row').count() === 11, `${tag}: sign page shows relations to all`);
    // תרבויות
    await p.goto(BASE + '#/cultures'); await p.waitForTimeout(500);
    ok(await p.locator('.culture').count() === 9, `${tag}: nine culture cards`);
    ok(await p.locator('svg[aria-label^="מפת התרבויות"] path').count() > 5, `${tag}: world map renders`);
    ok(await p.locator('table.names tbody tr').count() === 12, `${tag}: names table has 12 signs`);
    // מקרא
    await p.goto(BASE + '#/key'); await p.waitForTimeout(300);
    ok(await p.locator('.format').count() === 14, `${tag}: key lists 14 formats`);
    ok(await p.locator('.hidden-item').count() >= 8, `${tag}: hidden buttons explained`);
    // תוויות לכפתורים חבויים
    await p.goto(BASE + '#/sign/aries'); await p.waitForTimeout(300);
    ok((await p.locator('.ops [data-tip]').count()) === 3, `${tag}: icon buttons carry tooltips`);
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
