/** Executed inside the browser, with no dependencies or outer-scope variables. */
export function readAmazonPage() {
  const text = selector => document.querySelector(selector)?.textContent?.trim() ?? '';
  const title = text('#productTitle');
  const blocked = !!document.querySelector('#captchacharacters, form[action*="validateCaptcha"]')
    || /robot check|ロボットチェック|Amazon CAPTCHA/i.test(document.title)
    || /認証のために、文字を入力|あなたがロボットではないことを確認|Enter the characters you see below/i.test(document.body.innerText);
  const asin = document.querySelector('input#ASIN, #desktop_buybox input[name="ASIN"], #buybox input[name="ASIN"]')?.value
    || document.querySelector('link[rel="canonical"]')?.href?.match(/\/dp\/([A-Z0-9]{10})/)?.[1]
    || null;
  const visible = node => !!(node?.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
  const selectors = [
    '#corePriceDisplay_desktop_feature_div .priceToPay .a-offscreen',
    '#corePrice_feature_div .priceToPay .a-offscreen',
    '#apex_desktop .priceToPay .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-price:not(.a-text-price):not(.a-price-unit) .a-offscreen',
    '#corePrice_feature_div .a-price:not(.a-text-price):not(.a-price-unit) .a-offscreen',
    '#price_inside_buybox', '#priceblock_ourprice', '#priceblock_dealprice',
  ];
  let priceText = null;
  for (const selector of selectors) {
    for (const node of document.querySelectorAll(selector)) {
      // a-offscreen itself is clipped for accessibility; inspect its price container.
      if (visible(node.closest('.a-price') ?? node)) {
        priceText = node.textContent.trim();
        break;
      }
    }
    if (priceText) break;
  }
  const availability = text('#availability');
  const unavailable = /現在お取り扱いできません|一時的に在庫切れ|この商品は現在お取り扱いできません|Currently unavailable|Temporarily out of stock/i.test(availability);
  return { title, asin, blocked, priceText, unavailable };
}

export function parseYen(text) {
  if (typeof text !== 'string') return null;
  const value = text.normalize('NFKC').replace(/\s/g, '');
  // Require a yen marker. Never extract points, installments, list price or a range.
  const match = value.match(/^(?:[¥￥]((?:\d{1,3}(?:,\d{3})+|\d+))(?:\.00)?|((?:\d{1,3}(?:,\d{3})+|\d+))(?:\.00)?円)$/);
  if (!match) return null;
  const amount = Number((match[1] ?? match[2]).replaceAll(',', ''));
  return Number.isSafeInteger(amount) && amount > 0 && amount <= 10_000_000 ? amount : null;
}

export function classifyAmazonPage(data, expectedAsin, url, httpStatus = 200) {
  if ([403, 429, 503].includes(httpStatus) || data.blocked) return { status: 'blocked', price: null, error: `Amazon access restricted (HTTP ${httpStatus}); no bypass attempted` };
  if (httpStatus < 200 || httpStatus >= 300) return { status: 'error', price: null, error: `Amazon HTTP ${httpStatus}` };
  const location = new URL(url);
  const pathAsin = location.pathname.match(/\/dp\/([A-Z0-9]{10})(?:\/|$)/)?.[1];
  if (location.hostname !== 'www.amazon.co.jp' || pathAsin !== expectedAsin || data.asin !== expectedAsin || !data.title) {
    return { status: 'error', price: null, error: 'Product identity/selected ASIN did not match the catalog' };
  }
  if (data.unavailable) return { status: 'unavailable', price: null, error: null };
  const price = parseYen(data.priceText);
  return price === null
    ? { status: 'error', price: null, error: 'No unambiguous JPY purchase price found in the main product price area' }
    : { status: 'ok', price, error: null };
}

export function mergePrice(asin, result, previous, attemptedAt) {
  const preserve = ['blocked', 'error'].includes(result.status) && previous?.asin === asin && previous.currency === 'JPY'
    && Number.isSafeInteger(previous.price) && previous.price > 0 && previous.price <= 10_000_000
    && typeof previous.fetchedAt === 'string' && Number.isFinite(Date.parse(previous.fetchedAt));
  return {
    asin, currency: 'JPY', status: result.status,
    price: result.status === 'ok' ? result.price : preserve ? previous.price : null,
    fetchedAt: result.status === 'ok' ? attemptedAt : preserve ? previous.fetchedAt : null,
    attemptedAt, error: result.error,
  };
}

export async function collectPrices({ targets, previous, scrape, wait, now = () => new Date().toISOString(), intervalMs = 5000 }) {
  const products = {};
  let index = 0;
  for (const [id, asin] of Object.entries(targets)) {
    if (index++) await wait(intervalMs);
    let result;
    try { result = await scrape(asin); }
    catch { result = { status: 'error', price: null, error: 'Navigation or page extraction failed after retry' }; }
    products[id] = mergePrice(asin, result, previous?.products?.[id], now());
  }
  return { schemaVersion: 1, updatedAt: now(), products };
}
