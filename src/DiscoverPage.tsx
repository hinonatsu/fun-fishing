import { useState } from 'react';
import { ArrowRight, CalendarDays, MapPin, Search, Sparkles, Waves } from 'lucide-react';
import { areas, fishSpecies, methods } from './catalog';
import { questions, requiredQuestions } from './diagnosis';
import { getFish, hasProductGuide, type FishingBuild } from './domain';
import { fishReason, nextQuestion, rankedFish } from './planner';
import { FishArtwork } from './FishArtwork';
import { filterFish } from './fish-catalog';
import { FlowShell } from './FlowPages';
import { ExternalLinkButton, Notice } from './ui';
import './fish-selection.css';

export function ConditionChips({ build }: { build: FishingBuild }) {
  return <div className="condition-chips"><span><CalendarDays size={14} />{build.conditions.month}月</span><span><MapPin size={14} />{areas.find(a => a.id === build.conditions.area)?.name}</span><span><Waves size={14} />{build.conditions.field === 'pier' ? '堤防' : build.conditions.field === 'surf' ? 'サーフ' : '磯'}</span></div>;
}

export function DiagnosisPage({ build, questionId, onAnswer, onNavigate }: { build: FishingBuild; questionId: string; onAnswer: (id: string, value: string) => void; onNavigate: (screen: string) => void }) {
  const question = questions.find(q => q.id === questionId);
  if (!question) {
    const next = nextQuestion(build);
    const answered = questions.filter(q => build.answers[q.id]);
    return <FlowShell eyebrow="YOUR PREFERENCES" title="あなたの釣りを、見つけにいこう。" description={`${answered.length}問の回答がそろいました。結果を見るか、もう少し好みを教えてください。`} onBack={() => onNavigate(`diagnosis/${answered.at(-1)?.id || 'goal'}`)}>
      <div className="diagnosis-ready"><span className="ready-illustration"><Sparkles size={32} /></span><h2>まず3問で、おすすめを見られます。</h2><p>追加の質問は任意です。途中でも、いつでも結果に進めます。</p><button className="button primary" onClick={() => onNavigate('discover')}>おすすめの魚を見る<ArrowRight size={17} /></button>{next ? <button className="text-button" onClick={() => onNavigate(`diagnosis/${next.id}`)}>もっと質問に答える<ArrowRight size={15} /></button> : <p className="small muted">用意している質問への回答がそろいました。回答は下から見直せます。</p>}</div>
      <details className="answer-review"><summary>これまでの回答を見直す（{answered.length}問）</summary>{answered.map(q => <button key={q.id} onClick={() => onNavigate(`diagnosis/${q.id}`)}><span>{q.title}<strong>{q.options.find(o => o.value === build.answers[q.id])?.label}</strong></span><ArrowRight size={15} /></button>)}</details>
    </FlowShell>;
  }
  const index = questions.indexOf(question);
  const required = index < requiredQuestions.length;
  return <FlowShell eyebrow={required ? `QUESTION ${index + 1} / 3` : 'もう少しあなたのこと · 追加質問'} title={question.title} description={question.description} onBack={() => onNavigate(index === 0 ? 'conditions/field' : required ? `diagnosis/${questions[index - 1].id}` : 'diagnosis/ready')}>
    <div className="question-progress" aria-label={required ? `必須の質問 ${index + 1} / 3` : `追加で${Math.max(0,Object.keys(build.answers).length - 3)}問回答済み`}>
      {required ? [0,1,2].map(i => <span key={i} className={i <= index ? 'filled' : ''} />) : <span className="extra-question-count">3問完了・ここからは任意です</span>}
    </div>
    <div className="decision-options" role="group" aria-label={question.title}>{question.options.map(option => <button className="decision-option" key={option.value} aria-pressed={build.answers[question.id] === option.value} onClick={() => onAnswer(question.id,option.value)}><span className="decision-emoji" aria-hidden="true">{option.icon}</span><span className="decision-copy"><strong>{option.label}</strong><span>{option.description}</span></span><ArrowRight size={18} /></button>)}</div>
    {required ? <p className="quiet-note">まずは3問。気になる項目は、あとから何問でも答えられます。</p> : <button className="text-button result-shortcut" onClick={() => onNavigate('discover')}>ここまでの回答でおすすめを見る<ArrowRight size={15} /></button>}
  </FlowShell>;
}

export function DiscoverPage({ build, onSelect, onBack }: { build: FishingBuild; onSelect: (id: string) => void; onBack: () => void; onSample: () => void }) {
  const [query, setQuery] = useState('');
  const [methodId, setMethodId] = useState('');
  const [sort, setSort] = useState('recommended');
  const fish = filterFish(sort === 'popular' ? fishSpecies : rankedFish(build), query, methodId);
  const seasonal = getFish(build.conditions);
  return <FlowShell wide eyebrow="FIND YOUR FISH · 30 TARGETS" title="どの魚に、出会いたい？" description="初心者が岸から狙える30項目。気になる魚を選んで、釣り方を見つけましょう。" onBack={onBack}>
    <ConditionChips build={build} />
    <p className="fish-context-note">{seasonal.length ? `この条件では${seasonal.map(f => f.name).join('・')}の季節の目安があります。ほかの魚も一覧から選べます。` : 'この条件の季節のおすすめは準備中です。全国の対象魚から選び、現地の時期・釣果を確認しましょう。'}</p>
    <div className="fish-toolbar">
      <label className="fish-search"><span>魚の名前・別名で検索</span><span className="fish-search-input"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="アジ、ガシラ、ヤリイカ…" /></span></label>
      <label><span>釣り方で絞り込む</span><select value={methodId} onChange={e => setMethodId(e.target.value)}><option value="">すべての釣り方</option>{methods.filter(m => m.supported).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
      <label><span>並び順</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="recommended">あなたへのおすすめ順</option><option value="popular">有名順</option></select></label>
    </div>
    <p className="fish-result-count" role="status">{fish.length} / {fishSpecies.length}項目を表示<span>近い仲間はまとめています · イカ類を含む</span></p>
    {fish.length ? <div className="fish-grid" role="group" aria-label="狙う魚を選ぶ">{fish.map((f,i) =>
      <button className="fish-card" key={f.id} onClick={() => onSelect(f.id)}>
        <div className={`fish-art ${f.id}`}><FishArtwork species={f.id} />{sort === 'recommended' && i === 0 && seasonal.some(s => s.id === f.id) && <span className="fish-recommend"><Sparkles size={12} />あなたにおすすめ</span>}</div>
        <div className="fish-body">
          <span className="fish-level">{f.difficulty}</span>
          <h2>{f.name}<ArrowRight size={19} /></h2>
          {f.members.length > 0 && <span className="fish-members">{f.members.join('・')}</span>}
          <p>{f.description}</p><p className="fish-personal-reason">{fishReason(build,f.id)}</p>
          <span className="fish-method-tag">この魚の釣り方を見る →</span>
        </div>
      </button>
    )}</div> : <div className="empty-state"><Search size={32} /><h2>一致する魚が見つかりませんでした。</h2><p>名前や釣り方を変えて探してみましょう。</p><button className="button secondary" onClick={() => {setQuery(''); setMethodId('');}}>検索・絞り込みを解除する</button></div>}
    <p className="quiet-note">全国の対象魚一覧です。すべての魚が選択した地域・月・場所で釣れることを示すものではありません。有名順は掲載上の目安です。</p>
    <button className="text-button" onClick={onBack}>質問に戻って、好みを追加する<ArrowRight size={15} /></button>
  </FlowShell>;
}

export function MethodPage({ build, onSelect, onBack }: { build: FishingBuild; onSelect: (id: string) => void; onBack: () => void }) {
  const fish = fishSpecies.find(f => f.id === build.fishId);
  const available = methods.filter(m => fish?.methodIds.includes(m.id));
  return <FlowShell eyebrow="CHOOSE YOUR STYLE" title={`${fish?.name}、どうやって釣る？`} description="楽しみ方を確かめて、釣り方をひとつ選びましょう。" onBack={onBack}>
    {fish && <div className="fish-target-summary"><FishArtwork species={fish.id} /><div><strong>{fish.habitat}</strong><p>{fish.tip}</p></div></div>}
    <div className="decision-options">{available.map(m => {
      const productsAvailable = hasProductGuide({...build, methodId:m.id});
      return <div key={m.id} className="style-choice"><span className="style-art"><Waves size={36} /></span><div><span className={productsAvailable ? 'recommended-tag' : 'neutral-tag'}>{productsAvailable ? '商品を選んで準備' : '準備品と始め方をご案内'}</span><h2>{m.name}</h2><p>{m.description}</p><dl className="style-facts"><div><dt>道具</dt><dd>{productsAvailable ? '8カテゴリをひとつずつ選択' : m.supplies[0]}</dd></div><div><dt>進め方</dt><dd>{productsAvailable ? '商品・組み合わせ・価格を確認' : '必要な道具と基本の手順を確認'}</dd></div></dl><button className="button primary full-width" onClick={() => onSelect(m.id)}>{productsAvailable ? 'この釣り方の道具を選ぶ' : 'この釣り方で準備する'}<ArrowRight size={17} /></button></div></div>;
    })}</div>
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
