import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Fish, Waves, X } from 'lucide-react';
import { type CategoryId } from './catalog';
import { requiredQuestions } from './diagnosis';
import { createDefaultBuild, decodeBuild, encodeBuild, getFish, isSupported, type FishingBuild } from './domain';
import { chosenCount, resolveScreen } from './planner';
import { SearchPage } from './SearchPage';
import { ConditionsPage } from './FlowPages';
import { DiagnosisPage, DiscoverPage, MethodPage } from './DiscoverPage';
import { BuilderPage, EquipmentListPage, ChecklistPage, CheckoutPage, PricePage, ReviewPage, SavePage, ShippingPage } from './EquipmentPages';
import { Modal } from './ui';
import { RigLibraryPage } from './RigLibraryPage';
import { rigById } from './rigs';

const storageKey = 'fun-fishing-build-v1';
const stages = ['釣行条件','あなたの好み','魚と釣り方','道具選び','完成・準備'];
function stageFor(screen: string) {
  return screen === 'search' || screen.startsWith('conditions/') ? 0 : screen.startsWith('diagnosis/') ? 1 : screen === 'discover' || screen === 'method' ? 2 : screen === 'builder' || screen.startsWith('builder/') ? 3 : 4;
}
function initialize() {
  const params = new URLSearchParams(location.search);
  const shared = params.get('build');
  let build: FishingBuild | null = null;
  let message = '';
  if (shared !== null) {
    build = decodeBuild(shared);
    message = build ? '共有された道具リストを開きました。' : '共有URLを読み込めませんでした。条件からもう一度お試しください。';
    if (!build) { params.delete('build'); history.replaceState({},'',`${location.pathname}${params.size ? `?${params}` : ''}#search`); }
  } else {
    try {
      const saved = history.state?.fishingBuild || localStorage.getItem(storageKey);
      if (saved) { build = decodeBuild(saved); if (!build) message = '保存データを読み込めなかったため、新しいプランを用意しました。'; }
    } catch { message = '自動保存が使えません。完成したリストは構成URLで保存できます。'; }
  }
  if (build?.replacedCategories?.length) message = '掲載商品を更新しました。変更した商品の仕様をご確認ください。';
  const restored = build || createDefaultBuild();
  const requested = location.hash.slice(1) || (shared ? 'list' : 'search');
  return { build: restored, screen: build || requested === 'rigs' || requested.startsWith('rigs/') ? resolveScreen(requested,restored) : 'search', message, planId: history.state?.planId || crypto.randomUUID() };
}

export default function App() {
  const [initial] = useState(initialize);
  const [build,setBuild] = useState(initial.build);
  const [screen,setScreen] = useState(initial.screen);
  const [toast,setToast] = useState(initial.message);
  const [info,setInfo] = useState<'about'|'areas'|'reset'|null>(null);
  const [recentCategory,setRecentCategory] = useState<CategoryId>();
  const galleryReturn = useRef<string>(typeof history.state?.rigGalleryReturn === 'string' ? history.state.rigGalleryReturn : 'search');
  const planId = useRef(initial.planId);
  const cache = useRef(new Map<string,FishingBuild>());
  const savedError = useRef(false);

  useEffect(()=>{
    const encoded = encodeBuild(build);
    cache.current.set(planId.current,build);
    try { localStorage.setItem(storageKey,encoded); }
    catch { if (!savedError.current) { savedError.current = true; setToast('自動保存が使えません。完成したリストは構成URLをコピーして保存してください。'); } }
    const params = new URLSearchParams(location.search);
    if (params.has('build')) params.set('build',encoded);
    history.replaceState({fishingBuild:encoded,planId:planId.current,rigGalleryReturn:galleryReturn.current},'',`${location.pathname}${params.size ? `?${params}` : ''}#${screen}`);
  },[build,screen]);

  useEffect(()=>{
    const sync = ()=>{
      const state = history.state;
      if (typeof state?.rigGalleryReturn === 'string') galleryReturn.current = state.rigGalleryReturn;
      const encoded = new URLSearchParams(location.search).get('build') || state?.fishingBuild;
      const restored = cache.current.get(state?.planId) || (encoded ? decodeBuild(encoded) : cache.current.get(planId.current));
      if (restored) { planId.current = state?.planId || crypto.randomUUID(); setBuild(restored); setScreen(resolveScreen(location.hash.slice(1),restored)); }
      else { const fresh = createDefaultBuild(); planId.current = crypto.randomUUID(); setBuild(fresh); setScreen('search'); setToast('履歴を読み込めませんでした。新しいプランを始められます。'); }
      setInfo(null);
      setRecentCategory(undefined);
    };
    addEventListener('popstate',sync);
    return ()=>removeEventListener('popstate',sync);
  },[]);
  useEffect(()=>{
    window.scrollTo({top:0,behavior:'instant'});
    const frame = requestAnimationFrame(()=>document.querySelector<HTMLElement>('main h1')?.focus());
    return ()=>cancelAnimationFrame(frame);
  },[screen]);
  useEffect(()=>{if (toast) {const timer = setTimeout(()=>setToast(''),7000); return ()=>clearTimeout(timer);}},[toast]);

  function navigate(requested: string, next = build) {
    if (requested.startsWith('rigs') && !screen.startsWith('rigs')) galleryReturn.current = screen;
    setRecentCategory(undefined);
    const resolved = resolveScreen(requested,next);
    cache.current.set(planId.current,next);
    const params = new URLSearchParams(location.search);
    if (params.has('build')) params.set('build',encodeBuild(next));
    history.pushState({fishingBuild:encodeBuild(next),planId:planId.current,rigGalleryReturn:galleryReturn.current},'',`${location.pathname}${params.size ? `?${params}` : ''}#${resolved}`);
    setBuild(next); setScreen(resolved); setInfo(null);
  }
  function sample() {
    planId.current = crypto.randomUUID();
    const next = createDefaultBuild({month:10,area:'tokyo-bay',field:'pier'});
    navigate('diagnosis/goal',next);
  }
  function start() {
    planId.current = crypto.randomUUID();
    navigate('conditions/month',createDefaultBuild(build.conditions));
  }
  function condition(value: string) {
    const field = screen.split('/')[1] as 'month'|'area'|'field';
    const conditions = {...build.conditions,[field]:field === 'month' ? Number(value) : value};
    const validFish = getFish(conditions).some(f=>f.id === build.fishId);
    const next = {...build,conditions,fishId:validFish ? build.fishId : '',methodId:validFish ? build.methodId : ''};
    navigate(field === 'month' ? 'conditions/area' : field === 'area' ? 'conditions/field' : isSupported(conditions) ? 'diagnosis/goal' : 'discover',next);
  }
  function answer(id: string, value: string) {
    const next = {...build,answers:{...build.answers,[id]:value}};
    const missing = requiredQuestions.find(q=>!next.answers[q.id]);
    navigate(missing ? `diagnosis/${missing.id}` : 'diagnosis/ready',next);
  }
  function selectGear(next: FishingBuild) {
    navigate('builder',next);
    setRecentCategory(screen.split('/')[1] as CategoryId);
  }
  function reset() {
    planId.current = crypto.randomUUID();
    const fresh = createDefaultBuild();
    history.pushState({fishingBuild:encodeBuild(fresh),planId:planId.current},'',`${location.pathname}#search`);
    setBuild(fresh); setScreen('search'); setInfo(null);
    setToast('新しいプランをはじめましょう。');
  }
  const stage = stageFor(screen);
  const hasProgress = chosenCount(build) > 0 || Object.keys(build.answers).length > 0;
  const shareUrl = new URL(location.pathname,location.origin);
  shareUrl.searchParams.set('build',encodeBuild(build)); shareUrl.hash = 'list';
  const segment = screen.split('/')[1];
  const category = segment as CategoryId;

  return <>
    <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>本文へスキップ</a>
    <header className="site-header"><div className="header-inner"><button className="brand" onClick={()=>navigate('search')} aria-label="FUN FISHING その一投を、もっと気軽に。 トップへ"><span className="brand-mark"><Fish size={26} strokeWidth={1.7} /><Waves size={20} strokeWidth={1.5} /></span><span>FUN FISHING<span className="brand-caption">その一投を、もっと気軽に。</span></span></button><div className="focused-header-links"><button onClick={()=>setInfo('about')}>使い方</button>{hasProgress && screen === 'search' ? <button className="text-button" onClick={()=>navigate('builder')}>プランの続きへ<ArrowRight size={15} /></button> : <span><Check size={13} />自動保存</span>}</div></div></header>
    {screen !== 'search' && !screen.startsWith('rigs') && <div className="journey-progress"><ol className="container" aria-label="準備のステップ">{stages.map((label,i)=><li key={label} className={i === stage ? 'current' : i < stage ? 'completed' : ''} aria-current={i === stage ? 'step' : undefined}><span>{i < stage ? <Check size={12} /> : i+1}</span><strong>{label}</strong></li>)}</ol></div>}
    <main id="main-content" tabIndex={-1}>
      {screen === 'search' && <SearchPage onStart={start} onSample={sample} />}
      {screen.startsWith('conditions/') && <ConditionsPage key={screen} conditions={build.conditions} field={segment as 'month'|'area'|'field'} onChoose={condition} onBack={()=>navigate(segment === 'month' ? 'search' : segment === 'area' ? 'conditions/month' : 'conditions/area')} />}
      {screen.startsWith('diagnosis/') && <DiagnosisPage key={screen} build={build} questionId={segment} onAnswer={answer} onNavigate={navigate} />}
      {screen === 'discover' && <DiscoverPage build={build} onSelect={id=>navigate('method',{...build,fishId:id,methodId:build.fishId === id ? build.methodId : ''})} onBack={()=>navigate(isSupported(build.conditions) ? 'diagnosis/ready' : 'conditions/field')} onSample={sample} />}
      {screen === 'method' && <MethodPage build={build} onSelect={id=>navigate('builder',{...build,methodId:id})} onBack={()=>navigate('discover')} />}
      {screen === 'builder' && <EquipmentListPage build={build} onNavigate={navigate} recentCategory={recentCategory} onBack={()=>navigate('method')} />}
      {screen.startsWith('builder/') && <BuilderPage key={screen} build={build} category={category} onSelect={selectGear} onNavigate={navigate} onBack={()=>navigate('builder')} />}
      {screen.startsWith('rigs') && <RigLibraryPage key={screen} rig={rigById(segment) || rigById('sabiki')!} onNavigate={navigate} onBack={()=>navigate(galleryReturn.current)} />}
      {screen === 'review' && <ReviewPage build={build} onNavigate={navigate} onBack={()=>navigate('builder')} />}
      {screen.startsWith('prices/') && <PricePage key={screen} build={build} category={category} onSave={next=>navigate('review',next)} onBack={()=>navigate('review')} />}
      {screen === 'shipping' && <ShippingPage build={build} onSave={next=>navigate('review',next)} onBack={()=>navigate('review')} />}
      {screen === 'checkout' && <CheckoutPage onNavigate={navigate} onBack={()=>navigate('review')} />}
      {screen === 'save' && <SavePage shareUrl={shareUrl.href} onBack={()=>navigate('checkout')} />}
      {screen === 'list' && <ChecklistPage build={build} onChange={setBuild} onNavigate={navigate} onBack={()=>navigate('checkout')} />}
    </main>
    <footer className="site-footer"><div className="container focused-footer"><span>© {new Date().getFullYear()} FUN FISHING</span><div><button onClick={()=>navigate('rigs/sabiki')}>仕掛け図鑑</button><button onClick={()=>setInfo('areas')}>対応エリア・データ</button>{screen !== 'search' && <button onClick={()=>setInfo('reset')}>新しいプランをつくる</button>}</div></div></footer>
    {toast && <div className="toast" role="status"><InfoIcon /><span>{toast}</span><button className="icon-button" aria-label="通知を閉じる" onClick={()=>setToast('')}><X size={16} /></button></div>}
    {info === 'about' && <Modal title="一画面ずつ、あなたの釣りを。" onClose={()=>setInfo(null)}><div className="modal-body prose"><ol><li>時期・エリア・場所を、ひとつずつ選びます。</li><li>まず3問に回答。もっと答えることもできます。</li><li>魚と釣り方を、それぞれ選びます。</li><li>おすすめを参考に、道具8カテゴリをすべて自分で選びます。</li><li>価格を比べて、購入先の確認やリストの保存へ。</li></ol><p>商品は自動選択しません。公開仕様の確認範囲は商品ごとに表示します。完成したリストは専用URLで保存でき、会員登録は不要です。</p></div></Modal>}
    {info === 'areas' && <Modal title="対応エリアとデータについて" onClose={()=>setInfo(null)}><div className="modal-body prose"><p>現在は東京湾・堤防のサビキ釣りに対応しています。イワシ・小サバは4〜10月、アジは5〜10月の一般的な季節傾向を使っています。</p><p>商品は14点、道具は8カテゴリです。Amazon価格を毎朝取得し、取得日時とともに表示します。取得した購入単位の税込金額で比較でき、手入力した価格があれば優先します。取得失敗や36時間を超えた価格は合計に使いません。送料・在庫は購入先で確認してください。未入力を0円と扱ったり、実測していない節約額を表示したりしません。</p><p>組み合わせは公開仕様の範囲で確認します。現物装着や総重量、結束強度、体格への適合には未確認の項目があります。季節データは直近の釣果を保証するものではありません。</p><p>画像はオリジナルのイラストです。購入先はAmazonの個別商品ページです。</p></div></Modal>}
    {info === 'reset' && <Modal title="新しいプランをつくりますか？" onClose={()=>setInfo(null)}><div className="modal-body"><p>現在の選択を残す場合は、先に完成したリストの構成URLを保存してください。</p><div className="button-row"><button className="button secondary" onClick={()=>setInfo(null)}>今のプランに戻る</button><button className="button primary" onClick={reset}>最初からはじめる<ArrowRight size={16} /></button></div></div></Modal>}
  </>;
}

function InfoIcon() { return <Check size={17} />; }
