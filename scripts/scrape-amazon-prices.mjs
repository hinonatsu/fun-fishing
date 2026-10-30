import { chromium } from '@playwright/test';
import { readFile, mkdir, rename, writeFile, appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import { classifyAmazonPage, collectPrices, readAmazonPage } from './amazon-price-core.mjs';

const root = new URL('../', import.meta.url);
const targetPath = new URL('src/data/amazon-products.json', root);
const pricePath = new URL('src/data/amazon-prices.json', root);
const reportDir = new URL('artifacts/amazon-prices/', root);
const targets = JSON.parse(await readFile(targetPath, 'utf8'));
if (!Object.keys(targets).length || Object.values(targets).some(asin => !/^[A-Z0-9]{10}$/.test(asin))) throw new Error('Invalid Amazon product manifest');
const args = process.argv.slice(2);
if (args.some(arg => !['--dry-run', '--allow-partial'].includes(arg))) throw new Error('Usage: npm run prices:update -- [--dry-run] [--allow-partial]');
let previous;
try { previous = JSON.parse(await readFile(pricePath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

const browser = await chromium.launch({ headless: true });
let snapshot;
try {
  const context = await browser.newContext({ locale: 'ja-JP', timezoneId: 'Asia/Tokyo' });
  // Prices only: avoid downloading images, media and fonts. No login or CAPTCHA bypass.
  await context.route('**/*', route => ['image', 'media', 'font'].includes(route.request().resourceType()) ? route.abort() : route.continue());
  const page = await context.newPage();
  const scrape = async asin => {
    const url = `https://www.amazon.co.jp/dp/${asin}?th=1&psc=1`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35_000 });
        const status = response?.status() ?? 0;
        if (![403, 429, 503].includes(status)) {
          await page.waitForFunction(() => {
            const price = document.querySelector('#corePriceDisplay_desktop_feature_div .a-price:not(.a-text-price), #corePrice_feature_div .a-price:not(.a-text-price), #apex_desktop .priceToPay, #price_inside_buybox, #priceblock_ourprice, #priceblock_dealprice');
            const availability = document.querySelector('#availability')?.textContent ?? '';
            return !!price || !!document.querySelector('#captchacharacters, form[action*="validateCaptcha"]')
              || /現在お取り扱いできません|一時的に在庫切れ|Currently unavailable|Temporarily out of stock/i.test(availability);
          }, null, { timeout: 8000 }).catch(() => {});
        }
        const data = await page.evaluate(readAmazonPage);
        const result = classifyAmazonPage(data, asin, page.url(), status);
        console.log(`${asin}: ${result.status}${result.price === null ? '' : ` JPY ${result.price}`}`);
        if (result.status === 'error') console.log(JSON.stringify({ asin, ...data, url: page.url(), httpStatus: status }));
        return result;
      } catch (error) {
        if (attempt) throw error;
        await wait(5000);
      }
    }
  };
  snapshot = await collectPrices({ targets, previous, scrape, wait });
} finally {
  await browser.close();
}

await mkdir(reportDir, { recursive: true });
const report = {
  updatedAt: snapshot.updatedAt, total: Object.keys(targets).length,
  ok: Object.values(snapshot.products).filter(p => p.status === 'ok').length,
  unavailable: Object.values(snapshot.products).filter(p => p.status === 'unavailable').length,
  failed: Object.values(snapshot.products).filter(p => ['blocked', 'error'].includes(p.status)).length,
  products: snapshot.products,
};
await writeFile(new URL('latest.json', reportDir), JSON.stringify(report, null, 2) + '\n');
if (!args.includes('--dry-run')) {
  const temporary = new URL('src/data/amazon-prices.json.tmp', root);
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n');
  await rename(temporary, pricePath);
}
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `failed=${report.failed}\n`);
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = Object.entries(snapshot.products).map(([id, p]) => `| ${id} | ${p.asin} | ${p.status} | ${p.status === 'ok' ? p.price : '—'} |`).join('\n');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `## Amazon prices\n\n${report.ok}/${report.total} priced, ${report.unavailable} unavailable, ${report.failed} failed.\n\n| Product | ASIN | Status | JPY (excludes shipping) |\n|---|---|---|---|\n${rows}\n`);
}
console.log(`Amazon prices: ${report.ok}/${report.total} priced, ${report.unavailable} unavailable, ${report.failed} failed. Report: ${fileURLToPath(new URL('latest.json', reportDir))}`);
if (report.failed && !args.includes('--allow-partial')) process.exitCode = 1;
