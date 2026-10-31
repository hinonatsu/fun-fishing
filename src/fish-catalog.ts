import type { FishSpecies, FishingMethod } from './catalog';

const daiwa = (page: string) => `https://www.daiwa.com/jp/beginner/place/${page}`;
const sabiki = daiwa('sabiki');
const floating = daiwa('uminouki');
const casting = daiwa('nage');
const lure = 'https://begood-funegg.jackall.co.jp/how-to-good/article33/';
const squid = 'https://www.yamaria.co.jp/yamashita/naory/detail/1';

/** Popularity order is an editorial ordering agreed with the user, not a survey. */
export const targetFish: FishSpecies[] = [
  { id:'aji', name:'アジ', members:['マアジ','マルアジ','ムロアジ'], aliases:['鯵','アオアジ'], description:'群れを寄せて足元から。サビキで狙う、はじめての一匹の定番です。', difficulty:1, months:[5,6,7,8,9,10], methodIds:['sabiki','uki-sabiki','float','lure','kago'], sourceUrl:sabiki, habitat:'全国の堤防・港。種類により分布が異なります。', tip:'まずは小アジの回遊がある堤防で、足元のサビキから。' },
  { id:'saba', name:'サバ', members:['マサバ','ゴマサバ'], aliases:['鯖','小サバ'], description:'群れが回ればサビキで狙えます。小サバの元気な引きを楽しみましょう。', difficulty:1, months:[4,5,6,7,8,9,10], methodIds:['sabiki','uki-sabiki','float','lure','kago'], sourceUrl:sabiki, habitat:'全国の堤防・港。回遊情報が目安です。', tip:'初心者は小サバから。群れのいる深さを探します。' },
  { id:'iwashi', name:'イワシ', members:['マイワシ','カタクチイワシ','ウルメイワシ'], aliases:['鰯','シコイワシ'], description:'小さな群れとの出会いを楽しむ釣り。回遊している港でサビキを下ろします。', difficulty:1, months:[4,5,6,7,8,9,10], methodIds:['sabiki','uki-sabiki'], sourceUrl:sabiki, habitat:'全国の堤防・港。群れの接岸時に狙います。', tip:'小さな口に合う小針のサビキを使いましょう。' },
  { id:'madai', name:'マダイ', members:[], aliases:['真鯛','タイ','チャリコ'], description:'小〜中型から挑戦する人気の魚。岸から狙える場所と時期選びが大切です。', difficulty:3, months:[], methodIds:['kago','bukkomi','float'], sourceUrl:floating, habitat:'潮通しのよい堤防・磯。岸からの釣果がある場所を選びます。', tip:'初心者は遠投を競わず、足場のよい釣り場の小〜中型から。' },
  { id:'buri', name:'ブリの若魚', members:['ワカシ','イナダ','ハマチ'], aliases:['ブリ','鰤','ツバス','ワラサ','メジロ'], description:'小型の青物をルアーやカゴで。回遊している時期を選んで挑戦します。', difficulty:2, months:[], methodIds:['lure','kago'], sourceUrl:lure, habitat:'全国の潮通しのよい堤防・海岸。回遊には地域差があります。', tip:'対象は若魚。大型ブリ向けの道具や難しい磯場は別の準備が必要です。' },
  { id:'hirame', name:'ヒラメ', members:[], aliases:['平目','鮃'], description:'砂地に潜む魚をルアーで探します。釣れている海岸を選ぶところから。', difficulty:3, months:[], methodIds:['lure'], sourceUrl:daiwa('hirame_magochi_lure'), habitat:'全国の砂浜・砂地に面した堤防。', tip:'一か所で待ち続けず、地形の変化を探してルアーを通します。' },
  { id:'karei', name:'カレイ', members:['マコガレイ','イシガレイ','マガレイ','クロガシラガレイ'], aliases:['鰈','クロガレイ','スナガレイ','ヌマガレイ'], description:'砂泥底へエサを届け、竿先の反応を待つ釣り。地域ごとに狙える種類が違います。', difficulty:2, months:[], methodIds:['choi-nage','nage','bukkomi'], sourceUrl:casting, habitat:'砂泥底の堤防・海岸。北日本では対象種が増えます。', tip:'最初は岸近くで釣果のある場所を選び、ちょい投げで狙います。' },
  { id:'tsutsuika', name:'ツツイカ', members:['スルメイカ','ヤリイカ','ケンサキイカ','ヒイカ'], aliases:['ジンドウイカ','槍烏賊','剣先烏賊','マルイカ'], description:'小型のエギで誘うイカ釣り。種類ごとの接岸期に、港から狙えます。', difficulty:2, months:[], methodIds:['eging'], sourceUrl:squid, habitat:'各地の港。種類ごとに分布・接岸期・狙う深さが異なります。', tip:'初心者はヒイカなどの接岸情報を確認し、種類に合う小型エギを選びます。' },
  { id:'suzuki', name:'スズキ', members:['セイゴ','フッコ'], aliases:['シーバス','鱸','ハネ'], description:'河口や港の小型から。エサ釣りでもルアーでも狙える身近な魚です。', difficulty:2, months:[], methodIds:['float','bukkomi','lure'], sourceUrl:lure, habitat:'全国の河口・内湾・港。', tip:'まずはセイゴ・フッコサイズを、足場のよい岸から狙いましょう。' },
  { id:'sawara', name:'サワラの若魚', members:['サゴシ'], aliases:['サワラ','鰆','サゴチ'], description:'小魚を追って回るサゴシをルアーで。回遊情報が頼りになります。', difficulty:2, months:[], methodIds:['lure'], sourceUrl:lure, habitat:'各地の堤防・海岸。群れが岸へ寄る時期が狙い目です。', tip:'サゴシサイズが対象。歯で糸を傷めるため、リーダーをこまめに確認します。' },
  { id:'anago', name:'マアナゴ', members:[], aliases:['アナゴ','穴子'], description:'日暮れからエサを底へ置いて待つ釣り。近い距離でも狙えます。', difficulty:2, months:[], methodIds:['bukkomi','choi-nage'], sourceUrl:casting, habitat:'各地の内湾・港の砂泥底。', tip:'明るいうちに足場を確認し、夜釣りが認められた場所で準備します。' },
  { id:'kanpachi', name:'カンパチの若魚', members:['ショゴ','シオ'], aliases:['カンパチ','間八','ネリゴ'], description:'小型でも力強い青物。港へ回遊している若魚を狙います。', difficulty:2, months:[], methodIds:['lure','kago'], sourceUrl:lure, habitat:'暖かい海域の堤防・港。幼魚の回遊時に狙います。', tip:'大型のカンパチではなく、小型のショゴ・シオから始めましょう。' },
  { id:'hokke', name:'ホッケ', members:[], aliases:['𩸽'], description:'北日本で人気の岸釣り対象魚。群れが接岸するとウキやサビキで狙えます。', difficulty:1, months:[], methodIds:['float','sabiki','nage'], sourceUrl:'https://fishland.jp/2021/03/%E6%98%A5%E9%87%A3%E3%82%8A%E9%96%8B%E5%B9%95-%E6%97%A5%E6%9C%AC%E6%B5%B7%E3%83%9B%E3%83%83%E3%82%B1%EF%BC%86%E3%82%AB%E3%83%AC%E3%82%A4%E9%87%A3%E3%82%8A%E6%83%85%E5%A0%B1/', habitat:'主に北海道・北日本の堤防や港。', tip:'接岸情報を確認し、足場のよい港で群れを狙います。' },
  { id:'nishin', name:'ニシン', members:[], aliases:['鰊','鯡'], description:'北日本の港で群れを待つサビキ釣り。回遊の有無で釣果が変わります。', difficulty:1, months:[], methodIds:['sabiki'], sourceUrl:'https://fishland.jp/?p=107728', habitat:'主に北海道など北日本の港。', tip:'地域の釣具店で群れの情報と、合うサビキの針サイズを確認します。' },
  { id:'kawahagi', name:'カワハギ', members:['カワハギ','ウマヅラハギ'], aliases:['皮剥','ウマヅラ'], description:'足元の胴付き仕掛けで小さなアタリを探す釣り。エサ付けも楽しめます。', difficulty:2, months:[], methodIds:['dozuki'], sourceUrl:'https://fish.shimano.com/ja-JP/content/beginners/fishingstyle/baitfishing/saguri/index.html', habitat:'各地の堤防の際や、岩礁が混じる場所。', tip:'エサを小さく付け、底を取ってからゆっくり探ります。' },
  { id:'tachiuo', name:'タチウオ', members:[], aliases:['太刀魚'], description:'夕方からの電気ウキやルアーで。港へ寄る時期に挑戦します。', difficulty:2, months:[], methodIds:['float','lure'], sourceUrl:'https://www.ishiguro-gr.com/know/fishing-guide/detail.php?id=10', habitat:'各地の湾・堤防。接岸期の夕方〜夜が中心です。', tip:'電気ウキとタチウオ用仕掛けを使用。針外し用のプライヤーを準備します。' },
  { id:'kisu', name:'シロギス', members:[], aliases:['キス','鱚','シロキス'], description:'近くの砂地をちょい投げで探る定番。軽い仕掛けから始められます。', difficulty:1, months:[], methodIds:['choi-nage','nage'], sourceUrl:casting, habitat:'全国の砂浜・砂地に面した堤防。', tip:'遠くへ投げるより、近くで釣れている砂地を探すのが近道です。' },
  { id:'mebaru', name:'メバル', members:['アカメバル','クロメバル','シロメバル','エゾメバル'], aliases:['眼張','ガヤ'], description:'堤防の際や海藻の周りを探ります。小さなエサやルアーで誘います。', difficulty:2, months:[], methodIds:['float','dozuki','lure'], sourceUrl:floating, habitat:'各地の堤防・岩礁。エゾメバルは主に北日本です。', tip:'足元の障害物や海藻の周辺を、ゆっくり探ってみましょう。' },
  { id:'kasago', name:'カサゴ', members:[], aliases:['ガシラ','アラカブ','笠子'], description:'足元の岩の陰をエサで探る釣り。胴付きや穴釣りで狙う定番です。', difficulty:1, months:[], methodIds:['dozuki','hole','lure'], sourceUrl:'https://www.daiwa.com/jp/column/fish_field_guide/sea/test', habitat:'各地の堤防の捨て石・岩礁の隙間。', tip:'足場のよい岸から届く隙間を探ります。消波ブロックに乗る必要はありません。' },
  { id:'kurodai', name:'クロダイ', members:['クロダイ','キチヌ'], aliases:['チヌ','キビレ','黒鯛','黄茅渟'], description:'港や河口で身近に狙えるタイの仲間。小〜中型から基本を覚えます。', difficulty:3, months:[], methodIds:['float','bukkomi','lure','hechi'], sourceUrl:floating, habitat:'各地の内湾・河口・堤防。種類により分布が異なります。', tip:'最初は小〜中型の実績がある釣り場で、エサ釣りから始めましょう。' },
  { id:'aoriika', name:'アオリイカ', members:[], aliases:['障泥烏賊','モイカ','ミズイカ'], description:'エギを動かして誘う人気のイカ釣り。初心者は秋の小型から。', difficulty:3, months:[], methodIds:['eging'], sourceUrl:'https://www.yamaria.co.jp/yamashita/kingdom/wall.html', habitat:'主に暖かい海域の港・堤防・藻場周辺。', tip:'秋の接岸情報を確認し、小型に合うエギと穏やかな場所を選びます。' },
  { id:'kouika', name:'コウイカ', members:['コウイカ','カミナリイカ','シリヤケイカ'], aliases:['スミイカ','モンゴウイカ','紋甲烏賊'], description:'海底付近をエギで探るイカ釣り。港内の砂泥底が狙い目です。', difficulty:2, months:[], methodIds:['eging'], sourceUrl:'https://www.yamaria.co.jp/yamashita/support/detail/39', habitat:'各地の港・堤防の砂泥底。種類により時期・分布が違います。', tip:'エギを底まで沈め、根掛かりに気を付けながら小さく誘います。' },
  { id:'shimaaji', name:'シマアジ', members:[], aliases:['縞鯵'], description:'堤防へ寄る小型を狙います。群れがいればサビキやウキで挑戦できます。', difficulty:2, months:[], methodIds:['float','sabiki','kago'], sourceUrl:'https://www.daiwa.com/jp/special/products/reel/23legalis/legalis-life03', habitat:'主に暖かい海域の潮通しのよい堤防。', tip:'岸に寄る小型が対象。近くで釣れているかを確認して出かけましょう。' },
  { id:'isaki', name:'イサキ', members:[], aliases:['伊佐木','ウリボウ'], description:'小型が岸に寄る時期を選び、浮きサビキやカゴで群れを狙います。', difficulty:2, months:[], methodIds:['uki-sabiki','kago','float'], sourceUrl:floating, habitat:'主に暖かい海域の潮通しのよい堤防・磯。', tip:'初心者は岸近くの小型から。船の大型イサキとは道具が異なります。' },
  { id:'haze', name:'ハゼ', members:['マハゼ','ウロハゼ'], aliases:['鯊','沙魚'], description:'河口の浅い砂泥底で楽しむちょい投げ。はじめてのエサ釣りにも。', difficulty:1, months:[], methodIds:['choi-nage','float','dozuki'], sourceUrl:casting, habitat:'各地の河口・内湾の浅い砂泥底。', tip:'近くへ軽く投げ、小さなアタリを感じながら底を探します。' },
  { id:'bora', name:'ボラ', members:[], aliases:['鯔','イナ','イナッコ'], description:'港や河口で見かける身近な魚。小さなエサを浮かせて狙います。', difficulty:2, months:[], methodIds:['float'], sourceUrl:'https://www.daiwa.com/jp/column/fish_field_guide/sea/042', habitat:'全国の河口・内湾・港。', tip:'見えていても簡単とは限りません。軽いウキ仕掛けでエサを自然に流します。' },
  { id:'ainame', name:'アイナメ', members:['アイナメ','クジメ'], aliases:['鮎並','アブラコ'], description:'堤防の石や岩の周辺を探る釣り。足元のエサ釣りから挑戦できます。', difficulty:2, months:[], methodIds:['dozuki','choi-nage','hole'], sourceUrl:casting, habitat:'各地の岩礁・堤防の捨て石周辺。', tip:'仕掛けが引っ掛からないよう、底を取りながら少しずつ探ります。' },
  { id:'sayori', name:'サヨリ', members:[], aliases:['細魚','針魚'], description:'水面近くを泳ぐ群れを、専用の小さな針とウキで狙います。', difficulty:2, months:[], methodIds:['float'], sourceUrl:'https://www.honda.co.jp/fishing/picture-book/sayori/trap01/', habitat:'各地の内湾・堤防の表層。群れの接岸時が狙い目です。', tip:'普通の大きな針ではなく、サヨリ用の小針・ウキ仕掛けを使いましょう。' },
  { id:'kamasu', name:'カマス', members:['アカカマス','ヤマトカマス'], aliases:['魳'], description:'港に集まる群れを小型ルアーで。専用サビキでも狙えます。', difficulty:2, months:[], methodIds:['lure','sabiki'], sourceUrl:lure, habitat:'各地の港・堤防。小魚の集まる場所を回遊します。', tip:'小型ルアーかカマス専用サビキを選びます。アジ用仕掛けをそのまま流用しません。' },
  { id:'mejina', name:'メジナ', members:['メジナ','クロメジナ'], aliases:['グレ','クロ','口太','尾長'], description:'堤防の小〜中型から始めるウキ釣り。エサを自然に流して誘います。', difficulty:2, months:[], methodIds:['float','kago'], sourceUrl:floating, habitat:'各地の堤防・磯の岩礁周り。', tip:'まずは堤防の小〜中型から。大型の磯釣りは経験を積んでから。' },
];

export const targetMethods: FishingMethod[] = [
  { id:'sabiki', name:'サビキ釣り', description:'コマセを入れたカゴと小さな針が並ぶ仕掛けを、足元に下ろして群れを狙います。', beginner:true, supported:true, supplies:['サビキに合う竿・リール・道糸','魚の口に合うサビキ仕掛け','竿の負荷に合うカゴ','アミエビなどのコマセ'], steps:['回遊情報と、狙う魚に合う針の大きさを確認する','コマセを入れた仕掛けを足元へ静かに下ろす','少し動かしてコマセを出し、群れの深さで反応を待つ'], sourceUrl:sabiki },
  { id:'float', name:'浮き釣り', description:'ウキでエサの深さを決め、ウキの動きを見ながら魚を待つ釣りです。', beginner:true, supported:true, supplies:['対象魚に合う竿・リール・道糸','ウキ・ウキ止め・ガン玉','ハリス・針・サルカン','対象魚に合う付けエサ'], steps:['対象魚に合うウキ仕掛けとエサを選ぶ','エサの深さを合わせ、穏やかな場所へ入れる','ウキの変化を見て、エサの状態と深さを調整する'], sourceUrl:floating },
  { id:'lure', name:'ルアー釣り', description:'小魚などに似せた疑似餌を投げ、巻く・止める動きで魚を誘います。', beginner:true, supported:true, supplies:['魚・ルアーの重さに合う竿とリール','道糸・リーダー','対象魚に合うルアー','スナップ・プライヤー'], steps:['魚の大きさと場所に合うルアーを選ぶ','周囲を確認して投げ、狙う深さまで沈める','まずは一定の速さで巻き、反応に合わせて深さを変える'], sourceUrl:lure },
  { id:'hole', name:'穴釣り', description:'足場のよい岸から届く岩の隙間へ、エサ付きの仕掛けをそっと下ろします。', beginner:true, supported:true, supplies:['短めの竿・リール・道糸','竿の負荷に合うブラクリ','魚の切り身・虫エサなど','針外し・魚ばさみ'], steps:['立ち入り可能な足場から届く隙間を選ぶ','エサ付きのブラクリをゆっくり下ろす','底付近を探り、反応がなければ別の隙間へ移る'], sourceUrl:'https://www.daiwa.com/jp/column/fish_field_guide/sea/test' },
  { id:'bukkomi', name:'ぶっこみ釣り', description:'エサとオモリを海底へ届け、竿先の反応を待ちます。', beginner:true, supported:true, supplies:['対象魚とオモリに合う竿・リール・道糸','中通しオモリ・サルカン','ハリス・針・対象魚に合うエサ','竿掛け・針外し'], steps:['魚の大きさに合う仕掛けとエサを準備する','周囲を確認し、仕掛けを底へ届ける','道糸のたるみを取り、竿先の反応を待つ'], sourceUrl:'https://www.daiwa.com/jp/special/bkg/' },
  { id:'nage', name:'投げ釣り', description:'天秤とエサ付きの仕掛けを投げ、沖の砂泥底を探ります。', beginner:true, supported:true, supplies:['投げる重さに合う投げ竿とリール','道糸・必要な力糸','天秤・オモリ・投げ仕掛け','虫エサ・指保護用品'], steps:['竿・糸・オモリを合わせ、投げられる場所を選ぶ','周囲の人と後方を確認して投げる','底を探るか置き竿で待ち、エサを定期的に確認する'], sourceUrl:casting },
  { id:'choi-nage', name:'ちょい投げ釣り', description:'軽い天秤と短い仕掛けで、岸近くの底を探るエサ釣りです。', beginner:true, supported:true, supplies:['軽いオモリを投げられる竿・リール','道糸・小型天秤・オモリ','短めのちょい投げ仕掛け','アオイソメ・ジャリメなど'], steps:['竿の負荷に合う軽い仕掛けを準備する','周囲を確認し、近くの砂地へ軽く投げる','ゆっくり底を探り、小さな反応を待つ'], sourceUrl:casting },
  { id:'dozuki', name:'胴付き', description:'一番下にオモリ、その上にエサ付きの枝針。堤防の足元を探ります。', beginner:true, supported:true, supplies:['足元を探れる竿・リール・道糸','対象魚に合う胴付き仕掛け','竿の負荷に合う下オモリ','虫エサ・エビ・切り身など'], steps:['魚の口に合う針とエサを選ぶ','仕掛けを足元へ下ろし、静かに底を取る','少し持ち上げて反応を待ち、広い範囲を探る'], sourceUrl:'https://fish.shimano.com/ja-JP/content/beginners/fishingstyle/baitfishing/saguri/index.html' },
  { id:'uki-sabiki', name:'浮きサビキ', description:'サビキにウキを加え、少し沖や一定の深さにいる群れを狙います。', beginner:true, supported:true, supplies:['投げる総重量に合う竿・リール・道糸','ウキ・ウキ止め・シモリ玉','サビキ仕掛け・カゴ','アミエビなどのコマセ'], steps:['ウキの浮力と、カゴ・エサを含む総重量を合わせる','群れの深さにウキ下を合わせ、周囲を確認して入れる','時々誘ってコマセを出し、反応する深さを探る'], sourceUrl:sabiki },
  { id:'eging', name:'エギング', description:'イカに合うサイズのエギを動かし、沈んでいく間も反応を見ます。', beginner:true, supported:true, supplies:['エギの重さに合う竿とリール','道糸・リーダー','狙うイカに合うエギ','スナップ・取り込み用具'], steps:['狙うイカの接岸情報とエギのサイズを確認する','投げて狙う深さまで沈め、小さく動かして誘う','糸を見ながら沈め直し、重さや糸の変化を捉える'], sourceUrl:squid },
  { id:'hechi', name:'ヘチ釣り', description:'岸壁の際へ軽いオモリとエサを落とし、糸や穂先の変化でアタリを取ります。', beginner:true, supported:true, supplies:['ヘチ釣りに合う竿・リール・道糸','ハリス・針・ガン玉','カニ・貝・虫エサなど','玉網・針外し'], steps:['足場のよい岸壁で、エサを自然に落とせる場所を選ぶ','岸壁に沿ってゆっくりエサを落とす','糸や穂先の変化を見て、広い範囲を探る'], sourceUrl:'https://www.honda.co.jp/fishing/enjoy/report/hechi/index.html' },
  { id:'kago', name:'カゴ釣り', description:'ウキとコマセカゴを使い、寄せエサと付けエサを同じ深さへ届けます。', beginner:true, supported:true, supplies:['カゴの総重量に合う竿・リール・道糸','ウキ・ウキ止め・天秤・カゴ','対象魚に合うハリスと針','コマセ・付けエサ'], steps:['遠投可能な釣り場で、ウキとカゴの仕掛けを合わせる','狙う深さを決め、周囲を確認して投げる','コマセを出して付けエサを同調させ、ウキの変化を待つ'], sourceUrl:'https://www.gamakatsu.co.jp/column/entokago/' },
  // Preserve validation of old unsupported IDs without presenting another style.
  { id:'ajing', name:'アジング', description:'アジを狙う小型ルアーの釣り。ルアー釣りとして案内します。', beginner:false, supported:false, supplies:[], steps:[], sourceUrl:lure },
];

export function normalizeFishSearch(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s+/g, '');
}

export function filterFish(fish: FishSpecies[], query: string, methodId = '') {
  const normalized = normalizeFishSearch(query);
  const eligible = fish.filter(f => !methodId || f.methodIds.includes(methodId));
  const names = (f: FishSpecies) => [f.name,...f.members,...f.aliases].map(normalizeFishSearch);
  const exact = normalized ? eligible.filter(f => names(f).includes(normalized)) : [];
  return exact.length ? exact : eligible.filter(f => !normalized || names(f).some(name => name.includes(normalized)));
}
