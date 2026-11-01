import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Waves } from 'lucide-react';
import type { ReactNode } from 'react';
import { areas, fishingFields } from './catalog';
import { getFish, type FishingConditions } from './domain';
import { regionalGuides } from './guidance';
import { ExternalLinkButton } from './ui';

export function FlowShell({ eyebrow, title, description, onBack, children, wide = false, backLabel='戻る' }: { eyebrow: string; title: string; description: string; onBack: () => void; children: ReactNode; wide?: boolean; backLabel?:string }) {
  return <div className={`container focused-page ${wide ? 'focused-wide' : ''}`}><button className="back-button" onClick={onBack}><ArrowLeft size={16} />{backLabel}</button><div className="focused-heading"><p className="eyebrow">{eyebrow}</p><h1 tabIndex={-1}>{title}</h1><p>{description}</p></div>{children}</div>;
}

export function ConditionsPage({ conditions, field, onChoose, onBack }: { conditions: FishingConditions; field: 'month'|'area'|'field'; onChoose: (value: string) => void; onBack: () => void }) {
  const month = new Date().getMonth() + 1;
  const info = {
    month: { title: '何月に釣りに行く？', description: '行きたい月をひとつ選んでください。', icon: <CalendarDays size={23} /> },
    area: { title: 'どのエリアで釣りをする？', description: '釣りに行きたいエリアを選んでください。', icon: <MapPin size={23} /> },
    field: { title: 'どんな場所で釣ってみたい？', description: 'イメージに近い場所をひとつ選んでください。', icon: <Waves size={23} /> },
  }[field];
  return <FlowShell eyebrow={`PLAN YOUR DAY · ${field === 'month' ? '1' : field === 'area' ? '2' : '3'} / 3`} title={info.title} description={info.description} onBack={onBack}>
    <div className="condition-context">{info.icon}<span>{field === 'month' ? '釣れる魚は季節によって変わります。' : field === 'area' ? `${conditions.month}月の釣りを計画中` : `${conditions.month}月 · ${areas.find(a=>a.id===conditions.area)?.name}`}</span></div>
    {field === 'month' ? <div className="month-decisions" role="group" aria-label="釣りに行く月">{Array.from({length:12},(_,i) => <button key={i} onClick={() => onChoose(String(i+1))}><strong>{i+1}<small>月</small></strong><span>{i+1 === month ? '今月・' : ''}{i+1 >= 4 && i+1 <= 10 ? '東京湾・堤防の時期の目安あり' : '釣れる時期の情報は未掲載'}</span></button>)}</div> : <div className="decision-options" role="group" aria-label={info.title}>{(field === 'area' ? areas.map(a=>({id:a.id,name:a.name,note:`${a.region} · ${getFish({...conditions,area:a.id,field:'pier'}).length ? `${conditions.month}月・堤防で釣れる時期の目安あり` : `${conditions.month}月の情報は未掲載`}`})) : fishingFields.map(f=>({id:f.id,name:f.name,note:f.id==='pier'?'堤防や施設の利用案内を確認して行き先を決める':f.id==='surf'?'砂の海岸。釣りができる場所と波の状態を確認':'海に面した岩場。足場・立入条件・必要装備を確認'}))).map(c => <button key={c.id} className="decision-option" onClick={() => onChoose(c.id)}><span className={`decision-symbol field-symbol ${c.id}`}>{info.icon}</span><span className="decision-copy"><strong>{c.name}</strong><span>{c.note}</span></span><ArrowRight size={18} /></button>)}</div>}
    {field!=='month'&&<p className="quiet-note">どのエリア・月でも道具を選べます。釣れる時期の情報を掲載していない場合は、施設や釣具店で最近の釣果を確認してください。</p>}
    {field==='field'&&<div className="regional-info"><ExternalLinkButton href={regionalGuides[conditions.area]?.url}>{regionalGuides[conditions.area]?.title}</ExternalLinkButton><p>{regionalGuides[conditions.area]?.note}</p></div>}
    <p className="quiet-note">選ぶと保存されます。あとから変更できます。</p>
  </FlowShell>;
}
