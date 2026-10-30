import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, ClipboardCheck, Copy, Info, PackageCheck, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { amazonLinkLabel, categories, defaultSelection, fishSpecies, products, type CategoryId, type Product } from './catalog';
import type { FishingBuild } from './domain';
import { candidateStatus, candidatesFor, chosenCount, chooseIncludedLine, chooseOwned, chooseProduct, compatibilityForBuild, hasChoice, priceComparison, recommendedProduct, yen } from './planner';
import { GearIllustration } from './Illustrations';
import { ConditionChips } from './DiscoverPage';
import { FlowShell } from './FlowPages';
import { CompatibilityBadge, ExternalLinkButton, Notice } from './ui';

type PageProps = { build: FishingBuild; onBack: () => void };
const getProduct = (id: string) => products.find(p => p.id === id);

function ProductSpecs({ product }: { product: Product }) {
  return <details className="product-details"><summary>仕様と出典を確認<ChevronDown size={14} /></summary><ul>{product.specs.map(s => <li key={s}>{s}</li>)}</ul><p className="small">公開情報の確認日：{product.record.checkedAt}</p><p className="verification-note">{product.record.note}</p><ExternalLinkButton href={product.sourceUrl}>仕様の出典を開く</ExternalLinkButton></details>;
}

function PriceSummary({ build }: { build: FishingBuild }) {
  const comparison = priceComparison(build);
  const hasShipping = comparison.paymentDifference !== null;
  const difference = hasShipping ? comparison.paymentDifference : comparison.productDifference;
  const baseline = hasShipping ? comparison.referencePayment : comparison.referenceTotal;
  const budget = Number(build.answers.budget);
  return <section className="price-comparison" aria-label="価格の比較"><p className="eyebrow">YOUR COST COMPARISON</p><h2>選んだ道具の価格</h2>
    <dl><div><dt>今回の構成・商品代</dt><dd>{comparison.selectedTotal === null ? comparison.rows.length ? '価格未入力' : '購入対象なし' : yen(comparison.selectedTotal)}</dd></div><div><dt>メーカー品中心の比較構成</dt><dd>{comparison.referenceTotal === null ? '比較価格未入力' : yen(comparison.referenceTotal)}</dd></div></dl>
    {difference !== null ? <div className={`saving-result ${difference < 0 ? 'over-budget' : ''}`}><span>{hasShipping ? '送料込みの差額' : '商品代の差額（送料別）'}</span><strong>{difference > 0 ? `${yen(difference)}抑えられます` : difference === 0 ? '差額はありません' : `${yen(Math.abs(difference))}高い構成です`}</strong>{difference > 0 && baseline !== null && baseline > 0 && <span>比較構成から約{Math.round(difference / baseline * 1000) / 10}%削減</span>}</div> : <p className="comparison-pending">同じ選択済みの道具について、両方の価格がそろうと差額を表示します。</p>}
    {comparison.rows.length > 0 && <p className="small muted">価格入力済み：{comparison.knownCount} / {comparison.rows.length}点</p>}
    {comparison.selectedPayment !== null && <p className="payment-total">今回の送料込み支払額 <strong>{yen(comparison.selectedPayment)}</strong></p>}
    {Number.isFinite(budget) && budget > 0 && <p className={comparison.selectedTotal !== null && comparison.selectedTotal > budget ? 'text-danger small' : 'small muted'}>予算目安：{yen(budget)}{comparison.selectedTotal !== null && comparison.selectedTotal > budget ? ' · 商品代が予算を超えています' : ''}</p>}
    <p className="small muted">手入力の比較です。購入単位の税込価格を使います。{build.shipping.selected === null || build.shipping.reference === null ? '送料は未確定です。' : '送料は入力した条件で比較します。'}未選択・所持品・付属品は集計しません。</p>
  </section>;
}

export function BuilderPage({ build, category, onSelect, onBack }: PageProps & { category: CategoryId; onSelect: (build: FishingBuild) => void }) {
  const c = categories.find(c => c.id === category)!;
  const index = categories.indexOf(c);
  const recommended = recommendedProduct(build, category);
  const candidates = candidatesFor(build, category).sort((a,b) => Number(b.id === recommended?.id) - Number(a.id === recommended?.id));
  const allCandidates = products.filter(p => p.category === category);
  const reel = getProduct(build.selection.reel);
  const current = getProduct(build.selection[category]);
  return <FlowShell wide eyebrow={`CHOOSE YOUR GEAR · ${index + 1} / ${categories.length}`} title={`${c.label}を選ぼう。`} description={`${c.description} おすすめの理由を参考に、あなた自身でひとつ選びます。`} onBack={onBack}>
    <div className="gear-layout"><div>
      {current && !candidates.some(p => p.id === current.id) && <Notice tone="warning">選択中の「{current.name}」は、現在の組み合わせでは非推奨です。別の候補を選んでください。</Notice>}
      {category === 'line' && reel?.technical.includedLine && !build.owned.includes('reel') && <div className="included-choice"><PackageCheck size={25} /><div><h2>リールに糸が付属しています。</h2><p>{reel.technical.includedLine}。別売りの糸を買わずに使う選択もできます。</p><button className="button primary" onClick={() => onSelect(chooseIncludedLine(build))}>リール付属の糸を使う<ArrowRight size={16} /></button></div></div>}
      <div className="gear-candidates">{candidates.map(p => {
        const active = current?.id === p.id && !build.owned.includes(category);
        const status = candidateStatus(build,p);
        const isRecommended = recommended?.id === p.id;
        const quote = build.prices[p.id];
        return <article className={`gear-card ${isRecommended ? 'is-recommended' : ''}`} key={p.id}>
          <div className="gear-card-heading">{isRecommended ? <span className="recommended-tag"><Sparkles size={13} />あなたにおすすめ</span> : <span className="neutral-tag">比較候補</span>}{active && <span className="selected-indicator"><Check size={13} />前回の選択</span>}</div>
          <div className="gear-card-main"><div className="gear-image"><GearIllustration category={category} /></div><div className="gear-description"><p className="product-brand">{p.brand}</p><h2>{p.name}</h2><p>{p.summary}</p><span className="gear-price">{quote === undefined ? '価格は購入先で確認' : `${yen(quote)}（手入力）`}</span></div></div>
          <p className="gear-reason"><Sparkles size={16} />{category === 'reel' && isRecommended && p.technical.includedLine ? '準備を手軽にしたいという回答から、糸付きの候補をおすすめします。' : category === 'rod' && build.answers.transport === 'train' && isRecommended ? '電車移動の回答に合わせて、仕舞寸法47cmの持ち運びやすい候補です。' : p.reason}</p>
          {p.generic && <div className="generic-conditions"><strong>汎用品・地上で給水する用途に限定</strong><p>施設の水道などから水を入れて使います。海へ下ろして水をくむ用途には使えません。専用品との強度・耐久性の同等性は未確認です。</p></div>}
          <div className="candidate-rule"><CompatibilityBadge status={status} /><span>{status === 'check' ? '未確認の仕様・使用条件があります' : '確認できた仕様の範囲で候補にしています'}</span></div>
          <ProductSpecs product={p} />
          <button className="button primary full-width" aria-label={`${p.generic ? '地上で給水して使うことを確認して選ぶ' : 'この商品を選ぶ'}：${p.name}`} onClick={() => {
            const next = chooseProduct(build,category,p.id);
            onSelect(p.generic ? {...next,answers:{...next.answers,water:'tap'}} : next);
          }}>{p.generic ? '地上で給水して使うことを確認して選ぶ' : 'この商品を選ぶ'}<ArrowRight size={16} /></button>
        </article>;
      })}</div>
      {allCandidates.length > candidates.length && <p className="quiet-note">選択済みの道具と、公称仕様が明確に合わない候補は表示していません。</p>}
      <details className="owned-choice"><summary>持っている道具を使いたい</summary><p>購入対象から外します。手持ちの型番・仕様は未登録なので、関連する組み合わせは要確認として残します。</p><button className="button secondary" onClick={() => onSelect(chooseOwned(build,category))}>{c.label}は手持ちの道具を使う<ArrowRight size={16} /></button></details>
      <p className="quiet-note">イラストは道具のイメージです。商品を選ぶと、次の画面に進みます。</p>
    </div><aside className="gear-progress" aria-label="現在の道具選び"><p className="eyebrow">YOUR FISHING SETUP</p><h2>{chosenCount(build)}<small> / {categories.length}点を選択</small></h2><div className="progress-track"><span style={{width:`${chosenCount(build)/categories.length*100}%`}} /></div><ol className="gear-steps">{categories.map((slot,i) => <li key={slot.id} aria-current={category === slot.id ? 'step' : undefined}><span>{hasChoice(build,slot.id) ? <Check size={12} /> : i+1}</span>{slot.label}<small>{hasChoice(build,slot.id) ? '選択済み' : category === slot.id ? 'いま選ぶ' : 'これから'}</small></li>)}</ol><PriceSummary build={build} /><p className="quiet-note"><ShieldCheck size={14} />選択済みの点数は、適合確認済みの数とは異なります。</p></aside></div>
    <div className="gear-mobile-progress"><span>道具 <strong>{chosenCount(build)} / {categories.length}点</strong><small>いま選ぶ：{c.label}</small></span><span>{priceComparison(build).selectedTotal === null ? '価格未入力' : `商品代 ${yen(priceComparison(build).selectedTotal!)}`}</span></div>
  </FlowShell>;
}

function CompatibilityDetails({ build }: { build: FishingBuild }) {
  const results = compatibilityForBuild(build).filter(r => !r.id.startsWith('missing-'));
  return <details className="review-compatibility"><summary><ShieldCheck size={17} />組み合わせの確認事項（{results.filter(r=>r.status !== 'recommended').length}件）<ChevronDown size={15} /></summary>{results.map(r => <div key={r.id}><CompatibilityBadge status={r.status} /><strong>{r.title}</strong><p>{r.reason}</p></div>)}</details>;
}

export function ReviewPage({ build, onNavigate, onBack }: PageProps & { onNavigate: (screen: string) => void }) {
  const fish = fishSpecies.find(f=>f.id === build.fishId);
  return <FlowShell wide eyebrow="YOUR OWN FISHING SETUP" title="自分で選んだ、あなたの一式。" description="8つの選択がそろいました。内容を確認して、購入や保存へ進みましょう。" onBack={onBack}>
    <div className="review-plan"><ClipboardCheck size={27} /><div><h2>{fish?.name}のサビキ釣り</h2><ConditionChips build={build} /></div><span className="review-complete"><Check size={15} />8 / 8点</span></div>
    <div className="review-layout"><div><div className="review-items">{categories.map(c => {
      const owned = build.owned.includes(c.id), included = build.included.includes(c.id);
      const p = getProduct(build.selection[c.id]);
      return <article className="review-item" key={c.id}><div className="review-item-icon"><GearIllustration category={c.id} /></div><div><span className="small muted">{c.label}</span><h2>{owned ? '手持ちの道具を使う' : included ? 'リール付属のナイロン3号150m' : p?.name}</h2><p>{owned ? '購入対象外・仕様は要確認' : included ? '追加購入なし' : p && build.prices[p.id] !== undefined ? `${yen(build.prices[p.id])}（手入力）` : '価格未入力'}</p><button className="text-button" onClick={() => onNavigate(`builder/${c.id}`)}>{c.label}を選び直す</button></div>{!owned && !included && <button className="price-edit" aria-label={`${c.label}の価格を入力`} onClick={() => onNavigate(`prices/${c.id}`)}>価格を入力<ArrowRight size={14} /></button>}</article>;
    })}</div><CompatibilityDetails build={build} />{build.answers.keep === 'eat' && <Notice>魚を持ち帰る予定です。保冷用品・氷と、釣り場の持ち帰りルールも確認してください。</Notice>}</div>
    <aside className="review-sidebar"><PriceSummary build={build} /><details className="reference-details"><summary>比較の基準を見る</summary><p>メーカー品中心の基本候補と、同じ選択済みカテゴリを比較します。所持品・付属品は両方から除外。汎用バケツは地上で給水する用途でのみ比較します。性能全体が同等という意味ではありません。</p><ul>{categories.map(c => <li key={c.id}>{c.label}：{getProduct(defaultSelection[c.id])?.name}</li>)}</ul><p>価格は購入単位の税込金額を手入力します。商品仕様の出典は商品選択画面で確認できます。</p></details><button className="text-button" onClick={() => onNavigate('shipping')}>送料を入力して総額を比較<ArrowRight size={15} /></button><button className="button primary full-width" onClick={() => onNavigate('checkout')}>この構成で購入・保存へ<ArrowRight size={17} /></button><p className="quiet-note">価格未入力でも、リストを保存できます。</p></aside></div>
  </FlowShell>;
}

export function PricePage({ build, category, onSave, onBack }: PageProps & { category: CategoryId; onSave: (build: FishingBuild) => void }) {
  const selected = getProduct(build.selection[category]);
  const reference = getProduct(defaultSelection[category])!;
  const [selectedPrice,setSelectedPrice] = useState(selected ? String(build.prices[selected.id] ?? '') : '');
  const [referencePrice,setReferencePrice] = useState(String(build.prices[reference.id] ?? ''));
  const c = categories.find(c=>c.id === category)!;
  return <FlowShell eyebrow="COMPARE PURCHASE PRICES" title={`${c.label}の価格を確認しよう。`} description="購入先で確認した、1個・1袋など実際に購入する単位の税込金額を入力してください。送料は別に入力します。" onBack={onBack}>
    <form className="price-form" onSubmit={e=>{
      e.preventDefault();
      const prices = {...build.prices};
      for (const [id,value] of [[selected?.id,selectedPrice],[reference.id,selected?.id === reference.id ? selectedPrice : referencePrice]]) if (id) { if (value === '') delete prices[id]; else prices[id] = Number(value); }
      onSave({...build,prices});
    }}>
      {selected ? <div className="price-input-card"><span className="eyebrow">あなたが選んだ商品</span><h2>{selected.name}</h2><ExternalLinkButton href={selected.purchaseUrl}>{amazonLinkLabel(selected)}</ExternalLinkButton><label htmlFor="selected-price">購入単位の税込価格（円）</label><input id="selected-price" type="number" min="0" max="10000000" step="1" inputMode="numeric" value={selectedPrice} onChange={e=>setSelectedPrice(e.target.value)} placeholder="未入力" /></div> : <Notice>このカテゴリは購入対象外です。価格の入力は不要です。</Notice>}
      {selected && selected.id !== reference.id && <div className="price-input-card"><span className="eyebrow">メーカー品中心の比較商品</span><h2>{reference.name}</h2><ExternalLinkButton href={reference.purchaseUrl}>{amazonLinkLabel(reference)}</ExternalLinkButton><label htmlFor="reference-price">比較商品の税込価格（円）</label><input id="reference-price" type="number" min="0" max="10000000" step="1" inputMode="numeric" value={referencePrice} onChange={e=>setReferencePrice(e.target.value)} placeholder="未入力" /></div>}
      {selected?.id === reference.id && <p className="quiet-note">比較構成も同じ商品なので、入力した価格を両方に使います。</p>}
      <button className="button primary full-width" type="submit">価格を保存して構成に戻る<ArrowRight size={17} /></button><p className="quiet-note">未入力は0円として扱いません。価格・在庫は購入時に再確認してください。</p>
    </form>
  </FlowShell>;
}

export function ShippingPage({ build, onSave, onBack }: PageProps & { onSave: (build: FishingBuild) => void }) {
  const [selected,setSelected] = useState(String(build.shipping.selected ?? ''));
  const [reference,setReference] = useState(String(build.shipping.reference ?? ''));
  return <FlowShell eyebrow="COMPARE TOTAL PAYMENTS" title="送料を含めると、いくら？" description="購入先で確認した各構成の送料合計を入力します。無料なら0円、わからない場合は空欄にしてください。" onBack={onBack}><form className="price-form" onSubmit={e=>{e.preventDefault();onSave({...build,shipping:{selected:selected === '' ? null : Number(selected),reference:reference === '' ? null : Number(reference)}});}}><div className="price-input-card"><label htmlFor="selected-shipping">今回の構成の送料合計（円）</label><input id="selected-shipping" type="number" min="0" max="10000000" step="1" inputMode="numeric" value={selected} onChange={e=>setSelected(e.target.value)} /></div><div className="price-input-card"><label htmlFor="reference-shipping">比較構成の送料合計（円）</label><input id="reference-shipping" type="number" min="0" max="10000000" step="1" inputMode="numeric" value={reference} onChange={e=>setReference(e.target.value)} /></div><button className="button primary full-width" type="submit">送料を保存して比較する<ArrowRight size={17} /></button></form></FlowShell>;
}

export function CheckoutPage({ onNavigate, onBack }: { onNavigate: (screen: string) => void; onBack: () => void }) {
  return <FlowShell eyebrow="READY FOR YOUR NEXT STEP" title="このリストを、どう使おう？" description="いま購入することも、保存して釣具店で使うこともできます。" onBack={onBack}><div className="decision-options"><button className="decision-option" onClick={()=>onNavigate('list')}><span className="decision-symbol"><ShoppingBag size={26} /></span><span className="decision-copy"><strong>購入先を確認する</strong><span>Amazonの個別商品ページへ。</span></span><ArrowRight size={18} /></button><button className="decision-option" onClick={()=>onNavigate('save')}><span className="decision-symbol"><ClipboardCheck size={26} /></span><span className="decision-copy"><strong>買い物リストを保存する</strong><span>専用URLをコピーして、店舗でも使う。</span></span><ArrowRight size={18} /></button></div></FlowShell>;
}

export function SavePage({ shareUrl, onBack }: { shareUrl: string; onBack: () => void }) {
  const [status,setStatus] = useState('');
  return <FlowShell eyebrow="KEEP YOUR FISHING LIST" title="お店でも、このリストを。" description="選んだ道具と準備チェックを、専用URLに保存できます。URLを知っている人は同じリストを開けます。" onBack={onBack}><div className="save-card"><span className="save-symbol"><ClipboardCheck size={38} /></span><label className="input-label" htmlFor="share-url">構成URL</label><input id="share-url" className="share-input" readOnly value={shareUrl} onFocus={e=>e.target.select()} /><button className="button primary full-width" onClick={async()=>{try {await navigator.clipboard.writeText(shareUrl);setStatus('コピーしました');} catch {setStatus('URLを選択してコピーしてください。');}}}><Copy size={17} />{status === 'コピーしました' ? 'コピーしました' : '構成URLをコピーして保存'}</button><p className="share-status" role="status">{status}</p><p className="small muted">このブラウザにも自動保存します。共有後の変更は、それぞれのブラウザで独立します。</p></div></FlowShell>;
}

export function ChecklistPage({ build, onChange, onNavigate, onBack }: PageProps & { onChange: (b: FishingBuild) => void; onNavigate: (screen: string) => void }) {
  const done = categories.filter(c=>build.checked.includes(c.id)||build.owned.includes(c.id)).length;
  return <FlowShell wide eyebrow="YOUR SHOPPING CHECKLIST" title="ひとつずつ、準備しよう。" description="商品名・サイズ・販売単位を確認して購入し、そろった道具にチェックしてください。" onBack={onBack}>
    <div className="shopping-progress"><PackageCheck size={22} /><strong>{done} / {categories.length}点を準備済み</strong><button className="text-button" onClick={()=>onNavigate('save')}>このチェックリストを保存<ArrowRight size={15} /></button></div>
    <div className="shopping-list">{categories.map(c=>{
      const p = getProduct(build.selection[c.id]);
      const owned = build.owned.includes(c.id), included = build.included.includes(c.id);
      const checked = owned || build.checked.includes(c.id);
      return <article className={`shopping-item ${checked ? 'done' : ''}`} key={c.id}><label className="checklist-checkbox"><input type="checkbox" checked={checked} disabled={owned} aria-label={`${c.label}を準備済みにする`} onChange={()=>onChange({...build,checked:checked ? build.checked.filter(id=>id !== c.id) : [...build.checked,c.id]})} /><span><Check size={14} /></span></label><div className="shopping-art"><GearIllustration category={c.id} /></div><div className="shopping-info"><span className="shopping-category">{c.label}</span><h2>{owned ? '手持ちの道具を使う' : included ? 'リール付属のナイロン3号150m' : p?.name}</h2><p className="small muted">{owned ? '購入対象外・仕様は要確認' : included ? 'リールと一緒に準備する付属品' : p?.brand}</p>{p && !owned && !included && <ProductSpecs product={p} />}</div><div className="shopping-actions">{owned || included ? <span className="owned-badge">{owned ? '購入対象外' : '追加購入なし'}</span> : <ExternalLinkButton className="buy-link" href={p?.purchaseUrl}>{p ? amazonLinkLabel(p) : '購入先を確認'}</ExternalLinkButton>}</div></article>;
    })}</div><div className="list-disclosure"><Info size={16} /><p>購入先はAmazonです。価格・在庫・送料は購入先でご確認ください。</p></div><CompatibilityDetails build={build} /><button className="text-button" onClick={()=>onNavigate('review')}>道具や価格を見直す<ArrowRight size={15} /></button>
  </FlowShell>;
}
