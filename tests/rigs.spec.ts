import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { decodeBuild, encodeBuild } from '../src/domain';
import { rigs } from '../src/rigs';
import { builder, completedBuild, noOverflow } from './helpers';

test('all twelve rig diagrams are reachable and show every labeled component', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./#rigs/sabiki');
  const choices = page.getByRole('group', { name: '12種類の釣り方' });
  await expect(choices.getByRole('button')).toHaveCount(12);
  for (const rig of rigs) {
    await choices.getByRole('button', { name: `${rig.name}の仕掛けを見る`, exact: true }).click();
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
  const overview = () => page.getByRole('region', { name: '道具の全体像' });
  await expect(overview().locator('[data-part][data-state="missing"]')).toHaveCount(8);
  const mobileKey = overview().locator('.tackle-mobile-key');
  if (await mobileKey.isVisible()) await mobileKey.locator('summary').click();
  await overview().getByRole('button', { name: '全体図から商品を選ぶ：1 ロッド 未選択', exact: true }).click();
  await expect(overview().locator('[data-part="rod"]')).toHaveClass(/is-missing is-current/);
  await page.getByRole('button', { name: 'この商品を選ぶ：リバティクラブ 小継 磯 3-300', exact: true }).click();
  await expect(overview().locator('[data-part="rod"]')).toHaveAttribute('data-state', 'selected');
  await expect(overview().locator('[data-part="reel"]')).toHaveAttribute('data-state', 'missing');
  await expect(page.getByRole('status').filter({ hasText: 'ロッドを反映しました。' })).toBeVisible();
  await overview().screenshot({ path: info.outputPath('setup-one-selected.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'リールの商品を選ぶ', exact: true }).click();
  await expect(overview().locator('[data-part="rod"]')).toHaveAttribute('data-state', 'selected');
  await expect(overview().locator('[data-part="reel"]')).toHaveClass(/is-missing is-current/);
  await overview().screenshot({ path: info.outputPath('setup-current-reel.png'), animations: 'disabled' });
  await page.reload();
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
