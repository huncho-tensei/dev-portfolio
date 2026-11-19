// The page around the scene: its text version, the no-scene fallback, the title and what it loads.
export default function pageChecks(check, { ok, until, sleep }) {
  check('text version: every stage line and every answer is in the HTML', {}, async (page) => {
    const text = await page.locator('article.text').evaluate((e) => e.textContent);
    for (const want of ['I like to build things.', 'Five live systems you can try.', 'A dump of my daily X doom scroll.', 'Co-founded.', 'All of this in six months',
      "Currently out of Barcelona, but originally I'm from Kenya.", "Yes, and I'm accepting 1v1 challenges anytime, any day. You pick the place.", 'Maison', '7series']) {
      ok(text.includes(want), `the text version is missing: ${want}`);
    }
    const box = await page.locator('article.text').boundingBox();
    ok(box && box.width <= 2 && box.height <= 2, 'the text version is visible on top of the scene');
  });

  check('no scene: without WebGL the text version shows, with its links, and nothing breaks', { noGl: true }, async (page) => {
    await until(page, () => document.body.classList.contains('no-scene'), null, 15000, 'the page never fell back to its text version');
    ok(await page.locator('article.text h1').isVisible(), 'the name is not visible');
    ok(await page.locator('article.text h2').count() === 10, 'the text version does not have its ten headings');
    ok(await page.locator('article.text dt').count() === 7, 'the seven questions are missing');
    ok(await page.locator('article.text footer a').count() === 3, 'the three footer links are missing');
    ok(!(await page.locator('#scroller').isVisible()), 'the empty scene frame is still taking up the page');
  });

  check('search engines: Google can verify the site, and robots.txt and the sitemap point at it', {}, async (page) => {
    ok(await page.locator('meta[name="google-site-verification"]').getAttribute('content') === 'vDTYmAjB23ixZEgX2VgqZjglOYN7t8xzbqM2pnRKPeY', 'the Google verification tag is missing or wrong');
    const get = (path) => page.evaluate(async (p) => { const r = await fetch(p); return { status: r.status, text: await r.text() }; }, path);
    const robots = await get('/robots.txt');
    ok(robots.status === 200 && /Allow: \//.test(robots.text) && robots.text.includes('Sitemap: https://hawioyugi.com/sitemap.xml'), `robots.txt: ${robots.status} ${robots.text.slice(0, 80)}`);
    const map = await get('/sitemap.xml');
    ok(map.status === 200 && map.text.includes('<loc>https://hawioyugi.com</loc>'), `sitemap.xml: ${map.status} ${map.text.slice(0, 120)}`);
  });

  check('page: the title, description and icon are set, and nothing loads from another site', {}, async (page) => {
    const other = [];
    page.on('request', (r) => { const u = new URL(r.url()); if (!['localhost', '127.0.0.1'].includes(u.hostname) && !u.hostname.endsWith('.vercel.app') && u.hostname !== 'hawioyugi.com' && u.protocol.startsWith('http')) other.push(u.hostname); });
    await page.reload({ waitUntil: 'networkidle' }); await sleep(1500);
    ok(await page.title() === 'Hawi Oyugi', `the title is "${await page.title()}"`);
    ok(await page.locator('meta[name="description"]').getAttribute('content') === 'I like to build things. Co-founder of Ink and Pixel.', 'the description is wrong');
    ok(await page.locator('link[rel="icon"]').count() >= 1, 'no icon');
    ok(other.length === 0, `the page loaded from: ${[...new Set(other)].join(', ')}`);
  });
}
