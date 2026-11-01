import { describe, expect, it } from 'vitest';
import { analyticsUrl, productGroup, productParameters } from './analytics';
import { products } from './catalog';

describe('analytics data', () => {
  it('keeps campaign attribution but excludes shared plans and arbitrary query data', () => {
    const clean = analyticsUrl('https://example.com/fun-fishing/?build=PRIVATE_PLAN&email=private&analytics_debug=1&utm_source=newsletter&utm_campaign=autumn#unknown', 'builder/rod');
    expect(clean).toBe('https://example.com/fun-fishing/?utm_source=newsletter&utm_campaign=autumn#builder/rod');
    expect(analyticsUrl('https://example.com/?build=private#list')).toBe('https://example.com/');
  });

  it('separates consumables, reusable equipment and lure products', () => {
    for (const category of ['line','rig','bait','hook','sinker','chum'] as const) expect(productGroup(category)).toBe('consumable');
    for (const category of ['rod','reel','bucket','safety'] as const) expect(productGroup(category)).toBe('equipment');
    for (const category of ['lure','egi','burakuri'] as const) expect(productGroup(category)).toBe('lure');
  });

  it('sends stable catalog identifiers and no user-entered plan data', () => {
    const product = products.find(p => p.category === 'rod')!;
    expect(productParameters(product)).toEqual({ product_id: product.id, product_name: product.name, product_category: 'rod', product_group: 'equipment' });
  });
});
