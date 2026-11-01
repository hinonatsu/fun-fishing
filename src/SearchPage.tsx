import { ArrowRight, Check, Fish, Sparkles, Waves } from 'lucide-react';

export function SearchPage({ onStart, onSample }: { onStart: () => void; onSample: () => void }) {
  return <section className="welcome-page">
    <div className="welcome-ocean"><img src={`${import.meta.env.BASE_URL}images/harbor.svg`} alt="穏やかな海と堤防で釣りを楽しむ人のイラスト" width="1600" height="850" /></div>
    <div className="container welcome-content">
      <p className="eyebrow"><Waves size={17} /> YOUR NEXT DAY BY THE SEA</p>
      <h1 tabIndex={-1}>次の休日、<br />何を釣ろう。</h1>
      <p className="welcome-description">釣りたい魚と釣り方を選んで、<br />必要な道具を比較できます。</p>
      <button className="button primary welcome-start" onClick={onStart}>釣りのプランをつくる<ArrowRight size={19} /></button>
      <p className="welcome-assurance"><Check size={14} />釣りが初めてでも使えます・ログイン不要</p>
      <button className="text-button welcome-sample" onClick={onSample}><Sparkles size={15} />10月・東京湾のサンプルで始める</button>
    </div>
    <div className="welcome-caption"><Fish size={18} /><p>道具選びから当日の準備まで。<span>買う物と持っていく物をリストにまとめられます。</span></p></div>
  </section>;
}
