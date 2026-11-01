import { allCategories, products, type CategoryId, type Product } from './catalog';
import type { FishingBuild } from './domain';
import { coveringProduct, equipmentFor } from './equipment';

export type Arrangement = 'store' | 'rental';
export interface PreparationPlan {
  people?: number;
  hours?: number;
  tripDate?: string;
  quantities?: Partial<Record<CategoryId, number>>;
  arrangements?: Partial<Record<CategoryId, Arrangement>>;
  checkedSupplies?: string[];
  deliveries?: Partial<Record<CategoryId, string>>;
  shippingOrders?: { label: string; amount: number | null }[];
}
const categoryIds = new Set(allCategories.map(c => c.id));
const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
export const validTripDate = (v: unknown): v is string => typeof v === 'string' && /^20\d{2}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
export const supplyIds = ['ice', 'towel', 'trash', 'scissors', 'drink', 'rules', 'bait-amount', 'net-height'] as const;
export function validPreparation(v: unknown): v is PreparationPlan {
  if (!object(v) || Object.keys(v).some(k => !['people','hours','tripDate','quantities','arrangements','checkedSupplies','deliveries','shippingOrders'].includes(k))) return false;
  if (v.people !== undefined && (!Number.isInteger(v.people) || Number(v.people) < 1 || Number(v.people) > 10)) return false;
  if (v.hours !== undefined && (!Number.isInteger(v.hours) || Number(v.hours) < 1 || Number(v.hours) > 12)) return false;
  if (v.tripDate !== undefined && v.tripDate !== '' && !validTripDate(v.tripDate)) return false;
  if (v.quantities !== undefined && (!object(v.quantities) || Object.entries(v.quantities).some(([k,n]) => !categoryIds.has(k as CategoryId) || !Number.isInteger(n) || Number(n) < 1 || Number(n) > 20))) return false;
  if (v.arrangements !== undefined && (!object(v.arrangements) || Object.entries(v.arrangements).some(([k,a]) => !categoryIds.has(k as CategoryId) || !['store','rental'].includes(String(a))))) return false;
  if (v.deliveries !== undefined && (!object(v.deliveries) || Object.entries(v.deliveries).some(([k,d]) => !categoryIds.has(k as CategoryId) || !validTripDate(d)))) return false;
  if (v.checkedSupplies !== undefined && (!Array.isArray(v.checkedSupplies) || v.checkedSupplies.length > supplyIds.length || v.checkedSupplies.some(k => !supplyIds.includes(k as typeof supplyIds[number])))) return false;
  if (v.shippingOrders !== undefined && (!Array.isArray(v.shippingOrders) || v.shippingOrders.length > 20 || v.shippingOrders.some(o => !object(o) || typeof o.label !== 'string' || o.label.length > 80 || (o.amount !== null && (!Number.isSafeInteger(o.amount) || Number(o.amount) < 0 || Number(o.amount) > 10_000_000))))) return false;
  return true;
}
export const peopleFor = (build: FishingBuild) => build.preparation?.people || 1;
export const arrangementFor = (build: FishingBuild, id: CategoryId) => build.preparation?.arrangements?.[id];
export const arrangementLabel = (a: Arrangement) => a === 'store' ? '店舗で相談して用意する' : '施設の貸出を確認して用意する';
/** Quantities are purchase packs. Shared and consumable quantities are explicitly editable. */
export function purchaseQuantity(build: FishingBuild, id: CategoryId): number {
  return build.preparation?.quantities?.[id] ?? (['rod','reel','safety'].includes(id) ? peopleFor(build) : 1);
}
export function purchaseUnit(p: Product): string {
  if (p.id==='basket-riseway-6') return '販売店の同型番は3個入りの表示。購入先でも入り数を確認し、必要なカゴと予備の数を決めます。';
  if (p.category === 'bait' || p.category === 'chum') return p.specs.find(s => /内容量|容量|[g㎏]/.test(s)) || '内容量・1袋で使える量を購入先で確認';
  if (p.category === 'line') return p.technical.spoolLength ? `1巻${p.technical.spoolLength}m。巻く長さはリールの容量に合わせます。` : '1巻の長さを仕様と購入先で確認';
  return p.specs.find(s => /\d+(個|本|セット|パック|枚|組).*入|1セット|1個/.test(s)) || '表示価格は1販売単位。入り数・サイズは商品ページで確認';
}
export function setArrangement(build: FishingBuild, id: CategoryId, arrangement: Arrangement): FishingBuild {
  return {
    ...build, selection: { ...build.selection, [id]: '' }, owned: build.owned.filter(c => c !== id),
    included: build.included.filter(c => c !== id && !(id === 'reel' && c === 'line')), checked: [],
    shipping: { selected: null, reference: null },
    preparation: { ...build.preparation, shippingOrders: undefined, arrangements: { ...build.preparation?.arrangements, [id]: arrangement }, deliveries: { ...build.preparation?.deliveries, [id]: undefined } },
  };
}
export function selectedPurchases(build: FishingBuild) {
  return equipmentFor(build).flatMap(c => {
    if (build.owned.includes(c.id) || build.included.includes(c.id) || coveringProduct(build,c.id) || arrangementFor(build,c.id)) return [];
    const product = products.find(p => p.id === build.selection[c.id]);
    return product ? [{ category: c, product, quantity: purchaseQuantity(build,c.id) }] : [];
  });
}
export function suppliesFor(build: FishingBuild) {
  return [
    { id:'towel', label:'手や道具を拭くタオル', note:'家にある物を準備できます。' },
    { id:'trash', label:'ゴミ袋', note:'糸・針・エサの包装を持ち帰ります。' },
    { id:'scissors', label:'糸を切る道具', note:'選んだ糸を切れる物か確認します。' },
    { id:'drink', label:'飲み物・服装', note:'当日の天気と気温に合わせて準備します。' },
    { id:'rules', label:'施設の営業・釣り場のルール', note:'立入可能な場所、営業時間、持ち帰りの決まりを公式案内で確認します。' },
    ...(build.answers.keep === 'eat' ? [{ id:'ice', label:'魚を冷やす氷・保冷剤', note:'保冷容器と合わせて、釣行前に準備します。' }] : []),
    ...(equipmentFor(build).some(c => c.id === 'bait' || c.id === 'chum') ? [{ id:'bait-amount', label:'エサの必要量・追加調達先', note:`${peopleFor(build)}人・${build.preparation?.hours || '未定'}時間で使う袋数を販売店に確認します。` }] : []),
    ...(build.selection.net || build.owned.includes('net') || arrangementFor(build,'net') ? [{ id:'net-height', label:'網が水面に届く長さ・施設の貸出', note:'足場の高さと持ち運び、貸出の有無を施設へ確認します。' }] : []),
  ];
}
