import { categories, findProduct, fishSpecies, methods, products, type CategoryId, type Product } from './catalog';
import { questions, requiredQuestions } from './diagnosis';
import { createDefaultBuild, evaluateCompatibility, evaluateMethodCompatibility, getFish, hasProductGuide, type FishingBuild, type EquipmentDraft } from './domain';
import { productPrice } from './pricing';
import { rigById } from './rigs';
import { coveringProduct, equipmentFor, includedLineProduct, productApplies, referenceProduct, requiredEquipment } from './equipment';
import { arrangementFor, arrangementLabel, purchaseQuantity } from './preparation';

export function answeredRequired(build: FishingBuild) {
  return requiredQuestions.filter(q => !!build.answers[q.id]).length;
}
export function nextQuestion(build: FishingBuild) {
  return questions.find(q => !build.answers[q.id]);
}
export function hasChoice(build: FishingBuild, id: CategoryId) {
  return findProduct(build.selection[id])?.category === id || build.owned.includes(id) || build.included.includes(id) || !!coveringProduct(build,id) || !!arrangementFor(build,id);
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
  const arranged = equipmentFor(build).filter(c => arrangementFor(build,c.id)).map(c => c.id);
  const effective = arranged.length ? { ...build, owned: [...new Set([...build.owned,...arranged])] } : build;
  const selection = build.included.includes('line') ? { ...build.selection, line: includedLineProduct(build)?.id||'' } : build.selection;
  const results = build.methodId!=='sabiki'||build.fishId==='kamasu' ? evaluateMethodCompatibility(effective) : evaluateCompatibility(selection,effective.owned).filter(r=>!(build.included.includes('line')&&r.id==='included-line'));
  for (const r of results) {
    const arrangedCategory = arranged.find(id => r.id === `owned-${id}`);
    if (arrangedCategory) { r.title = `${equipmentFor(build).find(c=>c.id===arrangedCategory)?.label}の準備先で確認`; r.reason = `${arrangementLabel(arrangementFor(build,arrangedCategory)!)}予定です。商品・費用・予約・サイズは未確定です。準備先で、ほかの道具との組み合わせを確認してください。`; }
    if (r.id === 'reel-line' && build.included.includes('line') && r.status === 'recommended') r.reason = `選択したリールに付属する${findProduct(build.selection.reel)?.technical.includedLine}を使います。糸の追加購入はありません。使用前に傷と巻き具合を確認します。`;
  }
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
  const preparation = build.preparation ? { ...build.preparation, arrangements:{...build.preparation.arrangements}, deliveries:{...build.preparation.deliveries}, shippingOrders:undefined } : undefined;
  if (preparation) { delete preparation.arrangements[category]; delete preparation.deliveries[category]; }
  return { ...build, selection: { ...build.selection, [category]: id }, owned: build.owned.filter(c => c !== category), included, checked: [], shipping: { selected: null, reference: null }, ...(preparation?{preparation}:{}) };
}
export function removeOptional(build: FishingBuild, category: CategoryId): FishingBuild {
  return equipmentFor(build).find(c=>c.id===category)?.necessity === 'required' ? build : chooseProduct(build,category,'');
}
export function chooseSetIncluded(build:FishingBuild,category:CategoryId):FishingBuild {
  const next=chooseProduct(build,category,'');
  return coveringProduct(next,category)?next:build;
}
export function switchFishingPlan(build:FishingBuild,fishId:string,methodId:string):FishingBuild {
  if(build.fishId===fishId&&build.methodId===methodId) return build;
  const drafts={...build.drafts};
  const snapshot:EquipmentDraft={selection:{...build.selection},owned:[...build.owned],included:[...build.included],checked:[...build.checked],shipping:{...build.shipping},...(build.preparation?{preparation:build.preparation}:{})};
  if(hasProductGuide(build)) drafts[`${build.fishId}:${build.methodId}`]=snapshot;
  const saved=drafts[`${fishId}:${methodId}`];
  const empty=createDefaultBuild(build.conditions);
  const preparation = build.preparation ? { people:build.preparation.people, hours:build.preparation.hours, tripDate:build.preparation.tripDate, ...(saved?.preparation||{}) } : saved?.preparation;
  return {...build,fishId,methodId,selection:saved?{...saved.selection}:empty.selection,owned:saved?[...saved.owned]:[],included:saved?[...saved.included]:[],checked:saved?[...saved.checked]:[],shipping:saved?{...saved.shipping}:empty.shipping,drafts,...(preparation?{preparation}:{})};
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
  return [...fishSpecies].sort((a,b) => Number(seasonal.has(b.id)) - Number(seasonal.has(a.id)) || Number(b.id === preferred) - Number(a.id === preferred) || a.difficulty-b.difficulty);
}
export function fishReason(build: FishingBuild, fishId: string) {
  const fish = fishSpecies.find(f=>f.id===fishId);
  if (!getFish(build.conditions).some(f => f.id === fishId)) {
    if (build.answers.goal === 'first' && fish?.difficulty === 1) return '「まずは一匹」という希望に合わせ、入門向けの魚を候補にしています。この月・地域で狙えるかは現地情報の確認が必要です。';
    if (build.answers.goal === 'food') return '「釣った魚を食べたい」という希望に合わせて比較する候補です。この月・地域の季節情報は未確認です。';
    if (build.answers.pace === 'calm' && fish?.methodIds.some(id=>['sabiki','float','bukkomi','choi-nage','dozuki'].includes(id))) return '「のんびり過ごす」という希望から、待つ釣り方がある魚を比較できます。地域・季節への適性は別に確認します。';
    return '好みと釣り方を比較するための候補です。この月・地域で狙えるかは現地情報を確認しましょう。';
  }
  if (fishId === 'saba' && build.answers.goal === 'fight') return '「魚とのやり取りを楽しみたい」という回答から、小サバの元気な引きを提案します。';
  if (fishId === 'iwashi' && build.answers.goal === 'first') return '「まずは一匹」という回答から、群れとの出会いを楽しむ釣りを提案します。';
  if (fishId === 'aji' && build.answers.goal === 'food') return '「おいしく食べたい」という回答から、食卓でも楽しめるアジを提案します。';
  return `${build.conditions.month}月・東京湾の堤防の季節データに含まれる魚です。回遊の状況は釣り場で確認しましょう。`;
}

export interface PriceRow { category: CategoryId; product: Product; reference: Product; quantity: number; selected: number | null; baseline: number | null; comparable: boolean }
export function priceComparison(build: FishingBuild) {
  const rows: PriceRow[] = equipmentFor(build).flatMap(c => {
    if (build.owned.includes(c.id) || build.included.includes(c.id) || coveringProduct(build,c.id) || arrangementFor(build,c.id)) return [];
    const product = findProduct(build.selection[c.id]);
    const reference = referenceProduct(build,c.id);
    const quantity = purchaseQuantity(build,c.id);
    const price = product ? productPrice(build,product) : null;
    const baseline = reference ? productPrice(build,reference) : null;
    return product ? [{ category: c.id, product, reference:reference||product, quantity, selected: price === null ? null : price*quantity, baseline: baseline === null ? null : baseline*quantity, comparable:!!reference && (!product.generic || build.answers.water === 'tap') && JSON.stringify([...(product.provides||[])].sort())===JSON.stringify([...(reference.provides||[])].sort()) }] : [];
  });
  // An included selected line cannot also disappear from a threadless reference reel.
  const referenceExtras: {category:CategoryId;product:Product;quantity:number;price:number|null}[] = [];
  const referenceReel = rows.find(r=>r.category==='reel')?.reference;
  if (build.included.includes('line') && referenceReel && !referenceReel.technical.includedLine) {
    const p = referenceProduct(build,'line');
    if (p) {
      const used = includedLineProduct(build)?.technical.lineLength;
      const quantity = used && p.technical.spoolLength ? Math.ceil(used*purchaseQuantity(build,'reel')/p.technical.spoolLength) : purchaseQuantity(build,'reel');
      const price=productPrice(build,p);
      referenceExtras.push({category:'line',product:p,quantity,price:price===null?null:price*quantity});
    }
  }
  const knownCount = rows.filter(r => r.selected !== null).length;
  const knownSubtotal = rows.reduce((sum,r)=>sum+(r.selected??0),0);
  const selectedTotal = rows.length ? knownCount === rows.length ? knownSubtotal : null : chosenCount(build)>0 ? 0 : null;
  const comparable = rows.length > 0 && rows.every(r => r.comparable && r.baseline !== null && r.selected !== null) && referenceExtras.every(r=>r.price!==null);
  const referenceTotal = comparable ? rows.reduce((sum,r) => sum + r.baseline!,0)+referenceExtras.reduce((sum,r)=>sum+r.price!,0) : null;
  const productDifference = selectedTotal !== null && referenceTotal !== null ? referenceTotal - selectedTotal : null;
  const selectedPayment = selectedTotal !== null && build.shipping.selected !== null ? selectedTotal + build.shipping.selected : null;
  const referencePayment = referenceTotal !== null && build.shipping.reference !== null ? referenceTotal + build.shipping.reference : null;
  const paymentDifference = selectedPayment !== null && referencePayment !== null ? referencePayment - selectedPayment : null;
  const requiredIds=new Set(requiredEquipment(build).map(c=>c.id));
  const requiredRows=rows.filter(r=>requiredIds.has(r.category));
  const requiredTotal=requiredRows.every(r=>r.selected!==null)?requiredRows.reduce((sum,r)=>sum+r.selected!,0):null;
  const arrangedCount=equipmentFor(build).filter(c=>arrangementFor(build,c.id)).length;
  return { rows, knownCount, knownSubtotal, selectedTotal, referenceTotal, referenceExtras, requiredTotal, arrangedCount, productDifference, selectedPayment, referencePayment, paymentDifference };
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
  if (!['discover','method','review','checkout','list','save','shipping','builder','trip','prices','budget'].includes(screen) && !categoryScreen) return 'search';
  if (required && !completeLegacy) return `diagnosis/${required.id}`;
  if (screen === 'discover') return screen;
  if (screen === 'trip') return screen;
  if (!fishSpecies.some(f => f.id === build.fishId)) return 'discover';
  if (screen === 'method') return screen;
  if (!methods.some(m => m.supported && m.id === build.methodId) || !fishSpecies.find(f => f.id === build.fishId)?.methodIds.includes(build.methodId)) return 'method';
  if (!hasProductGuide(build)) return 'builder';
  if(categoryScreen&&!equipmentFor(build).some(c=>c.id===categoryScreen[2])) return 'builder';
  if (screen === 'builder' || screen.startsWith('builder/') || screen === 'budget') return screen;
  if(screen==='prices')return screen;
  if(categoryScreen?.[1]==='prices')return build.selection[categoryScreen[2] as CategoryId]&&!build.owned.includes(categoryScreen[2] as CategoryId)&&!build.included.includes(categoryScreen[2] as CategoryId)?screen:'builder';
  if (!canComplete(build)) return 'builder';
  if(categoryScreen?.[1]==='prices'&&(!build.selection[categoryScreen[2] as CategoryId]||build.owned.includes(categoryScreen[2] as CategoryId)||build.included.includes(categoryScreen[2] as CategoryId))) return 'review';
  return screen;
}
