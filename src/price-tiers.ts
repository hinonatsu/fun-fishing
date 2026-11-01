import type { Product } from './catalog';
import type { FishingBuild } from './domain';
import { productPrice } from './pricing';
import references from './data/product-price-references.json' with { type: 'json' };

export const priceTiers = [
  { id: 'low', label: '低単価' },
  { id: 'standard', label: '普通' },
  { id: 'high', label: '高単価' },
] as const;
export type PriceTier = typeof priceTiers[number]['id'];
export interface PriceReference { asin: string; price: number; checkedAt: string }

/** A historical quote classifies a candidate; it never becomes a current purchase price. */
export function tierReferencePrice(build: FishingBuild, product: Product): number | null {
  const reference = (references as Record<string, PriceReference>)[product.id];
  const asin = new URL(product.offer.url).pathname.split('/')[2];
  if (reference?.asin === asin && Number.isSafeInteger(reference.price) && reference.price > 0 && Number.isFinite(Date.parse(reference.checkedAt))) return reference.price;
  return productPrice(build, product);
}

/** Compare only eligible candidates for this slot. Equal prices always share a band. */
export function groupPriceTiers(build: FishingBuild, candidates: Product[]) {
  const prices = new Map(candidates.map(product => [product.id, tierReferencePrice(build, product)]));
  const amounts = [...new Set([...prices.values()].filter((price): price is number => price !== null))].sort((a, b) => a - b);
  const tierById = new Map<string, PriceTier>();
  for (const product of candidates) {
    const amount = prices.get(product.id);
    if (amount === null || amount === undefined) continue;
    const rank = amounts.indexOf(amount);
    const tier: PriceTier = amounts.length === 1 ? 'standard' : amounts.length === 2 ? rank === 0 ? 'low' : 'high' : priceTiers[Math.min(2, Math.floor(rank * 3 / amounts.length))].id;
    tierById.set(product.id, tier);
  }
  return {
    tierById,
    groups: Object.fromEntries(priceTiers.map(tier => [tier.id, candidates.filter(product => tierById.get(product.id) === tier.id)])) as Record<PriceTier, Product[]>,
    unknown: candidates.filter(product => !tierById.has(product.id)),
  };
}
