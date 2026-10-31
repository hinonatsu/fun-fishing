import { useId, useState } from 'react';
import { ArrowRight, BookOpen, Info } from 'lucide-react';
import { FlowShell } from './FlowPages';
import { RigDiagram } from './RigDiagram';
import { rigs, type RigDefinition, type RigPartId } from './rigs';
import { ExternalLinkButton } from './ui';

export function RigLibraryPage({ rig, onNavigate, onBack }: { rig: RigDefinition; onNavigate: (screen: string) => void; onBack: () => void }) {
  const [activePart, setActivePart] = useState<RigPartId>();
  const detailId = useId();
  const current = rig.parts.find(p => p.id === activePart);
  return <FlowShell wide eyebrow="A LITTLE GUIDE TO FISHING RIGS" title="仕掛けのつながりを、図で。" description="12種類の釣り方を、ひとつずつ。気になる釣り方を選ぶと、道具のつながりを見られます。" onBack={onBack}>
    <div className="rig-library-choices" role="group" aria-label="12種類の釣り方">{rigs.map((item, index) => <button key={item.id} className={rig.id === item.id ? 'is-active' : ''} aria-pressed={rig.id === item.id} aria-label={`${item.name}の仕掛けを見る`} onClick={() => onNavigate(`rigs/${item.id}`)}><RigDiagram rig={item} miniature /><span><small>{String(index + 1).padStart(2, '0')}</small><strong>{item.name}</strong></span></button>)}</div>
    <article className="rig-library-detail" aria-label={`${rig.name}の仕掛け図解`}>
      <div className="rig-library-visual"><div className="rig-library-visual-heading"><p className="eyebrow">THE WHOLE PICTURE</p><span>基本形の一例</span></div><RigDiagram rig={rig} activePart={activePart} /><p>番号は右の道具名と対応します。長さ・大きさの比率は省略しています。</p></div>
      <div className="rig-library-explanation"><p className="eyebrow">{rig.variant}</p><h2>{rig.name}</h2><p className="rig-library-summary">{rig.summary}</p><div className="rig-connection" aria-label="仕掛けの接続順">{rig.connection.map((label, i) => <span key={label}>{i > 0 && <ArrowRight size={11} aria-hidden="true" />}{label}</span>)}</div>
        <h3>道具の名前から、位置を確認</h3><ol className="rig-library-parts">{rig.parts.map((p, i) => <li key={p.id}><button aria-pressed={activePart === p.id} aria-controls={detailId} onClick={() => setActivePart(p.id)}><span>{i + 1}</span>{p.label}</button></li>)}</ol>
        <div id={detailId} className="rig-part-explanation" role="status"><Info size={17} aria-hidden="true" /><p><strong>{current ? current.label : '気になる道具を押してみよう'}</strong>{current ? current.description : '図の中の位置が強調され、道具の役割を確認できます。'}</p></div>
        {rig.note && <p className="rig-library-note">{rig.note}</p>}
        <details className="rig-references"><summary><BookOpen size={14} aria-hidden="true" />図解の参考にした資料</summary><p>Web画像検索と以下の解説を参照し、接続関係を独自のSVGで描いています。画像の転載・トレースはしていません。</p>{rig.sources.map(source => <ExternalLinkButton key={source.url} href={source.url}>{source.title}</ExternalLinkButton>)}</details>
      </div>
    </article>
    <p className="rig-library-scope">このページは仕掛けの基本形を知るための図鑑です。全12釣法で、魚と釣り方を選ぶと必要な道具の商品選択・価格確認へ進めます。対象魚や商品によって構成・針の本数は変わります。</p>
  </FlowShell>;
}
