import { areas, allCategories, categories, fishSpecies, fishingFields, methods, products, replacedProductIds, seasonality, type CategoryId, type Product } from './catalog';
import { validAnswers } from './diagnosis';
import { coveringProduct, equipmentFor, includedLineProduct, productApplies, selectableMethodIds } from './equipment';
import { validPreparation, type PreparationPlan } from './preparation';
export type { CategoryId } from './catalog';

export interface FishingConditions { month: number; area: string; field: string }
export interface FishingBuild {
  conditions: FishingConditions; fishId: string; methodId: string;
  selection: Record<CategoryId,string>; checked: CategoryId[]; owned: CategoryId[]; replacedCategories?: CategoryId[];
  answers: Record<string,string>; included: CategoryId[]; prices: Record<string,number>;
  shipping: { selected: number | null; reference: number | null };
  drafts?: Record<string,EquipmentDraft>;
  preparation?: PreparationPlan;
}
export interface EquipmentDraft { selection: Record<CategoryId,string>; checked: CategoryId[]; owned: CategoryId[]; included: CategoryId[]; shipping: FishingBuild['shipping']; preparation?: PreparationPlan }
export type CompatibilityStatus = 'recommended' | 'check' | 'avoid';
export interface CompatibilityResult { id: string; status: CompatibilityStatus; title: string; reason: string; categoryIds: CategoryId[] }
export interface CompatibilityRule { id: string; title: string; categoryIds: CategoryId[]; sourceUrls: string[] }

export const compatibilityRules: CompatibilityRule[] = [
  { id:'rod-basket',title:'竿とカゴの公称オモリ負荷',categoryIds:['rod','basket'],sourceUrls:['https://www.daiwa.com/jp/product/2023/05/09/09/55/eu19urm','https://www.amazon.co.jp/dp/B07HFTBWBN','https://www.amazon.co.jp/dp/B07HFSRS9P'] },
  { id:'reel-line',title:'リールの糸巻量',categoryIds:['reel','line'],sourceUrls:['https://www.daiwa.com/jp/product/m4f0cz4','https://www.daiwa.com/jp/product/2023/05/09/08/09/uzkh2vp'] },
  { id:'line-rig',title:'道糸と仕掛けの太さ',categoryIds:['line','rig'],sourceUrls:['https://www.hayabusa.co.jp/hayabusa/products/HS201/','https://www.honda.co.jp/fishing/enjoy/season/season-201707/tool/'] },
];
const byId = new Map(products.map(p => [p.id,p]));
const categoryIds = allCategories.map(c => c.id);
const knownCategories = new Set<string>(categoryIds);
// An owned item's unknown specification also affects the other side of each
// applicable rule. A successful remaining rule must not hide that uncertainty.
const ownedDependencies: Partial<Record<CategoryId,CategoryId[]>> = {
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
  return isSupported(conditions) ? seasonality.filter(s => s.areaId === conditions.area && s.fieldId === conditions.field && s.months.includes(conditions.month)).map(s => fishSpecies.find(f => f.id === s.fishId)!) : [];
}
export function hasProductGuide(build: Pick<FishingBuild, 'conditions'|'fishId'|'methodId'>) {
  return selectableMethodIds.includes(build.methodId) && !!fishSpecies.find(f=>f.id===build.fishId)?.methodIds.includes(build.methodId);
}
export function createDefaultBuild(conditions: FishingConditions = { month: new Date().getMonth() + 1, area:'tokyo-bay',field:'pier' }): FishingBuild {
  return { conditions:{...conditions},fishId:'',methodId:'',selection:Object.fromEntries(categories.map(c=>[c.id,''])) as Record<CategoryId,string>,checked:[],owned:[],answers:{},included:[],prices:{},shipping:{selected:null,reference:null} };
}

/** Pure evaluation: never changes/removes the user's selections. A recommendation only covers the named rule. */
export function evaluateCompatibility(selection: Record<CategoryId,string>, owned: CategoryId[] = []): CompatibilityResult[] {
  const results: CompatibilityResult[] = [];
  const selected = Object.fromEntries(categoryIds.map(id => [id,byId.get(selection[id])])) as Record<CategoryId,Product|undefined>;
  const add = (id:string,status:CompatibilityStatus,title:string,reason:string,ids:CategoryId[]) => results.push({id,status,title,reason,categoryIds:ids});
  const available = (...ids:CategoryId[]) => ids.every(id => selected[id]?.category === id && !owned.includes(id));

  for (const category of categories) {
    if (owned.includes(category.id)) add(`owned-${category.id}`,'check',`${category.label}は手持ちの道具`, '手持ちの型番・仕様は未登録です。掲載商品の仕様では判定せず、関連する組み合わせを現物で確認してください。',ownedDependencies[category.id]||[category.id]);
    else if (!selected[category.id] || selected[category.id]?.category !== category.id) add(`missing-${category.id}`,'check',`${category.label}が未選択`,category.necessity === 'required' ? '釣行に必要な道具です。商品を選ぶか、持っている道具として登録してください。' : '必要に応じて準備してください。',[category.id]);
  }
  if (available('rod','reel')) {
    add('rod-reel','check','竿とリールの取り付け','どちらもスピニング用ですが、実物での取り付けは未確認です。リール脚が竿の固定部分に収まるか、購入先で確認してください。',['rod','reel']);
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
    else if (leader < rod.rodMinLeader || leader > rod.rodMaxLeader) add('rod-rig','check','ハリスが竿の適合表記の範囲外',`仕掛けのハリス${leader}号に対し、竿の適合ハリス表記は${rod.rodMinLeader}〜${rod.rodMaxLeader}号です。この表記をサビキの枝糸にも当てはめてよいか、ドラグの調整や魚の取り込み方と合わせて販売店に確認してください。`,['rod','rig']);
    else add('rod-rig','recommended','ハリスの号数は竿の記載範囲内',`ハリス${leader}号は竿の適合表記${rod.rodMinLeader}〜${rod.rodMaxLeader}号の範囲内です。結び目や実際の強度は別途確認してください。`,['rod','rig']);
  }
  if (available('rig') && (selected.rig!.technical.hookSize ?? 0) >= 8) add('hook-size','check','魚の大きさに合う針か確認','8号の針は小さなアジ・イワシには大きいことがあります。現地の魚の大きさや釣果情報で選んでください。',['rig']);
  if (available('bucket')) {
    if (selected.bucket!.generic) add('bucket-use','check','汎用バケツは地上での用途限定','地上で水を入れる容器としてのみ比較しています。取っ手の吊り下げ強度・海水への長期耐久性は未確認。海に下ろす水くみ用途には使わないでください。',['bucket']);
    else add('bucket-use','recommended','水くみ用のロープ付き','メーカーが水くみ用途として販売するEVAバケツです。付属ロープの長さが届かない高さや、禁止された場所では使わないでください。',['bucket']);
  }
  if (available('safety')) add('safety-fit','check','ライフジャケットのサイズ・使用環境','着用者の体格・固定状態と、選んだ製品の使用環境は未確認。各商品のサイズ・使用区分・装着方法を施設や販売店で確認してください。',['safety']);
  return results;
}

/** Method-specific checks compare only quantities whose material and units are known. */
export function evaluateMethodCompatibility(build:FishingBuild):CompatibilityResult[] {
  const equipment=equipmentFor(build), ids=equipment.map(c=>c.id), results:CompatibilityResult[]=[];
  const add=(id:string,status:CompatibilityStatus,title:string,reason:string,categoryIds:CategoryId[])=>results.push({id,status,title,reason,categoryIds});
  const selected=(id:CategoryId):Product|undefined=>!ids.includes(id)||build.owned.includes(id)?undefined:build.included.includes(id)&&id==='line'?includedLineProduct(build):byId.get(build.selection[id])||coveringProduct(build,id);
  const rod=selected('rod')?.technical, reel=selected('reel')?.technical, line=selected('line')?.technical;
  for(const c of equipment) {
    const p=selected(c.id);
    if(build.owned.includes(c.id)) add(`owned-${c.id}`,'check',`${c.label}は手持ちの道具`,'型番・素材・適合重量は未登録です。関係する道具と現物の仕様を確認してください。',ids.filter(id=>id===c.id||['rod','reel','line','leader','rig','sinker','basket','float','lure','egi','burakuri'].includes(id)));
    else if(!p) add(`missing-${c.id}`,'check',`${c.label}が未選択`,c.necessity==='required'?'商品・手持ち・付属品のいずれかを選んでください。':'必要に応じて準備する推奨品です。',[c.id]);
    else if(!productApplies(build,p)) add(`method-${c.id}`,'avoid',`${c.label}を釣り方・対象魚に合わせて選び直す`,`${p.name}は、この対象魚・釣法の候補ではありません。`,[c.id]);
    if(p && p.category===c.id && p.provides?.some(id=>id!==p.category&&(!!build.selection[id]||build.owned.includes(id)))) add(`duplicate-${c.id}`,'check',`${c.label}のセット内容を確認`,'セットに含まれる部品が別にも選択されています。予備として必要か確認し、付属品を使う場合は各項目の「セットの付属品を使う」を選んでください。',[c.id,...p.provides]);
  }
  if(rod&&reel) {
    const mismatch=rod.rodType&&reel.reelType&&rod.rodType!==reel.reelType;
    add('rod-reel',mismatch?'avoid':'check',mismatch?'竿とリールの方式が異なります':'竿とリールの取り付けを確認',mismatch?'ヘチ用とスピニング用を混在させないでください。':'実物での取り付けは未確認です。リール脚が竿の固定部分に収まるか、購入先で確認してください。',['rod','reel']);
  }
  if(reel&&line) {
    const material=line.lineMaterial||'nylon', capacity=line.lineSize===undefined?undefined:(material==='pe'?reel.peCapacity:material==='nylon'?reel.nylonCapacity:undefined)?.[line.lineSize];
    add('reel-line',capacity===undefined||line.lineLength===undefined?'check':line.lineLength>capacity?'avoid':'recommended','リールの糸巻量',capacity===undefined?'この素材・太さの巻糸量は未確認です。別素材の号数から推測しません。':`公称容量${capacity}m、使用する長さ${line.lineLength??'未確認'}m。巻く量と下巻きを確認してください。`,['reel','line']);
  }
  if(rod&&line?.lineMaterial==='pe'&&line.lineSize!==undefined&&rod.rodMinPe!==undefined&&rod.rodMaxPe!==undefined) add('rod-pe',line.lineSize<rod.rodMinPe||line.lineSize>rod.rodMaxPe?'avoid':'recommended','竿とPEの適合号数',`PE${line.lineSize}号に対し、竿の適合は${rod.rodMinPe}〜${rod.rodMaxPe}号です。`,['rod','line']);
  const loads:CategoryId[]=['sinker','basket','burakuri','lure','egi','tenbin'];
  const loaded=[...new Map(loads.filter(id=>ids.includes(id)).map(id=>selected(id)).filter((p):p is Product=>!!p).map(p=>[p.id,p])).values()];
  const mass=(p:Product)=>p.technical.weightG??p.technical.basketWeightG??((p.technical.sinkerSize??p.technical.basketWeight)!==undefined?(p.technical.sinkerSize??p.technical.basketWeight)!*3.75:undefined);
  const knownMass=loaded.reduce((sum,p)=>sum+(mass(p)??0),0);
  const max=rod?.rodMaxLureG??(rod?.rodMaxWeight!==undefined?rod.rodMaxWeight*3.75:undefined);
  if(rod&&loaded.length) {
    add('rod-load',max!==undefined&&knownMass>max?'avoid':'check',max!==undefined&&knownMass>max?'仕掛けの確認済み重量だけで竿の上限を超えています':'竿と仕掛けの重量を確認',`確認できた重量の合計${Math.round(knownMass*100)/100}g。竿の上限${max===undefined?'は未確認':`${max}g`}。${loaded.some(p=>mass(p)===undefined)?'重量未確認の部品があります。':''}${['lure','eging'].includes(build.methodId)?'接続金具を含めた総重量も確認します。':'エサ・ウキ・接続金具を含む実際の総重量を確認します。'}`,['rod',...loads.filter(id=>ids.includes(id)),'bait']);
  }
  const egi=selected('egi')?.technical;
  if(egi?.egiSize!==undefined&&rod?.rodMinEgi!==undefined&&rod.rodMaxEgi!==undefined) add('rod-egi',egi.egiSize<rod.rodMinEgi||egi.egiSize>rod.rodMaxEgi?'avoid':'recommended','竿とエギの適合サイズ',`エギ${egi.egiSize}号に対し、竿は${rod.rodMinEgi}〜${rod.rodMaxEgi}号に対応します。`,['rod','egi']);
  const float=selected('float')?.technical;
  const ballast=selected(ids.includes('basket')?'basket':'sinker')?.technical;
  const ballastSize=ballast?.basketWeight??ballast?.sinkerSize;
  if(float&&ballast) add('float-load',float.floatLoadSize!==undefined&&ballastSize!==undefined&&ballastSize>float.floatLoadSize?'avoid':'check','ウキの浮力と仕掛けの負荷',`ウキの適合負荷${float.floatLoadSize??'未確認'}号、オモリの公称${ballastSize??'未確認'}号。カゴ本体・エサ・金具を含めて浮くか現物で調整してください。`,['float',ids.includes('basket')?'basket':'sinker','bait']);
  if(selected('leader')||selected('shock')) add('leader-knot','check','糸の接続・結束と耐摩耗性','素材が異なる糸の号数を同じ強度として扱いません。対象魚・根の荒さに合う太さ、傷、結び目とドラグを確認してください。',['line',ids.includes('shock')?'shock':'leader']);
  if(build.methodId==='kago'||build.methodId==='nage'||build.methodId==='uki-sabiki') add('casting-load','check','投げる総重量と周囲を確認','エサを入れた仕掛けやウキを含む全体の重さを確認してください。オモリの号数だけでは、遠くへ投げられるか判断できません。糸の結び方、投げ方、釣り場のルールも確認してください。',['rod','line',...(build.methodId==='nage'?['shock'] as CategoryId[]:['basket','float'] as CategoryId[])]);
  if(selected('safety')) add('safety-fit','check','ライフジャケットのサイズ・使用環境','着用者の体格・製品の使用環境を確認し、適切に装着してください。',['safety']);
  if(selected('bucket')?.generic) add('bucket-use','check','汎用バケツは地上での用途限定','海に下ろす水くみ用途には使わないでください。',['bucket']);
  return results;
}

/** Only published hosts are permitted; URLs from shared builds are never accepted. */
export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const hosts = new Set(['www.daiwa.com','www.hayabusa.co.jp','www.honda.co.jp','www.marukyu.com','bluestorm.jp','jp.daisonet.com','store.castingnet.jp','affiliate.amazon.co.jp','www.amazon.co.jp','www.jma.go.jp','www.kaiho.mlit.go.jp','yokohama-fishingpiers.jp','www.yamaria.co.jp','www.gamakatsu.co.jp','fish.shimano.com','begood-funegg.jackall.co.jp','www.ishiguro-gr.com','fishland.jp','www.proxinc.co.jp','www.seaguar.ne.jp','yamatoyo.com','www.majorcraft.co.jp','www.sasame.co.jp','www.daiichiseiko.com','www.fujitackle.com','fishing-fujiwara.com','www.owner.co.jp','www.rapala.co.jp','rapala.co.jp','fujitoki.co.jp','www.mr-dragon.jp','www.hamadashokai.co.jp','web.tsuribito.co.jp','www.yokohama-fishingpiers.jp','nankou-uotsuri-en.com','www.city.shizuoka.lg.jp','faq.globeride.co.jp','www.mlit.go.jp','www6.kaiho.mlit.go.jp','www.komeri.com']);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && hosts.has(url.hostname) ? url.href : null;
  } catch { return null; }
}
export function encodeBuild(build: FishingBuild): string {
  const bytes = new TextEncoder().encode(JSON.stringify({v:4,conditions:build.conditions,fishId:build.fishId,methodId:build.methodId,selection:build.selection,checked:build.checked,owned:build.owned,answers:build.answers,included:build.included,prices:build.prices,shipping:build.shipping,...(build.drafts?{drafts:build.drafts}:{}),...(build.preparation?{preparation:build.preparation}:{})}));
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
const record = (value:unknown): value is Record<string,unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
export function decodeBuild(encoded: string): FishingBuild | null {
  try {
    if (encoded.length < 8 || encoded.length > 65000 || !/^[\w-]+$/.test(encoded)) return null;
    const binary = atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));
    const value: unknown = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0))));
    if (!record(value) || ![1,2,3,4].includes(value.v as number) || !record(value.conditions) || !record(value.selection)) return null;
    const c = value.conditions;
    if (typeof c.month !== 'number' || !Number.isInteger(c.month) || c.month < 1 || c.month > 12 || !areas.some(a => a.id === c.area) || !fishingFields.some(f=>f.id===c.field)) return null;
    if (typeof value.fishId !== 'string' || (value.fishId !== '' && !fishSpecies.some(f=>f.id===value.fishId))) return null;
    const conditions: FishingConditions = {month:c.month,area:c.area as string,field:c.field as string};
    if (value.v === 1 && isSupported(conditions) && value.fishId !== '' && !getFish(conditions).some(f=>f.id===value.fishId)) return null;
    if (value.v === 1 && isSupported(conditions) && value.fishId === '') return null;
    if (value.methodId !== '' && !methods.some(m => m.supported && m.id === value.methodId)) return null;
    if (value.v === 1 && value.methodId === '') return null;
    if (value.fishId !== '' && value.methodId !== '' && !fishSpecies.find(f=>f.id===value.fishId)?.methodIds.includes(value.methodId as string)) return null;
    const selection = {} as Record<CategoryId,string>;
    const replacedCategories: CategoryId[] = [];
    if(Object.keys(value.selection).some(id=>!knownCategories.has(id))) return null;
    for (const id of categoryIds.filter(id=>Object.hasOwn(value.selection as object,id)||categories.some(c=>c.id===id))) {
      let chosen = value.selection[id];
      if (typeof chosen === 'string' && Object.hasOwn(replacedProductIds, chosen)) { chosen = replacedProductIds[chosen]; replacedCategories.push(id); }
      if (typeof chosen !== 'string' || (chosen !== '' && byId.get(chosen)?.category !== id)) return null;
      selection[id] = chosen;
    }
    const list = (candidate:unknown): CategoryId[] | null => Array.isArray(candidate) && candidate.length <= categoryIds.length && candidate.every(v => typeof v === 'string' && knownCategories.has(v)) ? [...new Set(candidate)] as CategoryId[] : null;
    const checked = list(value.checked);
    const owned = list(value.owned ?? []);
    const included = list(value.included ?? []);
    const answers = value.answers ?? {};
    const prices = value.prices ?? {};
    const shipping = value.shipping ?? {selected:null,reference:null};
    const money = (n:unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n <= 10_000_000;
    if (!checked || !owned || !included || !validAnswers(answers) || !record(prices) || !record(shipping)) return null;
    if (Object.entries(prices).some(([id,n])=>!byId.has(id)||!money(n))) return null;
    if ((shipping.selected !== null && !money(shipping.selected)) || (shipping.reference !== null && !money(shipping.reference))) return null;
    if (included.some(id=>id !== 'line' || selection.line !== '' || owned.includes('line') || owned.includes('reel') || !byId.get(selection.reel)?.technical.includedLine)) return null;
    if (owned.some(id=>included.includes(id))) return null;
    if (value.preparation !== undefined && !validPreparation(value.preparation)) return null;
    if (value.preparation?.arrangements && Object.keys(value.preparation.arrangements).some(id => selection[id as CategoryId] || owned.includes(id as CategoryId) || included.includes(id as CategoryId))) return null;
    const result:FishingBuild={ conditions,fishId:value.fishId,methodId:value.methodId as string,selection,checked,owned,answers,included,prices:prices as Record<string,number>,shipping:{selected:shipping.selected as number|null,reference:shipping.reference as number|null},...(replacedCategories.length ? {replacedCategories} : {}) };
    if (value.preparation !== undefined) result.preparation = value.preparation;
    result.checked=checked.filter(id=>(!!selection[id]||owned.includes(id)||included.includes(id)||!!coveringProduct(result,id)||!!result.preparation?.arrangements?.[id])&&!replacedCategories.includes(id));
    if(value.drafts!==undefined) {
      if(![3,4].includes(value.v as number)||!record(value.drafts)||Object.keys(value.drafts).length>120) return null;
      const drafts:Record<string,EquipmentDraft>={};
      for(const [key,draft] of Object.entries(value.drafts)) {
        if(!record(draft)) return null;
        const [fishId,methodId,...extra]=key.split(':');
        if(extra.length||!fishSpecies.find(f=>f.id===fishId)?.methodIds.includes(methodId)||!selectableMethodIds.includes(methodId)) return null;
        // Reuse the strict active-selection validator, without recursive drafts.
        const decoded=decodeBuild(encodeBuild({...result,fishId,methodId,selection:draft.selection as Record<CategoryId,string>,checked:draft.checked as CategoryId[],owned:draft.owned as CategoryId[],included:draft.included as CategoryId[],shipping:draft.shipping as FishingBuild['shipping'],preparation:draft.preparation as PreparationPlan|undefined,drafts:undefined}));
        if(!decoded) return null;
        drafts[key]={selection:decoded.selection,checked:decoded.checked,owned:decoded.owned,included:decoded.included,shipping:decoded.shipping,...(decoded.preparation?{preparation:decoded.preparation}:{})};
      }
      result.drafts=drafts;
    }
    return result;
  } catch { return null; }
}
