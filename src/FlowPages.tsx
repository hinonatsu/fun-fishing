import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Waves } from 'lucide-react';
import type { ReactNode } from 'react';
import { areas, fishingFields } from './catalog';
import type { FishingConditions } from './domain';

export function FlowShell({ eyebrow, title, description, onBack, children, wide = false }: { eyebrow: string; title: string; description: string; onBack: () => void; children: ReactNode; wide?: boolean }) {
  return <div className={`container focused-page ${wide ? 'focused-wide' : ''}`}><button className="back-button" onClick={onBack}><ArrowLeft size={16} />戻る</button><div className="focused-heading"><p className="eyebrow">{eyebrow}</p><h1 tabIndex={-1}>{title}</h1><p>{description}</p></div>{children}</div>;
}

export function ConditionsPage({ conditions, field, onChoose, onBack }: { conditions: FishingConditions; field: 'month'|'area'|'field'; onChoose: (value: string) => void; onBack: () => void }) {
  const month = new Date().getMonth() + 1;
  const info = {
    month: { title: 'いつ、海に出かけよう？', description: '行きたい月をひとつ選んでください。', icon: <CalendarDays size={23} /> },
    area: { title: 'どのエリアで楽しみたい？', description: '行きたい海をひとつ選んでください。', icon: <MapPin size={23} /> },
    field: { title: 'どんな場所で釣ってみたい？', description: 'イメージに近い場所をひとつ選んでください。', icon: <Waves size={23} /> },
  }[field];
  return <FlowShell eyebrow={`PLAN YOUR DAY · ${field === 'month' ? '1' : field === 'area' ? '2' : '3'} / 3`} title={info.title} description={info.description} onBack={onBack}>
    <div className="condition-context">{info.icon}<span>{field === 'month' ? '季節から、出会える魚が変わります。' : field === 'area' ? `${conditions.month}月の釣りを計画中` : `${conditions.month}月 · ${areas.find(a=>a.id===conditions.area)?.name}`}</span></div>
    {field === 'month' ? <div className="month-decisions" role="group" aria-label="釣りに行く月">{Array.from({length:12},(_,i) => <button key={i} onClick={() => onChoose(String(i+1))}><strong>{i+1}<small>月</small></strong><span>{i+1 === month ? '今月' : i+1 >= 4 && i+1 <= 10 ? '東京湾のデータあり' : 'データ準備中'}</span></button>)}</div> : <div className="decision-options" role="group" aria-label={info.title}>{(field === 'area' ? areas.map(a=>({id:a.id,name:a.name,note:`${a.region} · ${a.supported ? '対応エリア' : 'データ準備中'}`})) : fishingFields.map(f=>({id:f.id,name:f.name,note:f.supported ? '足場の整った施設など · 対応中' : 'データ準備中'}))).map(c => <button key={c.id} className="decision-option" onClick={() => onChoose(c.id)}><span className="decision-symbol">{info.icon}</span><span className="decision-copy"><strong>{c.name}</strong><span>{c.note}</span></span><ArrowRight size={18} /></button>)}{field === 'field' && <button className="decision-option" onClick={() => onChoose('pier')}><span className="decision-symbol"><Waves size={23} /></span><span className="decision-copy"><strong>おすすめの場所から始める</strong><span>対応中の堤防・海釣り施設をご案内</span></span><ArrowRight size={18} /></button>}</div>}
    <p className="quiet-note">ひとつ選ぶと、次の画面へ進みます。あとから戻って変更できます。</p>
  </FlowShell>;
}
