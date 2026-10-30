import { areas, categories, defaultSelection, fishSpecies, fishingFields, methods, products, replacedProductIds, type CategoryId, type Product } from './catalog';
export type { CategoryId } from './catalog';

export interface FishingConditions { month: number; area: string; field: string }
export interface FishingBuild {
  conditions: FishingConditions; fishId: string; methodId: string;
  selection: Record<CategoryId,string>; checked: CategoryId[]; owned: CategoryId[]; replacedCategories?: CategoryId[];
}
export type CompatibilityStatus = 'recommended' | 'check' | 'avoid';
export interface CompatibilityResult { id: string; status: CompatibilityStatus; title: string; reason: string; categoryIds: CategoryId[] }
export interface CompatibilityRule { id: string; title: string; categoryIds: CategoryId[]; sourceUrls: string[] }

export const compatibilityRules: CompatibilityRule[] = [
  { id:'rod-basket',title:'竿とカゴの公称オモリ負荷',categoryIds:['rod','basket'],sourceUrls:['https://www.daiwa.com/jp/product/2023/05/09/09/55/eu19urm','https://www.amazon.co.jp/dp/B07HFTBWBN','https://www.amazon.co.jp/dp/B07HFSRS9P'] },
  { id:'reel-line',title:'リールの糸巻量',categoryIds:['reel','line'],sourceUrls:['https://www.daiwa.com/jp/product/m4f0cz4','https://www.daiwa.com/jp/product/2023/05/09/08/09/uzkh2vp'] },
  { id:'line-rig',title:'道糸と仕掛けの太さ',categoryIds:['line','rig'],sourceUrls:['https://www.hayabusa.co.jp/hayabusa/products/HS201/','https://www.honda.co.jp/fishing/enjoy/season/season-201707/tool/'] },
];
const byId = new Map(products.map(p => [p.id,p]));
const categoryIds = categories.map(c => c.id);
const knownCategories = new Set<string>(categoryIds);
// An owned item's unknown specification also affects the other side of each
// applicable rule. A successful remaining rule must not hide that uncertainty.
const ownedDependencies: Record<CategoryId,CategoryId[]> = {
  rod: ['rod','reel','basket','bait','rig'],
  reel: ['reel','rod','line'],
  line: ['line','reel','rig'],
  rig: ['rig','line','rod'],
  basket: ['basket','rod','bait'],
  bait: ['bait','rod','basket'],
  bucket: ['bucket'],
  safety: ['safety'],
};

export function isSupported(conditions: FishingConditions): boolean {
  return conditions.area === 'tokyo-bay' && conditions.field === 'pier' && Number.isInteger(conditions.month) && conditions.month >= 4 && conditions.month <= 10;
}
export function getFish(conditions: FishingConditions) {
  return isSupported(conditions) ? fishSpecies.filter(f => f.months.includes(conditions.month)) : [];
}
export function createDefaultBuild(conditions: FishingConditions = { month: new Date().getMonth() + 1, area:'tokyo-bay',field:'pier' }): FishingBuild {
  return { conditions:{...conditions},fishId:getFish(conditions)[0]?.id ?? '',methodId:'sabiki',selection:{...defaultSelection},checked:[],owned:[] };
}

/** Pure evaluation: never changes/removes the user's selections. A recommendation only covers the named rule. */
export function evaluateCompatibility(selection: Record<CategoryId,string>, owned: CategoryId[] = []): CompatibilityResult[] {
  const results: CompatibilityResult[] = [];
  const selected = Object.fromEntries(categoryIds.map(id => [id,byId.get(selection[id])])) as Record<CategoryId,Product|undefined>;
  const add = (id:string,status:CompatibilityStatus,title:string,reason:string,ids:CategoryId[]) => results.push({id,status,title,reason,categoryIds:ids});
  const available = (...ids:CategoryId[]) => ids.every(id => selected[id]?.category === id && !owned.includes(id));

  for (const category of categories) {
    if (owned.includes(category.id)) add(`owned-${category.id}`,'check',`${category.label}は手持ちの道具`, '手持ちの型番・仕様は未登録です。掲載商品の仕様では判定せず、関連する組み合わせを現物で確認してください。',ownedDependencies[category.id]);
    else if (!selected[category.id] || selected[category.id]?.category !== category.id) add(`missing-${category.id}`,'check',`${category.label}が未選択`,category.necessity === 'required' ? '釣行に必要な道具です。商品を選ぶか、持っている道具として登録してください。' : '必要に応じて準備してください。',[category.id]);
  }
  if (available('rod','reel')) {
    add('rod-reel','check','竿とリールの取り付け','スピニング用の候補ですが、リール脚と竿の固定部分の寸法照合・現物装着は未実施です。購入先で取り付けを確認してください。',['rod','reel']);
  }
  if (available('reel','line')) {
    const reel = selected.reel!.technical;
    const line = selected.line!.technical;
    const capacity = line.lineSize === undefined ? undefined : reel.nylonCapacity?.[line.lineSize];
    if (capacity === undefined || line.lineLength === undefined) add('reel-line','check','糸巻量の情報が不足','この太さの糸の巻糸量をメーカーの仕様表で確認してください。未知の太さから巻糸量を推測しません。',['reel','line']);
    else if (line.lineLength > capacity) add('reel-line','avoid','リールの糸巻量を超えています',`ナイロン${line.lineSize}号は${capacity}mの記載に対し、${line.lineLength}mを巻く構成です。容量が足りるリールか、使用する糸の長さを見直してください。`,['reel','line']);
    else add('reel-line','recommended','糸の太さと巻く長さは仕様内',`ナイロン${line.lineSize}号の記載容量${capacity}mに対し、使用想定は${line.lineLength}mです。製品の全${line.spoolLength}mを巻かず、適量で止めてください。`,['reel','line']);
    if (reel.includedLine) add('included-line','check','リールには糸が付属しています',`${reel.includedLine}付きです。付属糸を使う場合、別売りラインは予備として扱い、重複購入を避けてください。`,['reel','line']);
  }
  if (available('rod','basket')) {
    const rod = selected.rod!.technical;
    const basket = selected.basket!.technical;
    if (rod.rodMaxWeight === undefined || rod.rodMinWeight === undefined || basket.basketWeight === undefined) add('rod-basket','check','オモリ負荷の情報が不足','竿のオモリ負荷とカゴの重量を、購入前に確認してください。',['rod','basket']);
    else if (basket.basketWeight > rod.rodMaxWeight) add('rod-basket','avoid','カゴが竿の上限を超えています',`カゴ${basket.basketWeight}号${basket.basketWeightG === undefined ? "（総重量は未確認）" : `（約${basket.basketWeightG}g）`}は、竿の上限${rod.rodMaxWeight}号を超えます。6号カゴと3号竿の基本構成へ戻すなど、組み合わせを見直してください。`,['rod','basket']);
    else if (basket.basketWeight === rod.rodMaxWeight) add('rod-basket','check','カゴだけで竿の負荷上限です',`カゴ${basket.basketWeight}号が竿の上限${rod.rodMaxWeight}号です。エサの重さが加わるため、そのまま推奨できません。基本の3号竿・6号カゴを検討してください。`,['rod','basket']);
    else if (basket.basketWeight < rod.rodMinWeight) add('rod-basket','check','カゴが竿の負荷目安より軽め','メーカーの記載範囲外です。操作性や釣り場の流れも含めて販売店へ相談してください。',['rod','basket']);
    else add('rod-basket','recommended','公称のオモリ号数は竿の範囲内',`カゴ${basket.basketWeight}号は、竿のオモリ負荷${rod.rodMinWeight}〜${rod.rodMaxWeight}号の範囲内です。これは公称号数の比較で、本体を含む実際の総重量の適合を保証しません。`,['rod','basket']);
    add('total-load','check','エサを入れた総重量を確認','カゴ本体・エサ・仕掛けを合わせた重さは未計測です。総重量が竿の負荷上限を超えないか確認し、この構成は足元に下ろして使ってください。',['rod','basket','bait']);
  }
  if (available('line','rig')) {
    const line = selected.line!.technical.lineSize;
    const rig = selected.rig!.technical;
    if (line === undefined || rig.rigMainSize === undefined || rig.rigBranchSize === undefined) add('line-rig','check','糸と仕掛けの仕様が不足','ライン・仕掛けの太さと素材を確認してください。',['line','rig']);
    else if (line < rig.rigMainSize || line <= rig.rigBranchSize) add('line-rig','check','仕掛けに対して道糸が細め',`道糸${line}号、幹糸${rig.rigMainSize}号、ハリス${rig.rigBranchSize}号です。根掛かり時に道糸側で切れる可能性もあるため、太さと結び方を見直してください。`,['line','rig']);
    else add('line-rig','recommended','糸の号数の順序は基本構成の条件内',`道糸${line}号 ≥ 幹糸${rig.rigMainSize}号 > ハリス${rig.rigBranchSize}号。号数だけで結束強度は保証できないため、傷・結び目・ドラグは現物で確認します。`,['line','rig']);
  }
  if (available('rod','rig')) {
    const rod=selected.rod!.technical;
    const leader=selected.rig!.technical.rigBranchSize;
    if (leader === undefined || rod.rodMinLeader === undefined || rod.rodMaxLeader === undefined) add('rod-rig','check','竿と仕掛けのハリス仕様を確認','竿の適合ハリスと仕掛けの枝糸の仕様を照合できません。販売店で確認してください。',['rod','rig']);
    else if (leader < rod.rodMinLeader || leader > rod.rodMaxLeader) add('rod-rig','check','ハリスが竿の適合表記の範囲外',`仕掛けのハリス${leader}号に対し、竿の適合ハリス表記は${rod.rodMinLeader}〜${rod.rodMaxLeader}号です。サビキの枝糸への適用は一律に断定せず、ドラグ調整や取り込み方を販売店へ確認してください。`,['rod','rig']);
    else add('rod-rig','recommended','ハリスの号数は竿の記載範囲内',`ハリス${leader}号は竿の適合表記${rod.rodMinLeader}〜${rod.rodMaxLeader}号の範囲内です。結び目や実際の強度は別途確認してください。`,['rod','rig']);
  }
  if (available('rig') && (selected.rig!.technical.hookSize ?? 0) >= 8) add('hook-size','check','魚の大きさに合う針か確認','8号の針は小さなアジ・イワシには大きいことがあります。現地の魚の大きさや釣果情報で選んでください。',['rig']);
  if (available('bucket')) {
    if (selected.bucket!.generic) add('bucket-use','check','汎用バケツは地上での用途限定','地上で水を入れる容器としてのみ比較しています。取っ手の吊り下げ強度・海水への長期耐久性は未確認。海に下ろす水くみ用途には使わないでください。',['bucket']);
    else add('bucket-use','recommended','水くみ用のロープ付き','メーカーが水くみ用途として販売するEVAバケツです。8mロープが届かない高さや、禁止された場所では使わないでください。',['bucket']);
  }
  if (available('safety')) add('safety-fit','check','ライフジャケットのサイズ・使用環境','Mサイズの候補です。着用者の体格・固定状態とType Dの使用環境は未確認。施設や販売店で確認し、股ベルトも装着してください。',['safety']);
  return results;
}

/** Only published hosts are permitted; URLs from shared builds are never accepted. */
export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const hosts = new Set(['www.daiwa.com','www.hayabusa.co.jp','www.honda.co.jp','www.marukyu.com','bluestorm.jp','jp.daisonet.com','store.castingnet.jp','affiliate.amazon.co.jp','www.amazon.co.jp','www.jma.go.jp','www.kaiho.mlit.go.jp','yokohama-fishingpiers.jp']);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && hosts.has(url.hostname) ? url.href : null;
  } catch { return null; }
}
export function encodeBuild(build: FishingBuild): string {
  const bytes = new TextEncoder().encode(JSON.stringify({v:1,conditions:build.conditions,fishId:build.fishId,methodId:build.methodId,selection:build.selection,checked:build.checked,owned:build.owned}));
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
const record = (value:unknown): value is Record<string,unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
export function decodeBuild(encoded: string): FishingBuild | null {
  try {
    if (encoded.length < 8 || encoded.length > 7000 || !/^[\w-]+$/.test(encoded)) return null;
    const binary = atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));
    const value: unknown = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0))));
    if (!record(value) || value.v !== 1 || !record(value.conditions) || !record(value.selection)) return null;
    const c = value.conditions;
    if (typeof c.month !== 'number' || !Number.isInteger(c.month) || c.month < 1 || c.month > 12 || !areas.some(a => a.id === c.area) || !fishingFields.some(f=>f.id===c.field)) return null;
    if (typeof value.fishId !== 'string' || (value.fishId !== '' && !fishSpecies.some(f=>f.id===value.fishId))) return null;
    const conditions: FishingConditions = {month:c.month,area:c.area as string,field:c.field as string};
    if (isSupported(conditions) && !getFish(conditions).some(f=>f.id===value.fishId)) return null;
    if (!methods.some(m => m.supported && m.id === value.methodId)) return null;
    const selection = {} as Record<CategoryId,string>;
    const replacedCategories: CategoryId[] = [];
    for (const id of categoryIds) {
      let chosen = value.selection[id];
      if (typeof chosen === 'string' && Object.hasOwn(replacedProductIds, chosen)) { chosen = replacedProductIds[chosen]; replacedCategories.push(id); }
      if (typeof chosen !== 'string' || (chosen !== '' && byId.get(chosen)?.category !== id)) return null;
      selection[id] = chosen;
    }
    const list = (candidate:unknown): CategoryId[] | null => Array.isArray(candidate) && candidate.length <= categoryIds.length && candidate.every(v => typeof v === 'string' && knownCategories.has(v)) ? [...new Set(candidate)] as CategoryId[] : null;
    const checked = list(value.checked);
    const owned = list(value.owned ?? []);
    if (!checked || !owned) return null;
    return { conditions,fishId:value.fishId,methodId:value.methodId as string,selection,checked:checked.filter(id=>(!!selection[id]||owned.includes(id))&&!replacedCategories.includes(id)),owned,...(replacedCategories.length ? {replacedCategories} : {}) };
  } catch { return null; }
}
