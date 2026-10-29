import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Fish, Menu, Waves, X } from "lucide-react";
import { categories, fishSpecies } from "./catalog";
import { createDefaultBuild, decodeBuild, encodeBuild, getFish, isSupported, type FishingBuild, type FishingConditions } from "./domain";
import { SearchPage } from "./SearchPage";
import { DiscoverPage } from "./DiscoverPage";
import { BuilderPage, ChecklistPage } from "./EquipmentPages";
import { Modal } from "./ui";

export type Step = "search" | "discover" | "builder" | "list";
const steps: { id: Step; label: string; short: string }[] = [
  { id: "search", label: "釣りに行く日と場所", short: "条件" },
  { id: "discover", label: "魚と釣り方", short: "釣り方" },
  { id: "builder", label: "道具をそろえる", short: "道具" },
  { id: "list", label: "準備リスト", short: "リスト" },
];
const storageKey = "fun-fishing-build-v1";

function initialize(): { build: FishingBuild; step: Step; message: string } {
  const params = new URLSearchParams(window.location.search);
  const shared = params.get("build");
  let build: FishingBuild | null = null;
  let message = "";
  if (shared !== null) {
    build = decodeBuild(shared);
    message = build ? "共有された道具リストを開きました。" : "共有URLを読み込めませんでした。条件からもう一度お試しください。";
    if (!build) { params.delete("build"); history.replaceState({}, "", `${location.pathname}${params.size ? `?${params}` : ""}#search`); }
  } else {
    try {
      const saved = history.state?.fishingBuild || localStorage.getItem(storageKey);
      if (saved) { build = decodeBuild(saved); if (!build) message = "保存データを読み込めなかったため、新しいプランを用意しました。"; }
    } catch { message = "このブラウザでは自動保存が使えません。構成URLから保存できます。"; }
  }
  const stepId = (location.hash.slice(1) || (shared && build ? "list" : "search")) as Step;
  return { build: build || createDefaultBuild(), step: build && steps.some(s => s.id === stepId) && (stepId === "search" || stepId === "discover" || isSupported(build.conditions)) ? stepId : "search", message };
}

export default function App() {
  const [initial] = useState(initialize);
  const [build, setBuild] = useState(initial.build);
  const [step, setStep] = useState<Step>(initial.step);
  const [toast, setToast] = useState(initial.message);
  const [info, setInfo] = useState<"about" | "areas" | "share" | "reset" | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const savedError = useRef(false);
  const currentIndex = steps.findIndex(s => s.id === step);

  useEffect(() => {
    try { localStorage.setItem(storageKey, encodeBuild(build)); }
    catch { if (!savedError.current) { savedError.current = true; setToast("自動保存が使えません。構成URLをコピーして保存してください。"); } }
    const encoded = encodeBuild(build);
    const params = new URLSearchParams(location.search);
    if (params.has("build")) params.set("build", encoded);
    history.replaceState({ fishingBuild: encoded }, "", `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`);
  }, [build]);
  useEffect(() => {
    const sync = () => {
      const encoded = new URLSearchParams(location.search).get("build") || history.state?.fishingBuild;
      const restored = encoded ? decodeBuild(encoded) : build;
      if (restored) setBuild(restored);
      else setToast("履歴の構成を読み込めませんでした。条件からお試しください。");
      const next = (location.hash.slice(1) || "search") as Step;
      if (restored && steps.some(s => s.id === next) && (next === "search" || next === "discover" || isSupported(restored.conditions))) setStep(next);
      else setStep("search");
      setInfo(null);
    };
    addEventListener("popstate", sync); addEventListener("hashchange", sync);
    return () => { removeEventListener("popstate", sync); removeEventListener("hashchange", sync); };
  }, [build]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 7000); return () => clearTimeout(t); } }, [toast]);

  function navigate(next: Step) {
    if ((next === "builder" || next === "list") && !isSupported(build.conditions)) next = "search";
    history.pushState({ fishingBuild: encodeBuild(build) }, "", `${location.pathname}${location.search}#${next}`);
    setStep(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus());
  }
  function reset() {
    const fresh = createDefaultBuild();
    setBuild(fresh); setInfo(null); setStep("search");
    history.pushState({ fishingBuild: encodeBuild(fresh) }, "", `${location.pathname}#search`);
    setToast("新しいプランをはじめましょう。"); window.scrollTo({ top: 0 });
  }
  function sample() {
    const fresh = createDefaultBuild({ month: 10, area: "tokyo-bay", field: "pier" });
    setBuild(fresh); history.pushState({ fishingBuild: encodeBuild(fresh) }, "", `${location.pathname}${location.search}#discover`); setStep("discover");
    window.scrollTo({ top: 0 }); requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus());
  }
  function search(conditions: FishingConditions) {
    const available = getFish(conditions);
    const next = { ...build, conditions, fishId: available.some(f => f.id === build.fishId) ? build.fishId : available[0]?.id || "", methodId: "sabiki" };
    setBuild(next); history.pushState({ fishingBuild: encodeBuild(next) }, "", `${location.pathname}${location.search}#discover`); setStep("discover");
    window.scrollTo({ top: 0 }); requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus());
  }
  const shareUrl = new URL(location.pathname, location.origin);
  shareUrl.searchParams.set("build", encodeBuild(build)); shareUrl.hash = "list";
  async function copy() {
    try { await navigator.clipboard.writeText(shareUrl.href); setShareStatus("コピーしました"); }
    catch { setShareStatus("コピーできませんでした。下のURLを選択してコピーしてください。"); }
  }
  const selectedFish = fishSpecies.find(f => f.id === build.fishId);

  return <>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById("main-content")?.focus(); }}>本文へスキップ</a>
    <header className="site-header"><div className="header-inner">
      <button className="brand" onClick={() => navigate("search")} aria-label="FUN FISHING その一投を、もっと気軽に。 トップへ"><span className="brand-mark"><Fish size={26} strokeWidth={1.7} /><Waves size={20} strokeWidth={1.5} /></span><span>FUN FISHING<span className="brand-caption">その一投を、もっと気軽に。</span></span></button>
      <nav className={`header-nav ${mobileNav ? "expanded" : ""}`} aria-label="メインナビゲーション">
        <button onClick={() => { setInfo("about"); setMobileNav(false); }}>はじめての方へ</button><button onClick={() => { setInfo("areas"); setMobileNav(false); }}>対応エリア</button>
        <button className="nav-plan" onClick={() => { if (!isSupported(build.conditions)) setToast("まずは対応する釣行条件と釣り方を選んでください。"); navigate("builder"); }}><span className="tiny-dot" />道具リスト<ArrowRight size={15} /></button>
      </nav>
      <button className="icon-button mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="メニュー" aria-expanded={mobileNav}>{mobileNav ? <X /> : <Menu />}</button>
    </div></header>

    {step !== "search" && <div className="stepbar"><nav className="container" aria-label="準備のステップ">{steps.map((s, i) => <button key={s.id} className={`step-item ${i === currentIndex ? "current" : ""} ${i < currentIndex ? "completed" : ""}`} disabled={i > currentIndex} aria-current={i === currentIndex ? "step" : undefined} onClick={() => navigate(s.id)}><span className="step-num">{i < currentIndex ? <Check size={13} /> : i + 1}</span><span className="step-long">{s.label}</span><span className="step-short">{s.short}</span>{i < 3 && <span className="step-line" />}</button>)}</nav></div>}

    <main id="main-content" tabIndex={-1}>
      {step === "search" && <SearchPage conditions={build.conditions} onSearch={search} onSample={sample} />}
      {step === "discover" && <DiscoverPage build={build} onChange={setBuild} onBack={() => navigate("search")} onNext={() => navigate("builder")} />}
      {step === "builder" && <BuilderPage build={build} onChange={setBuild} onBack={() => navigate("discover")} onNext={() => navigate("list")} />}
      {step === "list" && <ChecklistPage build={build} onChange={setBuild} onBack={() => navigate("builder")} onShare={() => { setShareStatus(""); setInfo("share"); }} onReset={() => setInfo("reset")} />}
    </main>

    <footer className="site-footer"><div className="container footer-top"><div><span className="footer-brand"><Fish size={20} />FUN FISHING</span><p>道具選びの先に、たのしい一日を。</p></div><div className="footer-links"><button onClick={() => setInfo("about")}>このサービスについて</button><button onClick={() => setInfo("areas")}>データと対応範囲</button></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Fun Fishing</span><span>プロトタイプ · 価格・在庫は購入先でご確認ください</span></div></footer>

    {toast && <div className="toast" role="status"><Check size={17} /><span>{toast}</span><button className="icon-button" aria-label="通知を閉じる" onClick={() => setToast("")}><X size={16} /></button></div>}
    {info === "about" && <Modal title="はじめての一投を、もっと気軽に。" onClose={() => setInfo(null)}><div className="modal-body prose"><p>FUN FISHINGは、行く時期と場所から、釣り方と道具を選べる準備ツールです。ログインせずに利用できます。</p><ol><li><strong>いつ、どこで？</strong> 釣行条件を選びます。</li><li><strong>何を釣ってみたい？</strong> 魚と釣り方を決めます。</li><li><strong>必要な道具をひとまとめ。</strong> おまかせセットを確認し、必要に応じて変更します。</li><li><strong>準備できたらチェック。</strong> 購入先を確認し、リストを保存・共有できます。</li></ol><p className="muted">組み合わせの確認は公開仕様に基づく目安です。釣果やすべての組み合わせの適合を保証するものではありません。現在は限定シナリオを試せるプロトタイプです。</p><button className="button primary" onClick={() => { setInfo(null); sample(); }}>サンプルで試す<ArrowRight size={17} /></button></div></Modal>}
    {info === "areas" && <Modal title="少しずつ、確かめながら。" onClose={() => setInfo(null)}><div className="modal-body prose"><p>現在は<strong>東京湾の堤防・サビキ釣り</strong>を対象にしています。一般的な季節傾向に基づく提案で、リアルタイムの釣果情報ではありません。</p><p>魚ごとの対応月は検索結果で変わります。データがない季節・エリア・フィールドでは、対応するサンプルをご案内します。</p><h3>情報の扱いについて</h3><ul><li>魚・釣り方：海釣り施設やメーカーの公開資料を参照</li><li>商品：メーカーの仕様を優先し、確認状況を個別に表示</li><li>価格：未取得のため掲載せず、購入先で確認</li><li>イラスト：当サイトのオリジナル。商品実物の写真ではありません</li><li>リンク：通常リンクを使用。架空の提携IDは使用していません</li></ul><p className="small muted">出典・確認状況は各商品の「仕様と出典」から確認できます。釣り場の営業状況、立入規則、天候は釣行前に別途確認してください。</p></div></Modal>}
    {info === "share" && <Modal title="たのしみを、いっしょに。" onClose={() => setInfo(null)}><div className="modal-body"><p className="muted">魚・釣り方・選んだ道具・準備のチェックをURLに保存します。URLを知っている人が同じ構成を開けます。</p><div className="share-preview"><Fish size={30} /><div><strong>{selectedFish?.name}のサビキ釣り</strong><p>{build.conditions.month}月 · 東京湾 · 道具 {categories.filter(c => build.selection[c.id]).length}点</p></div></div><label className="input-label" htmlFor="share-url">構成URL</label><input id="share-url" className="share-input" value={shareUrl.href} readOnly onFocus={e => e.target.select()} /><button className="button primary full-width" onClick={copy}>{shareStatus === "コピーしました" ? <Check size={18} /> : null}{shareStatus === "コピーしました" ? "コピーしました" : "構成URLをコピー"}</button><p className="share-status small" role="status">{shareStatus}</p><p className="small muted">このブラウザにも自動保存されます。個人情報は入力不要です。</p></div></Modal>}
    {info === "reset" && <Modal title="新しいプランをつくりますか？" onClose={() => setInfo(null)}><div className="modal-body"><p>現在の道具選択とチェックをリセットします。残しておきたい場合は、先に構成URLをコピーしてください。</p><div className="button-row"><button className="button secondary" onClick={() => setInfo(null)}><ArrowLeft size={16} />リストに戻る</button><button className="button primary" onClick={reset}>最初からはじめる<ArrowRight size={16} /></button></div></div></Modal>}
  </>;
}
