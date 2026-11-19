// The block, the stage titles, the cards and the chat.
export default function blockChecks(check, { ok, until, sleep, scrollTo, blockAt }) {
  const ready = (page) => until(page, () => window.__block && document.body.classList.contains('made'), null, 20000, 'the scene never started');
  const where = (page, kind, n = 0) => page.evaluate(([k, n]) => window.__block.where(k, n), [kind, n]);
  const card = (page) => page.evaluate(() => { const c = document.getElementById('card'), r = c.getBoundingClientRect();
    return { on: c.classList.contains('on'), pinned: c.classList.contains('pinned'), text: c.innerText, top: r.top, bottom: r.bottom, left: r.left, right: r.right, vw: innerWidth, vh: innerHeight }; });
  const chatOpen = (page) => until(page, () => { const c = window.__block.world.closing; return c.open && !c.busy; }, null, 30000, 'the chat never opened');

  check('block: only the court at the top, all 17 things with a card up at the end', { query: '?debug&noshot' }, async (page) => {
    await ready(page);
    const count = () => page.evaluate(() => window.__block.world.pops.filter((g) => g.visible && g.userData.kind).length);
    ok(await count() === 0, 'things are up before any scrolling');
    await blockAt(page, 1); await sleep(2600);
    ok(await count() === 17, `${await count()} things are up at the end of the block, not 17`);
  });

  check('titles: the ten stage titles appear in order as the page scrolls', { query: '?debug&noshot' }, async (page) => {
    await ready(page);
    const want = ['Hawi Oyugi', 'Agents and bots', 'Games', 'Systems', 'Films', 'Writing', 'Websites', 'Ink and Pixel', 'All of this in six months', 'Next'];
    const seen = [];
    for (const f of [0, 0.13, 0.22, 0.31, 0.39, 0.47, 0.57, 0.68, 0.75, 0.82]) {
      await scrollTo(page, f); await sleep(1300);
      seen.push(await page.locator('#cap h2').innerText());
    }
    ok(JSON.stringify(seen) === JSON.stringify(want), `titles seen: ${seen.join(' / ')}`);
  });

  check('resize mid-scroll keeps the stage and leaves no sideways overflow', { query: '?debug&noshot' }, async (page) => {
    await ready(page);
    await blockAt(page, 0.5); await sleep(1500);
    const before = await page.locator('#cap h2').innerText();
    await page.setViewportSize({ width: 820, height: 700 }); await sleep(1200);
    const o = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: innerWidth, title: document.querySelector('#cap h2').textContent }));
    ok(o.doc <= o.win, `the page is ${o.doc}px wide in a ${o.win}px window`);
    ok(o.title === before, `the title changed from "${before}" to "${o.title}"`);
  });

  check('desktop card: the workshop pins on click, stays on the page, swaps pictures, and only links to the systems page', { query: '?debug&noshot' }, async (page, ctx) => {
    await ready(page);
    await blockAt(page, 1); await sleep(2600);
    const at = await where(page, 'Systems');
    await page.mouse.move(at.x, at.y); await sleep(700);
    ok((await card(page)).on, 'pointing at the workshop showed no card');
    const pages = ctx.pages().length;
    await page.mouse.click(at.x, at.y); await sleep(600);
    ok(ctx.pages().length === pages, 'clicking the workshop opened a new tab');
    ok((await card(page)).pinned, 'the card did not lock open');
    const first = await page.locator('#card .thumb img').getAttribute('src');
    await page.locator('#card .rows a').nth(3).hover(); await sleep(300);
    ok(await page.locator('#card .thumb img').getAttribute('src') !== first, 'hovering Mirador did not change the picture');
    const hrefs = await page.locator('#card a').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
    ok(hrefs.length === 6 && hrefs.every((x) => x === 'https://inkandpixel.co/systems'), `links: ${hrefs.join(', ')}`);
    const loaded = await page.locator('#card .thumb img').evaluate((i) => i.complete && i.naturalWidth > 0);
    ok(loaded, 'the card picture did not load');
  });

  check('desktop card: the Ink and Pixel building opens inkandpixel.co in a new tab', { query: '?debug&noshot' }, async (page, ctx) => {
    await ready(page);
    await blockAt(page, 1); await sleep(2600);
    const at = await where(page, 'Ink and Pixel');
    await page.mouse.move(at.x, at.y); await sleep(400);
    ok((await card(page)).text.includes('Co-founded.'), 'the studio card does not say Co-founded.');
    const [tab] = await Promise.all([ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null), page.mouse.click(at.x, at.y)]);
    ok(tab && tab.url().startsWith('https://inkandpixel.co'), `it opened ${tab ? tab.url() : 'nothing'}`);
  });

  check('desktop card: a pinned card fits inside a 1280x680 window', { query: '?debug&noshot', size: { width: 1280, height: 680 } }, async (page) => {
    await ready(page);
    await blockAt(page, 1); await sleep(2600);
    const at = await where(page, 'Systems');
    await page.mouse.click(at.x, at.y); await sleep(900);
    const c = await card(page);
    ok(c.pinned && c.top >= 0 && c.bottom <= c.vh && c.left >= 0 && c.right <= c.vw, `card box ${Math.round(c.top)}..${Math.round(c.bottom)} in a ${c.vh}px tall window`);
  });

  check('newsstand: its rows are doom scroll takes that open the blog', { query: '?debug&noshot' }, async (page) => {
    await ready(page);
    await blockAt(page, 1); await sleep(2600);
    const at = await where(page, 'Writing');
    await page.mouse.click(at.x, at.y); await sleep(700);
    const rows = await page.locator('#card .rows a').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
    const button = await page.locator('#card .go').getAttribute('href');
    ok(button === 'https://inkandpixel.co/blog/doom-scroll', `the button goes to ${button}`);
    ok(rows.length <= 3 && rows.every((x) => x.startsWith('https://inkandpixel.co/blog/')), `rows: ${rows.join(', ')}`);
  });

  check('phone card: a tap pins it under the thing and on screen; X, a second tap and scrolling all close it', { phone: true, query: '?debug&noshot' }, async (page) => {
    await ready(page);
    await blockAt(page, 1); await sleep(2600);
    for (const kind of ['Systems', 'Ink and Pixel', 'Films']) {
      const at = await where(page, kind);
      await page.touchscreen.tap(at.x, at.y); await sleep(1700);
      const c = await card(page);
      ok(c.pinned, `tapping ${kind} pinned no card`);
      ok(c.top >= 0 && c.bottom <= c.vh && c.left >= 0 && c.right <= c.vw, `${kind} card is off screen`);
      await page.locator('#card .x').tap(); await sleep(1500);
      ok(!(await card(page)).on, `the X did not close the ${kind} card`);
    }
    let at = await where(page, 'Writing'); await page.touchscreen.tap(at.x, at.y); await sleep(1600);
    at = await where(page, 'Writing'); await page.touchscreen.tap(at.x, at.y - 30); await sleep(700);
    ok(!(await card(page)).on, 'a second tap on the same thing did not close its card');
    await sleep(1200);
    at = await where(page, 'Films'); await page.touchscreen.tap(at.x, at.y); await sleep(1500);
    await page.evaluate(() => window.scrollBy(0, -200)); await sleep(900);
    ok(!(await card(page)).on, 'scrolling away did not close the card');
  });

  check('phone card: tall cards show the rail and the "more" tab, short ones do not', { phone: true, query: '?debug&noshot' }, async (page) => {
    await ready(page);
    await blockAt(page, 1); await sleep(2600);
    const cue = () => page.evaluate(() => ({ rail: document.querySelector('#card .rail').classList.contains('on'), more: document.querySelector('#card .more').classList.contains('on') }));
    let at = await where(page, 'Systems'); await page.touchscreen.tap(at.x, at.y); await sleep(1700);
    let c = await cue(); ok(c.rail && c.more, 'the systems card shows no scroll cue');
    await page.locator('#card .more').tap(); await sleep(900);
    c = await cue(); ok(c.rail && !c.more, 'the "more" tab is still showing at the bottom');
    ok(await page.locator('#card .x').isVisible(), 'the X scrolled out of reach');
    await page.locator('#card .x').tap(); await sleep(1500);
    at = await where(page, 'Films'); await page.touchscreen.tap(at.x, at.y); await sleep(1700);
    c = await cue(); ok(!c.rail && !c.more, 'the short films card shows a scroll cue');
  });

  check('closing: he shoots, misses, and the chat opens with seven questions', { query: '?debug&noshot' }, async (page) => {
    await ready(page);
    await scrollTo(page, 1);
    await chatOpen(page); await sleep(1600);
    ok(await page.locator('.hello.in').innerText() === 'Ask me anything.', 'the first bubble is wrong');
    ok(await page.locator('.qa.in').count() === 7, 'not all seven questions are showing');
    const s = await page.evaluate(() => { const w = window.__block.world; return { phase: w.sh.phase, ball: w.ball.visible }; });
    ok(s.phase === 'rest' && !s.ball, `after the miss he is in "${s.phase}" and the ball is ${s.ball ? 'still on the court' : 'gone'}`);
  });

  check('chat: one answer at a time, and LinkedIn is a link inside its sentence', { query: '?debug&noshot' }, async (page) => {
    await ready(page);
    await scrollTo(page, 1); await chatOpen(page); await sleep(1500);
    await page.locator('.qa .q').nth(2).click(); await sleep(2500);
    ok((await page.locator('.qa .a:not([hidden]) p').innerText()).startsWith('Currently out of Barcelona'), 'the Barcelona answer is wrong');
    await page.locator('.qa .q').nth(6).click(); await sleep(4500);
    ok(await page.locator('.qa .a:not([hidden])').count() === 1, 'two answers are open at once');
    const link = await page.locator('.qa .a:not([hidden]) p a').evaluateAll((a) => a.map((x) => [x.textContent, x.getAttribute('href')]));
    ok(link.length === 1 && link[0][0] === 'LinkedIn' && link[0][1] === 'https://www.linkedin.com/in/hawi-oyugi/', `links in the answer: ${JSON.stringify(link)}`);
    const footer = await page.locator('#chat footer a').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
    ok(footer.join() === 'https://www.linkedin.com/in/hawi-oyugi/,https://x.com/paroadster,https://inkandpixel.co', `footer: ${footer.join()}`);
  });

  check('chat: "the block" closes it, the tab reopens it with another miss, twice, and scrolling up resets', { query: '?debug&noshot' }, async (page) => {
    await ready(page);
    await scrollTo(page, 1); await chatOpen(page); await sleep(2500);
    for (const round of [1, 2]) {
      await page.locator('#chatx').click(); await sleep(3000);
      const s = await page.evaluate(() => { const w = window.__block.world; return { open: w.closing.open, shot: w.sh.active, ball: w.ball.visible, tab: document.getElementById('asktab').classList.contains('on'), title: document.querySelector('#cap h2').textContent }; });
      ok(!s.open && !s.shot && s.ball && s.tab, `round ${round}: after closing: ${JSON.stringify(s)}`);
      ok(s.title === 'All of this in six months', `round ${round}: title is "${s.title}"`);
      const at = await where(page, 'Systems');
      await page.mouse.move(at.x, at.y); await sleep(700);
      ok(await page.evaluate(() => document.getElementById('card').classList.contains('on')), `round ${round}: the block cannot be pointed at after closing the chat`);
      await page.mouse.move(700, 880);
      await page.locator('#asktab').click();
      await chatOpen(page); await sleep(1500);
      ok(await page.locator('.qa.in').count() === 7, `round ${round}: questions missing after reopening`);
    }
    await scrollTo(page, 0.4); await sleep(2500);
    const s = await page.evaluate(() => { const w = window.__block.world; return { chat: document.getElementById('chat').classList.contains('on'), tab: document.getElementById('asktab').classList.contains('on'), shot: w.sh.active, ball: w.ball.visible }; });
    ok(!s.chat && !s.tab && !s.shot && s.ball, `after scrolling up: ${JSON.stringify(s)}`);
  });

  check('phone chat: the close button and the answers stay reachable', { phone: true, query: '?debug&noshot' }, async (page) => {
    await ready(page);
    await scrollTo(page, 1); await chatOpen(page); await sleep(2500);
    const x = await page.locator('#chatx').boundingBox();
    ok(x && x.height >= 40 && x.y >= 0, `the close button is ${x ? Math.round(x.height) : 0}px tall`);
    await page.locator('.qa .q').nth(6).scrollIntoViewIfNeeded(); await page.locator('.qa .q').nth(6).tap(); await sleep(4200);
    const seen = await page.evaluate(() => { const a = document.querySelector('.qa .a:not([hidden])').getBoundingClientRect(), t = document.getElementById('thread').getBoundingClientRect(); return a.top >= t.top - 1 && a.bottom <= t.bottom + 1; });
    ok(seen, 'the last answer is cut off inside the chat');
    await page.setViewportSize({ width: 844, height: 390 }); await sleep(1500);
    const r = await page.locator('#chatx').boundingBox();
    ok(r && r.y >= 0 && r.y + r.height <= 390 && r.x + r.width <= 844, 'turning the phone pushed the close button off screen');
  });
}
