import { describe, expect, it } from 'vitest';
import { fishSpecies, products } from './catalog';
import { createDefaultBuild, type FishingBuild } from './domain';
import { equipmentFor } from './equipment';
import { candidatesFor, chooseProduct, hasChoice, recommendedProduct } from './planner';
import { groupPriceTiers, priceTiers } from './price-tiers';
import additions from './data/tier-products.json' with { type: 'json' };
import references from './data/product-price-references.json' with { type: 'json' };
import manifest from './data/amazon-products.json' with { type: 'json' };
import { productPrice } from './pricing';
import { tierReferencePrice } from './price-tiers';

describe('three price bands', () => {
  it('uses eligible candidates and keeps identical amounts in the same band', () => {
    const candidates = products.slice(0, 5).map((p, i) => ({ ...p, id: `fixture-${i}` }));
    const build = createDefaultBuild();
    candidates.forEach((p, i) => { build.prices[p.id] = [100, 100, 300, 500, 500][i]; });
    const result = groupPriceTiers(build, candidates);
    expect(result.groups.low.map(p => p.id)).toEqual(candidates.slice(0, 2).map(p => p.id));
    expect(result.groups.standard.map(p => p.id)).toEqual([candidates[2].id]);
    expect(result.groups.high.map(p => p.id)).toEqual(candidates.slice(3).map(p => p.id));
  });
  it('does not invent an additional price for one or two observed amounts', () => {
    const build = createDefaultBuild();
    const candidates = products.slice(0, 2).map((p, i) => ({ ...p, id: `fixture-${i}` }));
    candidates.forEach(p => { build.prices[p.id] = 100; });
    expect(groupPriceTiers(build, candidates).groups.standard).toHaveLength(2);
    build.prices[candidates[1].id] = 200;
    expect(groupPriceTiers(build, candidates).groups.standard).toHaveLength(0);
  });
  it('registers distinct, researched ASINs in the daily price manifest', () => {
    const ids = products.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of additions) {
      expect((manifest as Record<string, string>)[p.id]).toBe(p.asin);
      expect((references as Record<string, { asin: string }>)[p.id]?.asin).toBe(p.asin);
    }
  });
  it('uses a historical quote only for classification and rejects a quote for a replaced ASIN', () => {
    const build = createDefaultBuild();
    const source = products.find(p => (references as Record<string, unknown>)[p.id])!;
    const stale = { ...source, amazonPrice: null, price: null };
    expect(productPrice(build, stale)).toBeNull();
    expect(tierReferencePrice(build, stale)).toBeGreaterThan(0);
    const replaced = { ...stale, offer: { ...stale.offer, url: 'https://www.amazon.co.jp/dp/B000000000' } };
    expect(tierReferencePrice(build, replaced)).toBeNull();
    expect(groupPriceTiers(build, [replaced]).unknown).toEqual([replaced]);
  });
  it('offers all three price bands for every tool in every supported fish/method combination', () => {
    const missing: string[] = [];
    for (const fish of fishSpecies) for (const methodId of fish.methodIds) {
      let build: FishingBuild = { ...createDefaultBuild(), fishId: fish.id, methodId, answers: { keep: 'eat' } };
      for (const category of equipmentFor(build)) {
        if (hasChoice(build, category.id)) continue;
        const preferred = recommendedProduct(build, category.id);
        if (preferred) build = chooseProduct(build, category.id, preferred.id);
      }
      for (const category of equipmentFor(build)) {
        const groups = groupPriceTiers(build, candidatesFor(build, category.id)).groups;
        const absent = priceTiers.filter(tier => !groups[tier.id].length).map(tier => tier.id);
        if (absent.length) missing.push(`${fish.id}/${methodId}/${category.id}: ${absent.join(',')}`);
      }
    }
    expect(missing, missing.join('\n')).toEqual([]);
  }, 120_000);
});
