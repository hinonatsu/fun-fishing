import { fishSpecies, methods, products, type CategoryId, type Product } from './catalog';
import type { FishingBuild, CompatibilityResult } from './domain';

export const regionalGuides: Record<string,{ title:string; url:string; note:string }> = {
  'tokyo-bay': {title:'大黒海づり施設の公式案内・釣果',url:'https://www.yokohama-fishingpiers.jp/daikoku/',note:'営業・釣り場のルール・直近の釣果・貸出を確認できます。行き先の一例で、釣果の保証ではありません。'},
  'osaka-bay': {title:'南港魚つり園の公式釣果情報',url:'https://nankou-uotsuri-en.com/fishing/',note:'直近の魚と利用案内を確認し、釣れる時期・場所を確かめます。'},
  'suruga-bay': {title:'静岡市公式・広野海岸公園の施設案内',url:'https://www.city.shizuoka.lg.jp/s5984/s005517.html',note:'釣りのできる護岸の施設案内です。季節・釣果情報は掲載範囲外です。'},
};
export const methodGuides: Record<string,{ action:string; effort:string; bait:string; reason:string }> = {
  sabiki:{action:'岸のすぐそばへ仕掛けを下ろし、魚の群れを待つ',effort:'針が付いた完成仕掛けをつなぐ',bait:'カゴへ魚を集めるエサを入れる',reason:'小魚の群れが来ている施設で、最初の一匹を目指す候補です。'},
  float:{action:'水面のウキの動きを見て魚を待つ',effort:'ウキの深さと仕掛けの重さを調整する',bait:'針にエサを付ける',reason:'景色や会話と、ウキの反応を楽しみたい人の比較候補です。'},
  lure:{action:'エサに似せた道具を投げ、巻いて魚を誘う',effort:'投げる・巻く操作を覚える',bait:'生きたエサは使わない',reason:'動きながら探したい・エサに触れにくい釣りを探す人の候補です。'},
  hole:{action:'岩や石の隙間へ仕掛けを下ろす',effort:'短い仕掛けで、引っ掛かりと足場を確認する',bait:'針にエサを付ける',reason:'近い場所を探る候補。立入可能な足場から使います。'},
  bukkomi:{action:'海底へエサを届けて、竿先の反応を待つ',effort:'海底の状態と投げる仕掛けの重さを確認する',bait:'針にエサを付ける',reason:'待つ時間も楽しみたい人の比較候補です。'},
  nage:{action:'砂地へ遠く投げて、魚の反応を待つ',effort:'投げる練習と、周囲の広さ・総重量の確認が必要',bait:'針にエサを付ける',reason:'広い釣り場で、投げる操作を覚えて挑戦する候補です。'},
  'choi-nage':{action:'近くの砂地へ軽い仕掛けを投げる',effort:'近い距離で投げる操作を覚える',bait:'針にエサを付ける',reason:'近い砂地を探りたい人の比較候補です。'},
  dozuki:{action:'中心の糸から枝分かれした針で海底付近を探る',effort:'針付きの完成仕掛けとオモリをつなぐ',bait:'それぞれの針にエサを付ける',reason:'岸の近くで、小さな反応を探りたい人の候補です。'},
  'uki-sabiki':{action:'ウキ付きのサビキを少し沖へ届ける',effort:'投げる重さとウキの深さを調整する',bait:'カゴに魚を集めるエサを入れる',reason:'足元より離れた群れを狙うための比較候補です。'},
  eging:{action:'イカを狙う道具「エギ」を投げて動かす',effort:'投げる・沈める・動かす操作を覚える',bait:'生きたエサは使わない',reason:'イカを狙いたい人の候補。地域の接岸時期を確認します。'},
  hechi:{action:'堤防の壁ぎわへエサを落として探る',effort:'糸の出し方と魚の反応の見分け方を覚える',bait:'針にエサを付ける',reason:'堤防の際を探りたい人の比較候補です。'},
  kago:{action:'魚を集めるエサと針のエサを沖へ届ける',effort:'投げる重さ・ウキ・エサの深さを調整する',bait:'カゴと針の両方にエサを用意する',reason:'沖の群れを狙うため、道具と操作を覚えて挑戦する候補です。'},
};
export interface GlossaryEntry { id:string; term:string; plain:string; detail:string }
export const glossary: GlossaryEntry[] = [
  {id:'G01',term:'ロッド',plain:'釣り竿',detail:'仕掛けを操作する竿です。使うときの長さ、収納時の長さ、対応する重さを別々に確認します。'},
  {id:'G02',term:'リール',plain:'竿の手元に取り付け、糸を巻く道具',detail:'糸が付属する物と、糸を別に用意する物があります。竿への取り付け箇所は実物写真でも確認します。'},
  {id:'G03',term:'メインライン・道糸',plain:'リールに巻く糸',detail:'リールから仕掛けまでをつなぎます。仕掛けの中心の糸や、針につながる糸とは区別します。'},
  {id:'G04',term:'仕掛け',plain:'魚を掛けるために、糸・針・オモリなどをつないだ部分',detail:'道具一式とは別です。このサイトの図では、商品カテゴリごとに対応する部分を色で示します。'},
  {id:'G05',term:'サビキ・足元・下カゴ式',plain:'複数の針が付いた仕掛けを、岸のすぐそばへ下ろす基本形',detail:'下カゴ式は針の並びの下にエサのカゴがある形です。投げる釣りとは分けて、仕掛け図で動かす場所を確認します。'},
  {id:'G06',term:'コマセ・寄せエサ・付けエサ',plain:'魚を集めるエサと、針に付けるエサ',detail:'コマセ・寄せエサは魚を集める用途です。付けエサは針に付けます。カゴに入れる物と針に付ける物を図で区別します。'},
  {id:'G07',term:'オモリ負荷・公称号数',plain:'メーカーが示す、扱うオモリの重さの目安',detail:'公称値は商品に記載された値です。カゴ本体・エサ・接続部品を含む総重量の確認とは別です。未計測の総重量を適合済みとは扱いません。'},
  {id:'G08',term:'竿・針・糸・オモリの「号」',plain:'道具ごとに意味が異なる番号',detail:'「竿3号」「針の大きさ6号」「糸の太さ3号」「オモリ6号」のように対象と一緒に読みます。違う道具の号数をそのまま比較しません。'},
  {id:'G09',term:'ハリス・幹糸・枝糸',plain:'仕掛けの中心の糸と、針につながる糸',detail:'サビキの図では道糸→中心の幹糸→針につながる枝糸（ハリス）の位置を確認できます。竿の適合表記を枝糸へどう適用するかは、メーカーに確認する場合があります。'},
  {id:'G10',term:'ドラグ・結束強度',plain:'リールからの糸の出方の調整と、結び目の強さ',detail:'号数だけでは使用時の強さは決まりません。調整や結び方が初めてなら、選んだ型番を伝えて販売店で実物の扱い方を教わります。'},
  {id:'G11',term:'スピニング・リール脚・固定部分',plain:'竿とリールの方式・取り付ける部分',detail:'リール脚は竿に固定する部分です。方式が一致しても、特定の竿とリールの取り付け寸法まで確認できたとは限りません。商品画面の質問文で相談できます。'},
  {id:'G12',term:'仕舞寸法・小継',plain:'収納したときの長さと、短く収納する竿の構造',detail:'「収納時47cm」のような表示を、電車での移動やバッグに入るかの判断に使います。使用時の全長とは別です。'},
  {id:'G13',term:'3-300・2-300',plain:'釣り竿の型番',detail:'数字の意味を推測せず、その型番の使用時の長さ・収納時の長さ・本体重量・対応する重さを仕様で比較します。'},
  {id:'G14',term:'2500・CF2500',plain:'リールの型番・モデル名',detail:'この掲載のワールドスピン2500は糸付き、CF2500は糸なしです。他製品も同じ名前の規則とは限らないため、商品カードの糸の有無を確認します。'},
  {id:'G15',term:'回遊・接岸',plain:'魚の群れが移動し、岸の近くへ来ること',detail:'群れが来ているかで釣れ方が変わります。季節の一般的な目安と、施設の直近の釣果は分けて確認します。'},
  {id:'G16',term:'潮通し・砂泥底・岩礁・捨て石',plain:'潮の流れや海底・岸ぎわの状態',detail:'砂や泥の底、岩の多い場所などで道具と狙う魚が変わります。施設の釣り場図・現地写真・公式案内を見て確認します。'},
  {id:'G17',term:'サーフ・磯',plain:'砂浜・海に面した岩場',detail:'場所選びでは「砂浜（サーフ）」「岩場（磯）」と表示します。立ち入れる場所か、必要な装備と利用条件も現地の案内で確認します。'},
  {id:'G18',term:'浮き釣り・浮きサビキ・カゴ釣り',plain:'ウキやカゴを使い分ける釣り方',detail:'浮き釣りはウキの反応を見て待つ、浮きサビキはサビキにウキを足す、カゴ釣りは寄せエサと針のエサを届ける形です。図鑑で部品と基本動作を比べられます。'},
  {id:'G19',term:'胴付き・ヘチ釣り・ぶっこみ釣り',plain:'仕掛けの形・狙う場所・待ち方が異なる釣り',detail:'胴付きは中心の糸から針が枝分かれする形、ヘチ釣りは堤防の壁ぎわ、ぶっこみ釣りは海底に届けたエサで待つ釣りです。図鑑で位置を比較できます。'},
  {id:'G20',term:'エギング・エギ・疑似餌',plain:'イカを狙う釣りと、エサに似せた道具',detail:'エギはイカを誘うために使う道具です。ルアーなどの疑似餌も、実際のエサの代わりに動かして魚を誘います。'},
  {id:'G21',term:'玉網・取り込み・ランディングシャフト',plain:'魚をすくう網（たまあみ）と、その柄',detail:'取り込みは水面の魚を手元へ運ぶことです。網と伸縮する柄がセットの商品もあります。足場から水面まで届く長さと、施設の貸出を確認します。'},
  {id:'G22',term:'バッカン・汎用バケツ',plain:'用途を確認して選ぶ容器',detail:'ロープで海へ下ろす水くみ用と、地上で水を入れるバケツは別です。汎用バケツは水くみ用の代わりとして使いません。'},
  {id:'G23',term:'プライヤー・PE・スプリットリング',plain:'針をつかむ道具、糸の種類、交換用の小さな金具',detail:'サビキではまず針外しに使う道具として選びます。PE糸の切断やルアーの金具交換は別の用途なので、対応仕様を別途確認します。'},
  {id:'G24',term:'継数・シャフト455cm',plain:'柄の構造と、伸ばしたときの長さ',detail:'継数は柄が何段に分かれるかという構造の情報です。持ち歩くときは収納時の長さと重さも確認します。収納長が未確認の商品は購入先で確認します。'},
  {id:'G25',term:'Type D・固型式・初期浮力',plain:'ライフジャケットの規格・構造・浮く力の情報',detail:'Type Dは船で使う際の航行区域などに条件がある区分です。これだけで今回の施設への適合は判定できません。体格に合うサイズを衣服の上から試着し、施設・メーカーに利用条件を確認します。'},
  {id:'G26',term:'公称仕様・適合・要確認',plain:'確認できたことと、まだ確認が必要なこと',detail:'メーカーの記載で照合できる範囲と、現物装着・総重量など未確認の範囲を分けています。要確認の項目には、対象と確認先を表示します。'},
  {id:'G27',term:'構成・比較構成',plain:'今回選んだ道具一式・比較用の別の道具一式',detail:'商品と数量の違いを表示し、必要な付属品・買い足しも含めて比べます。性能全体が同じという意味ではありません。'},
  {id:'G28',term:'購入単位・3P・販売単位',plain:'表示価格で買えるパックや個数',detail:'入り数と必要数、購入するパック数を分けます。3Pなどの表記だけで内容を断定せず、購入先の選択サイズ・入り数を確認します。'},
  {id:'G29',term:'集計対象外・取得失敗・自動取得待ち',plain:'最新価格を確認できていない状態',detail:'古い価格は前回の参考値として表示し、今回の確定総額には入れません。未確認は0円として扱わず、確認済みの小計と残る商品数を示します。'},
  {id:'G30',term:'構成URL・コピーして保存',plain:'この買い物リストを開くリンク',detail:'コピー後、メモなどに貼り付けて保管します。このブラウザーへの自動保存とは別です。共有した後の変更は各ブラウザーで独立します。'},
];
export const categoryTerms: Partial<Record<CategoryId,string[]>> = {
  rod:['G01','G07','G08','G12','G13'],reel:['G02','G10','G11','G14'],line:['G03','G08','G10'],rig:['G04','G05','G08','G09'],basket:['G05','G06','G07','G28'],bait:['G06','G28'],bucket:['G07','G22'],safety:['G25','G26'],net:['G21','G24'],pliers:['G23'],cooler:['G28'],float:['G18'],leader:['G03','G09','G10'],chum:['G06'],egi:['G20'],lure:['G20'],sinker:['G07','G08'],shock:['G03','G10'],hook:['G08','G09'],tenbin:['G04'],burakuri:['G04','G19'],stopper:['G18'],swivel:['G04'],snap:['G04'],cushion:['G04'],
};
export function productSummary(p: Product) {
  if(p.category==='pliers') return '魚の口の針をつかんで外す道具。今回の用途に必要な形と大きさを確認します。';
  if(p.category==='net') return '魚をすくう網と、伸縮する柄のセット。水面まで届く長さと収納時の大きさを確認します。';
  return p.summary;
}
export function confirmationHelp(build: FishingBuild, result: CompatibilityResult) {
  const names = result.categoryIds.map(id=>productsName(build,id)).filter(Boolean).join('、');
  const details: Record<string,{how:string;url:string}> = {
    'rod-reel':{how:'竿の固定部分とリール脚の装着を、メーカーまたは販売店に型番を伝えて確認します。',url:'https://faq.globeride.co.jp/?site_domain=default'},
    'rod-rig':{how:'竿の適合ハリス表記をサビキの枝糸にどう適用するか、使用時の調整も含めてメーカーに確認します。',url:'https://faq.globeride.co.jp/?site_domain=default'},
    'total-load':{how:'カゴ本体・入れるエサ・仕掛け・金具の合計を使用状態で確認します。公称オモリ号数だけで判断せず、竿の表記との比べ方を販売店に相談します。',url:'https://www.daiwa.com/jp/beginner/place/sabiki'},
    'safety-fit':{how:'メーカーのサイズ表を確認し、衣服の上から試着します。ベルトの固定と利用環境は施設・メーカーに確認します。',url:'https://bluestorm.jp/contact/'},
  };
  const fallback = {how:'選んだ商品名と、今回の魚・釣り方を購入先に伝えて確認します。',url:'https://www.honda.co.jp/fishing/picture-book/trap/'};
  const detail=details[result.id]||fallback;
  return {...detail,question:`${names || '準備予定の道具'}で、${build.conditions.month}月に${fishSpecies.find(f=>f.id===build.fishId)?.name||'対象魚'}の${methods.find(m=>m.id===build.methodId)?.name||'釣り'}を考えています。「${result.title}」について、${result.reason} この条件で使えるか、確認方法と必要な調整を教えてください。`};
}
function productsName(build: FishingBuild,id:CategoryId) { return products.find(p=>p.id===build.selection[id])?.name || (build.owned.includes(id)?`${id}は手持ち`: ''); }
