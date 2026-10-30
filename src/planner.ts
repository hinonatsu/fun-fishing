import { categories, defaultSelection, products, type CategoryId, type Product } from './catalog';
import { questions, requiredQuestions } from './diagnosis';
import { evaluateCompatibility, getFish, isSupported, type FishingBuild } from './domain';
import { productPrice } from './pricing';

export function answeredRequired(build: FishingBuild) {
  return requiredQuestions.filter(q => !!build.answers[q.id]).length;
}
export function nextQuestion(build: FishingBuild) {
  return questions.find(q => !build.answers[q.id]);
}
export function hasChoice(build: FishingBuild, id: CategoryId) {
  return !!build.selection[id] || build.owned.includes(id) || build.included.includes(id);
}
export function chosenCount(build: FishingBuild) {
  return categories.filter(c => hasChoice(build, c.id)).length;
}
export function firstUnchosen(build: FishingBuild) {
  return categories.find(c => !hasChoice(build, c.id))?.id;
}
export function compatibilityForBuild(build: FishingBuild) {
  const selection = build.included.includes('line') ? { ...build.selection, line: 'line-3' } : build.selection;
  return evaluateCompatibility(selection, build.owned).filter(r => !(build.included.includes('line') && r.id === 'included-line'));
}
export function canComplete(build: FishingBuild) {
  return isSupported(build.conditions) && !!build.fishId && !!build.methodId
    && chosenCount(build) === categories.length && !compatibilityForBuild(build).some(r => r.status === 'avoid');
}
export function chooseProduct(build: FishingBuild, category: CategoryId, id: string): FishingBuild {
  const included = build.included.filter(c => c !== category && !(category === 'reel' && c === 'line'));
  return { ...build, selection: { ...build.selection, [category]: id }, owned: build.owned.filter(c => c !== category), included, checked: [], shipping: { selected: null, reference: null } };
}
export function chooseOwned(build: FishingBuild, category: CategoryId): FishingBuild {
  const next = chooseProduct(build, category, '');
  return { ...next, owned: [...next.owned, category] };
}
export function chooseIncludedLine(build: FishingBuild): FishingBuild {
  const reel = products.find(p => p.id === build.selection.reel);
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
  return products.filter(p => p.category === category && candidateStatus(build, p) !== 'avoid');
}
export function recommendedProduct(build: FishingBuild, category: CategoryId) {
  const eligible = candidatesFor(build, category).filter(p => !p.generic || build.answers.water === 'tap');
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
  return eligible.find(p => p.id === defaultSelection[category]) || eligible[0];
}
export function rankedFish(build: FishingBuild) {
  const preferred = build.answers.goal === 'fight' ? 'saba' : build.answers.goal === 'first' ? 'iwashi' : 'aji';
  return [...getFish(build.conditions)].sort((a,b) => Number(b.id === preferred) - Number(a.id === preferred));
}
export function fishReason(build: FishingBuild, fishId: string) {
  if (fishId === 'saba' && build.answers.goal === 'fight') return '「魚とのやり取りを楽しみたい」という回答から、小サバの元気な引きを提案します。';
  if (fishId === 'iwashi' && build.answers.goal === 'first') return '「まずは一匹」という回答から、群れとの出会いを楽しむ釣りを提案します。';
  if (fishId === 'aji' && build.answers.goal === 'food') return '「おいしく食べたい」という回答から、食卓でも楽しめるアジを提案します。';
  return `${build.conditions.month}月・東京湾の堤防の季節データに含まれる魚です。回遊の状況は釣り場で確認しましょう。`;
}

export interface PriceRow { category: CategoryId; product: Product; reference: Product; selected: number | null; baseline: number | null; comparable: boolean }
export function priceComparison(build: FishingBuild) {
  const rows: PriceRow[] = categories.flatMap(c => {
    if (build.owned.includes(c.id) || build.included.includes(c.id)) return [];
    const product = products.find(p => p.id === build.selection[c.id]);
    const reference = products.find(p => p.id === defaultSelection[c.id]);
    return product && reference ? [{ category: c.id, product, reference, selected: productPrice(build,product), baseline: productPrice(build,reference), comparable: !product.generic || build.answers.water === 'tap' }] : [];
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
  if (screen === 'search' || /^conditions\/(month|area|field)$/.test(screen)) return screen;
  if (!isSupported(build.conditions)) return 'discover';
  const completeLegacy = canComplete(build);
  const required = requiredQuestions.find(q => !build.answers[q.id]);
  if (screen.startsWith('diagnosis/')) {
    const id = screen.split('/')[1];
    if (required && (id === 'ready' || questions.findIndex(q => q.id === id) >= 3)) return `diagnosis/${required.id}`;
    return id === 'ready' || questions.some(q => q.id === id) ? screen : 'search';
  }
  if (!['discover','method','review','checkout','list','save','shipping','builder'].includes(screen) && !/^builder\/(rod|reel|line|rig|basket|bait|bucket|safety)$/.test(screen) && !/^prices\/(rod|reel|line|rig|basket|bait|bucket|safety)$/.test(screen)) return 'search';
  if (required && !completeLegacy) return `diagnosis/${required.id}`;
  if (screen === 'discover') return screen;
  if (!getFish(build.conditions).some(f => f.id === build.fishId)) return 'discover';
  if (screen === 'method') return screen;
  if (build.methodId !== 'sabiki') return 'method';
  if (screen === 'builder' || screen.startsWith('builder/')) return screen;
  if (!canComplete(build)) return 'builder';
  return screen;
}
