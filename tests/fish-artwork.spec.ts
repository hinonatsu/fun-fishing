import { test, expect } from '@playwright/test';
import { fishSpecies } from '../src/catalog';
import { createDefaultBuild, encodeBuild } from '../src/domain';
import { noOverflow } from './helpers';

test('all 30 fish render distinct artwork and share it with method summaries', async ({ page, isMobile }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const build = { ...createDefaultBuild({ month: 10, area: 'tokyo-bay', field: 'pier' }), answers: { goal: 'food', pace: 'calm', budget: '30000' } };
  const url = `./?build=${encodeBuild(build)}#discover`;
  await page.goto(url);
  await expect(page.locator('.fish-card').first()).toBeVisible({ timeout: 15_000 });
  const expand = page.getByRole('button', { name: '全国の30項目をすべて見る', exact: true });
  if (await expand.isVisible()) await expand.click();
  const cards = page.locator('.fish-card');
  await expect(cards).toHaveCount(fishSpecies.length);
  await expect(page.locator('.fish-art > svg[data-artwork-species]')).toHaveCount(fishSpecies.length);

  const audit = await page.locator('.fish-art > svg').evaluateAll(nodes => nodes.map(svg => {
    const bounds = svg instanceof SVGGraphicsElement ? svg.getBBox() : null;
    const missing = [...svg.querySelectorAll('[fill], [clip-path]')].flatMap(node => {
      const refs = `${node.getAttribute('fill')} ${node.getAttribute('clip-path')}`.matchAll(/url\(#([^)]+)\)/g);
      return [...refs].filter(([, id]) => ![...svg.querySelectorAll('[id]')].some(def => def.id === id)).map(([, id]) => id);
    });
    return {
      species: svg.getAttribute('data-artwork-species'),
      model: svg.querySelector('title')?.textContent,
      body: svg.querySelector('[data-fish-body]')?.getAttribute('d'),
      hidden: svg.getAttribute('aria-hidden'),
      missing,
      bounds: bounds && { x: bounds.x, y: bounds.y, right: bounds.x + bounds.width, bottom: bounds.y + bounds.height },
    };
  }));
  expect(audit.map(item => item.species).sort()).toEqual(fishSpecies.map(fish => fish.id).sort());
  expect(new Set(audit.map(item => item.body)).size).toBe(fishSpecies.length);
  for (const item of audit) {
    expect(item.model, item.species!).toBeTruthy();
    expect(item.body, item.species!).toBeTruthy();
    expect(item.hidden).toBe('true');
    expect(item.missing, item.species!).toEqual([]);
    if (item.bounds) {
      expect(item.bounds.x, item.species!).toBeGreaterThan(0);
      expect(item.bounds.y, item.species!).toBeGreaterThan(0);
      expect(item.bounds.right, item.species!).toBeLessThan(290);
      expect(item.bounds.bottom, item.species!).toBeLessThan(170);
    }
  }
  const ids = await page.locator('.fish-art svg [id]').evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ['tsutsuika', 'aoriika', 'kouika']) {
    const svg = page.locator(`.fish-art svg[data-artwork-species="${id}"]`);
    await expect(svg.locator('[data-squid-arms] > path')).toHaveCount(8);
    await expect(svg.locator('[data-squid-tentacles] > path')).toHaveCount(2);
  }
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath('fish-cards.png'), fullPage: true, scale: 'css' });

  // Capture the actual application SVGs at readable comparison size for visual QA.
  const gallery = await cards.evaluateAll(nodes => nodes.map(card => ({
    name: card.querySelector('h2')!.textContent!, svg: card.querySelector('.fish-art > svg')!.outerHTML,
  })));
  const summaryTargets = ['aji', 'hirame', 'karei', 'kawahagi', 'tachiuo', 'aoriika'];
  for (const fish of fishSpecies.filter(fish => summaryTargets.includes(fish.id))) {
    await cards.filter({ has: page.getByRole('heading', { name: fish.name, exact: true }) }).click();
    await expect(page.locator(`.fish-target-summary > svg[data-artwork-species="${fish.id}"]`)).toBeVisible();
    await page.goBack();
    await expect(cards.first()).toBeVisible();
    if (await expand.isVisible()) await expand.click();
  }
  expect(errors).toEqual([]);

  if (!isMobile) {
    await page.setViewportSize({ width: 1500, height: 1320 });
    await page.setContent('<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>魚のイラスト 30種類</title><style>body{margin:0;padding:24px;background:#fcfbf5;color:#344f47;font-family:Meiryo,sans-serif}h1{font-size:22px;margin:0 0 18px}main{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}article{background:#f0f3e9;border:1px solid #dce4d7;border-radius:10px;overflow:hidden}svg{display:block;width:100%;height:150px}h2{font-size:14px;text-align:center;margin:0;padding:0 0 13px;font-weight:600}</style></head><body><h1>FUN FISHING · 魚種別イラスト 30種類</h1><main></main></body></html>');
    await page.locator('main').evaluate((main, items) => {
      for (const item of items) {
        const article = document.createElement('article');
        article.innerHTML = item.svg;
        const heading = document.createElement('h2');
        heading.textContent = item.name;
        article.append(heading);
        main.append(article);
      }
    }, gallery);
    await page.screenshot({ path: 'artifacts/screenshots/fish-artwork-30.png', fullPage: true, scale: 'css' });
  }
});
