import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, CircleCheck, ClipboardCheck, Copy, Info, MapPin, Minus, PackageCheck, RotateCcw, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles } from "lucide-react";
import { amazonLinkLabel, categories, defaultSelection, fishSpecies, products, type CategoryId, type Product } from "./catalog";
import { evaluateCompatibility, type FishingBuild } from "./domain";
import { GearIllustration } from "./Illustrations";
import { ConditionChips } from "./DiscoverPage";
import { CompatibilityBadge, ExternalLinkButton, Modal, Notice } from "./ui";

type PageProps = { build: FishingBuild; onChange: (build: FishingBuild) => void; onBack: () => void };
const necessityLabel = { required: "必須", recommended: "推奨", optional: "任意" };
function getProduct(id: string) { return products.find(p => p.id === id); }
function statusFor(build: FishingBuild, category: CategoryId) {
  const statuses = evaluateCompatibility(build.selection, build.owned).filter(c => c.categoryIds.includes(category));
  return statuses.some(s => s.status === "avoid") ? "avoid" : !statuses.length || statuses.some(s => s.status === "check") ? "check" : "recommended";
}
function productUpdate(build: FishingBuild, category: CategoryId, productId: string): FishingBuild {
  return { ...build, selection: { ...build.selection, [category]: productId }, checked: build.checked.filter(c => c !== category), owned: build.owned.filter(c => c !== category) };
}
function ProductSpecs({ product }: { product: Product }) {
  return <details className="product-details"><summary>仕様と出典<ChevronDown size={14} /></summary><ul>{product.specs.map(s => <li key={s}>{s}</li>)}</ul><p className="small">{product.verification === "verified" ? "公開仕様を確認" : "一部情報は要確認"} · 確認日 {product.record.checkedAt}</p><p className="verification-note">{product.record.note}</p><p className="verification-note">購入リンク：{"Amazon個別商品ページで型番・選択仕様を確認（価格・在庫はリンク先で確認）"}</p><ExternalLinkButton href={product.sourceUrl}>製品情報・仕様の出典</ExternalLinkButton></details>;
}

function CompatibilityPanel({ build, expanded = false }: { build: FishingBuild; expanded?: boolean }) {
  const results = evaluateCompatibility(build.selection, build.owned);
  const avoid = results.some(r => r.status === "avoid");
  const check = results.filter(r => r.status === "check").length;
  const recommended = results.filter(r => r.status === "recommended").length;
  return <div className="compatibility-panel"><div className="summary-section-title"><ShieldCheck size={19} /><h3>道具の組み合わせ</h3></div><p className={`compatibility-overview ${avoid ? "text-danger" : ""}`}>{avoid ? "組み合わせの見直しが必要です" : check ? "購入前に確認したい点があります" : "公開仕様のルールに適合しています"}</p><p className="small muted">仕様ルール {recommended}/{results.length}件を確認 · 選択済みの点数とは異なります</p><div className="compatibility-results">{results.map(r => <details key={r.id} open={expanded || r.status === "avoid" || undefined} className={`compatibility-rule ${r.status}`}><summary><CompatibilityBadge status={r.status} /><span>{r.title}</span><ChevronDown size={14} /></summary><p>{r.reason}</p></details>)}</div><p className="tiny muted">規格や公開仕様による目安です。実物の取付・使用条件を含む完全な適合を保証するものではありません。</p></div>;
}

function ProductPicker({ category, build, onChange, onClose }: { category: CategoryId; build: FishingBuild; onChange: (b: FishingBuild) => void; onClose: () => void }) {
  const [compare, setCompare] = useState(false);
  const c = categories.find(c => c.id === category)!;
  const candidates = products.filter(p => p.category === category);
  return <Modal title={`${c.label}を選ぶ`} onClose={onClose} className="product-drawer"><div className="drawer-intro"><p>{c.description}</p><span className="small muted">価格・在庫はAmazonでご確認ください。商品名・サイズ・販売単位もリンク先でご確認ください。イラストは道具のイメージです。</span></div>
    {candidates.some(p => p.generic) && <div className="comparison-toggle"><button className="text-button" onClick={() => setCompare(!compare)} aria-expanded={compare}><SlidersHorizontal size={16} />釣り用と汎用品を比較する<ChevronDown size={14} /></button>{compare && <div className="comparison-content"><div className="comparison-scroll"><table className="comparison-table"><caption>用途と条件を比較して選びましょう</caption><thead><tr><th scope="col">比較項目</th>{candidates.map(p => <th scope="col" key={p.id}>{p.name}</th>)}</tr></thead><tbody><tr><th scope="row">用途</th>{candidates.map(p => <td key={p.id}>{p.summary}</td>)}</tr><tr><th scope="row">材質・サイズ</th>{candidates.map(p => <td key={p.id}>{p.specs.join(" / ")}</td>)}</tr><tr><th scope="row">代用条件</th>{candidates.map(p => <td key={p.id}>{p.generic ? "陸上で水や道具を入れる用途のみ。海への投下や水汲みには使わない。" : "製品の用途・説明書に従って使う。"}</td>)}</tr><tr><th scope="row">強度・耐環境性</th>{candidates.map(p => <td key={p.id}>引き上げ荷重・海水への長期耐久性は未確認</td>)}</tr><tr><th scope="row">購入時の確認</th>{candidates.map(p => <td key={p.id}>容量、持ち手、数量、販売単位を購入先で確認</td>)}</tr></tbody></table></div><Notice tone="warning">汎用品は釣り専用品と同一ではありません。安全用品や仕掛けの代替には使いません。</Notice></div>}</div>}
    <div className="product-candidates">{candidates.map(p => {
      const trial = productUpdate(build, category, p.id);
      const active = build.selection[category] === p.id;
      const status = statusFor(trial, category);
      return <article className={`candidate-card ${active ? "selected" : ""}`} key={p.id}><div className="candidate-top"><div className="candidate-art"><GearIllustration category={category} /></div><div><div className="candidate-tags">{p.generic && <span className="neutral-tag">汎用品・用途限定</span>}{p.localOnly && <span className="neutral-tag">現地で準備</span>}<CompatibilityBadge status={status} /></div><p className="product-brand">{p.brand}</p><h3>{p.name}</h3><p className="small muted">{p.summary}</p></div></div><p className="product-reason"><Sparkles size={15} />{p.reason}</p><ProductSpecs product={p} /><div className="candidate-bottom"><ExternalLinkButton href={p.purchaseUrl}>{amazonLinkLabel(p)}</ExternalLinkButton><button className={`button ${active ? "secondary" : "primary"}`} onClick={() => { onChange(trial); onClose(); }} aria-label={`${p.name}を選ぶ`}>{active ? <><Check size={16} />選択中</> : <>この商品を選ぶ<ArrowRight size={15} /></>}</button></div>{status === "avoid" && <p className="candidate-warning"><Info size={15} />現在の道具との組み合わせは非推奨です。選択後に理由を確認できます。</p>}</article>;
    })}</div><div className="drawer-bottom"><button className="text-button muted" onClick={() => { onChange(productUpdate(build, category, "")); onClose(); }}><Minus size={15} />この道具の選択を外す</button><button className="text-button" onClick={onClose}>変更せずに閉じる</button></div>
  </Modal>;
}

export function BuilderPage({ build, onChange, onBack, onNext }: PageProps & { onNext: () => void }) {
  const [picker, setPicker] = useState<CategoryId | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const results = evaluateCompatibility(build.selection, build.owned);
  const avoid = results.filter(r => r.status === "avoid");
  const missing = categories.filter(c => c.necessity === "required" && !build.selection[c.id] && !build.owned.includes(c.id));
  const selectedCount = categories.filter(c => build.selection[c.id] || build.owned.includes(c.id)).length;
  const fish = fishSpecies.find(f => f.id === build.fishId);
  function toggleOwned(category: CategoryId) { onChange({ ...build, owned: build.owned.includes(category) ? build.owned.filter(c => c !== category) : [...build.owned, category], checked: build.checked.filter(c => c !== category) }); }
  return <div className="container flow-page builder-page"><button className="back-button" onClick={onBack}><ArrowLeft size={16} />魚・釣り方を変える</button><div className="page-heading"><p className="eyebrow">STEP 03 / BUILD YOUR SETUP</p><h1 tabIndex={-1}>あなたの一投に、必要なもの。</h1><p>おまかせセットをご用意しました。持っている道具は、買うものから外せます。</p><ConditionChips build={build} /></div>
    <div className="builder-layout"><div className="builder-main"><div className="setup-banner"><span className="setup-icon"><Sparkles size={24} /></span><div><strong>{fish?.name}のサビキ釣り・おまかせセット</strong><p>公開仕様をもとに選定。エサや安全用品も忘れずに。</p></div><span className="setup-count">{selectedCount}/{categories.length}<small>点を選択</small></span></div><div className="builder-toolbar"><h2>道具リスト<span>{categories.length}カテゴリ</span></h2><button className="text-button" onClick={() => { setCustomizing(!customizing); document.getElementById("equipment-slots")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} aria-pressed={customizing}><SlidersHorizontal size={15} />商品を自分で選び直す</button></div>
    {customizing && <p className="customize-hint" role="status">各道具の「変更」から、仕様・選ぶ理由・組み合わせを比較できます。</p>}
    <div className="equipment-slots" id="equipment-slots">{categories.map((c, i) => {
      const p = getProduct(build.selection[c.id]);
      const owned = build.owned.includes(c.id);
      const status = statusFor(build, c.id);
      return <article className={`equipment-slot ${!p && !owned ? "missing" : ""}`} key={c.id}><div className="slot-art"><GearIllustration category={c.id} /></div><div className="slot-content"><div className="slot-heading"><h3><span className="slot-index">{String(i + 1).padStart(2, "0")}</span>{c.label}</h3><span className={`necessity ${c.necessity}`}>{necessityLabel[c.necessity]}</span>{owned && <span className="owned-badge">所持品</span>}</div><p className="product-brand">{owned ? "所持品の型番・仕様は未確認" : p?.brand || "未選択"}</p><h4>{owned ? "持っている道具を使う" : p?.name || "道具を選んでください"}</h4><p className="slot-description">{owned ? "購入リストから除外します。実物の仕様をご確認ください。" : p?.reason || c.description}</p><div className="slot-meta">{p?.localOnly ? <span className="local-badge"><MapPin size={12} />現地・釣具店で準備</span> : <CompatibilityBadge status={status} />}<span className="price-note">{owned ? "購入対象外" : "購入先で価格を確認"}</span></div><label className="owned-control"><input type="checkbox" checked={owned} onChange={() => toggleOwned(c.id)} aria-label={`${c.label}は持っている`} />持っている・購入しない</label></div><button className="slot-change" onClick={() => setPicker(c.id)} aria-label={`${c.label}を変更`}>変更<ChevronRight size={15} /></button></article>;
    })}</div><p className="illustration-note">イラストはカテゴリのイメージです。実際の商品の形状・色とは異なります。</p><button className="text-button restore-button" onClick={() => onChange({ ...build, selection: { ...defaultSelection }, owned: [], checked: [] })}><RotateCcw size={15} />おまかせ構成に戻す</button>
    </div><aside className="build-summary" aria-label="現在の構成サマリー"><div className="summary-head"><span className="eyebrow">YOUR FISHING SETUP</span><h2>{fish?.name}のサビキ釣り</h2><p><WavesIcon />堤防で、気軽にはじめるセット</p></div><div className="selection-progress"><div><span>道具の選択</span><strong>{selectedCount}<small> / {categories.length}点</small></strong></div><div className="progress-track"><span style={{ width: `${selectedCount / categories.length * 100}%` }} /></div><p>選択済みは、適合確認済みとは異なります。</p></div><div className="summary-price"><span>道具一式の価格</span><strong>購入先で価格を確認</strong><p>価格未取得のため、合計額は表示していません。</p></div>{missing.length > 0 && <p className="blocking-message" role="status">必須の道具をあと{missing.length}点選んでください。</p>}{avoid.length > 0 && <p className="blocking-message" role="status">非推奨の組み合わせを変更してください。</p>}<button className="button primary full-width" onClick={onNext} disabled={missing.length > 0 || avoid.length > 0}>このセットで準備する<ArrowRight size={17} /></button><p className="summary-footnote"><ShieldCheck size={13} />要確認の項目は、準備リストにも残ります。</p><CompatibilityPanel build={build} /></aside></div>
    <div className="mobile-summary"><div><span>道具 {selectedCount}/{categories.length}点</span><strong>{avoid.length ? "組み合わせを見直してください" : "価格は購入先で確認"}</strong></div><button className="button primary" disabled={missing.length > 0 || avoid.length > 0} onClick={onNext}>準備リストへ<ArrowRight size={15} /></button></div>
    {picker && <ProductPicker category={picker} build={build} onChange={onChange} onClose={() => setPicker(null)} />}
  </div>;
}

function WavesIcon() { return <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M1 8c2-3 4 3 6 0s4 3 6 0 4 3 6 0M1 13c2-3 4 3 6 0s4 3 6 0 4 3 6 0" stroke="currentColor" strokeWidth="1.3" /></svg>; }

export function ChecklistPage({ build, onChange, onBack, onShare, onReset }: PageProps & { onShare: () => void; onReset: () => void }) {
  const [showOwned, setShowOwned] = useState(true);
  const fish = fishSpecies.find(f => f.id === build.fishId);
  const selected = categories.filter(c => build.selection[c.id] || build.owned.includes(c.id));
  const done = selected.filter(c => build.checked.includes(c.id) || build.owned.includes(c.id)).length;
  const missing = categories.filter(c => c.necessity === "required" && !build.selection[c.id] && !build.owned.includes(c.id));
  const warnings = evaluateCompatibility(build.selection, build.owned).filter(r => r.status !== "recommended");
  function toggleCheck(id: CategoryId) { onChange({ ...build, checked: build.checked.includes(id) ? build.checked.filter(c => c !== id) : [...build.checked, id] }); }
  return <div className="container flow-page checklist-page"><button className="back-button" onClick={onBack}><ArrowLeft size={16} />道具を見直す</button><div className="list-heading"><div className="page-heading"><p className="eyebrow">STEP 04 / READY FOR YOUR FIRST CAST</p><h1 tabIndex={-1}>準備ができたら、海へ行こう。</h1><p>購入先を確認して、そろった道具にチェック。釣行前にも見返せます。</p></div><button className="button secondary share-button" onClick={onShare}><Copy size={17} />構成URLを共有</button></div>
    <div className="list-plan-banner"><div className="list-plan-icon"><ClipboardCheck size={30} /></div><div><span className="small">YOUR FISHING PLAN</span><h2>{fish?.name}のサビキ釣り</h2><ConditionChips build={build} /></div><div className="list-progress"><strong>{done}<span>/{selected.length}</span></strong><span>準備済み</span></div></div>
    <div className="list-layout"><div>{missing.length > 0 && <Notice tone="warning">必須の道具が{missing.length}点不足しています。「道具を見直す」から選んでください。</Notice>}{warnings.length > 0 && <Notice tone="warning"><strong>購入前に、組み合わせの確認を。</strong><p>{warnings.length}件の確認点があります。下の「道具の組み合わせ」から理由を確認できます。</p></Notice>}<div className="checklist-toolbar"><h2>買うもの・準備するもの</h2><label className="owned-control"><input type="checkbox" checked={showOwned} onChange={e => setShowOwned(e.target.checked)} />所持品も表示</label></div><div className="shopping-list">{selected.filter(c => showOwned || !build.owned.includes(c.id)).map(c => {
      const p = getProduct(build.selection[c.id]);
      const owned = build.owned.includes(c.id);
      const checked = build.checked.includes(c.id) || owned;
      return <article className={`shopping-item ${checked ? "done" : ""}`} key={c.id}><label className="checklist-checkbox"><input type="checkbox" checked={checked} disabled={owned} onChange={() => toggleCheck(c.id)} aria-label={`${c.label}を準備済みにする`} /><span><Check size={14} /></span></label><div className="shopping-art"><GearIllustration category={c.id} /></div><div className="shopping-info"><div className="shopping-category">{c.label}<span className={`necessity ${c.necessity}`}>{necessityLabel[c.necessity]}</span>{checked && <span className="ready-label">{owned ? "所持品" : "準備済み"}</span>}</div><h3>{owned ? "持っている道具を使う" : p?.name || "未選択"}</h3><p className="small muted">{owned ? "型番・仕様の確認が必要です" : p?.brand}</p>{!owned && p && <ProductSpecs product={p} />}</div><div className="shopping-actions">{owned ? <span className="owned-badge"><Check size={12} />購入対象外</span> : <ExternalLinkButton className="buy-link" href={p?.purchaseUrl}>{p ? amazonLinkLabel(p) : "Amazonで商品を探す"}</ExternalLinkButton>}{!owned && <span className="price-note">価格は購入先で確認</span>}</div></article>;
    })}</div><div className="list-disclosure"><Info size={16} /><p>リンク先で仕様・在庫・送料・価格をご確認ください。購入先はAmazonです。すべて個別商品ページへのリンクです。商品名・サイズ・販売単位を確かめて個別に購入してください。</p></div><section className="trip-guide" aria-labelledby="guide-title"><div className="section-heading"><div><p className="eyebrow">BEFORE YOU GO</p><h2 id="guide-title">釣りに行く前の、5つのこと。</h2></div><span className="guide-icon"><ShieldCheck size={26} /></span></div><ol>{[{ title: "釣り場のルールを確認", text: "営業・開放時間、立入禁止区域、使える仕掛けを公式案内で確認。" }, { title: "天気と海の状況を確認", text: "波・風・警報を確かめて、無理な釣行は控えましょう。" }, { title: "安全装備を準備", text: "体に合うライフジャケットと滑りにくい靴を。子どもから目を離さずに。" }, { title: "エサ・小物を忘れずに", text: "現地の釣具店で針サイズやエサを相談。ハサミ・魚つかみ・保冷用品も確認。" }, { title: "ゴミは持ち帰る", text: "釣り糸や針も回収できる袋を用意。使った場所をきれいに。" }].map((g, i) => <li key={g.title}><span>{i + 1}</span><div><strong>{g.title}</strong><p>{g.text}</p></div></li>)}</ol><p className="small muted">このリストは主要な準備の目安です。釣り場・天候・同行者に合わせて必要品を追加してください。</p></section></div><aside className="list-sidebar"><div className="list-summary"><div className="summary-section-title"><PackageCheck size={20} /><h2>準備の進みぐあい</h2></div><div className="ready-number">{done}<span> / {selected.length}点</span></div><div className="progress-track"><span style={{ width: `${selected.length ? done / selected.length * 100 : 0}%` }} /></div><p className="small muted">購入済み・所持品・現地で準備できたものをチェックしましょう。</p><div className="summary-price"><span>合計金額</span><strong>購入先で価格を確認</strong><p>価格不明の商品を0円として集計していません。</p></div><button className="button primary full-width" onClick={onShare}><Copy size={16} />構成URLを共有</button><p className="summary-footnote"><CircleCheck size={13} />このブラウザに自動保存</p></div><div className="list-compatibility"><CompatibilityPanel build={build} /></div><button className="text-button reset-button" onClick={onReset}><RotateCcw size={15} />最初からやり直す</button></aside></div>
    <div className="finish-note"><ShoppingBag size={25} /><h2>準備する時間も、たのしもう。</h2><p>道具がそろったら、あとはその日の海をたのしみに。</p></div>
  </div>;
}
