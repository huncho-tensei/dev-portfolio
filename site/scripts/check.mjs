// Browser checks for the block. They drive the real page in Chrome and assert on what it does.
//
//   npm run build && npx next start -p 3210 &
//   npm run check                 every check
//   npm run check -- chat         only checks whose name contains "chat"
//
// BASE=https://some-preview.vercel.app npm run check    runs them against a deployed copy.

import { chromium } from 'playwright-core';

const BASE = process.env.BASE || 'http://localhost:3210';
const only = process.argv[2];
const SOFTWARE_GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const PHONE = { width: 390, height: 844 };
const DESK = { width: 1440, height: 900 };

const checks = [];
/** Register a check. `opts`: { phone, size, query, reduced, noGl, keepErrors } */
function check(name, opts, fn) { checks.push({ name, opts, fn }); }
function ok(cond, why) { if (!cond) throw new Error(why); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- helpers shared by the checks ----------
/** Wait until `fn` (run in the page) returns something truthy, and return it. */
async function until(page, fn, arg, timeout = 15000, why = 'timed out waiting') {
  try { return await (await page.waitForFunction(fn, arg, { timeout })).jsonValue(); } catch { throw new Error(why); }
}
/** Scroll to a fraction of the whole page (0 top, 1 bottom). */
const scrollTo = (page, f) => page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), f);
/** The block takes the first 0.76 of the scroll. `p` is progress through the block, 0 to 1. */
const blockAt = (page, p) => scrollTo(page, 0.76 * p);
const h = { ok, sleep, until, scrollTo, blockAt, PHONE, DESK, BASE };

// ---------- the checks ----------
check('page loads with no console errors and a #stage element', {}, async (page) => {
  ok(await page.locator('#stage').count() === 1, 'no #stage on the page');
});

const more = ['./checks-player.mjs', './checks-block.mjs', './checks-page.mjs'];
for (const file of more) {
  try { (await import(file)).default(check, h); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
}

// ---------- runner ----------
const wanted = checks.filter((c) => !only || c.name.includes(only));
let failed = 0;
const browsers = {};
async function browser(noGl) {
  const key = noGl ? 'plain' : 'gl';
  browsers[key] ??= await chromium.launch({ channel: 'chrome', headless: true, args: noGl ? ['--disable-gpu'] : SOFTWARE_GL });
  return browsers[key];
}
for (const c of wanted) {
  const o = c.opts || {};
  const size = o.size || (o.phone ? PHONE : DESK);
  const b = await browser(o.noGl);
  const ctx = await b.newContext({
    viewport: size, deviceScaleFactor: o.phone ? 3 : 1, hasTouch: !!o.phone, isMobile: !!o.phone,
    reducedMotion: o.reduced ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  if (o.noGl) await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  const started = Date.now();
  try {
    await page.goto(`${BASE}/${o.query || ''}`, { waitUntil: 'load' });
    await c.fn(page, ctx);
    if (!o.keepErrors && errors.length) throw new Error(`console errors: ${[...new Set(errors)].join(' | ').slice(0, 300)}`);
    console.log(`ok    ${c.name}  (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${c.name}\n      ${String(e.message).split('\n')[0]}`);
  }
  await ctx.close();
}
for (const b of Object.values(browsers)) await b.close();
console.log(`\n${wanted.length - failed} of ${wanted.length} checks passed`);
process.exit(failed ? 1 : 0);
