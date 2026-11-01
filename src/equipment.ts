import { allCategories, categories, defaultSelection, findProduct, products, type CategoryId, type EquipmentCategory, type Product } from './catalog';
import type { FishingBuild } from './domain';

export type EquipmentContext = Pick<FishingBuild,'fishId'|'methodId'|'answers'>;
const common: CategoryId[]=['rod','reel','line'];
const providersByCategory = new Map<CategoryId, Product[]>();
for (const product of products) for (const category of product.provides || []) {
  const providers = providersByCategory.get(category) || [];
  providers.push(product);
  providersByCategory.set(category, providers);
}
const parts: Record<string,CategoryId[]>={
  sabiki:['rig','basket','bait'], float:['stopper','float','swivel','leader','sinker','hook','bait'],
  lure:['leader','snap','lure'], hole:['leader','burakuri','bait'],
  bukkomi:['sinker','cushion','swivel','leader','hook','bait'],
  nage:['shock','tenbin','sinker','rig','bait'], 'choi-nage':['tenbin','sinker','rig','bait'],
  dozuki:['rig','sinker','bait'], 'uki-sabiki':['stopper','float','rig','basket','bait'],
  eging:['leader','snap','egi'], hechi:['leader','sinker','hook','bait'],
  kago:['stopper','float','tenbin','basket','leader','hook','chum','bait'],
};
export const selectableMethodIds=Object.keys(parts);
export function equipmentProfile(build: Pick<FishingBuild,'fishId'|'methodId'>): string {
  const {fishId,methodId}=build;
  if(methodId==='lure') return ['aji','mebaru','saba','kamasu'].includes(fishId)?'light-game':fishId==='kasago'?'rock-game':fishId==='kurodai'?'chinning':'shore-lure';
  if(methodId==='eging') return fishId==='tsutsuika'?'light-eging':'eging';
  if(methodId==='float' && ['sayori','tachiuo'].includes(fishId)) return `${fishId}-float`;
  if(methodId==='sabiki' && fishId==='kamasu') return 'kamasu-sabiki';
  if(methodId==='nage' && fishId==='hokke') return 'hokke-cast';
  return methodId;
}
export function equipmentFor(build: EquipmentContext): EquipmentCategory[] {
  const special:CategoryId[]|undefined=build.methodId==='sabiki'&&build.fishId==='kamasu'?['rig','sinker']:build.methodId==='nage'&&build.fishId==='hokke'?['shock','rig','sinker','bait']:build.methodId==='float'&&build.fishId==='sayori'?['float','basket','swivel','leader','hook','chum','bait']:undefined;
  const ids:CategoryId[]=[...common,...(special||parts[build.methodId]||parts.sabiki),'bucket','safety'];
  // Accessories are separate from the rig and never inflate its component count.
  ids.push('pliers','net');
  if(build.answers.keep==='eat') ids.push('cooler');
  return ids.map(id=>{
    const c={...allCategories.find(c=>c.id===id)!};
    if(['bucket','pliers','net','cooler'].includes(id)) c.necessity='recommended';
    if(id==='net' && (['hechi','kago'].includes(build.methodId)||['buri','hirame','suzuki','madai'].includes(build.fishId))) c.necessity='required';
    if(id==='rod') c.description='釣り方・対象魚に合う竿。適合する重量・糸を確認します。';
    if(id==='line') c.description='道糸の素材・太さ・巻く長さを、釣り方とリールに合わせます。';
    if(id==='rig' && build.methodId!=='sabiki' && build.methodId!=='uki-sabiki') {c.label=build.methodId==='dozuki'?'胴付き仕掛け':'投げ仕掛け';c.description='対象魚に合う針・ハリスの完成仕掛けを選びます。';}
    if(id==='rig'&&build.fishId==='kamasu'&&build.methodId==='sabiki') {c.label='カマス専用サビキ';c.description='カマス用の投げサビキ。カゴやコマセは使いません。';}
    if(id==='sinker'&&build.fishId==='kamasu'&&build.methodId==='sabiki') c.label='棒状オモリ';
    if(id==='basket'&&build.methodId==='kago') c.label='コマセカゴ';
    if(id==='basket'&&build.methodId==='float'&&build.fishId==='sayori') {c.label='ロケットカゴ';c.description='寄せエサを入れるカゴ。サヨリ用完成仕掛けの付属品を使えます。';}
    if(id==='pliers'&&build.fishId==='tachiuo') c.necessity='required';
    if(id==='sinker'&&build.methodId==='hechi') c.label='ガン玉';
    if(id==='float') {c.label='ウキ・完成仕掛け';c.description='対象魚に合うウキを選びます。完成セットに含まれる取付部品も反映します。';}
    if(build.methodId==='float'&&build.fishId==='tachiuo') {
      if(id==='float') c.label='電気ウキ・完成仕掛け';
      if(id==='hook') c.label='タチウオ用針仕掛け';
    }
    if(id==='rig'&&equipmentProfile(build)==='hokke-cast') c.label='投げ胴突仕掛け';
    if(id==='bait') {c.label=['sabiki','uki-sabiki'].includes(build.methodId)?'エサ・コマセ':'付けエサ';c.description='対象魚と釣り方に合わせたエサを選びます。';}
    return c;
  });
}
export const requiredEquipment=(build:EquipmentContext)=>equipmentFor(build).filter(c=>c.necessity==='required');
export function productApplies(build:EquipmentContext,p:Product):boolean {
  if(p.methodIds && !p.methodIds.includes(build.methodId)) return false;
  if(p.fishIds && !p.fishIds.includes(build.fishId)) return false;
  if(p.profiles && !p.profiles.includes(equipmentProfile(build))) return false;
  if(p.methodIds || p.profiles || p.fishIds) return true;
  if(['bucket','safety','net','pliers','cooler'].includes(p.category)) return true;
  if(p.category==='bait') return ['sabiki','uki-sabiki'].includes(build.methodId)&&build.fishId!=='kamasu';
  if(p.category==='rig') return ['sabiki','uki-sabiki'].includes(build.methodId)&&!['kamasu','hokke','nishin'].includes(build.fishId);
  if(p.category==='basket') return ['sabiki','uki-sabiki'].includes(build.methodId);
  if(p.category==='rod') return ['sabiki','float','hole','bukkomi','choi-nage','dozuki','uki-sabiki'].includes(build.methodId);
  if(p.category==='reel') return !['hechi','lure','eging','nage','kago'].includes(build.methodId);
  if(p.category==='line') return !['lure','eging'].includes(build.methodId) && !(build.methodId==='hechi'&&p.technical.lineSize!==2);
  return false;
}
/** Coverage is derived from the currently selected set, so changing it cannot leave stale included parts. */
export function coveringProduct(build:Pick<FishingBuild,'selection'|'owned'|'included'>&Partial<EquipmentContext>,category:CategoryId):Product|undefined {
  if(build.selection[category]||build.owned.includes(category)||build.included.includes(category)) return undefined;
  const context=build.fishId&&build.methodId?{fishId:build.fishId,methodId:build.methodId,answers:build.answers||{}}:undefined;
  return providersByCategory.get(category)?.find(p=>p.category!==category && build.selection[p.category]===p.id && !build.owned.includes(p.category) && (!context||(equipmentFor(context).some(c=>c.id===p.category)&&productApplies(context,p))));
}
export function includedLabel(build:Pick<FishingBuild,'selection'|'owned'|'included'>,category:CategoryId):string {
  const covering=coveringProduct(build,category);
  if(covering) return `${covering.name}に付属`;
  if(category==='line'&&build.included.includes('line')) return `リール付属の${findProduct(build.selection.reel)?.technical.includedLine||'糸'}`;
  return 'セットに付属';
}
export function includedLineProduct(build:Pick<FishingBuild,'selection'>):Product|undefined {
  const reel=findProduct(build.selection.reel);
  return findProduct(reel?.technical.includedLineProductId||'line-3');
}
export function referenceProduct(build:EquipmentContext,category:CategoryId):Product|undefined {
  const eligible=products.filter(p=>p.category===category&&productApplies(build,p));
  if(category==='rod') {
    const preferred:Record<string,string>={hole:'rod-anazuri-m110',nage:'rod-surf-25-420',hechi:'rod-hechi-bjx270',kago:'rod-isokaze-4-53','uki-sabiki':'rod-isokaze-4-53','rock-game':'rod-lurenist-86ml','shore-lure':'rod-lurenist-86m',chinning:'rod-lurenist-86ml',eging:'rod-lurenist-86ml','light-eging':'rod-lurenist-68ls','light-game':'rod-lurenist-68ls'};
    const rod=eligible.find(p=>p.id===(equipmentProfile(build)==='hokke-cast'?'rod-surf-25-420':preferred[equipmentProfile(build)]));
    if(rod) return rod;
  }
  if(category==='cooler') {
    const compact=["aji", "saba", "iwashi", "mebaru", "kasago", "kawahagi", "haze", "kisu", "sayori", "nishin", "tsutsuika"].includes(build.fishId);
    const cooler=eligible.find(p=>p.id===(compact?'cooler-minicool2-s650':'cooler-lighttrunk-s3200'));
    if(cooler)return cooler;
  }
  if(category==='bait') {
    const preferred=build.methodId==='hechi'?'bait-power-crab-black-m':build.fishId==='tachiuo'?'bait-kibinago':undefined;
    const bait=eligible.find(p=>p.id===preferred);if(bait)return bait;
  }
  return eligible.find(p=>p.id===defaultSelection[category])||eligible[0];
}
export const legacyCategoryIds=categories.map(c=>c.id);
