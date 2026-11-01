import { useState } from 'react';
import { ArrowRight, CalendarDays, MapPin, Search, Sparkles, Star, Waves } from 'lucide-react';
import { areas, fishSpecies, methods, type FishDifficulty } from './catalog';
import { questions, requiredQuestions } from './diagnosis';
import { getFish, hasProductGuide, type FishingBuild } from './domain';
import { fishReason, nextQuestion, rankedFish, yen } from './planner';
import { FishArtwork } from './FishArtwork';
import { filterFish } from './fish-catalog';
import { FlowShell } from './FlowPages';
import { ExternalLinkButton, Notice } from './ui';
import './fish-selection.css';
import { equipmentFor, equipmentProfile, referenceProduct, requiredEquipment } from './equipment';
import { rigForBuild } from './rigs';
import { methodGuides } from './guidance';
import { RegionalInfo, TermHelp } from './Support';
import { productPrice } from './pricing';
import { RigDiagram } from './RigDiagram';
import { purchaseQuantity } from './preparation';

const difficultyLabels: Record<FishDifficulty, string> = {1:'簡単', 2:'ふつう', 3:'難しい'};

function DifficultyStars({ level, compact = false }: { level: FishDifficulty; compact?: boolean }) {
  return <span className="fish-difficulty">
    {!compact && <span className="fish-difficulty-caption">難易度</span>}
    <span className="fish-difficulty-stars" role="img" aria-label={`星${level} / 3`}>
      {[1,2,3].map(star => <Star key={star} size={14} strokeWidth={1.8} className={star <= level ? 'filled' : ''} fill={star <= level ? 'currentColor' : 'none'} aria-hidden="true" />)}
    </span>
    <span className="fish-difficulty-label">{difficultyLabels[level]}</span>
  </span>;
}

export function ConditionChips({ build,onNavigate }: { build: FishingBuild;onNavigate?:(s:string)=>void }) {
  const items=[{field:'month',text:`${build.conditions.month}月`,label:'釣行月',icon:<CalendarDays size={14}/>},{field:'area',text:areas.find(a=>a.id===build.conditions.area)?.name,label:'エリア',icon:<MapPin size={14}/>},{field:'field',text:build.conditions.field==='pier'?'堤防・施設':build.conditions.field==='surf'?'砂浜（サーフ）':'岩場（磯）',label:'釣り場の種類',icon:<Waves size={14}/>}];
  return <div className="condition-chips">{items.map(item=>onNavigate?<button key={item.field} className="condition-chip-edit" aria-label={`${item.label}を変更：${item.text}`} onClick={()=>onNavigate(`conditions/${item.field}`)}>{item.icon}{item.text}<small>変更</small></button>:<span key={item.field}>{item.icon}{item.text}</span>)}</div>;
}

export function DiagnosisPage({ build, questionId, onAnswer, onNavigate,onFinish }: { build: FishingBuild; questionId: string; onAnswer: (id: string, value: string) => void; onNavigate: (screen: string) => void;onFinish?:()=>void }) {
  const question = questions.find(q => q.id === questionId);
  if (!question) {
    const next = nextQuestion(build);
    const answered = questions.filter(q => build.answers[q.id]);
    return <FlowShell eyebrow="YOUR PREFERENCES" title={next?'あなたの釣りを、見つけにいこう。':'診断が完了しました。'} description={next?`${answered.length}問に回答しました。結果を見るか、任意の質問に進めます。`:'すべての質問に回答しました。好みに合う候補を見るか、回答を見直せます。'} onBack={() => onNavigate(`diagnosis/${answered.at(-1)?.id || 'goal'}`)}>
      <div className="diagnosis-ready"><span className="ready-illustration"><Sparkles size={32} /></span><h2>{next?'3問の回答がそろいました。':'すべての質問に回答しました。'}</h2><p>追加の質問は任意です。途中でも、いつでも結果に進めます。</p><button className="button primary" onClick={() => onNavigate('discover')}>おすすめの魚を見る<ArrowRight size={17} /></button>{next ? <button className="text-button" onClick={() => onNavigate(`diagnosis/${next.id}`)}>もっと質問に答える<ArrowRight size={15} /></button> : <p className="small muted">用意している質問への回答がそろいました。回答は下から見直せます。</p>}</div>
      <details className="answer-review"><summary>これまでの回答を見直す（{answered.length}問）</summary>{answered.map(q => <button key={q.id} onClick={() => onNavigate(`diagnosis/${q.id}`)}><span>{q.title}<strong>{q.options.find(o => o.value === build.answers[q.id])?.label}</strong></span><ArrowRight size={15} /></button>)}</details>
      {onFinish&&<button className="button secondary" onClick={onFinish}>回答の編集を終えて元の画面に戻る</button>}
    </FlowShell>;
  }
  const index = questions.indexOf(question);
  const required = index < requiredQuestions.length;
  return <FlowShell eyebrow={required ? `QUESTION ${index + 1} / 3` : `任意の質問 ${index-2} / ${questions.length-3}`} title={question.title} description={question.description} onBack={() => onNavigate(index === 0 ? 'conditions/field' : index === 3 ? 'diagnosis/ready' : `diagnosis/${questions[index - 1].id}`)}>
    <div className="question-progress" aria-label={required ? `必須の質問 ${index + 1} / 3` : `追加で${Math.max(0,Object.keys(build.answers).length - 3)}問回答済み`}>
      {required ? [0,1,2].map(i => <span key={i} className={i <= index ? 'filled' : ''} />) : <span className="extra-question-count">追加質問 {index-2} / {questions.length-3}・この後は{questions.length-index-1}問。いつでも結果へ進めます。</span>}
    </div>
    <div className="decision-options" role="group" aria-label={question.title}>{question.options.map(option => <button className="decision-option" key={option.value} aria-pressed={build.answers[question.id] === option.value} onClick={() => onAnswer(question.id,option.value)}><span className="decision-emoji" aria-hidden="true">{option.icon}</span><span className="decision-copy"><strong>{option.label}</strong><span>{option.description}</span></span><ArrowRight size={18} /></button>)}</div>
    {required ? <p className="quiet-note">まずは3問。気になる項目は、あとから何問でも答えられます。</p> : <button className="text-button result-shortcut" onClick={() => onNavigate('discover')}>ここまでの回答でおすすめを見る<ArrowRight size={15} /></button>}
  </FlowShell>;
}

export function DiscoverPage({ build, onSelect, onBack,onNavigate }: { build: FishingBuild; onSelect: (id: string) => void; onBack: () => void; onSample: () => void;onNavigate:(s:string)=>void }) {
  const [query, setQuery] = useState('');
  const [methodId, setMethodId] = useState('');
  const [sort, setSort] = useState('recommended');
  const [all,setAll]=useState(false),[feature,setFeature]=useState('');
  const filtered = filterFish(sort === 'popular' ? fishSpecies : rankedFish(build), query, methodId).filter(f=>feature==='easy'?f.difficulty===1:feature==='no-bait'?f.methodIds.some(id=>['lure','eging'].includes(id)):feature==='few-parts'?f.methodIds.some(id=>requiredEquipment({...build,fishId:f.id,methodId:id}).length<=8):true);
  const expanded=all||!!query||!!methodId||!!feature;
  const fish=expanded?filtered:filtered.slice(0,3);
  const seasonal = getFish(build.conditions);
  return <FlowShell wide eyebrow="FIND YOUR FISH · 30 TARGETS" title="どの魚に、出会いたい？" description="初心者が岸から狙える30項目。気になる魚を選んで、釣り方を見つけましょう。" onBack={onBack}>
    <ConditionChips build={build} onNavigate={onNavigate}/>
    <p className="fish-context-note">{seasonal.length ? `季節の目安がある魚：${seasonal.map(f => f.name).join('・')}。直近の釣果は施設で確認します。` : `${build.conditions.month}月・選んだ地域の季節情報は未整備です。以下は好みから比較する候補で、現地で狙えることは未確認です。`}</p>
    <details className="fish-filters"><summary>魚の検索・絞り込み</summary><div className="fish-toolbar">
      <label className="fish-search"><span>魚の名前・別名で検索</span><span className="fish-search-input"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="アジ、ガシラ、ヤリイカ…" /></span></label>
      <label><span>釣り方で絞り込む</span><select value={methodId} onChange={e => setMethodId(e.target.value)}><option value="">すべての釣り方</option>{methods.filter(m => m.supported).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
      <label><span>並び順</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="recommended">あなたへのおすすめ順</option><option value="popular">有名順</option></select></label>
      <label><span>分かりやすい条件から探す</span><select value={feature} onChange={e=>setFeature(e.target.value)}><option value="">すべて</option><option value="easy">難易度の目安が簡単</option><option value="no-bait">生きたエサを使わない釣り方あり</option><option value="few-parts">必要な道具が少なめの釣り方あり</option></select></label>
    </div>
    <div className="fish-difficulty-legend">
      <strong>難易度の目安</strong>
      <div className="fish-difficulty-scale">{([1,2,3] as const).map(level => <DifficultyStars key={level} level={level} compact />)}</div>
      <p>初心者が岸から1匹を狙う目安です。場所・時期・釣り方で変わります。</p>
    </div>
    </details><p className="fish-result-count" role="status">{expanded?`${fish.length} / ${fishSpecies.length}項目を表示`:'好みから比べる3候補'}<span>季節情報がある候補を優先。難易度は場所・時期で変わります。</span></p>
    {fish.length ? <div className="fish-grid" role="group" aria-label="狙う魚を選ぶ">{fish.map((f,i) =>
      <button className="fish-card" key={f.id} onClick={() => onSelect(f.id)}>
        <div className={`fish-art ${f.id}`}><FishArtwork species={f.id} />{sort === 'recommended' && i === 0 && <span className="fish-recommend"><Sparkles size={12} />{seasonal.some(s=>s.id===f.id)?'季節の目安あり':'好みから比べる候補'}</span>}</div>
        <div className="fish-body">
          <DifficultyStars level={f.difficulty} />
          <h2>{f.name}<ArrowRight size={19} /></h2>
          {f.members.length > 0 && <span className="fish-members">{f.members.join('・')}</span>}
          <p>{f.description}</p><p className="fish-personal-reason">{fishReason(build,f.id)}</p><span className="fish-season-state">{seasonal.some(s=>s.id===f.id)?'この条件の季節目安あり':'この月・地域での適性は未確認'}</span>
          <span className="fish-method-tag">この魚の釣り方を見る →</span>
        </div>
      </button>
    )}</div> : <div className="empty-state"><Search size={32} /><h2>一致する魚が見つかりませんでした。</h2><p>名前や釣り方を変えて探してみましょう。</p><button className="button secondary" onClick={() => {setQuery(''); setMethodId('');}}>検索・絞り込みを解除する</button></div>}
    {!expanded&&<button className="button secondary full-width" onClick={()=>setAll(true)}>全国の30項目をすべて見る</button>}{expanded&&<button className="text-button" onClick={()=>{setAll(false);setQuery('');setMethodId('');setFeature('');setSort('recommended');}}>最初の3候補に戻る</button>}<RegionalInfo build={build}/><TermHelp/>
    <p className="quiet-note">全国一覧は、すべての魚が選択した場所で釣れることを示すものではありません。有名順は掲載上の目安です。</p>
    <button className="text-button" onClick={onBack}>質問に戻って、好みを追加する<ArrowRight size={15} /></button>
  </FlowShell>;
}

export function MethodPage({ build, onSelect, onBack }: { build: FishingBuild; onSelect: (id: string) => void; onBack: () => void }) {
  const fish = fishSpecies.find(f => f.id === build.fishId);
  const available = methods.filter(m => fish?.methodIds.includes(m.id));
  const preferred = build.answers.bait==='avoid'?available.find(m=>['lure','eging'].includes(m.id))?.id:build.answers.pace==='active'?available.find(m=>['lure','eging','hole'].includes(m.id))?.id:available.find(m=>['sabiki','float','choi-nage','dozuki'].includes(m.id))?.id;
  available.sort((a,b)=>Number(b.id===preferred)-Number(a.id===preferred));
  return <FlowShell eyebrow="CHOOSE YOUR STYLE" title={`${fish?.name}、どうやって釣る？`} description="楽しみ方を確かめて、釣り方をひとつ選びましょう。" onBack={onBack}>
    {fish && <div className="fish-target-summary"><FishArtwork species={fish.id} /><div><strong>{fish.habitat}</strong><p>{fish.tip}</p></div></div>}
    <div className="decision-options">{available.map(m => {
      const context={...build,methodId:m.id};
      const productsAvailable = hasProductGuide(context);
      const description=['kamasu-sabiki','hokke-cast','sayori-float','tachiuo-float','light-eging'].includes(equipmentProfile(context))?rigForBuild(context).summary:m.description;
      const guide=methodGuides[m.id];
      const seen=new Set<string>();
      const estimate=requiredEquipment(context).flatMap(c=>{const p=referenceProduct(context,c.id);if(!p)return[{price:null}];if(seen.has(p.id))return[];seen.add(p.id);const price=productPrice(build,p);return[{price:price===null?null:price*purchaseQuantity(build,c.id)}];});
      const unknown=estimate.filter(r=>r.price===null).length,subtotal=estimate.reduce((sum,r)=>sum+(r.price??0),0);
      return <div key={m.id} className="style-choice"><span className="style-art"><RigDiagram rig={rigForBuild(context)} miniature/></span><div>{m.id===preferred&&<span className="recommended-tag">希望する過ごし方からの候補</span>}<h2>{m.name}</h2><p>{guide?.action||description}</p>{m.id===preferred&&<p className="method-personal-reason">{guide?.reason}</p>}<dl className="style-facts"><div><dt>準備・操作</dt><dd>{guide?.effort}</dd></div><div><dt>エサ</dt><dd>{guide?.bait}</dd></div><div><dt>道具</dt><dd>必須{requiredEquipment(context).length}項目・全{equipmentFor(context).length}項目</dd></div><div><dt>商品代目安</dt><dd>{unknown?`確認済み分${yen(subtotal)}＋価格未確認${unknown}商品`:`基本候補で${yen(subtotal)}`}<small>掲載の基本候補・現在の人数分。送料・未確認費用は別。商品の選択と数量で変わります。</small></dd></div></dl><button className="button primary full-width" onClick={() => onSelect(m.id)}>{productsAvailable ? 'この釣り方の道具を選ぶ' : 'この釣り方で準備する'}<ArrowRight size={17} /></button></div></div>;
    })}</div><RegionalInfo build={build}/><TermHelp/>
  </FlowShell>;
}

export function FishGuidePage({ build, onBack }: { build: FishingBuild; onBack: () => void }) {
  const fish = fishSpecies.find(f => f.id === build.fishId)!;
  const method = methods.find(m => m.id === build.methodId)!;
  return <FlowShell eyebrow="GET READY" title={`${fish.name}を、${method.name}で。`} description="必要な道具と基本の手順を確認して、釣りの準備を進めましょう。" onBack={onBack}>
    <ConditionChips build={build} />
    <div className="fish-target-summary"><FishArtwork species={fish.id} /><div><strong>{fish.habitat}</strong><p>{fish.tip}</p></div></div>
    <section className="fish-guide-section" aria-labelledby="fish-guide-supplies"><h2 id="fish-guide-supplies">準備する道具</h2><ul>{method.supplies.map(item => <li key={item}>{item}</li>)}</ul><p>共通の準備：体に合うライフジャケット、針外し、魚ばさみ、タオル、ゴミ袋。</p></section>
    <section className="fish-guide-section" aria-labelledby="fish-guide-steps"><h2 id="fish-guide-steps">はじめの3ステップ</h2><ol>{method.steps.map(item => <li key={item}>{item}</li>)}</ol></section>
    <Notice>この魚・釣り方の購入商品は準備中です。準備品の一覧を参考に、現地の釣具店で魚の大きさ・時期・場所に合う道具を確認してください。選んだ魚と釣り方は自動保存されます。</Notice>
    <div className="fish-guide-sources"><ExternalLinkButton href={fish.sourceUrl}>魚の狙い方を読む</ExternalLinkButton><ExternalLinkButton href={method.sourceUrl}>釣り方の基本を読む</ExternalLinkButton></div>
    <button className="button secondary" onClick={onBack}>釣り方を選び直す<ArrowRight size={17} /></button>
  </FlowShell>;
}
