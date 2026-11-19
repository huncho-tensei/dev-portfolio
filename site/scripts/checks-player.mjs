// The court, the player and the opening shot.
export default function playerChecks(check, { ok, until, sleep, scrollTo }) {
  const state = (page) => page.evaluate(() => {
    const w = window.__block.world;
    return { made: document.body.classList.contains('made'), mode: w.mv.mode, shot: w.sh.active ? w.sh.phase : null,
      bounces: w.sh.bounces, x: w.guy.position.x, z: w.guy.position.z, ballVisible: w.ball.visible };
  });

  check('opening: the name is hidden, then shown once the shot drops', { query: '?debug' }, async (page) => {
    await until(page, () => window.__block, null, 15000, 'the scene never started');
    await sleep(900);
    ok(!(await state(page)).made, 'the name was already showing before the shot');
    ok(await page.locator('#cap').evaluate((e) => getComputedStyle(e).opacity) === '0', 'the title is visible before the shot drops');
    await until(page, () => document.body.classList.contains('made'), null, 8000, 'the name never appeared');
    ok(await page.locator('#cap h2').innerText() === 'Hawi Oyugi', 'the first title is not his name');
    ok(await page.locator('#cap p').innerText() === 'I like to build things.', 'the first line is wrong');
  });

  check('opening: he ends up dribbling at his spot', { query: '?debug' }, async (page) => {
    await until(page, () => window.__block, null, 15000, 'the scene never started');
    await until(page, () => { const w = window.__block.world; return document.body.classList.contains('made') && w.mv.mode === 'idle' && !w.sh.active; }, null, 20000, 'he never got back to dribbling');
    const s = await state(page);
    ok(Math.hypot(s.x - 0.55, s.z - 0.35) < 0.05, `he stopped at ${s.x.toFixed(2)}, ${s.z.toFixed(2)}, not at his spot`);
    ok(s.ballVisible, 'the ball is hidden');
  });

  check('rebound: the ball bounces at least three times before he picks it up', { query: '?debug' }, async (page) => {
    await until(page, () => window.__block, null, 15000, 'the scene never started');
    const bounces = await until(page, () => { const s = window.__block.world.sh; return s.active && s.phase === 'pickup' ? s.bounces : 0; }, null, 20000, 'he never bent down to pick the ball up');
    ok(bounces >= 3, `only ${bounces} bounces before the pickup`);
  });

  check('loaded part-way down: no shot, name shown at once', { query: '?debug' }, async (page) => {
    await until(page, () => window.__block, null, 15000, 'the scene never started');
    await scrollTo(page, 0.3);
    await sleep(2500);
    const s = await state(page);
    ok(s.made, 'the name is still hidden');
    ok(s.shot === null, `he took the opening shot anyway (${s.shot})`);
  });
}
