import { describe, expect, it } from 'vitest';
import { amazonLinkLabel, products } from './catalog';
import { safeExternalUrl } from './domain';

describe('Amazon purchase destinations', () => {
  for (const product of products) {
    it(`${product.id}: opens Amazon with a truthful link label`, () => {
      const url = new URL(product.purchaseUrl!);
      expect(url.hostname).toBe('www.amazon.co.jp');
      expect(safeExternalUrl(url.href)).toBe(url.href);
      expect(product.offer.url).toBe(product.purchaseUrl);
      expect(product.offer.retailer).toBe('Amazon.co.jp');
      expect(url.searchParams.has('tag')).toBe(false);
      expect(product.price).toBeNull();
      expect(url.pathname).toMatch(/^\/dp\/[A-Z0-9]{10}$/);
      expect(url.searchParams.get('psc')).toBe('1');
      expect(amazonLinkLabel(product)).toBe('Amazonで価格を確認');
    });
  }
  it('requires individual pages for all fourteen products', () => {
    expect(products).toHaveLength(14);
    expect(products.filter(p => p.offer.linkStatus === 'content-confirmed')).toHaveLength(14);
    expect(products.some(p => p.brand === 'DAISO')).toBe(false);
  });
});
