import amazonAsins from './data/amazon-products.json' with { type: 'json' };
import { amazonPriceRecord, currentAmazonPrice, type AmazonPriceRecord } from './amazon-prices';
import { targetFish, targetMethods } from './fish-catalog';
import methodProducts from './data/method-products.json' with { type: 'json' };
import tierProducts from './data/tier-products.json' with { type: 'json' };

/** Curated specifications with a daily Amazon price snapshot. See docs/AMAZON_PRICES.md. */
export type CategoryId = 'rod' | 'reel' | 'line' | 'rig' | 'basket' | 'bait' | 'bucket' | 'safety' | 'float' | 'stopper' | 'sinker' | 'leader' | 'swivel' | 'hook' | 'tenbin' | 'snap' | 'lure' | 'egi' | 'burakuri' | 'cushion' | 'shock' | 'net' | 'pliers' | 'cooler' | 'chum';
export type VerificationStatus = 'verified' | 'partial';
export interface Area { id: string; name: string; region: string; supported: boolean }
export interface FishingField { id: string; name: string; supported: boolean }
export type FishDifficulty = 1 | 2 | 3;
export interface FishSpecies { id: string; name: string; members: string[]; aliases: string[]; description: string; difficulty: FishDifficulty; months: number[]; methodIds: string[]; sourceUrl: string; habitat: string; tip: string }
export interface Seasonality { fishId: string; areaId: string; fieldId: string; months: number[]; sourceUrl: string; note: string }
export interface FishingMethod { id: string; name: string; description: string; beginner: boolean; supported: boolean; supplies: string[]; steps: string[]; sourceUrl: string }
export interface EquipmentCategory { id: CategoryId; label: string; necessity: 'required' | 'recommended' | 'optional'; description: string }
export interface ProductSpecification {
  rodMinWeight?: number; rodMaxWeight?: number; rodMinLeader?: number; rodMaxLeader?: number;
  reelNylon3Capacity?: number; nylonCapacity?: Record<number, number>; lineSize?: number;
  lineLength?: number; spoolLength?: number; basketWeight?: number; basketWeightG?: number;
  rigMainSize?: number; rigBranchSize?: number; hookSize?: number; includedLine?: string;
  rodMinLureG?: number; rodMaxLureG?: number; rodMinEgi?: number; rodMaxEgi?: number;
  rodMinPe?: number; rodMaxPe?: number; rodType?: 'spinning' | 'hechi'; reelType?: 'spinning' | 'hechi';
  lineMaterial?: 'nylon' | 'pe' | 'fluoro'; peCapacity?: Record<number, number>;
  weightG?: number; sinkerSize?: number; floatLoadSize?: number; egiSize?: number;
  leaderSize?: number; strengthLb?: number; includedLineProductId?: string;
  shockThinSize?: number; shockThickSize?: number;
}
export interface RetailOffer { retailer: string; url: string; price: number | null; linkStatus: 'content-confirmed' | 'listing-confirmed'; checkedAt: string }
export interface VerificationRecord { checkedAt: string; status: VerificationStatus; sourceUrl: string; note: string }
export interface Product {
  id: string; category: CategoryId; name: string; brand: string; summary: string; reason: string;
  specs: string[]; sourceUrl: string; purchaseUrl?: string; verification: VerificationStatus;
  price: number | null; amazonPrice: AmazonPriceRecord | null; generic?: boolean; localOnly?: boolean; technical: ProductSpecification;
  offer: RetailOffer; record: VerificationRecord; jan: string;
  methodIds?: string[]; fishIds?: string[]; profiles?: string[]; provides?: CategoryId[];
  evidenceUrls?: string[];
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
  { id: 'surf', name: '砂浜（サーフ）', supported: false },
  { id: 'rock', name: '岩場（磯）', supported: false },
];
const fishSource = 'https://www.honda.co.jp/fishing/enjoy/season/season-201707/';
export const fishSpecies: FishSpecies[] = targetFish;
// A fish being selectable does not establish local seasonality or product fit.
export const seasonality: Seasonality[] = ['aji','iwashi','saba'].map(id => fishSpecies.find(f => f.id === id)!).map(fish => ({ fishId: fish.id, areaId: 'tokyo-bay', fieldId: 'pier', months: fish.months, sourceUrl: fishSource, note: '関東の一般的な季節傾向を東京湾の試作シナリオに限定して使用。直近の釣果予測ではありません。' }));
export const methods: FishingMethod[] = targetMethods;
export const categories: EquipmentCategory[] = [
  { id: 'rod', label: '釣り竿（ロッド）', necessity: 'required', description: '釣り竿。重さの合うカゴを使います。' },
  { id: 'reel', label: 'リール', necessity: 'required', description: '糸を巻いて魚を引き寄せる道具です。' },
  { id: 'line', label: 'リールに巻く糸（道糸）', necessity: 'required', description: 'リールに巻く糸。150mを巻く想定です。' },
  { id: 'rig', label: 'サビキ仕掛け', necessity: 'required', description: '小さな針が並んだ、魚を掛ける部分です。' },
  { id: 'basket', label: 'サビキカゴ', necessity: 'required', description: 'エサを入れて魚を寄せます。オモリ付きです。' },
  { id: 'bait', label: 'エサ・コマセ', necessity: 'required', description: 'カゴに入れるエサ。現地の釣具店でも調達できます。' },
  { id: 'bucket', label: 'バケツ', necessity: 'recommended', description: '手洗いや水くみに。用途に合わせて選びます。' },
  { id: 'safety', label: '安全用品', necessity: 'required', description: '体に合うライフジャケットを必ず準備しましょう。' },
];
export const allCategories: EquipmentCategory[] = [...categories,
  ...([
    ['float','ウキ','魚の反応を知らせます。使用する仕掛けの負荷に合わせます。'],
    ['stopper','ウキ取付セット','ウキ止め・シモリ玉・ウキスイベル・下側のストッパーをそろえます。'],
    ['sinker','オモリ','釣り方と竿の負荷に合う重さを選びます。'],
    ['leader','ハリス・リーダー','道糸の先につなぐ糸。素材と太さを確認します。'],
    ['swivel','サルカン','糸と仕掛けをつなぐ接続金具です。'],
    ['hook','針','対象魚に合う針。ハリス付き商品も選べます。'],
    ['tenbin','天秤','仕掛けの絡まりを減らします。オモリ付きなら追加分は不要です。'],
    ['snap','スナップ','ルアーやエギを交換するための接続金具です。'],
    ['lure','ルアー','対象魚と竿の適合重量に合う疑似餌を選びます。'],
    ['egi','エギ','対象のイカ・竿の適合サイズと重量に合わせます。'],
    ['burakuri','ブラクリ','オモリ・短いハリス・針が一体の穴釣り仕掛けです。'],
    ['cushion','保護ゴム','オモリから結び目を保護する部品です。'],
    ['shock','力糸','投げる負荷に備える糸。道糸との接続を確認します。'],
    ['net','魚をすくう網（玉網）','水面の魚をすくう網と柄。釣り場の高さと持ち運びに合う物を準備します。'],
    ['pliers','針外し・プライヤー','針を安全に外すための道具です。'],
    ['cooler','保冷用品','持ち帰る魚を冷やす容器。氷も準備します。'],
    ['chum','コマセ','魚を寄せるエサ。針に付けるエサとは別に準備します。'],
  ] as [CategoryId,string,string][]).map(([id,label,description])=>({id,label,description,necessity:'required' as const})),
];
const source = {
  rod: 'https://www.daiwa.com/jp/product/2023/05/09/09/55/eu19urm',
  reel: 'https://www.daiwa.com/jp/product/m4f0cz4',
  line: 'https://www.daiwa.com/jp/product/2023/05/09/08/09/uzkh2vp',
  rig: 'https://www.hayabusa.co.jp/hayabusa/products/HS201/',
};
/** Individual ASINs were checked in the Amazon browser UI, including selected variants. */
export function amazonLinkLabel(product: Product): string {
  return product.offer.retailer === 'Amazon.co.jp' ? 'Amazonの商品ページへ' : '購入先の商品ページへ';
}
function product(data: Omit<Product, 'price' | 'amazonPrice' | 'verification' | 'record' | 'offer'> & { verification?: VerificationStatus; note?: string }): Product {
  const { note = 'メーカー公式の型番・仕様を確認。価格・在庫はAmazonのリンク先で確認してください。', verification = 'verified', ...rest } = data;
  const asin = (amazonAsins as Record<string, string>)[data.id];
  if (!asin) throw new Error(`Amazon ASIN is required for ${data.id}`);
  const purchaseUrl = `https://www.amazon.co.jp/dp/${asin}?th=1&psc=1`;
  const linkStatus = 'content-confirmed';
  const amazonPrice = amazonPriceRecord(data.id, asin);
  const price = currentAmazonPrice(amazonPrice);
  return { ...rest, purchaseUrl, verification, price, amazonPrice,
    offer: { retailer: 'Amazon.co.jp', url: purchaseUrl, price, linkStatus, checkedAt: VERIFIED_AT },
    record: { checkedAt: VERIFIED_AT, status: verification, sourceUrl: data.sourceUrl, note },
  };
}
const legacyProducts: Product[] = [
  product({ id: 'rod-3-300', category: 'rod', name: 'リバティクラブ 小継 磯 3-300', brand: 'DAIWA', summary: 'しまうと47cm。持ち運びやすい堤防用の竿。', reason: '6号カゴを使う基本構成に。振り出し式で電車移動にも持ち出しやすい長さです。', specs: ['全長 2.98m', '仕舞 47cm', 'オモリ負荷 5〜10号', '自重 145g'], sourceUrl: source.rod, jan: '4960652108010', technical: { rodMinWeight: 5, rodMaxWeight: 10, rodMinLeader: 3, rodMaxLeader: 7 } }),
  product({ id: 'rod-2-300', category: 'rod', name: 'リバティクラブ 小継 磯 2-300', brand: 'DAIWA', summary: '少し軽い竿。重いカゴとの組み合わせに注意。', reason: '自重140g。オモリ負荷の上限が6号なので、エサを含む総重量の確認が必要です。', specs: ['全長 2.98m', '仕舞 47cm', 'オモリ負荷 2〜6号', '自重 140g'], sourceUrl: source.rod, jan: '4960652107990', technical: { rodMinWeight: 2, rodMaxWeight: 6, rodMinLeader: 2, rodMaxLeader: 5 } }),
  product({ id: 'reel-cf2500', category: 'reel', name: '17 ワールドスピン CF2500', brand: 'DAIWA', summary: '好きな糸を巻いて準備する、糸なしモデル。', reason: '3号のナイロン糸を150m巻ける仕様。糸は別に準備し、釣具店に巻き方を相談できます。', specs: ['スピニング', 'ナイロン 3号-150m / 2号-200m', '自重 265g', '糸は付属しません'], sourceUrl: source.reel, jan: '4960652252539', technical: { reelNylon3Capacity: 150, nylonCapacity: {2: 200,3:150} } }),
  product({ id: 'reel-2500', category: 'reel', name: '17 ワールドスピン 2500', brand: 'DAIWA', summary: 'ナイロン3号150mがあらかじめ付属。', reason: '糸巻きの手間を減らせます。付属糸を使うなら別売りラインの追加購入は不要です。', specs: ['スピニング', 'ナイロン 3号-150m / 2号-200m', '自重 270g', 'ナイロン3号150m付き'], sourceUrl: source.reel, jan: '4960652032681', technical: { reelNylon3Capacity: 150, nylonCapacity: {2:200,3:150}, includedLine:'ナイロン3号150m' } }),
  product({ id: 'line-3', category: 'line', name: 'ジャストロン クリアー 3号 500m', brand: 'DAIWA', summary: '150mずつ使える、ナイロン糸の大巻き。', reason: '基本構成では150mだけ巻きます。500m全量をリールに巻く商品ではありません。', specs: ['ナイロン 3号', '1巻 500m', '使用想定 150m', 'カラー クリアー'], sourceUrl: source.line, jan:'4550133362170', technical: {lineSize:3,lineLength:150,spoolLength:500} }),
  product({ id: 'line-2', category: 'line', name: 'ジャストロン クリアー 2号 500m', brand: 'DAIWA', summary: '3号より細い糸。仕掛けとの太さも確認。', reason: '小魚向けの選択肢。太い仕掛けをつなぐ場合は結び目や切れる位置の確認が必要です。', specs: ['ナイロン 2号', '1巻 500m', '使用想定 150m', 'カラー クリアー'], sourceUrl: source.line, jan:'4550133362156', technical: {lineSize:2,lineLength:150,spoolLength:500} }),
  product({ id:'rig-6',category:'rig',name:'小アジ専科 リアルシラス HS201 6号-1',brand:'HAYABUSA',summary:'小魚を狙う6本針のサビキ仕掛け。',reason:'針6号・ハリス1号の基本候補。釣れる魚の大きさに合わせ、現地でも調整しましょう。',specs:['針 6号','ハリス 1号 / 幹糸 2号','6本針・1セット','全長 1.4m / 1.75m（シリーズ表記）'],sourceUrl:source.rig,jan:'4993722786115',technical:{hookSize:6,rigBranchSize:1,rigMainSize:2} }),
  product({ id:'rig-8',category:'rig',name:'小アジ専科 リアルシラス HS201 8号-2',brand:'HAYABUSA',summary:'針と糸が太め。魚の大きさに合わせる候補。',reason:'針8号・ハリス2号。小さな魚には針が大きいことがあるため、釣果情報を見て選びます。',specs:['針 8号','ハリス 2号 / 幹糸 4号','6本針・1セット','全長 1.4m / 1.75m（シリーズ表記）'],sourceUrl:source.rig,jan:'4993722786139',technical:{hookSize:8,rigBranchSize:2,rigMainSize:4} }),
  product({ id:'basket-riseway-6',category:'basket',name:'UPK-001 3Pプラカゴ サビキ S-6号',brand:'RISEWAY',summary:'足元のサビキ釣りに使う、公称6号のプラカゴ。',reason:'公称オモリ6号は基本の3号竿の5〜10号の範囲内。カゴ本体やエサを含む総重量は使用前に確認します。',specs:['スタイル S-6号','サビキ用プラカゴ / UPK-001','商品名に3Pの表記あり・セット内容は購入先で確認','材質の詳細・カゴ全体の実測重量は未確認'],sourceUrl:'https://www.amazon.co.jp/dp/B07HFTBWBN',jan:'',verification:'partial',technical:{basketWeight:6},note:'Amazonの掲載商品名と選択スタイルS-6号を確認。公称号数で比較し、総重量・材質・取付部寸法は未確認。単位やセット内容も購入前に確認してください。' }),
  product({ id:'basket-riseway-10',category:'basket',name:'UPK-001 3Pプラカゴ サビキ L-10号',brand:'RISEWAY',summary:'公称10号のサビキ用プラカゴ。竿の上限に注意。',reason:'公称10号は2号竿の上限6号を超えるため非推奨。基本の3号竿でも上限と同じなので総重量を確認します。',specs:['スタイル L-10号','サビキ用プラカゴ / UPK-001','商品名に3Pの表記あり・セット内容は購入先で確認','材質の詳細・カゴ全体の実測重量は未確認'],sourceUrl:'https://www.amazon.co.jp/dp/B07HFSRS9P',jan:'',verification:'partial',technical:{basketWeight:10},note:'Amazonの掲載商品名と選択スタイルL-10号を確認。旧DAISOカゴの実測重量や材質は引き継ぎません。公称号数だけを比較します。' }),
  product({ id:'bait-amihime',category:'bait',name:'アミ姫 600g',brand:'マルキユー',summary:'キャップを開けて絞り出すサビキ用エサ。',reason:'常温で持ち運べ、解凍の準備を減らせます。使う量や現地調達は釣具店でも相談できます。',specs:['内容量 600g','堤防・サビキ釣り用','キャップ付きパック','直射日光・高温多湿を避けて保管'],sourceUrl:'https://www.marukyu.com/product/1944/',jan:'4905789006563',localOnly:true,technical:{} }),
  product({ id:'bucket-daiwa',category:'bucket',name:'水くみバッカン S17（K）ホワイト',brand:'DAIWA',summary:'ロープで水をくむための釣り専用バケツ。',reason:'8mロープ付き。水面から高い堤防では、無理に身を乗り出さず施設のルールを優先します。',specs:['素材 EVA','外寸 約17×17×21cm','8mロープ付き','1個'],sourceUrl:'https://www.daiwa.com/jp/product/w3jvyn5',jan:'4550133398513',technical:{},note:'メーカー公式仕様を確認。Amazonの個別ページでS17(K)・ホワイトを照合。' }),
  product({ id:'bucket-risu-8',category:'bucket',name:'アクティブバケツ ホワイト 8L',brand:'リス（RISU）',summary:'地上での手洗いや道具洗いに使う、容量8Lの汎用バケツ。',reason:'清掃・ガーデニング用の容器を、施設の水道などから給水する用途に限定。ロープで海へ下ろす水くみの代替には使いません。',specs:['容量 8L / ホワイト','直径28.0×高さ21.7cm / 本体重量417g','本体 ポリエチレン・EVA','持ち手 ポリプロピレン・ステンレス鋼','吊り下げ水くみは不可'],sourceUrl:'https://www.amazon.co.jp/dp/B002P9A77U',jan:'',generic:true,verification:'partial',technical:{},note:'Amazonの商品名、選択サイズ8L、色、材質、寸法、重量を照合。海水への長期耐久性・吊り下げ強度は未確認のため、地上で水を入れる用途のみ比較します。' }),
  product({ id:'safety-tokarau',category:'safety',name:'トカラウ BSJ-201ARS レッド M',brand:'Bluestorm',summary:'体に合うか試着して選ぶ、固型式ライフジャケット。',reason:'股ベルト付き。身長・胸囲・利用環境に合うか、必ず販売店や施設で確認してください。',specs:['国土交通省型式承認品 Type D','M：身長155〜175cm / 胸囲100cmまで','初期浮力 約8.8kg','使用水域に制限あり'],sourceUrl:'https://bluestorm.jp/products/inherently_buoyant_lifejacket/bsj-201ars/',jan:'4513291159815',localOnly:true,technical:{},note:'メーカー公式で仕様を確認。着用者の体格と利用環境が不明のため適合は要確認。安全装備は汎用品へ置き換えません。' }),
];
type AdditionalProduct = Omit<Product,'price'|'amazonPrice'|'record'|'offer'|'purchaseUrl'|'verification'|'jan'> & {asin:string; note:string; verification?:VerificationStatus; jan?:string; amazonVerified?:boolean};
export const products: Product[] = [...legacyProducts, ...([...methodProducts, ...tierProducts] as unknown as AdditionalProduct[]).map(data=>{
  const {asin,note,amazonVerified,...rest}=data;
  const purchaseUrl=`https://www.amazon.co.jp/dp/${asin}?th=1&psc=1`;
  const amazonPrice=amazonPriceRecord(data.id,asin), price=currentAmazonPrice(amazonPrice);
  return {...rest,jan:data.jan||'',purchaseUrl,amazonPrice,price,verification:data.verification||'partial',
    offer:{retailer:'Amazon.co.jp',url:purchaseUrl,price,linkStatus:amazonVerified?'content-confirmed' as const:'listing-confirmed' as const,checkedAt:'2026-11-01'},
    record:{checkedAt:'2026-11-01',status:data.verification||'partial',sourceUrl:data.sourceUrl,note}} satisfies Product;
})];

const indexedProducts = new Map(products.map(product => [product.id, product]));
export const findProduct = (id: string): Product | undefined => indexedProducts.get(id);

export const replacedProductIds: Record<string,string> = { 'basket-6':'basket-riseway-6', 'basket-10':'basket-riseway-10', 'bucket-generic':'bucket-risu-8' };

export const defaultSelection: Record<CategoryId,string> = {
  rod:'rod-3-300',reel:'reel-cf2500',line:'line-3',rig:'rig-6',basket:'basket-riseway-6',bait:'bait-amihime',bucket:'bucket-daiwa',safety:'safety-tokarau',
} as Record<CategoryId,string>;
export const alternatives: AlternativeProduct[] = [{ productId:'bucket-risu-8',replacesId:'bucket-daiwa',conditions:['地上での手洗い・道具洗いに限る','施設の水道などから給水できる','使用前に破損がないか確認'],limits:['海への吊り下げは不可','海水への長期耐久性・取っ手強度は未検証','価格優位性は比較していません'] }];
export const dataSources = [
  {title:'関東の季節傾向・対象魚（Honda釣り倶楽部）',url:fishSource},
  {title:'釣り方と基本の道具（Honda釣り倶楽部）',url:'https://www.honda.co.jp/fishing/enjoy/season/season-201707/tool/'},
  {title:'サビキ釣り入門（DAIWA）',url:'https://www.daiwa.com/jp/beginner/place/sabiki'},
  {title:'Amazonアソシエイト・プログラム運営規約',url:'https://affiliate.amazon.co.jp/help/operating/policies'},
];
