import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { encodeBuild } from '../src/domain';
import { products, defaultSelection } from '../src/catalog';
import { completedBuild } from './helpers';

async function events(page: Page, name?: string) {
  return page.evaluate(name => (window.dataLayer || []).map(entry => Array.from(entry as ArrayLike<unknown>))
    .filter(entry => entry[0] === 'event' && (!name || entry[1] === name))
    .map(entry => ({ name: entry[1] as string, parameters: entry[2] as Record<string, string | number | boolean> })), name);
}

async function blockAnalytics(context: BrowserContext) {
  // Test the actual gtag queue, without sending synthetic activity to production GA.
  await context.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await context.route('**/g/collect**', route => route.abort());
  await context.route('https://www.amazon.co.jp/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Test destination</title>' }));
}

async function openAmazon(page: Page, link: ReturnType<Page['locator']>) {
  const popup = page.waitForEvent('popup');
  await link.click();
  const destination = await popup;
  await expect(destination).toHaveURL(/^https:\/\/www\.amazon\.co\.jp\/dp\//);
  await destination.close();
}

test('local development does not initialize GA by default', async ({ page, context }) => {
  await blockAnalytics(context);
  await page.goto('./#search');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);
  expect(await events(page)).toEqual([]);
});

test('candidate impressions, clicks, confirmations and SPA visits keep correct product context', async ({ page, context }) => {
  await blockAnalytics(context);
  await page.goto(`./?analytics_debug=1&build=${encodeBuild(completedBuild())}&private=DO_NOT_SEND&utm_source=qa#builder/rod`);
  await expect(page.getByRole('heading', { name: '釣り竿（ロッド）を選ぼう。', exact: true })).toBeVisible();
  const card = page.locator('.gear-card').first();
  const name = await card.getByRole('heading', { level: 2 }).innerText();
  const product = products.find(p => p.name === name)!;
  await card.locator('.gear-card-main').scrollIntoViewIfNeeded();
  await expect.poll(async () => (await events(page, 'product_view')).filter(e => e.parameters.product_id === product.id).length).toBe(1);
  expect((await events(page, 'flow_step_view')).map(e => e.parameters.screen_id)).toEqual(['builder/rod']);
  expect((await events(page, 'page_view')).length).toBe(1);
  await openAmazon(page, card.getByRole('link', { name: /実物写真・サイズを購入先で確認/ }));
  const clicks = await events(page, 'amazon_click');
  expect(clicks).toHaveLength(1);
  expect(clicks[0].parameters).toMatchObject({ product_id: product.id, product_name: product.name, product_category: 'rod', product_group: 'equipment', screen_id: 'builder/rod', fish_id: 'aji', method_id: 'sabiki', link_position: 'candidate', debug_mode: true });
  await card.getByRole('button', { name: `この商品を選ぶ：${name}`, exact: true }).click();
  await expect(page).toHaveURL(/#builder$/);
  expect((await events(page, 'confirmation_click')).filter(e => e.parameters.product_id === product.id)).toHaveLength(1);
  const views = await events(page, 'page_view');
  expect(views.map(e => e.parameters.screen_id)).toEqual(['builder/rod', 'builder']);
  expect(views[1].parameters.page_referrer).toMatch(/#builder\/rod$/);
  const payload = await page.evaluate(() => JSON.stringify(window.dataLayer));
  expect(payload).not.toContain('build=');
  expect(payload).not.toContain('DO_NOT_SEND');
  expect(payload).toContain('utm_source=qa');
  await page.goBack();
  await expect(page).toHaveURL(/#builder\/rod$/);
  await expect.poll(async () => (await events(page, 'flow_step_view')).length).toBe(3);
});

test('shopping and batch price links identify consumables and do not recount input changes', async ({ page, context }) => {
  await blockAnalytics(context);
  const build = completedBuild();
  build.owned = ['rod'];
  await page.goto(`./?analytics_debug=1&build=${encodeBuild(build)}#list`);
  const product = products.find(p => p.id === defaultSelection.bait)!;
  const item = page.locator('.shopping-item').filter({ has: page.getByRole('heading', { name: product.name, exact: true }) });
  await item.locator('.shopping-info').scrollIntoViewIfNeeded();
  await expect.poll(async () => (await events(page, 'product_view')).filter(e => e.parameters.product_id === product.id).length).toBe(1);
  await item.getByRole('spinbutton').fill('2');
  expect((await events(page, 'flow_step_view')).length).toBe(1);
  expect((await events(page, 'product_view')).filter(e => e.parameters.product_id === product.id)).toHaveLength(1);
  await openAmazon(page, item.locator('.buy-link'));
  expect((await events(page, 'amazon_click'))[0].parameters).toMatchObject({ product_id: product.id, product_group: 'consumable', screen_id: 'list', link_position: 'shopping' });
  await item.locator('.product-details > summary').click();
  await openAmazon(page, item.getByRole('link', { name: /購入先で実物写真・サイズを確認/ }));
  expect((await events(page, 'amazon_click'))[1].parameters.link_position).toBe('shopping_details');
  await page.getByRole('button', { name: '道具や価格を見直す', exact: true }).click();
  await page.getByRole('button', { name: 'リール：価格をまとめて確認', exact: true }).click();
  await expect(page).toHaveURL(/#prices$/);
  await openAmazon(page, page.locator('.price-batch-row').first().getByRole('link'));
  expect((await events(page, 'amazon_click'))[2].parameters).toMatchObject({ screen_id: 'prices', link_position: 'price_selected' });
  // Even a failing analytics integration must not interrupt the purchase link.
  await page.evaluate(() => { window.gtag = () => { throw new Error('Blocked analytics'); }; });
  await openAmazon(page, page.locator('.price-batch-row').first().getByRole('link'));
});
