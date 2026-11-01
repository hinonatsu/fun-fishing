import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { decodeBuild, encodeBuild } from '../src/domain';
import { categories } from '../src/catalog';
import { rigs, rigForBuild } from '../src/rigs';
import { builder, completedBuild, noOverflow, openOverview } from './helpers';

test('all twelve rig diagrams are reachable and show every labeled component', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./#rigs/sabiki');
  const choices = page.getByRole('combobox',{name:'図解の釣り方を切り替える'});
  await expect(choices.locator('option')).toHaveCount(12);
  for (const rig of rigs) {
    await choices.selectOption(rig.id);
    await expect(page).toHaveURL(new RegExp(`#rigs/${rig.id}$`));
    const detail = page.getByRole('article', { name: `${rig.name}の仕掛け図解` });
    await expect(detail.getByRole('img', { name: new RegExp(`${rig.name}の道具全体図`) })).toBeVisible();
    await expect(detail.locator('[data-part]')).toHaveCount(rig.parts.length);
    for (const p of rig.parts) await expect(detail.locator(`[data-part="${p.id}"]`)).toHaveAttribute('data-state', 'selected');
    await detail.getByRole('button', { name: /ロッド/ }).click();
    await expect(detail.locator('[data-part="rod"]')).toHaveClass(/is-current/);
    await noOverflow(page);
    await detail.screenshot({ path: info.outputPath(`rig-${rig.id}.png`), animations: 'disabled' });
  }
  expect(errors).toEqual([]);
  expect(decodeBuild(await page.evaluate(() => localStorage.getItem('fun-fishing-build-v1')!))?.selection.rod).toBe('');
  const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(a11y.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});

test('choosing a product colors its part while the current unselected part stays grey', async ({ page }, info) => {
  await builder(page);
  await openOverview(page);
  const overview = () => page.getByRole('region', { name: '道具の全体像' });
  await expect(overview().locator('[data-part][data-state="missing"]')).toHaveCount(8);
  const mobileKey = overview().locator('.tackle-mobile-key');
  if (await mobileKey.isVisible()) await mobileKey.locator('summary').click();
  await overview().getByRole('button', { name: '全体図から商品を選ぶ：1 釣り竿（ロッド） 未選択', exact: true }).click();
  await openOverview(page);
  await expect(overview().locator('[data-part="rod"]')).toHaveClass(/is-missing is-current/);
  await page.getByRole('button', { name: 'この商品を選ぶ：リバティクラブ 小継 磯 3-300', exact: true }).click();
  await openOverview(page);
  await expect(overview().locator('[data-part="rod"]')).toHaveAttribute('data-state', 'selected');
  await expect(overview().locator('[data-part="reel"]')).toHaveAttribute('data-state', 'missing');
  await expect(page.getByRole('status').filter({ hasText: '釣り竿（ロッド）を反映しました。' })).toBeVisible();
  await overview().screenshot({ path: info.outputPath('setup-one-selected.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'リールの商品を選ぶ', exact: true }).click();
  await openOverview(page);
  await expect(overview().locator('[data-part="rod"]')).toHaveAttribute('data-state', 'selected');
  await expect(overview().locator('[data-part="reel"]')).toHaveClass(/is-missing is-current/);
  await overview().screenshot({ path: info.outputPath('setup-current-reel.png'), animations: 'disabled' });
  await page.reload();
  await openOverview(page);
  await expect(overview().locator('[data-part="reel"]')).toHaveClass(/is-missing is-current/);
  await noOverflow(page);
  await page.getByRole('button', { name: '12種類の仕掛けを見る', exact: true }).click();
  await expect(page).toHaveURL(/#rigs\/sabiki$/);
  await page.reload();
  await page.getByRole('button', { name: '戻る', exact: true }).click();
  await expect(page).toHaveURL(/#builder\/reel$/);
  await expect(overview().locator('[data-part="rod"]')).toHaveAttribute('data-state', 'selected');
});

test('owned and included components keep distinct labels and restore from a shared URL', async ({ page }, info) => {
  const build = completedBuild();
  build.owned = ['rod'];
  build.selection.rod = '';
  build.selection.reel = 'reel-2500';
  build.selection.line = '';
  build.included = ['line'];
  await page.goto(`./?build=${encodeBuild(build)}#builder`);
  await openOverview(page);
  const overview = page.getByRole('region', { name: '道具の全体像' });
  await expect(overview.locator('[data-part="rod"]')).toHaveAttribute('data-state', 'owned');
  await expect(overview.locator('[data-part="line"]')).toHaveAttribute('data-state', 'included');
  await expect(overview.locator('.tackle-desktop-key [data-category="rod"]')).toContainText('手持ち');
  await expect(overview.locator('.tackle-desktop-key [data-category="line"]')).toContainText('付属品');
  await page.screenshot({ path: info.outputPath('setup-overview-complete.png'), fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'リールを変更する', exact: true }).click();
  await page.getByRole('button', { name: 'この商品を選ぶ：17 ワールドスピン CF2500', exact: true }).click();
  await expect(overview.locator('[data-part="line"]')).toHaveAttribute('data-state', 'missing');
});

test('hover previews unselected gear while chosen tools stay colored', async ({ page, isMobile }, info) => {
  const build = completedBuild();
  build.selection.reel = '';
  await page.goto(`./?build=${encodeBuild(build)}#builder`);
  await openOverview(page);
  await page.getByRole('button', { name: '通知を閉じる', exact: true }).click();
  await page.mouse.move(0, 0);
  const diagram = page.getByRole('region', { name: '道具の全体像' }).locator('svg.rig-diagram');
  const saved = await page.evaluate(() => localStorage.getItem('fun-fishing-build-v1'));
  const selectedColor = await diagram.locator('[data-part="rod"]').evaluate(el => getComputedStyle(el).getPropertyValue('--rig-fill'));
  const missingColor = await diagram.locator('[data-part="reel"]').evaluate(el => getComputedStyle(el).getPropertyValue('--rig-fill'));
  const selectedMarkerColor = await diagram.locator('[data-part-label="rod"] > circle').evaluate(el => getComputedStyle(el).fill);
  expect(selectedColor).not.toBe(missingColor);
  if (isMobile) {
    // Touch opens the matching gear chooser and does not save a simulated hover.
    await diagram.locator('[data-part="reel"] > g:not(.rig-hit-area)').tap();
    await expect(page).toHaveURL(/#builder\/reel$/);
    await page.getByRole('button',{name:'戻る',exact:true}).click();
    await expect(page).toHaveURL(/#builder$/);
    await openOverview(page);
    await expect(diagram).not.toHaveAttribute('data-highlighted-part');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  } else {
    for (const category of categories) {
      await page.locator(`.equipment-table tr[data-category="${category.id}"]`).hover();
      await expect(diagram).toHaveAttribute('data-highlighted-part', category.id);
      await expect(page.getByRole('tooltip')).toHaveText(rigForBuild(build).parts.find(p=>p.category===category.id)!.label);
      const colors = await diagram.locator('[data-part]').evaluateAll(parts => parts.map(el => ({ id: el.getAttribute('data-part'), state: el.getAttribute('data-state'), color: getComputedStyle(el).getPropertyValue('--rig-fill') })));
      for (const part of colors) expect(part.color).toBe(part.state !== 'missing' || part.id === category.id ? selectedColor : missingColor);
      await expect(diagram.locator('[data-part="rod"]')).toHaveCSS('--rig-fill', selectedColor);
    }
    await page.locator('.equipment-table tr[data-category="reel"]').hover();
    await expect(diagram.locator('[data-part="rod"]')).toHaveCSS('--rig-fill', selectedColor);
    await expect(diagram.locator('[data-part="reel"]')).toHaveCSS('--rig-fill', selectedColor);
    await expect(diagram.locator('[data-part-label="rod"] > circle')).toHaveCSS('fill', selectedMarkerColor);
    await expect(page.getByRole('tooltip')).toBeVisible();
    const nameBox = (await page.getByRole('tooltip').boundingBox())!;
    expect(nameBox.x).toBeGreaterThanOrEqual(8);
    expect(nameBox.x + nameBox.width).toBeLessThanOrEqual(page.viewportSize()!.width - 8);
    await page.screenshot({ path: info.outputPath('hover-name-tooltip.png'), animations: 'disabled' });
    await page.getByRole('region', { name: '道具の全体像' }).screenshot({ path: info.outputPath('hover-reel.png'), animations: 'disabled' });
    await page.getByRole('heading', { level: 1 }).hover();
    await openOverview(page);
    await expect(diagram).not.toHaveAttribute('data-highlighted-part');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  }
  expect(await diagram.locator('[data-part="rod"]').evaluate(el => getComputedStyle(el).getPropertyValue('--rig-fill'))).toBe(selectedColor);
  expect(await diagram.locator('[data-part="reel"]').evaluate(el => getComputedStyle(el).getPropertyValue('--rig-fill'))).toBe(missingColor);
  expect(await page.evaluate(() => localStorage.getItem('fun-fishing-build-v1'))).toBe(saved);
});

test('illustration parts, legend cells and keyboard focus highlight the matching tool', async ({ page, isMobile }) => {
  await page.goto(`./?build=${encodeBuild(completedBuild())}#builder`);
  await openOverview(page);
  await page.getByRole('button', { name: '通知を閉じる', exact: true }).click();
  await page.mouse.move(0, 0);
  await openOverview(page);
  const overview = page.getByRole('region', { name: '道具の全体像' });
  const diagram = overview.locator('svg.rig-diagram');
  if (!isMobile) {
    await diagram.scrollIntoViewIfNeeded();
    const box = (await diagram.boundingBox())!;
    const targets = { rod: [292, 150], reel: [307, 271], line: [112, 100], rig: [112, 190], basket: [112, 287], bait: [102, 367], bucket: [248, 370], safety: [381, 365] };
    for (const [category, [x, y]] of Object.entries(targets)) {
      await page.mouse.move(box.x + box.width * x / 430, box.y + box.height * y / 420);
      await expect(diagram).toHaveAttribute('data-highlighted-part', category);
      await expect(page.getByRole('tooltip')).toHaveText(rigForBuild(completedBuild()).parts.find(p=>p.id===category)!.label);
      await expect(page.locator(`.equipment-table tr[data-category="${category}"]`)).toHaveClass(/is-highlighted/);
    }
    await diagram.locator('[data-part-label="reel"]').hover();
    await expect(page.getByRole('tooltip')).toHaveText('リール');
    await overview.locator('.tackle-desktop-key [data-category="reel"]').hover();
    await expect(diagram).toHaveAttribute('data-highlighted-part', 'reel');
    await expect(page.getByRole('tooltip')).toHaveText('リール');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.getByRole('heading', { level: 1 }).hover();
  }
  await page.getByRole('button', { name: 'リールを変更する', exact: true }).focus();
  await expect(diagram).toHaveAttribute('data-highlighted-part', 'reel');
  await page.getByRole('heading', { level: 1 }).focus();
  await expect(diagram).not.toHaveAttribute('data-highlighted-part');
});
