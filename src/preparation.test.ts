import { describe,expect,it,vi } from 'vitest';
vi.mock('./data/amazon-prices.json',()=>({default:{schemaVersion:1,updatedAt:null,products:{}}}));
import { defaultSelection,products } from './catalog';
import { createDefaultBuild,decodeBuild,encodeBuild,safeExternalUrl } from './domain';
import { canComplete,chooseIncludedLine,chooseProduct,compatibilityForBuild,isPrepared,priceComparison,removeOptional,switchFishingPlan } from './planner';
import { arrangementFor,purchaseQuantity,setArrangement,validPreparation } from './preparation';
import { glossary,regionalGuides,confirmationHelp } from './guidance';

const complete=()=>({...createDefaultBuild({month:11,area:'tokyo-bay',field:'pier'}),fishId:'aji',methodId:'sabiki',answers:{goal:'first',pace:'calm',budget:'20000'},selection:{...defaultSelection},prices:Object.fromEntries(products.map(p=>[p.id,1000]))});
describe('beginner preparation and purchasing',()=>{
  it('removes an optional purchase without inventing ownership or altering other selections',()=>{
    const before=complete(),after=removeOptional(before,'bucket');
    expect(after.selection.bucket).toBe('');expect(after.owned).not.toContain('bucket');
    expect(after.selection.rod).toBe(before.selection.rod);expect(canComplete(after)).toBe(true);
    expect(removeOptional(before,'safety')).toBe(before);
  });
  it('counts a preparation method as a decision, not a prepared or price-known product',()=>{
    const arranged=setArrangement(complete(),'safety','rental');
    expect(canComplete(arranged)).toBe(true);expect(isPrepared(arranged,'safety')).toBe(false);
    expect(priceComparison(arranged).arrangedCount).toBe(1);
    expect(compatibilityForBuild(arranged).find(r=>r.id==='owned-safety')?.reason).toContain('予約');
    expect(arrangementFor(chooseProduct(arranged,'safety','safety-tokarau'),'safety')).toBeUndefined();
  });
  it('includes bought quantities, retains a partial subtotal and leaves the complete amount unknown',()=>{
    const build=complete();build.preparation={people:2,quantities:{bait:3}};
    expect(purchaseQuantity(build,'rod')).toBe(2);expect(purchaseQuantity(build,'bucket')).toBe(1);
    expect(priceComparison(build).selectedTotal).toBe(13000);
    delete build.prices['line-3'];
    expect(priceComparison(build)).toMatchObject({knownSubtotal:12000,selectedTotal:null,knownCount:7});
  });
  it('prices the reference line needed by a threadless reel when the chosen reel includes line',()=>{
    const build=chooseIncludedLine(chooseProduct(complete(),'reel','reel-2500'));
    const cost=priceComparison(build);
    expect(cost.rows.some(r=>r.category==='line')).toBe(false);
    expect(cost.referenceExtras.map(r=>r.product.id)).toEqual(['line-3']);
    expect(cost).toMatchObject({selectedTotal:7000,referenceTotal:8000});
    expect(compatibilityForBuild(build).find(r=>r.id==='reel-line')?.reason).not.toContain('500m');
  });
  it('retains quantities, planned preparation, delivery and supplies in URLs and per-style drafts',()=>{
    let build=setArrangement(complete(),'safety','store');
    build={...build,checked:['safety'],preparation:{...build.preparation,people:2,hours:4,tripDate:'2026-11-14',quantities:{rod:2},checkedSupplies:['ice','towel'],deliveries:{rod:'2026-11-13'},shippingOrders:[{label:'竿の注文',amount:500}]}};
    expect(decodeBuild(encodeBuild(build))).toEqual(build);
    const other=switchFishingPlan(build,'aji','float');
    const restored=switchFishingPlan(other,'aji','sabiki');
    expect(restored.preparation?.arrangements).toEqual({safety:'store'});
    expect(restored.checked).toContain('safety');
  });
  it('rejects invalid dates, quantities, preparation kinds and conflicting claims in shared data',()=>{
    for(const value of [{people:0},{people:11},{hours:NaN},{tripDate:'2026-02-30'},{quantities:{rod:-1}},{quantities:{unknown:1}},{arrangements:{safety:'verified'}},{deliveries:{rod:'tomorrow'}},{checkedSupplies:['unknown']},{shippingOrders:[{label:'x',amount:-1}]}])expect(validPreparation(value)).toBe(false);
    const conflicting={...complete(),preparation:{arrangements:{safety:'store' as const}}};
    expect(decodeBuild(encodeBuild(conflicting))).toBeNull();
  });
  it('makes cooling a preparation decision when the user wants to keep fish',()=>{
    const build={...complete(),answers:{...complete().answers,keep:'eat'}};
    expect(canComplete(build)).toBe(false);
    expect(canComplete(setArrangement(build,'cooler','store'))).toBe(true);
  });
  it('keeps all thirty terminology entries and regional/consultation links usable',()=>{
    expect(glossary.map(g=>g.id)).toEqual(Array.from({length:30},(_,i)=>`G${String(i+1).padStart(2,'0')}`));
    for(const guide of Object.values(regionalGuides))expect(safeExternalUrl(guide.url)).toBe(guide.url);
    const build=complete(),rule=compatibilityForBuild(build).find(r=>r.id==='rod-reel')!;
    const help=confirmationHelp(build,rule);
    expect(help.question).toContain('リバティクラブ');expect(help.question).not.toContain('rod-3-300');
    expect(safeExternalUrl(help.url)).toBe(help.url);
  });
});
