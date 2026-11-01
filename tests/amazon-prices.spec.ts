import { test, expect } from '@playwright/test';
import targets from '../src/data/amazon-products.json' with { type: 'json' };
import { encodeBuild } from '../src/domain';
import { completedBuild, noOverflow } from './helpers';

test('daily prices appear in the review, manual overrides and shopping checklist', async ({ page }) => {
  const timestamp = new Date(Date.now() - 60_000).toISOString();
  const snapshot = { schemaVersion:1,updatedAt:timestamp,products:Object.fromEntries(Object.entries(targets).map(([id,asin])=>[id,{asin,currency:'JPY',price:1000,fetchedAt:timestamp,attemptedAt:timestamp,status:'ok',error:null}])) };
  await page.route('**/src/data/amazon-prices.json*', route=>route.fulfill({contentType:'application/javascript',body:`export default ${JSON.stringify(snapshot)};`}));
  const build = completedBuild();
  await page.goto(`./?build=${encodeBuild(build)}#builder`);
  await expect(page.getByRole('row').filter({hasText:'リバティクラブ 小継 磯 3-300'})).toContainText('1,000円（Amazon・');
  await expect(page.getByLabel('今回の購入費用')).toContainText('8,000円');
  await noOverflow(page);
  await page.getByRole('button',{name:'選んだ道具を確認する',exact:true}).click();
  await expect(page.getByLabel('今回の購入費用')).toContainText('8,000円');
  const rod = page.getByRole('article').filter({has:page.getByRole('heading',{name:'リバティクラブ 小継 磯 3-300',exact:true})});
  await expect(rod).toContainText('1,000円（Amazon・');
  await noOverflow(page);
  await page.getByRole('button',{name:'釣り竿（ロッド）の価格を入力',exact:true}).click();
  await page.getByRole('spinbutton',{name:'リバティクラブ 小継 磯 3-300の税込価格',exact:true}).fill('500');
  await page.getByRole('button',{name:'価格を保存して戻る',exact:true}).click();
  await expect(rod).toContainText('500円（手入力）');
  await expect(page.getByLabel('今回の購入費用')).toContainText('7,500円');
  await page.getByRole('button',{name:'釣り竿（ロッド）の価格を入力',exact:true}).click();
  await page.getByRole('spinbutton',{name:'リバティクラブ 小継 磯 3-300の税込価格',exact:true}).fill('');
  await page.getByRole('button',{name:'価格を保存して戻る',exact:true}).click();
  await expect(page.getByLabel('今回の購入費用')).toContainText('8,000円');
  await page.getByRole('button',{name:'購入先の確認・リストの保存へ',exact:true}).click();
  await page.getByRole('button',{name:/購入先と当日の持ち物を確認する/}).click();
  await expect(page.getByRole('article').first()).toContainText('1,000円（Amazon・');
  await noOverflow(page);
});

test('an old or failed price remains clearly labeled and cannot complete a total', async ({ page }) => {
  const timestamp = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const snapshot = {schemaVersion:1,updatedAt:timestamp,products:{'rod-3-300':{asin:targets['rod-3-300'],currency:'JPY',price:1234,fetchedAt:timestamp,attemptedAt:timestamp,status:'blocked',error:'access restricted'}}};
  await page.route('**/src/data/amazon-prices.json*', route=>route.fulfill({contentType:'application/javascript',body:`export default ${JSON.stringify(snapshot)};`}));
  await page.goto(`./?build=${encodeBuild(completedBuild())}#review`);
  await expect(page.getByText(/前回1,234円/)).toContainText('今回は合計に含めません');
  await expect(page.getByLabel('今回の購入費用')).toContainText('価格は未確定');
  await noOverflow(page);
});
