import { useState } from 'react';
import { BookOpen, Copy } from 'lucide-react';
import { allCategories, areas, fishSpecies, methods, products, type CategoryId } from './catalog';
import type { FishingBuild } from './domain';
import { categoryTerms, glossary, regionalGuides } from './guidance';
import { arrangementFor, arrangementLabel, peopleFor, purchaseQuantity, setArrangement, suppliesFor } from './preparation';
import { ExternalLinkButton, Modal } from './ui';

export function ThreadGuide() {
  return <figure className="thread-guide"><svg viewBox="0 0 360 140" role="img" aria-label="リールに巻く道糸から、仕掛けの中心の糸、針につながる枝糸、下のカゴへのつながり"><path d="M30 25H135" stroke="#20766d" strokeWidth="4"/><path d="M135 25V115" stroke="#486aa1" strokeWidth="4"/><path d="M135 52H220M135 85H220" stroke="#b57a37" strokeWidth="4"/><path d="M220 50q20 20 0 16M220 83q20 20 0 16" fill="none" stroke="#b57a37" strokeWidth="3"/><rect x="120" y="116" width="30" height="18" rx="3" fill="#dfeee3" stroke="#20766d"/><text x="25" y="16">①道糸</text><text x="150" y="30">②中心の糸（幹糸）</text><text x="238" y="66">③枝糸と針</text><text x="238" y="85">（ハリス）</text><text x="160" y="132">④エサのカゴ</text></svg><figcaption>サビキの一例。①はリールに巻く糸、②③は針付きの完成仕掛けです。</figcaption></figure>;
}
export function GlossaryList({ ids }: { ids?: string[] }) {
  const [query,setQuery] = useState('');
  const entries=glossary.filter(g=>(!ids||ids.includes(g.id))&&`${g.term}${g.plain}`.includes(query));
  return <div className="glossary-list">{!ids&&<label className="field-label-block">言葉を探す<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="道糸、号数、玉網…"/></label>}{ids?.some(id=>['G03','G04','G05','G09'].includes(id))&&<ThreadGuide/>}{entries.map(g=><details key={g.id}><summary>{g.term}<span>{g.plain}</span></summary><p>{g.detail}</p></details>)}{!entries.length&&<p>一致する言葉がありません。別の言葉で探してください。</p>}{!ids&&<><ThreadGuide/><ExternalLinkButton href="https://www.honda.co.jp/fishing/picture-book/trap/">Honda公式の仕掛け図解</ExternalLinkButton></>}</div>;
}
export function TermHelp({ category }: { category?:CategoryId }) {
  const [open,setOpen]=useState(false);
  return <><button type="button" className="text-button term-help" onClick={()=>setOpen(true)}><BookOpen size={16}/>言葉と道具の役割を確認</button>{open&&<Modal title="道具の言葉を、図と一緒に。" onClose={()=>setOpen(false)}><div className="modal-body"><GlossaryList ids={category?categoryTerms[category]:undefined}/></div></Modal>}</>;
}
export function RegionalInfo({ build }: { build: FishingBuild }) {
  const guide=regionalGuides[build.conditions.area];
  return guide?<div className="regional-info"><ExternalLinkButton href={guide.url}>{guide.title}</ExternalLinkButton><p>{guide.note}</p></div>:null;
}
export function TripFacts({ build, onNavigate }: { build:FishingBuild; onNavigate?:(screen:string)=>void }) {
  return <div className="trip-facts"><div><strong>{fishSpecies.find(f=>f.id===build.fishId)?.name} {methods.find(m=>m.id===build.methodId)?.name}</strong><span>{build.preparation?.tripDate||`${build.conditions.month}月`}・{areas.find(a=>a.id===build.conditions.area)?.name}・{peopleFor(build)}人分{build.preparation?.hours?`・${build.preparation.hours}時間`:''}</span></div>{onNavigate&&<button className="text-button" onClick={()=>onNavigate('trip')}>人数・日程を変更</button>}</div>;
}
export function QuantityControl({ build, category, onChange }: { build:FishingBuild;category:CategoryId;onChange:(b:FishingBuild)=>void }) {
  const label=allCategories.find(c=>c.id===category)?.label;
  return <label className="quantity-control">購入数（販売単位）<input aria-label={`${label}の購入数`} type="number" inputMode="numeric" min="1" max="20" value={purchaseQuantity(build,category)} onChange={e=>{const n=e.target.valueAsNumber;if(Number.isInteger(n)&&n>=1&&n<=20)onChange({...build,shipping:{selected:null,reference:null},preparation:{...build.preparation,shippingOrders:undefined,quantities:{...build.preparation?.quantities,[category]:n}}});}}/></label>;
}
export function ArrangementChoices({ build, category, onSelect }: { build:FishingBuild;category:CategoryId;onSelect:(b:FishingBuild)=>void }) {
  return <details className="arrangement-choice"><summary>掲載商品以外の準備方法を選ぶ</summary><p>購入する候補が合わない場合も、準備方法をリストへ残せます。貸出の有無・費用・予約・適合は準備先で確認します。</p>{(['store','rental'] as const).map(a=><button type="button" key={a} className="button secondary" aria-pressed={arrangementFor(build,category)===a} onClick={()=>onSelect(setArrangement(build,category,a))}>{arrangementLabel(a)}</button>)}</details>;
}
export function FitGuide({ onOutsideChange }: { onOutsideChange?:(outside:boolean)=>void }) {
  const [height,setHeight]=useState(''),[chest,setChest]=useState('');
  const entered=height!==''&&chest!=='';
  const within=entered&&Number(height)>=155&&Number(height)<=175&&Number(chest)>0&&Number(chest)<=100;
  const changed=(h:string,c:string)=>{setHeight(h);setChest(c);onOutsideChange?.(h!==''&&c!==''&&!(Number(h)>=155&&Number(h)<=175&&Number(c)>0&&Number(c)<=100));};
  return <div className="fit-guide"><h2>まずサイズと利用場所を確認</h2><p>この掲載商品はMサイズ（メーカー目安：身長155〜175cm・胸囲100cmまで）です。メーカーにはS・Lもあります。衣服の上から試着し、固定できるか確認します。</p><div className="form-columns"><label>身長（cm・任意）<input type="number" min="50" max="250" value={height} onChange={e=>changed(e.target.value,chest)}/></label><label>胸囲（cm・任意）<input type="number" min="30" max="200" value={chest} onChange={e=>changed(height,e.target.value)}/></label></div>{entered&&<p role="status">{within?'入力値はMの公表目安内です。体への固定・試着と利用環境の確認は別に必要です。':'入力値は掲載Mの公表目安に収まりません。別サイズや店舗・施設での準備を検討してください。'}</p>}<p className="small">入力した体格は、この画面での目安確認だけに使用します。Type Dは船での使用条件などを示す区分で、選んだ施設への適合を保証するものではありません。</p><ExternalLinkButton href="https://bluestorm.jp/products/inherently_buoyant_lifejacket/bsj-201ars/">メーカーの全サイズと使用条件</ExternalLinkButton></div>;
}
export function PreparationChecklist({ build,onChange }: {build:FishingBuild;onChange:(b:FishingBuild)=>void}) {
  return <section className="supplies-checklist"><h2>当日の持ち物・確認</h2><p>購入する商品とは別に、家から持参する物や施設で確認することをそろえます。</p>{suppliesFor(build).map(item=><label key={item.id}><input type="checkbox" checked={build.preparation?.checkedSupplies?.includes(item.id)||false} onChange={e=>onChange({...build,preparation:{...build.preparation,checkedSupplies:e.target.checked?[...new Set([...(build.preparation?.checkedSupplies||[]),item.id])]:(build.preparation?.checkedSupplies||[]).filter(id=>id!==item.id)}})}/><span><strong>{item.label}</strong><small>{item.note}</small></span></label>)}</section>;
}
export function DeliveryCheck({ build,category,onChange }: {build:FishingBuild;category:CategoryId;onChange:(b:FishingBuild)=>void}) {
  const date=build.preparation?.deliveries?.[category]||'';
  const product=products.find(p=>p.id===build.selection[category]);
  return <details className="delivery-check"><summary>使う日までに届くか確認{date?`：${date}`:'：未確認'}</summary><p>購入先で、お届け先・出品者・数量に応じた到着予定を確認してください。表示は変更されることがあります。</p><label>{product?.name}の到着予定日<input type="date" min="2000-01-01" max="2099-12-31" value={date} onChange={e=>{const deliveries={...build.preparation?.deliveries};if(e.target.value)deliveries[category]=e.target.value;else delete deliveries[category];onChange({...build,preparation:{...build.preparation,deliveries}});}}/></label>{date&&build.preparation?.tripDate&&<p role="status">{date<build.preparation.tripDate?'入力した予定では釣行日前に到着します。発送状況も確認してください。':'釣行日当日以降の到着予定です。受け取りが間に合うか購入先へ確認してください。'}</p>}{!build.preparation?.tripDate&&<p className="small">「人数・日程を変更」で使う日を登録すると、入力した到着予定と比較できます。</p>}</details>;
}
export function CopyQuestion({ text }: {text:string}) {
  const [status,setStatus]=useState('');
  return <div className="question-copy"><p>{text}</p><button className="text-button" onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('質問文をコピーしました。問い合わせ先に貼り付けて使えます。');}catch{setStatus('上の質問文を選択してコピーしてください。');}}}><Copy size={14}/>質問文をコピー</button><span role="status">{status}</span></div>;
}
