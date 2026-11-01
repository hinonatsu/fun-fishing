import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Fish, Waves, X } from 'lucide-react';
import { fishSpecies, products, type CategoryId } from './catalog';
import { questions, requiredQuestions } from './diagnosis';
import { createDefaultBuild, decodeBuild, encodeBuild, hasProductGuide, type FishingBuild } from './domain';
import { chosenCount, resolveScreen, switchFishingPlan } from './planner';
import { SearchPage } from './SearchPage';
import { ConditionsPage } from './FlowPages';
import { DiagnosisPage, DiscoverPage, FishGuidePage, MethodPage } from './DiscoverPage';
import { BuilderPage, EquipmentListPage, ChecklistPage, CheckoutPage, PricePage, ReviewPage, SavePage, ShippingPage } from './EquipmentPages';
import { Modal } from './ui';
import { RigLibraryPage } from './RigLibraryPage';
import { rigById } from './rigs';
import { AnalyticsProvider } from './AnalyticsTracking';
import { BatchPricePage, BudgetPage, TripPage } from './PlanningPages';
import { GlossaryList } from './Support';

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
    } catch { message = '自動保存が使えません。完成したリストはリストのURLで保存できます。'; }
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
  const [info,setInfo] = useState<'about'|'areas'|'reset'|'glossary'|null>(null);
  const [recentCategory,setRecentCategory] = useState<CategoryId>();
  const galleryReturn = useRef<string>(typeof history.state?.rigGalleryReturn === 'string' ? history.state.rigGalleryReturn : 'search');
  const planId = useRef(initial.planId);
  const cache = useRef(new Map<string,FishingBuild>());
  const savedError = useRef(false);
  const editReturn = useRef<string | undefined>(undefined);
  const preferenceReturn = useRef<string | undefined>(undefined);
  const returnPaths = useRef<Record<string,string>>(history.state?.returnPaths||{});

  useEffect(()=>{
    const encoded = encodeBuild(build);
    cache.current.set(planId.current,build);
    try { localStorage.setItem(storageKey,encoded); }
    catch { if (!savedError.current) { savedError.current = true; setToast('自動保存が使えません。完成したリストはリストのURLをコピーして保存してください。'); } }
    const params = new URLSearchParams(location.search);
    if (params.has('build')) params.set('build',encoded);
    history.replaceState({fishingBuild:encoded,planId:planId.current,rigGalleryReturn:galleryReturn.current,returnPaths:returnPaths.current},'',`${location.pathname}${params.size ? `?${params}` : ''}#${screen}`);
  },[build,screen]);

  useEffect(()=>{
    const sync = ()=>{
      const state = history.state;
      if (typeof state?.rigGalleryReturn === 'string') galleryReturn.current = state.rigGalleryReturn;
      returnPaths.current = state?.returnPaths||{};
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
    const frame = requestAnimationFrame(()=>{
      if(screen==='builder'&&recentCategory) {
        const row=document.querySelector<HTMLElement>(`tr[data-category="${recentCategory}"]`);
        row?.scrollIntoView({block:'center',behavior:'instant'});
        row?.querySelector<HTMLElement>('button')?.focus({preventScroll:true});
      } else { window.scrollTo({top:0,behavior:'instant'});document.querySelector<HTMLElement>('main h1')?.focus({preventScroll:true}); }
    });
    return ()=>cancelAnimationFrame(frame);
  },[screen,recentCategory]);
  useEffect(()=>{if (toast) {const timer = setTimeout(()=>setToast(''),7000); return ()=>clearTimeout(timer);}},[toast]);

  function navigate(requested: string, next = build, returning = false) {
    if (requested.startsWith('rigs') && !screen.startsWith('rigs')) galleryReturn.current = screen;
    setRecentCategory(requested==='builder'&&screen.startsWith('builder/')?screen.split('/')[1] as CategoryId:undefined);
    if(requested.startsWith('conditions/')&&!screen.startsWith('conditions/')&&screen!=='search'&&Object.keys(build.answers).length)editReturn.current=screen;
    if(requested==='diagnosis/ready'&&!screen.startsWith('diagnosis/')&&screen!=='search')preferenceReturn.current=screen;
    const returnKey=requested.startsWith('prices/')?'prices':requested;
    if(!returning&&['save','trip','prices','shipping','budget'].includes(returnKey)&&!screen.startsWith(returnKey))returnPaths.current[returnKey]=screen;
    const resolved = resolveScreen(requested,next);
    cache.current.set(planId.current,next);
    const params = new URLSearchParams(location.search);
    if (params.has('build')) params.set('build',encodeBuild(next));
    history.pushState({fishingBuild:encodeBuild(next),planId:planId.current,rigGalleryReturn:galleryReturn.current,returnPaths:returnPaths.current},'',`${location.pathname}${params.size ? `?${params}` : ''}#${resolved}`);
    setBuild(next); setScreen(resolved); setInfo(null);
  }
  function sample() {
    editReturn.current=undefined;preferenceReturn.current=undefined;returnPaths.current={};
    planId.current = crypto.randomUUID();
    const next = createDefaultBuild({month:10,area:'tokyo-bay',field:'pier'});
    navigate('diagnosis/goal',next);
  }
  function start() {
    editReturn.current=undefined;preferenceReturn.current=undefined;returnPaths.current={};
    planId.current = crypto.randomUUID();
    navigate('conditions/month',createDefaultBuild(build.conditions));
  }
  function condition(value: string) {
    const field = screen.split('/')[1] as 'month'|'area'|'field';
    const conditions = {...build.conditions,[field]:field === 'month' ? Number(value) : value};
    const validFish = fishSpecies.some(f=>f.id === build.fishId);
    const clearTripDate=field==='month'&&!!build.preparation?.tripDate&&Number(build.preparation.tripDate.slice(5,7))!==Number(value);
    const next = {...build,conditions,fishId:validFish ? build.fishId : '',methodId:validFish ? build.methodId : '',...(clearTripDate?{preparation:{...build.preparation,tripDate:undefined}}:{})};
    if(clearTripDate)setToast('釣行月を変更したため、以前の釣行日は未定に戻しました。人数・日程から登録できます。');
    const target=editReturn.current;
    if(target){editReturn.current=undefined;navigate(target,next,true);}
    else navigate(field === 'month' ? 'conditions/area' : field === 'area' ? 'conditions/field' : 'diagnosis/goal',next);
  }
  function answer(id: string, value: string) {
    const next = {...build,answers:{...build.answers,[id]:value}};
    const missing = requiredQuestions.find(q=>!next.answers[q.id]);
    const index=questions.findIndex(q=>q.id===id);
    navigate(missing ? `diagnosis/${missing.id}` : !build.answers[id]&&index>=requiredQuestions.length&&questions[index+1]?`diagnosis/${questions[index+1].id}`:'diagnosis/ready',next);
  }
  function selectGear(next: FishingBuild) {
    navigate('builder',next);
    setRecentCategory(screen.split('/')[1] as CategoryId);
  }
  function reset() {
    editReturn.current=undefined;preferenceReturn.current=undefined;returnPaths.current={};
    planId.current = crypto.randomUUID();
    const fresh = createDefaultBuild();
    history.pushState({fishingBuild:encodeBuild(fresh),planId:planId.current},'',`${location.pathname}#search`);
    setBuild(fresh); setScreen('search'); setInfo(null);
    setToast('新しいプランを作成しました。');
  }
  const stage = stageFor(screen);
  const hasProgress = chosenCount(build) > 0 || Object.keys(build.answers).length > 0;
  const shareUrl = new URL(location.pathname,location.origin);
  shareUrl.searchParams.set('build',encodeBuild(build)); shareUrl.hash = 'list';
  const segment = screen.split('/')[1];
  const category = segment as CategoryId;
  const backTo=(key:string,fallback='review')=>()=>navigate(returnPaths.current[key]||fallback,build,true);

  return <AnalyticsProvider screen={screen} fishId={build.fishId} methodId={build.methodId}>
    <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>本文へスキップ</a>
    <header className="site-header"><div className="header-inner"><button className="brand" onClick={()=>navigate('search')} aria-label="FUN FISHING その一投を、もっと気軽に。 トップへ"><span className="brand-mark"><Fish size={26} strokeWidth={1.7} /><Waves size={20} strokeWidth={1.5} /></span><span>FUN FISHING<span className="brand-caption">その一投を、もっと気軽に。</span></span></button><div className="focused-header-links"><button onClick={()=>setInfo('about')}>使い方</button><button onClick={()=>setInfo('glossary')}>用語</button>{hasProgress && screen === 'search' ? <button className="text-button" onClick={()=>navigate('builder')}>プランの続きへ<ArrowRight size={15} /></button> : <span title="このブラウザーに自動保存します"><Check size={13} />自動保存</span>}</div></div></header>
    {screen !== 'search' && !screen.startsWith('rigs') && <div className="journey-progress" role="navigation" aria-label="準備の進み具合"><ol className="container" aria-label="準備のステップ">{stages.map((label,i)=><li key={label} className={i === stage ? 'current' : i < stage ? 'completed' : ''} aria-current={i === stage ? 'step' : undefined}><button aria-label={i<stage?label:`${i+1} ${label}`} disabled={i>stage} onClick={()=>navigate(['conditions/month','diagnosis/ready','discover','builder','review'][i])}><span>{i < stage ? <Check size={12} /> : i+1}</span><strong>{label}</strong></button></li>)}</ol></div>}
    <main id="main-content" tabIndex={-1}>
      {screen === 'search' && <SearchPage onStart={start} onSample={sample} />}
      {screen.startsWith('conditions/') && <ConditionsPage key={screen} conditions={build.conditions} field={segment as 'month'|'area'|'field'} onChoose={condition} onBack={()=>navigate(segment === 'month' ? 'search' : segment === 'area' ? 'conditions/month' : 'conditions/area')} />}
      {screen.startsWith('diagnosis/') && <DiagnosisPage key={screen} build={build} questionId={segment} onAnswer={answer} onNavigate={navigate} onFinish={preferenceReturn.current?()=>{const target=preferenceReturn.current!;preferenceReturn.current=undefined;navigate(target,build,true);}:undefined} />}
      {screen === 'discover' && <DiscoverPage build={build} onSelect={id=>navigate('method',switchFishingPlan(build,id,build.fishId === id ? build.methodId : ''))} onBack={()=>navigate('diagnosis/ready')} onNavigate={navigate} onSample={sample} />}
      {screen === 'method' && <MethodPage build={build} onSelect={id=>navigate('builder',switchFishingPlan(build,build.fishId,id))} onBack={()=>navigate('discover')} />}
      {screen === 'builder' && (hasProductGuide(build) ? <EquipmentListPage build={build} onChange={setBuild} onNavigate={navigate} recentCategory={recentCategory} onBack={()=>navigate('method')} /> : <FishGuidePage build={build} onBack={()=>navigate('method')} />)}
      {screen.startsWith('builder/') && <BuilderPage key={screen} build={build} category={category} onSelect={selectGear} onNavigate={navigate} onBack={()=>navigate('builder')} />}
      {screen.startsWith('rigs') && <RigLibraryPage key={screen} rig={rigById(segment) || rigById('sabiki')!} onNavigate={navigate} onBack={()=>navigate(galleryReturn.current)} />}
      {screen === 'review' && <ReviewPage build={build} onChange={setBuild} onNavigate={navigate} onBack={()=>navigate('builder')} />}
      {screen.startsWith('prices/') && <PricePage key={screen} build={build} category={category} onSave={next=>navigate(returnPaths.current.prices||'review',next,true)} onBack={backTo('prices')} />}
      {screen === 'prices' && <BatchPricePage build={build} onSave={next=>navigate(returnPaths.current.prices||'review',next,true)} onBack={backTo('prices')} />}
      {screen === 'trip' && <TripPage build={build} onSave={next=>navigate(returnPaths.current.trip||'builder',next,true)} onBack={backTo('trip','builder')} />}
      {screen === 'budget' && <BudgetPage build={build} onChange={setBuild} onNavigate={navigate} onBack={backTo('budget','builder')} />}
      {screen === 'shipping' && <ShippingPage build={build} onSave={next=>navigate(returnPaths.current.shipping||'review',next,true)} onBack={backTo('shipping')} />}
      {screen === 'checkout' && <CheckoutPage onNavigate={navigate} onBack={()=>navigate('review')} />}
      {screen === 'save' && <SavePage shareUrl={shareUrl.href} onBack={backTo('save','checkout')} backLabel={returnPaths.current.save==='list'?'買い物リストに戻る':'元の画面に戻る'} />}
      {screen === 'list' && <ChecklistPage build={build} onChange={setBuild} onNavigate={navigate} onBack={()=>navigate('checkout')} />}
    </main>
    <footer className="site-footer"><div className="container focused-footer"><span>© {new Date().getFullYear()} FUN FISHING</span><div><button onClick={()=>navigate('rigs/sabiki')}>仕掛け図鑑</button><button onClick={()=>setInfo('areas')}>対応エリア・データ</button>{screen !== 'search' && <button onClick={()=>setInfo('reset')}>新しいプランをつくる</button>}</div></div></footer>
    {toast && <div className="toast" role="status"><InfoIcon /><span>{toast}</span><button className="icon-button" aria-label="通知を閉じる" onClick={()=>setToast('')}><X size={16} /></button></div>}
    {info === 'about' && <Modal title="このサイトの使い方" onClose={()=>setInfo(null)}><div className="modal-body prose"><ol><li>時期・エリア・場所を、ひとつずつ選びます。</li><li>楽しみ方・過ごし方・予算の3問に答えます。追加の質問は任意です。</li><li>魚と釣り方を、それぞれ選びます。</li><li>釣り方に必要な道具を、商品ごとに比較して選びます。</li><li>数量と費用を確認し、買い物リストを保存・共有できます。</li></ol><p>選んだ内容は、このブラウザーに自動保存されます。別の端末で開くには、リストのURLをメモなどに保存するか、QRコードや共有機能を使ってください。会員登録は不要です。道具の組み合わせについて、メーカーの仕様で確認できたことと、購入前に確認が必要なことを表示します。</p></div></Modal>}
    {info === 'glossary' && <Modal title="釣りの言葉と道具の役割" onClose={()=>setInfo(null)}><div className="modal-body"><GlossaryList/></div></Modal>}
    {info === 'areas' && <Modal title="対応エリアとデータについて" onClose={()=>setInfo(null)}><div className="modal-body prose"><p>岸から狙える魚やイカを紹介しています。12種類の釣り方から、それぞれに必要な道具を選べます。釣れる時期の目安を掲載しているのは、東京湾の堤防で狙うイワシ・小サバ（4〜10月）とアジ（5〜10月）です。ほかの地域・時期も道具選びに使えますが、実際に何が釣れているかは施設や釣具店で確認してください。</p><p>商品は{products.length}点。必要な道具は対象魚・釣り方で切り替わります。Amazon価格を毎朝取得し、取得日時とともに表示します。商品ページに表示された税込価格で比較します。手入力した価格があれば、そちらを使います。取得できなかった価格や、取得から36時間を超えた価格は合計に含めず、価格が分かる商品の小計を表示します。送料・在庫は購入先で確認してください。</p><p>道具の組み合わせはメーカーなどの公開情報で確認しています。竿へのリールの取り付け、エサを含む仕掛け全体の重さ、糸の結び目の強さ、ライフジャケットのサイズなどは、実物や使い方に合わせて販売店で確認してください。</p><p>画像はオリジナルのイラストです。購入先はAmazonの個別商品ページです。</p></div></Modal>}
    {info === 'reset' && <Modal title="新しいプランをつくりますか？" onClose={()=>setInfo(null)}><div className="modal-body"><p>現在の選択を残す場合は、先に完成したリストのリストのURLを保存してください。</p><div className="button-row"><button className="button secondary" onClick={()=>setInfo(null)}>今のプランに戻る</button><button className="button primary" onClick={reset}>最初からはじめる<ArrowRight size={16} /></button></div></div></Modal>}
  </AnalyticsProvider>;
}

function InfoIcon() { return <Check size={17} />; }
