import { useEffect } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Fish, MapPin, Sparkles, Waves } from "lucide-react";
import { areas, dataSources, methods } from "./catalog";
import { createDefaultBuild, getFish, type FishingBuild } from "./domain";
import { FishIllustration } from "./Illustrations";
import { ExternalLinkButton, Notice } from "./ui";

export function ConditionChips({ build }: { build: FishingBuild }) {
  return <div className="condition-chips"><span><CalendarDays size={14} />{build.conditions.month}月</span><span><MapPin size={14} />{areas.find(a => a.id === build.conditions.area)?.name || "未対応エリア"}</span><span><Waves size={14} />{build.conditions.field === "pier" ? "堤防" : build.conditions.field === "surf" ? "サーフ" : "磯"}</span></div>;
}

export function DiscoverPage({ build, onChange, onBack, onNext }: { build: FishingBuild; onChange: (build: FishingBuild) => void; onBack: () => void; onNext: () => void }) {
  const fish = getFish(build.conditions);
  const selected = fish.find(f => f.id === build.fishId);
  const selectedMethod = methods.find(m => m.id === build.methodId);
  useEffect(() => {
    if (fish.length && !selected) onChange({ ...build, fishId: fish[0].id, methodId: "sabiki" });
  }, [fish.length, selected, build, onChange, fish]);
  const availableMethods = selected ? methods.filter(m => selected.methodIds.includes(m.id)) : [];
  function sample() { onChange(createDefaultBuild({ month: 10, area: "tokyo-bay", field: "pier" })); }
  return <div className="container flow-page discover-page"><button className="back-button" onClick={onBack}><ArrowLeft size={16} />条件を変える</button><div className="page-heading"><p className="eyebrow">STEP 02 / FIND YOUR FISH</p><h1 tabIndex={-1}>{fish.length ? "どんな魚に、出会いたい？" : "この条件のデータを準備中です。"}</h1><p>{fish.length ? "まずは気になる魚をひとつ。釣り方まで、やさしくご案内します。" : "確認できた情報がある条件から、釣りの準備をはじめられます。"}</p><ConditionChips build={build} /></div>

    {!fish.length ? <div className="empty-state"><div className="empty-icon"><Fish size={42} /></div><h2>確かな情報があるプランを、どうぞ。</h2><p>現在は東京湾の堤防で、4〜10月のサビキ釣りに対応しています。<br />アジの提案は5〜10月です。現在の条件では魚種を推測して表示しません。</p><div className="sample-suggestion"><FishIllustration species="aji" /><div><span className="small muted">対応するサンプル</span><h3>10月・東京湾・堤防</h3><p>アジのサビキ釣りを試せます。</p></div></div><div className="button-row"><button className="button secondary" onClick={onBack}>条件を選び直す</button><button className="button primary" onClick={sample}>このサンプルに変更<ArrowRight size={16} /></button></div></div> : <>
      <div className="fish-grid" role="group" aria-label="狙う魚を選択">{fish.map(f => <button key={f.id} className={`fish-card ${selected?.id === f.id ? "selected" : ""}`} aria-pressed={selected?.id === f.id} onClick={() => onChange({ ...build, fishId: f.id, methodId: "sabiki" })}><div className={`fish-art ${f.id}`}><FishIllustration species={f.id as "aji" | "iwashi" | "saba"} /><span className="selection-mark">{selected?.id === f.id ? <Check size={17} /> : null}</span></div><div className="fish-body"><span className="fish-level">{f.difficulty}</span><h2>{f.name}<ArrowRight size={20} /></h2><p>{f.description}</p><span className="fish-method-tag">サビキ釣りで狙える</span></div></button>)}</div>
      <p className="source-note"><span>季節の目安です。水温や天候、釣り場により状況は変わります。</span><ExternalLinkButton href={dataSources[0].url}>季節と釣り方の参考資料</ExternalLinkButton></p>

      {selected && <section className="method-section" aria-labelledby="method-title"><div className="section-heading"><div><p className="eyebrow">NEXT, CHOOSE YOUR STYLE</p><h2 id="method-title">{selected.name}、どうやって釣る？</h2></div><span className="small muted">釣り方によって、必要な道具が変わります。</span></div><div className="method-options" role="group" aria-label="釣り方を選択">{availableMethods.filter(m => m.supported).map(m => <button key={m.id} className={`method-card ${build.methodId === m.id ? "selected" : ""}`} aria-pressed={build.methodId === m.id} onClick={() => onChange({ ...build, methodId: m.id })}><span className="method-icon"><Waves size={28} /></span><span className="method-copy"><span className="method-title">{m.name}{m.beginner && <span className="recommended-tag"><Sparkles size={12} />はじめてにおすすめ</span>}</span><span className="method-description">{m.description}</span></span><span className="radio-mark">{build.methodId === m.id && <span />}</span></button>)}</div>{availableMethods.some(m => !m.supported) && <details className="other-methods"><summary>ほかの釣り方も知りたい<ChevronDown size={15} /></summary>{availableMethods.filter(m => !m.supported).map(m => <div className="other-method" key={m.id}><strong>{m.name}<span className="neutral-tag">道具提案は準備中</span></strong><p>{m.description}</p></div>)}</details>}<Notice>いまはサビキ釣りの道具一式をご案内します。釣り場のルールに合った釣り方か、釣行前に確認しましょう。</Notice></section>}
      <div className="flow-actions"><p><Check size={17} />{selected?.name} × {selectedMethod?.name}<span>必要な道具を、おまかせでご用意します。</span></p><button className="button primary" disabled={!selected || !selectedMethod?.supported} onClick={onNext}>この釣り方で道具を見る<ArrowRight size={18} /></button></div>
    </>}
  </div>;
}
