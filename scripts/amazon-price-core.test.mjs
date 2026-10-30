import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { chromium } from '@playwright/test';
import targets from '../src/data/amazon-products.json' with { type: 'json' };
import { classifyAmazonPage, collectPrices, mergePrice, parseYen, readAmazonPage } from './amazon-price-core.mjs';

const asin = 'B06Y5DCTZD';
const url = `https://www.amazon.co.jp/dp/${asin}?th=1&psc=1`;
const now = '2026-10-30T22:17:00.000Z';
let browser;
before(async () => { browser = await chromium.launch({ headless: true }); });
after(async () => { await browser?.close(); });

test('JPY amounts reject ranges, USD, fractional yen, points and ambiguous text', () => {
  for (const value of ['￥1,234', '¥1234', '１，２３４円', '￥1,234.00']) assert.equal(parseYen(value), 1234);
  for (const value of ['1234', '$1,234', '￥1,000〜￥2,000', '￥0', '￥12.50', '￥1,23', '123ポイント', '月々￥500', null]) assert.equal(parseYen(value), null);
});

async function extract(html) {
  const page = await browser.newPage();
  try {
    await page.setContent(`<title>Amazon.co.jp</title><h1 id="productTitle">Fishing rod</h1><input id="ASIN" value="${asin}">${html}`);
    return await page.evaluate(readAmazonPage);
  } finally { await page.close(); }
}

test('uses the selected product purchase price, excluding list prices and recommendations', async () => {
  const data = await extract('<div id="corePriceDisplay_desktop_feature_div"><span class="a-price a-text-price"><span class="a-offscreen">￥9,999</span></span><span class="a-price priceToPay"><span class="a-offscreen">￥1,234</span></span></div><aside><span class="a-price"><span class="a-offscreen">￥100</span></span></aside>');
  assert.deepEqual(classifyAmazonPage(data, asin, url), { status: 'ok', price: 1234, error: null });
});

test('ignores hidden variant prices and supports the legacy buybox', async () => {
  const data = await extract('<div id="corePrice_feature_div" style="display:none"><span class="a-price priceToPay"><span class="a-offscreen">￥99</span></span></div><span id="price_inside_buybox">￥2,345</span>');
  assert.equal(classifyAmazonPage(data, asin, url).price, 2345);
});

test('cannot substitute an unrelated recommendation or list price when buybox is missing', async () => {
  const data = await extract('<div id="corePrice_feature_div"><span class="a-price a-text-price"><span class="a-offscreen">￥9,999</span></span></div><aside><span class="a-price"><span class="a-offscreen">￥100</span></span></aside>');
  assert.equal(classifyAmazonPage(data, asin, url).status, 'error');
});

test('recognizes unavailable offers without treating them as zero', async () => {
  const data = await extract('<div id="availability">現在お取り扱いできません。</div>');
  assert.deepEqual(classifyAmazonPage(data, asin, url), { status: 'unavailable', price: null, error: null });
});

test('detects robot checks, rate limiting and non-product pages', async () => {
  const data = await extract('<form action="/errors/validateCaptcha"><input id="captchacharacters"></form>');
  assert.equal(classifyAmazonPage(data, asin, url).status, 'blocked');
  assert.equal(classifyAmazonPage({ ...data, blocked: false }, asin, url, 429).status, 'blocked');
  assert.equal(classifyAmazonPage({ ...data, blocked: false }, asin, url, 404).status, 'error');
});

test('rejects changed variants and redirects to another ASIN or host', async () => {
  const data = await extract('<span id="price_inside_buybox">￥2,345</span>');
  assert.equal(classifyAmazonPage({ ...data, asin: 'B06Y57LTNK' }, asin, url).status, 'error');
  assert.equal(classifyAmazonPage(data, asin, 'https://www.amazon.co.jp/dp/B06Y57LTNK').status, 'error');
  assert.equal(classifyAmazonPage(data, asin, url.replace('www.amazon.co.jp', 'example.com')).status, 'error');
});

test('failed attempts preserve previous price and its original timestamp; sold-out clears it', () => {
  const previous = { asin, currency: 'JPY', price: 1234, fetchedAt: '2026-10-29T22:17:00.000Z' };
  const result = { status: 'blocked', price: null, error: 'blocked' };
  assert.deepEqual(mergePrice(asin, result, previous, now), { ...previous, ...result, price: 1234, attemptedAt: now });
  assert.equal(mergePrice('B06Y57LTNK', result, previous, now).price, null);
  assert.equal(mergePrice(asin, { status: 'unavailable', price: null, error: null }, previous, now).price, null);
});

test('visits every product, retries failures only after the full pass and prunes removed products', async () => {
  const visited = [];
  const waits = [];
  const snapshot = await collectPrices({
    targets, previous: { products: { removed: { asin } } }, now: () => now,
    wait: async ms => { waits.push(ms); },
    scrape: async value => { visited.push(value); if (value === asin) throw new Error('timeout'); return { status: 'ok', price: 1500, error: null }; },
  });
  assert.deepEqual(visited.slice(0,14), Object.values(targets));
  assert.deepEqual(visited.slice(14), [asin]);
  assert.equal(waits.length, 14);
  assert.equal(waits.at(-1), 60_000);
  assert.ok(waits.every(ms => ms >= 5000));
  assert.equal(snapshot.products['rod-3-300'].status, 'error');
  assert.equal(Object.keys(snapshot.products).length, 14);
  assert.equal(snapshot.updatedAt, now);
});

test('a temporary access restriction can recover on the single deferred attempt', async () => {
  let attempts = 0;
  const delays = [];
  const snapshot = await collectPrices({
    targets: {rod:asin}, now:()=>now, wait:async ms=>{delays.push(ms);},
    scrape:async()=>++attempts === 1 ? {status:'blocked',price:null,error:'temporary access restriction'} : {status:'ok',price:1234,error:null},
  });
  assert.equal(attempts,2);
  assert.deepEqual(delays,[60_000]);
  assert.equal(snapshot.products.rod.status,'ok');
  assert.equal(snapshot.products.rod.price,1234);
});
