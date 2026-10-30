import { ArrowRight, CalendarDays, MapPin, Sparkles, Waves } from 'lucide-react';
import { areas, fishSpecies, methods } from './catalog';
import { questions, requiredQuestions } from './diagnosis';
import { getFish, type FishingBuild } from './domain';
import { fishReason, nextQuestion, rankedFish } from './planner';
import { FishIllustration } from './Illustrations';
import { FlowShell } from './FlowPages';
import { Notice } from './ui';

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

export function DiscoverPage({ build, onSelect, onBack, onSample }: { build: FishingBuild; onSelect: (id: string) => void; onBack: () => void; onSample: () => void }) {
  const fish = rankedFish(build);
  return <FlowShell wide eyebrow="FIND YOUR FISH" title={fish.length ? 'どの魚に、出会いたい？' : 'この条件は、データを準備中です。'} description={fish.length ? '回答と季節から、おすすめを並べました。気になる魚をひとつ選んでください。' : '確認できた情報がある条件から、釣りの準備を始められます。'} onBack={onBack}>
    <ConditionChips build={build} />
    {!getFish(build.conditions).length ? <div className="empty-state"><Waves size={42} /><h2>10月の東京湾で、試してみませんか。</h2><p>現在は東京湾・堤防の4〜10月に対応しています。アジは5〜10月です。</p><button className="button primary" onClick={onSample}>対応する条件で診断を始める<ArrowRight size={17} /></button></div> : <>
      <div className="fish-grid" role="group" aria-label="狙う魚を選ぶ">{fish.map((f,i) => <button className="fish-card" key={f.id} onClick={() => onSelect(f.id)}><div className={`fish-art ${f.id}`}><FishIllustration species={f.id as 'aji'|'iwashi'|'saba'} />{i === 0 && <span className="fish-recommend"><Sparkles size={12} />あなたにおすすめ</span>}</div><div className="fish-body"><span className="fish-level">{f.difficulty}</span><h2>{f.name}<ArrowRight size={19} /></h2><p>{f.description}</p><p className="fish-personal-reason">{fishReason(build,f.id)}</p><span className="fish-method-tag">この魚の釣り方を見る →</span></div></button>)}</div>
      <p className="quiet-note">季節の目安です。直近の釣果予測ではありません。道具代は、商品を選びながら確認できます。</p>
      <button className="text-button" onClick={onBack}>質問に戻って、好みを追加する<ArrowRight size={15} /></button>
    </>}
  </FlowShell>;
}

export function MethodPage({ build, onSelect, onBack }: { build: FishingBuild; onSelect: (id: string) => void; onBack: () => void }) {
  const fish = fishSpecies.find(f => f.id === build.fishId);
  const available = methods.filter(m => fish?.methodIds.includes(m.id));
  return <FlowShell eyebrow="CHOOSE YOUR STYLE" title={`${fish?.name}、どうやって釣る？`} description="楽しみ方を確かめて、釣り方をひとつ選びましょう。" onBack={onBack}>
    {build.answers.pace === 'active' && <Notice>動きながら探す釣りを希望していますね。現在、道具まで案内できるのは足元を狙うサビキ釣りです。</Notice>}
    <div className="decision-options">{available.map(m => <div key={m.id} className={`style-choice ${!m.supported ? 'unavailable' : ''}`}><span className="style-art"><Waves size={36} /></span><div><span className={m.supported ? 'recommended-tag' : 'neutral-tag'}>{m.supported ? '基本の釣り方' : '道具データ準備中'}</span><h2>{m.name}</h2><p>{m.description}</p>{m.supported && <dl className="style-facts"><div><dt>楽しみ方</dt><dd>足元に下ろして、魚の反応を待つ</dd></div><div><dt>道具</dt><dd>8カテゴリをひとつずつ選択</dd></div><div><dt>予算</dt><dd>{/^\d+$/.test(build.answers.budget || '') ? `${Number(build.answers.budget).toLocaleString()}円を目安に比較` : '商品を選びながら確認'}</dd></div></dl>}{m.supported && <button className="button primary full-width" onClick={() => onSelect(m.id)}>この釣り方の道具を選ぶ<ArrowRight size={17} /></button>}</div></div>)}</div>
  </FlowShell>;
}
