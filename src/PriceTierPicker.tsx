import { useState, type ReactNode } from 'react';
import type { Product } from './catalog';
import type { FishingBuild } from './domain';
import { groupPriceTiers, priceTiers, type PriceTier } from './price-tiers';
import './price-tiers.css';

export function PriceTierPicker({ build, candidates, children }: { build: FishingBuild; candidates: Product[]; children: (products: Product[]) => ReactNode }) {
  const [selected, setSelected] = useState<PriceTier | 'all'>('all');
  const { groups, unknown } = groupPriceTiers(build, candidates);
  const visible = selected === 'all' ? candidates : groups[selected];
  return <section className="price-tier-picker" aria-label="商品の価格帯比較">
    <fieldset className="price-tier-filter"><legend>価格帯から選ぶ</legend>
      <div className="price-tier-options">
        <button type="button" aria-pressed={selected === 'all'} onClick={() => setSelected('all')}>すべて<span>{candidates.length}件</span></button>
        {priceTiers.map(tier => <button type="button" key={tier.id} aria-pressed={selected === tier.id} disabled={!groups[tier.id].length} onClick={() => setSelected(tier.id)}>{tier.label}<span>{groups[tier.id].length}件</span></button>)}
      </div>
      <p>この道具で選べる商品の確認時の販売価格を、低い順に3つの価格帯に分けています。価格帯は確認時の目安です。現在価格・入り数・送料は各商品と購入先で確認してください。</p>
    </fieldset>
    <p className="price-tier-result" role="status" aria-live="polite">{selected === 'all' ? 'すべての価格帯' : priceTiers.find(tier => tier.id === selected)!.label}：{visible.length}件{selected === 'all' && unknown.length ? `（価格帯未確認 ${unknown.length}件を含む）` : ''}</p>
    {children(visible)}
  </section>;
}
