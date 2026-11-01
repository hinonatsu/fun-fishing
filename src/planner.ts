import { categories, findProduct, fishSpecies, methods, products, type CategoryId, type Product } from './catalog';
import { questions, requiredQuestions } from './diagnosis';
import { createDefaultBuild, evaluateCompatibility, evaluateMethodCompatibility, getFish, hasProductGuide, type FishingBuild, type EquipmentDraft } from './domain';
import { productPrice } from './pricing';
import { rigById } from './rigs';
import { coveringProduct, equipmentFor, includedLineProduct, productApplies, referenceProduct, requiredEquipment } from './equipment';

export function answeredRequired(build: FishingBuild) {
  return requiredQuestions.filter(q => !!build.answers[q.id]).length;
}
export function nextQuestion(build: FishingBuild) {
  return questions.find(q => !build.answers[q.id]);
}
export function hasChoice(build: FishingBuild, id: CategoryId) {
  return findProduct(build.selection[id])?.category === id || build.owned.includes(id) || build.included.includes(id) || !!coveringProduct(build,id);
}
export function chosenCount(build: FishingBuild) {
  return equipmentFor(build).filter(c => hasChoice(build, c.id)).length;
}
export const requiredChosenCount=(build:FishingBuild)=>requiredEquipment(build).filter(c=>hasChoice(build,c.id)).length;
export function isPrepared(build:FishingBuild,id:CategoryId):boolean {
  const set=coveringProduct(build,id);
  return build.owned.includes(id)||build.checked.includes(id)||!!(set&&build.checked.includes(set.category))||(id==='line'&&build.included.includes('line')&&build.checked.includes('reel'));
}
export function firstUnchosen(build: FishingBuild) {
  return requiredEquipment(build).find(c => !hasChoice(build, c.id))?.id;
}
export function compatibilityForBuild(build: FishingBuild) {
  const selection = build.included.includes('line') ? { ...build.selection, line: includedLineProduct(build)?.id||'' } : build.selection;
  if(build.methodId!=='sabiki'||build.fishId==='kamasu') return evaluateMethodCompatibility(build);
  const results=evaluateCompatibility(selection,build.owned).filter(r=>!(build.included.includes('line')&&r.id==='included-line'));
  for(const c of equipmentFor(build)) {
    const p=findProduct(selection[c.id]);
    if(p&&!build.owned.includes(c.id)&&!productApplies(build,p)) results.push({id:`method-${c.id}`,status:'avoid',title:`${c.label}を対象魚・釣法に合わせて選び直す`,reason:'この対象魚・釣法の候補ではありません。',categoryIds:[c.id]});
    if(c.necessity==='required'&&!categories.some(old=>old.id===c.id)&&!hasChoice(build,c.id)) results.push({id:`missing-${c.id}`,status:'check',title:`${c.label}が未選択`,reason:'商品か手持ちの道具を選んでください。',categoryIds:[c.id]});
  }
  return results;
}
export function canComplete(build: FishingBuild) {
  return hasProductGuide(build) && !!build.fishId && !!build.methodId
    && requiredEquipment(build).every(c=>hasChoice(build,c.id)) && !compatibilityForBuild(build).some(r => r.status === 'avoid');
}
export function chooseProduct(build: FishingBuild, category: CategoryId, id: string): FishingBuild {
  const product=findProduct(id);
  if(id && (!product || (product.category!==category&&!product.provides?.includes(category)))) return build;
  if(product && product.category!==category) {
    const cleared=chooseProduct(build,category,'');
    return chooseProduct(cleared,product.category,id);
  }
  const included = build.included.filter(c => c !== category && !(category === 'reel' && c === 'line'));
  return { ...build, selection: { ...build.selection, [category]: id }, owned: build.owned.filter(c => c !== category), included, checked: [], shipping: { selected: null, reference: null } };
}
export function chooseSetIncluded(build:FishingBuild,category:CategoryId):FishingBuild {
  const next=chooseProduct(build,category,'');
  return coveringProduct(next,category)?next:build;
}
export function switchFishingPlan(build:FishingBuild,fishId:string,methodId:string):FishingBuild {
  if(build.fishId===fishId&&build.methodId===methodId) return build;
  const drafts={...build.drafts};
  const snapshot:EquipmentDraft={selection:{...build.selection},owned:[...build.owned],included:[...build.included],checked:[...build.checked],shipping:{...build.shipping}};
  if(hasProductGuide(build)) drafts[`${build.fishId}:${build.methodId}`]=snapshot;
  const saved=drafts[`${fishId}:${methodId}`];
  const empty=createDefaultBuild(build.conditions);
  return {...build,fishId,methodId,selection:saved?{...saved.selection}:empty.selection,owned:saved?[...saved.owned]:[],included:saved?[...saved.included]:[],checked:saved?[...saved.checked]:[],shipping:saved?{...saved.shipping}:empty.shipping,drafts};
}
export function chooseOwned(build: FishingBuild, category: CategoryId): FishingBuild {
  const next = chooseProduct(build, category, '');
  return { ...next, owned: [...next.owned, category] };
}
export function chooseIncludedLine(build: FishingBuild): FishingBuild {
  const reel = findProduct(build.selection.reel);
  if (!reel?.technical.includedLine || build.owned.includes('reel')) return build;
  const next = chooseProduct(build, 'line', '');
  return { ...next, included: [...next.included, 'line'] };
}
export function candidateStatus(build: FishingBuild, product: Product) {
  const results = compatibilityForBuild(chooseProduct(build, product.category, product.id))
    .filter(r => r.categoryIds.includes(product.category) && !r.id.startsWith('missing-'));
  return results.some(r => r.status === 'avoid') ? 'avoid' : !results.length || results.some(r => r.status === 'check') ? 'check' : 'recommended';
}
export function candidatesFor(build: FishingBuild, category: CategoryId) {
  if (!hasProductGuide(build)) return [];
  const categoryIds = new Set(equipmentFor(build).map(c => c.id));
  if(!categoryIds.has(category)) return [];
  return products.filter(p => (p.category === category || p.provides?.includes(category)) && categoryIds.has(p.category) && productApplies(build,p) && candidateStatus(build, p) !== 'avoid');
}
export function recommendedProduct(build: FishingBuild, category: CategoryId) {
  const eligible = candidatesFor(build, category).filter(p => !p.generic || build.answers.water === 'tap');
  if(category==='leader'&&['hechi','bukkomi'].includes(build.methodId)) {
    const tied=eligible.find(p=>p.category==='hook'&&p.provides?.includes('leader'));
    if(tied) return tied;
  }
  if (category === 'bucket' && build.answers.water === 'tap' && build.answers.priority === 'cost') {
    // A lower price must be observed, never inferred from a product being generic.
    const quoted = eligible.filter(p => productPrice(build,p) !== null).sort((a,b) => productPrice(build,a)! - productPrice(build,b)!);
    if (quoted.length) return quoted[0];
  }
  if (category === 'reel' && (build.answers.experience === 'first' || build.answers.cleanup === 'simple')) return eligible.find(p => !!p.technical.includedLine) || eligible[0];
  if (build.answers.priority === 'cost') {
    const quoted = eligible.filter(p => productPrice(build,p) !== null && candidateStatus(build, p) !== 'check').sort((a,b) => productPrice(build,a)! - productPrice(build,b)!);
    if (quoted.length) return quoted[0];
  }
  return eligible.find(p => p.id === referenceProduct(build,category)?.id) || eligible[0];
}
export function rankedFish(build: FishingBuild) {
  const preferred = build.answers.goal === 'fight' ? 'saba' : build.answers.goal === 'first' ? 'iwashi' : 'aji';
  const seasonal = new Set(getFish(build.conditions).map(f => f.id));
  return [...fishSpecies].sort((a,b) => Number(b.id === preferred && seasonal.has(b.id)) - Number(a.id === preferred && seasonal.has(a.id)) || Number(seasonal.has(b.id)) - Number(seasonal.has(a.id)));
}
export function fishReason(build: FishingBuild, fishId: string) {
  if (!getFish(build.conditions).some(f => f.id === fishId)) return fishSpecies.find(f => f.id === fishId)?.habitat || '現地の時期と釣果を確認しましょう。';
  if (fishId === 'saba' && build.answers.goal === 'fight') return '「魚とのやり取りを楽しみたい」という回答から、小サバの元気な引きを提案します。';
  if (fishId === 'iwashi' && build.answers.goal === 'first') return '「まずは一匹」という回答から、群れとの出会いを楽しむ釣りを提案します。';
  if (fishId === 'aji' && build.answers.goal === 'food') return '「おいしく食べたい」という回答から、食卓でも楽しめるアジを提案します。';
  return `${build.conditions.month}月・東京湾の堤防の季節データに含まれる魚です。回遊の状況は釣り場で確認しましょう。`;
}

export interface PriceRow { category: CategoryId; product: Product; reference: Product; selected: number | null; baseline: number | null; comparable: boolean }
export function priceComparison(build: FishingBuild) {
  const rows: PriceRow[] = equipmentFor(build).flatMap(c => {
    if (build.owned.includes(c.id) || build.included.includes(c.id) || coveringProduct(build,c.id)) return [];
    const product = findProduct(build.selection[c.id]);
    const reference = referenceProduct(build,c.id);
    return product ? [{ category: c.id, product, reference:reference||product, selected: productPrice(build,product), baseline: reference?productPrice(build,reference):null, comparable:!!reference && (!product.generic || build.answers.water === 'tap') && JSON.stringify([...(product.provides||[])].sort())===JSON.stringify([...(reference.provides||[])].sort()) }] : [];
  });
  const knownCount = rows.filter(r => r.selected !== null).length;
  const selectedTotal = rows.length && knownCount === rows.length ? rows.reduce((sum,r) => sum + r.selected!,0) : null;
  const comparable = rows.length > 0 && rows.every(r => r.comparable && r.baseline !== null && r.selected !== null);
  const referenceTotal = comparable ? rows.reduce((sum,r) => sum + r.baseline!,0) : null;
  const productDifference = selectedTotal !== null && referenceTotal !== null ? referenceTotal - selectedTotal : null;
  const selectedPayment = selectedTotal !== null && build.shipping.selected !== null ? selectedTotal + build.shipping.selected : null;
  const referencePayment = referenceTotal !== null && build.shipping.reference !== null ? referenceTotal + build.shipping.reference : null;
  const paymentDifference = selectedPayment !== null && referencePayment !== null ? referencePayment - selectedPayment : null;
  return { rows, knownCount, selectedTotal, referenceTotal, productDifference, selectedPayment, referencePayment, paymentDifference };
}
export const yen = (value: number) => `${value.toLocaleString('ja-JP')}円`;

/** Every decision has a URL. Guards protect direct links as well as browser history. */
export function resolveScreen(requested: string, build: FishingBuild): string {
  const screen = requested || 'search';
  if (screen === 'rigs') return 'rigs/sabiki';
  if (screen.startsWith('rigs/')) return rigById(screen.slice(5)) ? screen : 'rigs/sabiki';
  if (screen === 'search' || /^conditions\/(month|area|field)$/.test(screen)) return screen;
  const completeLegacy = canComplete(build);
  const required = requiredQuestions.find(q => !build.answers[q.id]);
  if (screen.startsWith('diagnosis/')) {
    const id = screen.split('/')[1];
    if (required && (id === 'ready' || questions.findIndex(q => q.id === id) >= 3)) return `diagnosis/${required.id}`;
    return id === 'ready' || questions.some(q => q.id === id) ? screen : 'search';
  }
  const categoryScreen=/^(builder|prices)\/([a-z-]+)$/.exec(screen);
  if (!['discover','method','review','checkout','list','save','shipping','builder'].includes(screen) && !categoryScreen) return 'search';
  if (required && !completeLegacy) return `diagnosis/${required.id}`;
  if (screen === 'discover') return screen;
  if (!fishSpecies.some(f => f.id === build.fishId)) return 'discover';
  if (screen === 'method') return screen;
  if (!methods.some(m => m.supported && m.id === build.methodId) || !fishSpecies.find(f => f.id === build.fishId)?.methodIds.includes(build.methodId)) return 'method';
  if (!hasProductGuide(build)) return 'builder';
  if(categoryScreen&&!equipmentFor(build).some(c=>c.id===categoryScreen[2])) return 'builder';
  if (screen === 'builder' || screen.startsWith('builder/')) return screen;
  if (!canComplete(build)) return 'builder';
  if(categoryScreen?.[1]==='prices'&&(!build.selection[categoryScreen[2] as CategoryId]||build.owned.includes(categoryScreen[2] as CategoryId)||build.included.includes(categoryScreen[2] as CategoryId))) return 'review';
  return screen;
}
