import { describe, expect, it } from 'vitest';
import { amazonPriceRecord, currentAmazonPrice, MAX_PRICE_AGE_MS, type AmazonPriceRecord } from './amazon-prices';
import { products } from './catalog';
import { createDefaultBuild } from './domain';
import { productPrice, productPriceLabel } from './pricing';

const now = Date.parse('2026-10-30T22:17:00.000Z');
const record: AmazonPriceRecord = { asin:'B06Y5DCTZD',currency:'JPY',price:1234,fetchedAt:new Date(now).toISOString(),attemptedAt:new Date(now).toISOString(),status:'ok',error:null };
const product = { ...products[0], amazonPrice: record };
const build = createDefaultBuild({ month:10,area:'tokyo-bay',field:'pier' });

describe('daily Amazon price snapshots', () => {
  it('uses a fresh price and allows a manual override, including zero', () => {
    expect(productPrice(build,product,now)).toBe(1234);
    expect(productPrice({...build,prices:{[product.id]:500}},product,now)).toBe(500);
    expect(productPrice({...build,prices:{[product.id]:0}},product,now)).toBe(0);
    expect(build.prices).toEqual({});
  });
  it('excludes old, future, failed and unavailable prices from calculations', () => {
    expect(currentAmazonPrice(record,now + MAX_PRICE_AGE_MS)).toBe(1234);
    expect(currentAmazonPrice(record,now + MAX_PRICE_AGE_MS + 1)).toBeNull();
    expect(currentAmazonPrice(record,now - 1)).toBeNull();
    for (const status of ['error','blocked','unavailable'] as const) expect(currentAmazonPrice({...record,status},now)).toBeNull();
  });
  it('labels the source, Japan time and stale history truthfully', () => {
    expect(productPriceLabel(build,product,now)).toContain('Amazon・10/31 07:17取得・送料別');
    expect(productPriceLabel({...build,prices:{[product.id]:500}},product,now)).toBe('500円（手入力）');
    expect(productPriceLabel(build,{...product,amazonPrice:{...record,status:'blocked'}},now)).toContain('最新価格の取得に失敗');
    expect(productPriceLabel(build,product,now + MAX_PRICE_AGE_MS + 1)).toContain('今回は合計に含めません');
  });
  it('rejects a corrupt snapshot, wrong ASIN, currency, timestamp and missing price', () => {
    const wrap = (row: unknown) => ({schemaVersion:1,products:{[product.id]:row}});
    expect(amazonPriceRecord(product.id,record.asin,wrap(record))).toEqual(record);
    for (const change of [{asin:'B06Y57LTNK'},{currency:'USD'},{price:-1},{price:NaN},{price:null},{fetchedAt:null},{attemptedAt:'bad'}]) {
      expect(amazonPriceRecord(product.id,record.asin,wrap({...record,...change}))).toBeNull();
    }
    expect(amazonPriceRecord(product.id,record.asin,{schemaVersion:2,products:{}})).toBeNull();
  });
});
