import { expect, type Page } from '@playwright/test';
import { categories, defaultSelection, products } from '../src/catalog';
import { createDefaultBuild } from '../src/domain';

export async function fresh(page: Page) {
  // Playwright provides an isolated browser context per test. The sample/start
  // actions create fresh plans, so no racing storage mutation or reload is needed.
  await page.goto('./#search');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
}
export async function diagnose(page: Page) {
  await fresh(page);
  await page.getByRole('button',{name:'10月・東京湾のサンプルで始める',exact:true}).click();
  await page.getByRole('button',{name:/釣った魚をおいしく食べたい/}).click();
  await page.getByRole('button',{name:/のんびり、魚の反応を待つ/}).click();
  await page.getByRole('button',{name:/3万円以内を目指したい/}).click();
  await expect(page).toHaveURL(/#diagnosis\/ready$/);
}
export async function builder(page: Page) {
  await diagnose(page);
  await page.getByRole('button',{name:'おすすめの魚を見る',exact:true}).click();
  await page.getByRole('button').filter({has:page.getByRole('heading',{name:'アジ',exact:true})}).click();
  await expect(page).toHaveURL(/#method$/);
  await page.locator('.style-choice').filter({has:page.getByRole('heading',{name:'サビキ釣り',exact:true})}).getByRole('button',{name:'この釣り方の道具を選ぶ',exact:true}).click();
  await expect(page).toHaveURL(/#builder$/);
}
export async function chooseAll(page: Page) {
  for (const category of categories) {
    await expect(page).toHaveURL(/#builder$/);
    await page.getByRole('button',{name:`${category.label}の商品を選ぶ`,exact:true}).click();
    await expect(page).toHaveURL(new RegExp(`#builder/${category.id}$`));
    const p = products.find(p=>p.id === defaultSelection[category.id])!;
    await page.getByRole('button',{name:`この商品を選ぶ：${p.name}`,exact:true}).click();
  }
  await expect(page).toHaveURL(/#builder$/);
  await page.getByRole('button',{name:'この構成を確認する',exact:true}).click();
  await expect(page).toHaveURL(/#review$/);
}
export async function complete(page: Page) { await builder(page); await chooseAll(page); }
export function completedBuild() {
  return {...createDefaultBuild({month:10,area:'tokyo-bay',field:'pier'}),fishId:'aji',methodId:'sabiki',answers:{goal:'food',pace:'calm',budget:'30000'},selection:{...defaultSelection}};
}
export async function noOverflow(page: Page) {
  const width = await page.evaluate(()=>({actual:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(width.actual).toBeLessThanOrEqual(width.viewport);
}
