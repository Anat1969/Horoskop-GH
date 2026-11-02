// צילומי מסך של כל הדפים, במחשב (1280) ובנייד (390).
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE || 'http://localhost:4173/';
const OUT = process.argv[2] || 'shots';
const PAGES = ['', 'atlas', 'sign/aries', 'quiz', 'bond', 'flex', 'sky', 'cultures', 'read', 'key'];
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [390, 844, 'm']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, locale: 'he-IL' });
    await ctx.route('**/ai-menu.js', (r) => r.fulfill({ path: path.join(__dirname, 'ai-menu.local.js'), contentType: 'text/javascript' }));
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', tag, e.message));
    for (const pg of PAGES) {
      await p.goto(BASE + '#/' + pg); await p.waitForTimeout(2000);
      await p.screenshot({ path: `${OUT}/${tag}-${pg.replace('/', '_') || 'home'}.png`, fullPage: tag === 'd' });
      const ow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (ow > 0) console.log('HSCROLL', tag, pg, ow);
    }
    await ctx.close();
  }
  await b.close();
})();
