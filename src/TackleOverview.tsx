import { useState } from 'react';
import { ArrowUpRight, Check, Map, PackageCheck } from 'lucide-react';
import { products, type CategoryId } from './catalog';
import type { FishingBuild } from './domain';
import { RigDiagram } from './RigDiagram';
import { buildPartStates, partStateLabel, rigById, type RigPart } from './rigs';

export function TackleOverview({ build, currentCategory, recentCategory, onNavigate, interactive = false, highlightedCategory, onHoverCategory, onFocusCategory }: {
  build: FishingBuild; currentCategory?: CategoryId; recentCategory?: CategoryId;
  onNavigate: (screen: string) => void; interactive?: boolean;
  highlightedCategory?: CategoryId; onHoverCategory?: (category?: CategoryId) => void; onFocusCategory?: (category?: CategoryId) => void;
}) {
  const [hovered, setHovered] = useState<CategoryId>();
  const [focused, setFocused] = useState<CategoryId>();
  const highlight = onHoverCategory ? highlightedCategory : hovered || focused;
  const hoverCategory = onHoverCategory || setHovered;
  const focusCategory = onFocusCategory || setFocused;
  const rig = rigById(build.methodId) || rigById('sabiki')!;
  const states = buildPartStates(build, rig);
  const currentPart = rig.parts.find(p => p.category === currentCategory);
  const chosen = rig.parts.filter(p => states[p.id] !== 'missing').length;
  const selectionName = (p: RigPart) => {
    if (!p.category || states[p.id] === 'missing') return p.description;
    if (states[p.id] === 'owned') return '持っている道具を使います。型番・仕様は要確認です。';
    if (states[p.id] === 'included') return 'リール付属のナイロン3号150mを使います。';
    const product = products.find(product => product.id === build.selection[p.category!]);
    return product ? `${product.brand} ${product.name}` : p.description;
  };
  const legend = () => <ol className="tackle-part-list">{rig.parts.map((p, index) => {
    const state = states[p.id] || 'missing';
    const content = <><span className={`tackle-part-number ${state !== 'missing' ? 'is-ready' : ''}`}>{index + 1}</span><span className="tackle-part-copy"><strong>{p.label}</strong><small>{state !== 'missing' && <Check size={10} aria-hidden="true" />}{currentCategory === p.category ? 'いま選ぶ · ' : ''}{partStateLabel[state]}</small></span>{interactive && <ArrowUpRight size={12} aria-hidden="true" />}</>;
    return <li key={p.id} className={`${p.category === currentCategory ? 'is-current' : ''} ${p.category === highlight ? 'is-highlighted' : ''}`} data-category={p.category} data-state={state}
      onPointerEnter={e => { if (e.pointerType !== 'touch') hoverCategory(p.category); }} onPointerLeave={() => hoverCategory(undefined)}
      onFocusCapture={() => { hoverCategory(undefined); focusCategory(p.category); }} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focusCategory(undefined); }}>
      {interactive && p.category ? <button type="button" title={selectionName(p)} aria-label={`全体図から商品を選ぶ：${index + 1} ${p.label} ${partStateLabel[state]}`} onClick={() => onNavigate(`builder/${p.category}`)}>{content}</button> : <div title={selectionName(p)}>{content}</div>}</li>;
  })}</ol>;
  return <section className={`tackle-overview ${currentCategory ? 'is-product-view' : ''}`} aria-label="道具の全体像">
    <div className="tackle-overview-heading"><div><p className="eyebrow">YOUR SETUP, COMING TO LIFE</p><h2>あなたの釣りの全体図</h2></div><Map size={20} aria-hidden="true" /></div>
    <div className="tackle-diagram-caption"><span>{rig.name} · {rig.variant}</span><strong>{chosen} / {rig.parts.length}</strong></div>
    <RigDiagram rig={rig} states={states} activePart={currentPart?.id} recentCategory={recentCategory} highlightedPart={rig.parts.find(p => p.category === highlight)?.id} onPartHover={id => hoverCategory(rig.parts.find(p => p.id === id)?.category)} />
    <div className="tackle-color-key" aria-label="図の見方"><span><i className="key-missing" />未選択</span><span><i className="key-selected" />選択済み</span><span><i className="key-current" />いま選ぶ</span></div>
    {currentPart && <p className="tackle-current-note"><span>いま選ぶ：{currentPart.label}</span>{currentPart.description}</p>}
    <div className="tackle-desktop-key">{legend()}</div>
    <details className="tackle-mobile-key"><summary>図の番号と道具名を見る</summary>{legend()}</details>
    {recentCategory && <p className="tackle-selected-message" role="status"><PackageCheck size={15} aria-hidden="true" />{rig.parts.find(p => p.category === recentCategory)?.label}を反映しました。</p>}
    <p className="tackle-figure-note">図は道具の役割を示すイメージです。色付きは選択済みを表します。</p>
    <button className="text-button rig-library-link" onClick={() => onNavigate(`rigs/${rig.id}`)}>12種類の仕掛けを見る<ArrowUpRight size={13} aria-hidden="true" /></button>
  </section>;
}
