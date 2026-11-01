import { expect, test } from '@playwright/test';
import { createDefaultBuild, decodeBuild, encodeBuild } from '../src/domain';
import { candidatesFor } from '../src/planner';
import { groupPriceTiers, priceTiers } from '../src/price-tiers';
import { noOverflow } from './helpers';

for (const [fishId, methodId, category] of [['aji', 'sabiki', 'pliers'], ['aji', 'float', 'stopper'], ['tsutsuika', 'eging', 'egi']] as const) {
  test(`${fishId}/${methodId}/${category}: all price bands select a real Amazon product`, async ({ page }, info) => {
    const build = { ...createDefaultBuild({ month: 5, area: 'tokyo-bay', field: 'pier' }), fishId, methodId, answers: { goal: 'first', pace: 'calm', budget: '30000' } };
    const { groups } = groupPriceTiers(build, candidatesFor(build, category));
    await page.goto(`./?build=${encodeBuild(build)}#builder/${category}`);
    const picker = page.getByRole('region', { name: '商品の価格帯比較' });
    await expect(picker.getByRole('button', { name: /^すべて/ })).toHaveAttribute('aria-pressed', 'true');
    for (const tier of priceTiers) {
      await picker.getByRole('button', { name: new RegExp(`^${tier.label}`) }).click();
      await expect(picker.getByRole('article')).toHaveCount(groups[tier.id].length);
      expect(groups[tier.id].length).toBeGreaterThan(0);
      await expect(picker.getByRole('status')).toHaveText(`${tier.label}：${groups[tier.id].length}件`);
      expect(decodeBuild(await page.evaluate(() => localStorage.getItem('fun-fishing-build-v1')!))?.selection).toEqual(build.selection);
    }
    await noOverflow(page);
    await page.screenshot({ path: info.outputPath('price-tiers.png'), fullPage: true });
    const target = groups.high[0];
    const card = picker.getByRole('article').filter({ has: page.getByRole('heading', { name: target.name, exact: true }) });
    await card.getByRole('button', { name: /^この商品を選ぶ：/ }).click();
    await expect(page).toHaveURL(/#builder$/);
    const saved = decodeBuild(await page.evaluate(() => localStorage.getItem('fun-fishing-build-v1')!))!;
    expect(saved.selection[target.category]).toBe(target.id);
    await page.reload();
    expect(decodeBuild(await page.evaluate(() => localStorage.getItem('fun-fishing-build-v1')!))?.selection[target.category]).toBe(target.id);
  });
}
