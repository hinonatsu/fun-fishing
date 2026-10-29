import { useState } from "react";
import { ArrowRight, CalendarDays, Check, CheckCheck, ChevronRight, Fish, MapPin, PackageCheck, Search, ShieldCheck, SlidersHorizontal, Sparkles, Waves } from "lucide-react";
import { areas } from "./catalog";
import type { FishingConditions } from "./domain";
import { FishIllustration } from "./Illustrations";
import { SearchSelect } from "./ui";

export function SearchPage({ conditions, onSearch, onSample }: { conditions: FishingConditions; onSearch: (c: FishingConditions) => void; onSample: () => void }) {
  const [values, setValues] = useState(conditions);
  const [imageFailed, setImageFailed] = useState(false);
  const month = new Date().getMonth() + 1;
  const nextMonth = month % 12 + 1;
  return <>
    <section className="home-hero">
      <div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><span className="tiny-line" />YOUR FIRST CAST STARTS HERE</p><h1 tabIndex={-1}>釣りの準備、<br /><span>迷わずはじめよう。</span></h1><p className="hero-description">いつ、どこで釣る？<br />あなたに合った釣り方と、道具一式が見つかります。</p><div className="hero-benefits"><span><Check size={15} />知識ゼロでも大丈夫</span><span><Check size={15} />必要なものだけ</span></div></div>
      <div className="hero-visual">{imageFailed ? <div className="hero-fallback" role="img" aria-label="海のイメージの代替表示"><Waves size={54} strokeWidth={1} /><span>次の休日を、海のそばで。</span></div> : <img src={`${import.meta.env.BASE_URL}images/harbor.svg`} alt="穏やかな海と、小さな釣り人がいる堤防のオリジナルイラスト" width="1600" height="850" fetchPriority="high" onError={() => setImageFailed(true)} />}<div className="hero-note"><span className="note-icon"><Waves size={21} /></span><div><strong>はじまりは、身近な海から。</strong><span><MapPin size={12} />東京湾・堤防の釣りを提案中</span></div></div><span className="image-caption">A LITTLE PREPARATION, A GREAT DAY OUT.</span></div></div>
      <div className="container search-wrap"><form className="search-bar" aria-label="釣行条件を検索" onSubmit={e => { e.preventDefault(); onSearch(values); }}>
        <SearchSelect label="いつ行く？" icon={<CalendarDays size={21} />} value={String(values.month)} choices={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: i + 1 === month ? `今月（${i + 1}月）` : i + 1 === nextMonth ? `来月（${i + 1}月）` : `${i + 1}月` }))} onChange={v => setValues({ ...values, month: Number(v) })} grid />
        <SearchSelect label="どこで釣る？" icon={<MapPin size={21} />} value={values.area} choices={areas.map(a => ({ value: a.id, label: a.name, group: a.region, note: a.supported ? "対応エリア" : "データ準備中" }))} onChange={v => setValues({ ...values, area: v })} />
        <SearchSelect label="どんな場所？" icon={<Waves size={21} />} value={values.field} choices={[{ value: "pier", label: "堤防", note: "足場の整った海釣り施設など" }, { value: "surf", label: "サーフ（砂浜）", note: "データ準備中" }, { value: "rock", label: "磯", note: "データ準備中" }]} onChange={v => setValues({ ...values, field: v })} />
        <button type="submit" className="search-submit"><Search size={19} />釣り方を見つける<ArrowRight size={17} /></button>
      </form><div className="search-caption"><span><ShieldCheck size={14} />ログイン不要・無料で使えます</span><button className="text-button" onClick={onSample}>まずはサンプルで試す<ChevronRight size={14} /></button></div></div>
    </section>

    <section className="container how-section" aria-labelledby="how-title"><div className="section-heading"><div><p className="eyebrow">LESS GUESSING, MORE FISHING</p><h2 id="how-title">道具選びを、もっと気軽に。</h2></div><p>むずかしい知識は、あとからで大丈夫。<br />釣りに行きたい気持ちを、準備リストに変えましょう。</p></div>
      <div className="how-grid">{[{ icon: <Fish />, title: "釣りたい、が見つかる。", text: "時期と場所から、狙える魚と釣り方を提案。はじめてでも選びやすく。", num: "01" }, { icon: <SlidersHorizontal />, title: "道具の相性まで、わかる。", text: "必要な道具はおまかせで。組み合わせの理由を確かめながら、選び直せます。", num: "02" }, { icon: <PackageCheck />, title: "あとは、ひとつずつ準備。", text: "買うものと持っているものを整理。リストを保存して、友だちにも共有。", num: "03" }].map(item => <article className="how-card" key={item.num}><div className="how-top"><span className="how-icon">{item.icon}</span><span className="how-num">{item.num}</span></div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>

    <section className="container sample-section" aria-labelledby="sample-title"><div className="sample-art"><FishIllustration species="aji" /><span className="sample-art-label">TRACHURUS JAPONICUS</span></div><div className="sample-content"><span className="sample-tag"><Sparkles size={13} />はじめての釣りに</span><h2 id="sample-title">東京湾で、アジを釣ってみよう。</h2><p>小さな針とエサで狙う「サビキ釣り」。<br className="desktop-only" />道具を持っていなくても、準備から一緒にはじめられます。</p><div className="sample-meta"><span><CalendarDays size={14} />10月のサンプル</span><span><Waves size={14} />堤防</span><span><CheckCheck size={14} />おまかせセット付き</span></div><button className="button sample-button" onClick={onSample}>このプランを見てみる<ArrowRight size={17} /></button></div></section>

    <div className="container home-disclosure"><ShieldCheck size={20} /><p>確かめた情報を、わかりやすく。<span>公開資料に基づく季節の提案です。釣果を保証するものではありません。対応範囲を限定して、データを整えています。</span></p></div>
  </>;
}
