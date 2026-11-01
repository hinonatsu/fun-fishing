import { test, expect } from '@playwright/test';
import { fishSpecies } from '../src/catalog';
import { createDefaultBuild, encodeBuild } from '../src/domain';
import { noOverflow } from './helpers';

test('all 30 realistic illustrations load and remain visible in fish cards and summaries', async ({ page, isMobile }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const build = { ...createDefaultBuild({ month: 10, area: 'tokyo-bay', field: 'pier' }), answers: { goal: 'food', pace: 'calm', budget: '30000' } };
  await page.goto(`./?build=${encodeBuild(build)}#discover`);
  const cards = page.locator('.fish-card');
  await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  const expand = page.getByRole('button', { name: 'すべての魚・イカを見る', exact: true });
  if (await expand.isVisible()) await expand.click();
  await expect(cards).toHaveCount(fishSpecies.length);
  const images = page.locator('.fish-art > img.fish-artwork');
  await expect(images).toHaveCount(fishSpecies.length);
  const audit = await images.evaluateAll(async nodes => {
    nodes.forEach(image => { image.loading = 'eager'; });
    return Promise.all(nodes.map(async image => {
      await image.decode();
      const bounds = image.getBoundingClientRect();
      const frame = image.parentElement!.getBoundingClientRect();
      return {
        id: image.dataset.artworkSpecies, model: image.dataset.artworkModel,
        src: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight,
        hidden: image.getAttribute('aria-hidden'), alt: image.alt,
        fit: getComputedStyle(image).objectFit,
        fits: bounds.left >= frame.left && bounds.right <= frame.right + 1 && bounds.top >= frame.top && bounds.bottom <= frame.bottom + 1,
      };
    }));
  });
  expect(audit.map(item => item.id).sort()).toEqual(fishSpecies.map(fish => fish.id).sort());
  expect(new Set(audit.map(item => item.src)).size).toBe(30);
  for (const item of audit) {
    expect(item.model, item.id).toBeTruthy();
    expect(item.src).toMatch(/\/fun-fishing\/images\/fish\/[a-z]+\.webp$/);
    expect([item.width, item.height], item.id).toEqual([1200, 800]);
    expect(item.fit, item.id).toBe('contain');
    expect(item.fits, item.id).toBe(true);
    expect(item.hidden).toBe('true');
    expect(item.alt).toBe('');
  }
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath('realistic-fish-cards.png'), fullPage: true, scale: 'css' });
  const gallery = fishSpecies.map(fish => ({ ...audit.find(item => item.id === fish.id)!, name: fish.name }));
  for (const id of ['aji', 'hirame', 'karei', 'kawahagi', 'tachiuo', 'aoriika']) {
    const fish = fishSpecies.find(fish => fish.id === id)!;
    await cards.filter({ has: page.getByRole('heading', { name: fish.name, exact: true }) }).click();
    const image = page.locator(`.fish-target-summary > img[data-artwork-species="${id}"]`);
    await expect(image).toBeVisible();
    expect(await image.evaluate(async image => { await image.decode(); return image.naturalWidth; })).toBe(1200);
    await noOverflow(page);
    await page.goBack();
    await expect(cards.first()).toBeVisible();
    if (await expand.isVisible()) await expand.click();
  }
  expect(errors).toEqual([]);
  if (!isMobile) {
    await page.setViewportSize({ width: 1800, height: 1640 });
    await page.setContent('<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>魚の写実イラスト30種類</title><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#f9faf5;color:#193f3e;font-family:Meiryo,sans-serif}header{display:flex;justify-content:space-between;align-items:end;margin-bottom:24px}h1{font-size:26px;letter-spacing:.03em;margin:0}header p{font-size:13px;letter-spacing:.15em;color:#6c8179;margin:0}main{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}article{background:radial-gradient(ellipse at 50% 40%,#fff 0%,#eff5ed 80%);border:1px solid #e1e9dc;border-radius:14px;overflow:hidden;text-align:center}img{display:block;width:100%;height:190px;object-fit:contain;filter:drop-shadow(0 7px 6px #24413718)}h2{font-size:16px;margin:0 0 4px;font-weight:700}small{display:block;font-size:11px;color:#6c8179;min-height:17px;margin-bottom:13px}</style></head><body><header><h1>FUN FISHING · 海で出会いたい30種類</h1><p>REALISTIC FISH ILLUSTRATIONS</p></header><main></main></body></html>');
    await page.locator('main').evaluate((main, items) => {
      for (const item of items) {
        const card = document.createElement('article');
        const image = document.createElement('img');
        image.src = item.src;
        image.alt = item.name;
        const heading = document.createElement('h2');
        heading.textContent = item.name;
        const model = document.createElement('small');
        model.textContent = item.name === item.model ? '' : item.model!;
        card.append(image, heading, model);
        main.append(card);
      }
    }, gallery);
    await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await page.screenshot({ path: 'artifacts/screenshots/fish-artwork-realistic-30.png', fullPage: true, scale: 'css' });
  }
});
