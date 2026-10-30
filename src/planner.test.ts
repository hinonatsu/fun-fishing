import { describe, expect, it, vi } from 'vitest';
import { categories, defaultSelection, products } from './catalog';
vi.mock('./data/amazon-prices.json', () => ({ default: { schemaVersion:1,updatedAt:null,products:{} } }));
import { questions } from './diagnosis';
import { createDefaultBuild, decodeBuild, encodeBuild, type FishingBuild } from './domain';
import { answeredRequired, canComplete, candidateStatus, candidatesFor, chosenCount, chooseIncludedLine, chooseOwned, chooseProduct, compatibilityForBuild, nextQuestion, priceComparison, rankedFish, recommendedProduct, resolveScreen } from './planner';

const conditions = {month:10,area:'tokyo-bay',field:'pier'};
function ready(): FishingBuild { return {...createDefaultBuild(conditions),answers:{goal:'food',pace:'calm',budget:'30000'},fishId:'aji',methodId:'sabiki'}; }
function complete() { return {...ready(),selection:{...defaultSelection}}; }

describe('explicit choices and diagnosis',()=>{
  it('starts with zero chosen products, no target and no method',()=>{
    const build = createDefaultBuild(conditions);
    expect(chosenCount(build)).toBe(0);
    expect(Object.values(build.selection).every(id=>id === '')).toBe(true);
    expect(build.fishId).toBe(''); expect(build.methodId).toBe('');
    expect(canComplete(build)).toBe(false);
    expect(decodeBuild(encodeBuild(build))).toEqual(build);
  });
  it('recommends a product without selecting it or any other slot',()=>{
    const build = ready();
    expect(recommendedProduct(build,'rod')?.id).toBe('rod-3-300');
    expect(chosenCount(build)).toBe(0);
    const next = chooseProduct(build,'rod','rod-3-300');
    expect(chosenCount(next)).toBe(1);
    expect(next.selection.reel).toBe('');
    expect(chosenCount(build)).toBe(0);
  });
  it('guards results and checkout until all three required questions are answered',()=>{
    const build = createDefaultBuild(conditions);
    expect(resolveScreen('discover',build)).toBe('diagnosis/goal');
    build.answers = {goal:'food',pace:'calm'};
    expect(answeredRequired(build)).toBe(2);
    expect(resolveScreen('diagnosis/ready',build)).toBe('diagnosis/budget');
    expect(resolveScreen('list',build)).toBe('diagnosis/budget');
    build.answers.budget = 'unsure';
    expect(resolveScreen('discover',build)).toBe('discover');
    expect(nextQuestion(build)?.id).toBe('experience');
  });
  it('can answer every available additional question and still return to results',()=>{
    const build = ready();
    for (const q of questions.slice(3)) build.answers[q.id] = q.options[0].value;
    expect(Object.keys(build.answers).length).toBeGreaterThan(6);
    expect(nextQuestion(build)).toBeUndefined();
    expect(resolveScreen('discover',build)).toBe('discover');
    expect(decodeBuild(encodeBuild(build))?.answers).toEqual(build.answers);
  });
  it('changes fish ranking according to the goal',()=>{
    const build = ready();
    expect(rankedFish(build)[0].id).toBe('aji');
    expect(rankedFish({...build,answers:{...build.answers,goal:'fight'}})[0].id).toBe('saba');
    expect(rankedFish({...build,answers:{...build.answers,goal:'first'}})[0].id).toBe('iwashi');
  });
  it('requires every category, including the recommended bucket, to be decided',()=>{
    const build = complete(); build.selection.bucket = '';
    expect(canComplete(build)).toBe(false);
    expect(resolveScreen('checkout',build)).toBe('builder');
    expect(resolveScreen('builder/safety',build)).toBe('builder/safety');
    expect(canComplete(chooseOwned(build,'bucket'))).toBe(true);
  });
  it('opens the equipment overview and any category without imposing an order',()=>{
    const build = ready();
    expect(resolveScreen('builder',build)).toBe('builder');
    expect(resolveScreen('builder/reel',build)).toBe('builder/reel');
    expect(resolveScreen('builder/safety',build)).toBe('builder/safety');
    expect(resolveScreen('review',build)).toBe('builder');
  });
});

describe('compatibility and included equipment',()=>{
  it('hides a basket exceeding the chosen rod while keeping the original state intact',()=>{
    const build = complete(); build.selection.rod = 'rod-2-300';
    expect(candidatesFor(build,'basket').map(p=>p.id)).not.toContain('basket-riseway-10');
    expect(build.selection.basket).toBe('basket-riseway-6');
  });
  it('does not mark an unevaluated combination as verified',()=>{
    const build = ready();
    expect(candidateStatus(build,recommendedProduct(build,'rod')!)).toBe('check');
  });
  it('does not silently remove an existing conflicting selection',()=>{
    const build = complete(); build.selection.basket = 'basket-riseway-10'; build.selection.rod = 'rod-2-300';
    expect(canComplete(build)).toBe(false);
    expect(resolveScreen('review',build)).toBe('builder');
    expect(build.selection.rod).toBe('rod-2-300');
  });
  it('requires an explicit choice to use included line, then invalidates it if the reel changes',()=>{
    const build = chooseProduct(complete(),'reel','reel-2500');
    const included = chooseIncludedLine(build);
    expect(included.selection.line).toBe('');
    expect(included.included).toEqual(['line']);
    expect(chosenCount(included)).toBe(categories.length);
    expect(canComplete(included)).toBe(true);
    expect(compatibilityForBuild(included).some(r=>r.id === 'missing-line')).toBe(false);
    expect(priceComparison(included).rows.some(r=>r.category === 'line')).toBe(false);
    expect(decodeBuild(encodeBuild(included))).toEqual(included);
    const changed = chooseProduct(included,'reel','reel-cf2500');
    expect(changed.included).toEqual([]);
    expect(resolveScreen('review',changed)).toBe('builder');
  });
  it('keeps owned specifications unverified and excludes them from both price totals',()=>{
    const build = chooseOwned(complete(),'rod');
    expect(compatibilityForBuild(build).find(r=>r.id === 'owned-rod')?.status).toBe('check');
    expect(priceComparison(build).rows).toHaveLength(7);
  });
});

describe('honest price comparison',()=>{
  it('uses daily prices in totals, prefers manual prices and excludes expired or failed quotes',()=>{
    const rod = products.find(p=>p.id === 'rod-3-300')!;
    const previous = rod.amazonPrice;
    const now = Date.now();
    const clock = vi.spyOn(Date,'now').mockReturnValue(now);
    try {
      rod.amazonPrice = {asin:'B06Y5DCTZD',currency:'JPY',price:1234,fetchedAt:new Date(now).toISOString(),attemptedAt:new Date(now).toISOString(),status:'ok',error:null};
      const build = chooseProduct(ready(),'rod',rod.id);
      expect(priceComparison(build)).toMatchObject({selectedTotal:1234,referenceTotal:1234,productDifference:0});
      build.prices[rod.id] = 500;
      expect(priceComparison(build).selectedTotal).toBe(500);
      delete build.prices[rod.id];
      rod.amazonPrice.status = 'blocked';
      expect(priceComparison(build).selectedTotal).toBeNull();
      rod.amazonPrice.status = 'ok';
      clock.mockReturnValue(now + 37 * 60 * 60 * 1000);
      expect(priceComparison(build).selectedTotal).toBeNull();
    } finally { rod.amazonPrice = previous; clock.mockRestore(); }
  });
  it('does not treat missing prices as zero or manufacture a saving',()=>{
    const build = complete();
    build.prices['rod-3-300'] = 10000;
    expect(priceComparison(build)).toMatchObject({knownCount:1,selectedTotal:null,referenceTotal:null,productDifference:null,paymentDifference:null});
  });
  it('compares only selected products and matches the reference scope',()=>{
    const build = chooseProduct(ready(),'rod','rod-3-300'); build.prices['rod-3-300'] = 10000;
    expect(priceComparison(build)).toMatchObject({selectedTotal:10000,referenceTotal:10000,productDifference:0});
    expect(priceComparison(build).rows).toHaveLength(1);
  });
  it('uses full purchase prices and makes shipping able to reverse the saving',()=>{
    const build = complete();
    build.selection.bucket = 'bucket-risu-8'; build.answers = {...build.answers,water:'tap'};
    for (const id of Object.values(defaultSelection)) build.prices[id] = 1000;
    build.prices['bucket-risu-8'] = 500;
    expect(priceComparison(build)).toMatchObject({selectedTotal:7500,referenceTotal:8000,productDifference:500,paymentDifference:null});
    build.shipping = {selected:900,reference:0};
    expect(priceComparison(build)).toMatchObject({selectedPayment:8400,referencePayment:8000,paymentDifference:-400});
  });
  it('does not count an unmatched generic use as a comparable saving',()=>{
    const build = complete(); build.selection.bucket = 'bucket-risu-8';
    for (const id of [...Object.values(defaultSelection),'bucket-risu-8']) build.prices[id] = 1000;
    expect(priceComparison(build).referenceTotal).toBeNull();
  });
  it('clears stale shipping after changing an item',()=>{
    const build = complete(); build.shipping = {selected:500,reference:500};
    expect(chooseProduct(build,'rod','rod-2-300').shipping).toEqual({selected:null,reference:null});
  });
  it('validates answers, prices and included items in shared URLs',()=>{
    const build = complete();
    expect(decodeBuild(encodeBuild({...build,answers:{goal:'unknown'}}))).toBeNull();
    expect(decodeBuild(encodeBuild({...build,prices:{'rod-3-300':-1}}))).toBeNull();
    expect(decodeBuild(encodeBuild({...build,prices:{'unknown':500}}))).toBeNull();
    expect(decodeBuild(encodeBuild({...build,included:['line']}))).toBeNull();
    expect(decodeBuild(encodeBuild({...build,shipping:{selected:NaN,reference:0}}))?.shipping.selected).toBeNull();
  });
});
