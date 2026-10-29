/** Curated sample data. See docs/DATA_SOURCES.md; no live price or stock feed. */
export type CategoryId = 'rod' | 'reel' | 'line' | 'rig' | 'basket' | 'bait' | 'bucket' | 'safety';
export type VerificationStatus = 'verified' | 'partial';
export interface Area { id: string; name: string; region: string; supported: boolean }
export interface FishingField { id: string; name: string; supported: boolean }
export interface FishSpecies { id: string; name: string; description: string; difficulty: string; months: number[]; methodIds: string[]; sourceUrl: string }
export interface Seasonality { fishId: string; areaId: string; fieldId: string; months: number[]; sourceUrl: string; note: string }
export interface FishingMethod { id: string; name: string; description: string; beginner: boolean; supported: boolean }
export interface EquipmentCategory { id: CategoryId; label: string; necessity: 'required' | 'recommended' | 'optional'; description: string }
export interface ProductSpecification {
  rodMinWeight?: number; rodMaxWeight?: number; rodMinLeader?: number; rodMaxLeader?: number;
  reelNylon3Capacity?: number; nylonCapacity?: Record<number, number>; lineSize?: number;
  lineLength?: number; spoolLength?: number; basketWeight?: number; basketWeightG?: number;
  rigMainSize?: number; rigBranchSize?: number; hookSize?: number; includedLine?: string;
}
export interface RetailOffer { retailer: string; url: string; price: null; linkStatus: 'content-confirmed' | 'indexed-only'; checkedAt: string }
export interface VerificationRecord { checkedAt: string; status: VerificationStatus; sourceUrl: string; note: string }
export interface Product {
  id: string; category: CategoryId; name: string; brand: string; summary: string; reason: string;
  specs: string[]; sourceUrl: string; purchaseUrl?: string; verification: VerificationStatus;
  price: null; generic?: boolean; localOnly?: boolean; technical: ProductSpecification;
  offer: RetailOffer; record: VerificationRecord; jan: string;
}
export interface AlternativeProduct { productId: string; replacesId: string; conditions: string[]; limits: string[] }
export const VERIFIED_AT = '2026-10-30';

export const areas: Area[] = [
  { id: 'tokyo-bay', name: '東京湾', region: '関東', supported: true },
  { id: 'osaka-bay', name: '大阪湾', region: '関西', supported: false },
  { id: 'suruga-bay', name: '駿河湾', region: '中部', supported: false },
];
export const fishingFields: FishingField[] = [
  { id: 'pier', name: '堤防・海釣り施設', supported: true },
  { id: 'surf', name: 'サーフ', supported: false },
  { id: 'rock', name: '磯', supported: false },
];
const fishSource = 'https://www.honda.co.jp/fishing/enjoy/season/season-201707/';
export const fishSpecies: FishSpecies[] = [
  { id: 'aji', name: 'アジ', description: '群れを寄せて、足元から。はじめての一匹を狙う定番です。', difficulty: '初心者向け', months: [5,6,7,8,9,10], methodIds: ['sabiki', 'ajing'], sourceUrl: fishSource },
  { id: 'iwashi', name: 'イワシ', description: '小さな群れとの出会いを楽しむ釣り。回遊情報が頼りです。', difficulty: '初心者向け', months: [4,5,6,7,8,9,10], methodIds: ['sabiki'], sourceUrl: fishSource },
  { id: 'saba', name: 'サバ', description: '小サバの元気な引きが魅力。群れが来たら手返しよく。', difficulty: '少し慣れてから', months: [4,5,6,7,8,9,10], methodIds: ['sabiki'], sourceUrl: fishSource },
];
export const seasonality: Seasonality[] = fishSpecies.map(fish => ({ fishId: fish.id, areaId: 'tokyo-bay', fieldId: 'pier', months: fish.months, sourceUrl: fishSource, note: '関東の一般的な季節傾向を東京湾の試作シナリオに限定して使用。直近の釣果予測ではありません。' }));
export const methods: FishingMethod[] = [
  { id: 'sabiki', name: 'サビキ釣り', description: 'エサを入れたカゴと、小さな針が並ぶ仕掛けを足元に下ろす釣り方。投げずに狙えます。', beginner: true, supported: true },
  { id: 'ajing', name: 'アジング', description: '小さなルアーを動かしてアジを誘う釣り方。専用の道具が必要です。道具提案は準備中です。', beginner: false, supported: false },
];
export const categories: EquipmentCategory[] = [
  { id: 'rod', label: 'ロッド', necessity: 'required', description: '釣り竿。重さの合うカゴを使います。' },
  { id: 'reel', label: 'リール', necessity: 'required', description: '糸を巻いて魚を引き寄せる道具です。' },
  { id: 'line', label: 'メインライン', necessity: 'required', description: 'リールに巻く糸。150mを巻く想定です。' },
  { id: 'rig', label: 'サビキ仕掛け', necessity: 'required', description: '小さな針が並んだ、魚を掛ける部分です。' },
  { id: 'basket', label: 'サビキカゴ', necessity: 'required', description: 'エサを入れて魚を寄せます。オモリ付きです。' },
  { id: 'bait', label: 'エサ・コマセ', necessity: 'required', description: 'カゴに入れるエサ。現地の釣具店でも調達できます。' },
  { id: 'bucket', label: 'バケツ', necessity: 'recommended', description: '手洗いや水くみに。用途に合わせて選びます。' },
  { id: 'safety', label: '安全用品', necessity: 'required', description: '体に合うライフジャケットを必ず準備しましょう。' },
];
const source = {
  rod: 'https://www.daiwa.com/jp/product/2023/05/09/09/55/eu19urm',
  reel: 'https://www.daiwa.com/jp/product/m4f0cz4',
  line: 'https://www.daiwa.com/jp/product/2023/05/09/08/09/uzkh2vp',
  rig: 'https://www.hayabusa.co.jp/hayabusa/products/HS201/',
};
function product(data: Omit<Product, 'price' | 'verification' | 'record' | 'offer'> & { verification?: VerificationStatus; retailer?: string; linkStatus?: RetailOffer['linkStatus']; note?: string }): Product {
  const { retailer = 'キャスティング', linkStatus = 'indexed-only', note = 'メーカー公式の型番・仕様を確認。販売ページの型番/JANは検索掲載内容で照合。価格・在庫は未取得。', verification = 'verified', ...rest } = data;
  return { ...rest, verification, price: null,
    offer: { retailer, url: data.purchaseUrl ?? data.sourceUrl, price: null, linkStatus, checkedAt: VERIFIED_AT },
    record: { checkedAt: VERIFIED_AT, status: verification, sourceUrl: data.sourceUrl, note },
  };
}
export const products: Product[] = [
  product({ id: 'rod-3-300', category: 'rod', name: 'リバティクラブ 小継 磯 3-300', brand: 'DAIWA', summary: 'しまうと47cm。持ち運びやすい堤防用の竿。', reason: '6号カゴを使う基本構成に。振り出し式で電車移動にも持ち出しやすい長さです。', specs: ['全長 2.98m', '仕舞 47cm', 'オモリ負荷 5〜10号', '自重 145g'], sourceUrl: source.rod, purchaseUrl: 'https://store.castingnet.jp/shop/g/g4960652108010/', jan: '4960652108010', technical: { rodMinWeight: 5, rodMaxWeight: 10, rodMinLeader: 3, rodMaxLeader: 7 } }),
  product({ id: 'rod-2-300', category: 'rod', name: 'リバティクラブ 小継 磯 2-300', brand: 'DAIWA', summary: '少し軽い竿。重いカゴとの組み合わせに注意。', reason: '自重140g。オモリ負荷の上限が6号なので、エサを含む総重量の確認が必要です。', specs: ['全長 2.98m', '仕舞 47cm', 'オモリ負荷 2〜6号', '自重 140g'], sourceUrl: source.rod, purchaseUrl: 'https://store.castingnet.jp/shop/g/g4960652107990/', jan: '4960652107990', technical: { rodMinWeight: 2, rodMaxWeight: 6, rodMinLeader: 2, rodMaxLeader: 5 } }),
  product({ id: 'reel-cf2500', category: 'reel', name: '17 ワールドスピン CF2500', brand: 'DAIWA', summary: '好きな糸を巻いて準備する、糸なしモデル。', reason: '3号のナイロン糸を150m巻ける仕様。糸は別に準備し、釣具店に巻き方を相談できます。', specs: ['スピニング', 'ナイロン 3号-150m / 2号-200m', '自重 265g', '糸は付属しません'], sourceUrl: source.reel, purchaseUrl: 'https://store.castingnet.jp/shop/g/g4960652252539/', jan: '4960652252539', technical: { reelNylon3Capacity: 150, nylonCapacity: {2: 200,3:150} } }),
  product({ id: 'reel-2500', category: 'reel', name: '17 ワールドスピン 2500', brand: 'DAIWA', summary: 'ナイロン3号150mがあらかじめ付属。', reason: '糸巻きの手間を減らせます。付属糸を使うなら別売りラインの追加購入は不要です。', specs: ['スピニング', 'ナイロン 3号-150m / 2号-200m', '自重 270g', 'ナイロン3号150m付き'], sourceUrl: source.reel, purchaseUrl: 'https://store.castingnet.jp/shop/g/g4960652032681/', jan: '4960652032681', technical: { reelNylon3Capacity: 150, nylonCapacity: {2:200,3:150}, includedLine:'ナイロン3号150m' } }),
  product({ id: 'line-3', category: 'line', name: 'ジャストロン クリアー 3号 500m', brand: 'DAIWA', summary: '150mずつ使える、ナイロン糸の大巻き。', reason: '基本構成では150mだけ巻きます。500m全量をリールに巻く商品ではありません。', specs: ['ナイロン 3号', '1巻 500m', '使用想定 150m', 'カラー クリアー'], sourceUrl: source.line, purchaseUrl:'https://store.castingnet.jp/shop/g/g4550133362170/', jan:'4550133362170', technical: {lineSize:3,lineLength:150,spoolLength:500} }),
  product({ id: 'line-2', category: 'line', name: 'ジャストロン クリアー 2号 500m', brand: 'DAIWA', summary: '3号より細い糸。仕掛けとの太さも確認。', reason: '小魚向けの選択肢。太い仕掛けをつなぐ場合は結び目や切れる位置の確認が必要です。', specs: ['ナイロン 2号', '1巻 500m', '使用想定 150m', 'カラー クリアー'], sourceUrl: source.line, purchaseUrl:'https://store.castingnet.jp/shop/g/g4550133362156/', jan:'4550133362156', technical: {lineSize:2,lineLength:150,spoolLength:500} }),
  product({ id:'rig-6',category:'rig',name:'小アジ専科 リアルシラス HS201 6号-1',brand:'HAYABUSA',summary:'小魚を狙う6本針のサビキ仕掛け。',reason:'針6号・ハリス1号の基本候補。釣れる魚の大きさに合わせ、現地でも調整しましょう。',specs:['針 6号','ハリス 1号 / 幹糸 2号','6本針・1セット','全長 1.4m / 1.75m（シリーズ表記）'],sourceUrl:source.rig,purchaseUrl:'https://store.castingnet.jp/shop/g/g4993722786115/',jan:'4993722786115',technical:{hookSize:6,rigBranchSize:1,rigMainSize:2} }),
  product({ id:'rig-8',category:'rig',name:'小アジ専科 リアルシラス HS201 8号-2',brand:'HAYABUSA',summary:'針と糸が太め。魚の大きさに合わせる候補。',reason:'針8号・ハリス2号。小さな魚には針が大きいことがあるため、釣果情報を見て選びます。',specs:['針 8号','ハリス 2号 / 幹糸 4号','6本針・1セット','全長 1.4m / 1.75m（シリーズ表記）'],sourceUrl:source.rig,purchaseUrl:'https://store.castingnet.jp/shop/g/g4993722786139/',jan:'4993722786139',technical:{hookSize:8,rigBranchSize:2,rigMainSize:4} }),
  product({ id:'basket-6',category:'basket',name:'サビキカゴ（ワンタッチ式）6号',brand:'DAISO',summary:'エサをつかんで閉じられる、オモリ付きカゴ。',reason:'足元に下ろすサビキ向け。6号は約22.5g。エサを入れた総重量は使用前に確認します。',specs:['6号・約22.5g','本体 ポリプロピレン / オモリ 鉛合金','5.8×10.8×3.8cm','1個入'],sourceUrl:'https://jp.daisonet.com/products/4550480770390',purchaseUrl:'https://jp.daisonet.com/products/4550480770390',jan:'4550480770390',retailer:'DAISO',linkStatus:'content-confirmed',technical:{basketWeight:6,basketWeightG:22.5},note:'DAISO公式商品本文で用途・サイズ・材質・重量・JANと個別販売ページを確認。価格・在庫は掲載しません。' }),
  product({ id:'basket-10',category:'basket',name:'サビキカゴ（ワンタッチ式）10号',brand:'DAISO',summary:'6号より重いカゴ。竿の上限に注意。',reason:'10号は約37.5g。基本構成では余裕が少なく、2号竿との組み合わせは非推奨です。',specs:['10号・約37.5g','本体 ポリプロピレン / オモリ 鉛合金','5.8×10.8×3.8cm','1個入'],sourceUrl:'https://jp.daisonet.com/products/4550480770369',purchaseUrl:'https://jp.daisonet.com/products/4550480770369',jan:'4550480770369',retailer:'DAISO',linkStatus:'content-confirmed',technical:{basketWeight:10,basketWeightG:37.5},note:'DAISO公式商品本文で用途・サイズ・材質・重量・JANと個別販売ページを確認。価格・在庫は掲載しません。' }),
  product({ id:'bait-amihime',category:'bait',name:'アミ姫 600g',brand:'マルキユー',summary:'キャップを開けて絞り出すサビキ用エサ。',reason:'常温で持ち運べ、解凍の準備を減らせます。使う量や現地調達は釣具店でも相談できます。',specs:['内容量 600g','堤防・サビキ釣り用','キャップ付きパック','直射日光・高温多湿を避けて保管'],sourceUrl:'https://www.marukyu.com/product/1944/',purchaseUrl:'https://store.castingnet.jp/shop/g/g4905789006563/',jan:'4905789006563',localOnly:true,technical:{} }),
  product({ id:'bucket-daiwa',category:'bucket',name:'水くみバッカン S17（K）ホワイト',brand:'DAIWA',summary:'ロープで水をくむための釣り専用バケツ。',reason:'8mロープ付き。水面から高い堤防では、無理に身を乗り出さず施設のルールを優先します。',specs:['素材 EVA','外寸 約17×17×21cm','8mロープ付き','1個'],sourceUrl:'https://www.daiwa.com/jp/product/w3jvyn5',purchaseUrl:'https://store.castingnet.jp/shop/g/g4550133398513/',jan:'4550133398513',technical:{},note:'メーカー公式仕様を確認。販売ページはJAN照合できたが取得本文に文字化けがあり、購入時の表示確認が必要。' }),
  product({ id:'bucket-generic',category:'bucket',name:'バケツ（アルファベット）10L',brand:'DAISO',summary:'地上での手洗い用。水くみロープの代わりには使えません。',reason:'水道などから給水できる施設での用途限定候補。海への吊り下げ強度や海水での長期耐久性は未確認です。',specs:['容量表記 10L / 1個','ポリプロピレン','29×27.5×29cm','ロープなし・吊り下げ不可'],sourceUrl:'https://jp.daisonet.com/products/4549131982527',purchaseUrl:'https://jp.daisonet.com/products/4549131982527',jan:'4549131982527',generic:true,verification:'partial',retailer:'DAISO',linkStatus:'content-confirmed',technical:{},note:'公式で容器の材質・容量・寸法を確認。吊り下げ強度と海水耐久性は未確認。地上で水を入れる容器用途のみ比較し、完全代替としません。' }),
  product({ id:'safety-tokarau',category:'safety',name:'トカラウ BSJ-201ARS レッド M',brand:'Bluestorm',summary:'体に合うか試着して選ぶ、固型式ライフジャケット。',reason:'股ベルト付き。身長・胸囲・利用環境に合うか、必ず販売店や施設で確認してください。',specs:['国土交通省型式承認品 Type D','M：身長155〜175cm / 胸囲100cmまで','初期浮力 約8.8kg','使用水域に制限あり'],sourceUrl:'https://bluestorm.jp/products/inherently_buoyant_lifejacket/bsj-201ars/',purchaseUrl:'https://store.castingnet.jp/shop/g/g4513291159815/',jan:'4513291159815',localOnly:true,technical:{},note:'メーカー公式で仕様を確認。着用者の体格と利用環境が不明のため適合は要確認。安全装備は汎用品へ置き換えません。' }),
];

export const defaultSelection: Record<CategoryId,string> = {
  rod:'rod-3-300',reel:'reel-cf2500',line:'line-3',rig:'rig-6',basket:'basket-6',bait:'bait-amihime',bucket:'bucket-daiwa',safety:'safety-tokarau',
};
export const alternatives: AlternativeProduct[] = [{ productId:'bucket-generic',replacesId:'bucket-daiwa',conditions:['地上での手洗い・道具洗いに限る','施設の水道などから給水できる','使用前に破損がないか確認'],limits:['海への吊り下げは不可','海水への長期耐久性・取っ手強度は未検証','価格優位性は比較していません'] }];
export const dataSources = [
  {title:'関東の季節傾向・対象魚（Honda釣り倶楽部）',url:fishSource},
  {title:'釣り方と基本の道具（Honda釣り倶楽部）',url:'https://www.honda.co.jp/fishing/enjoy/season/season-201707/tool/'},
  {title:'サビキ釣り入門（DAIWA）',url:'https://www.daiwa.com/jp/beginner/place/sabiki'},
  {title:'Amazonアソシエイト・プログラム運営規約',url:'https://affiliate.amazon.co.jp/help/operating/policies'},
];
