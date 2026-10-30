import { describe, expect, it } from 'vitest';
import { categories, defaultSelection, products } from './catalog';
import { currentAmazonPrice } from './amazon-prices';
import { createDefaultBuild as createEmptyBuild, decodeBuild, encodeBuild, evaluateCompatibility, getFish, isSupported, safeExternalUrl } from './domain';
// A fully populated fixture for the existing compatibility and v1 migration cases.
function createDefaultBuild(input?: Parameters<typeof createEmptyBuild>[0]) {
  const build = createEmptyBuild(input);
  return {...build,fishId:getFish(build.conditions)[0]?.id || '',methodId:'sabiki',selection:{...defaultSelection}};
}
const conditions = { month:10,area:'tokyo-bay',field:'pier' };
const pack = (value:unknown) => btoa(JSON.stringify(value)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

describe('Amazon replacement products', () => {
  for (const [category, oldId, newId] of [['basket','basket-6','basket-riseway-6'],['basket','basket-10','basket-riseway-10'],['bucket','bucket-generic','bucket-risu-8']] as const) {
    it(`migrates ${oldId} without marking a different product prepared`, () => {
      const original = createDefaultBuild({month:10,area:'tokyo-bay',field:'pier'});
      original.selection[category] = oldId;
      original.checked = ['rod', category];
      const restored = decodeBuild(encodeBuild(original))!;
      expect(restored.selection[category]).toBe(newId);
      expect(restored.checked).toEqual(['rod']);
      expect(restored.replacedCategories).toEqual([category]);
      expect(decodeBuild(encodeBuild(restored))?.replacedCategories).toBeUndefined();
    });
  }
  it('does not reuse the old baskets mass and keeps total load unverified', () => {
    expect(products.find(p=>p.id===defaultSelection.basket)?.technical.basketWeightG).toBeUndefined();
    const results=evaluateCompatibility(defaultSelection);
    expect(results.find(r=>r.id==='rod-basket')?.status).toBe('recommended');
    expect(results.find(r=>r.id==='total-load')?.status).toBe('check');
    const mismatch=evaluateCompatibility({...defaultSelection,rod:'rod-2-300',basket:'basket-riseway-10'}).find(r=>r.id==='rod-basket')!;
    expect(mismatch.status).toBe('avoid');
    expect(mismatch.reason).not.toContain('undefined');
    expect(mismatch.reason).not.toContain('37.5');
  });
});

describe('curated scenario',()=>{
  it('contains all eight slots with product identities matched to categories',()=>{
    expect(categories).toHaveLength(8);
    for (const c of categories) expect(products.find(p=>p.id===defaultSelection[c.id])?.category).toBe(c.id);
  });
  it('keeps unknown prices null and uses only fresh Amazon prices',()=>{
    expect(products.every(p=>p.price===currentAmazonPrice(p.amazonPrice)&&p.offer.price===p.price)).toBe(true);
  });
  it('supports October Tokyo Bay pier fishing',()=>{
    expect(isSupported(conditions)).toBe(true);
    expect(getFish(conditions).map(f=>f.id)).toEqual(['aji','iwashi','saba']);
  });
  it('does not offer an aji scenario in April',()=>{
    expect(getFish({...conditions,month:4}).map(f=>f.id)).toEqual(['iwashi','saba']);
  });
  it.each([{...conditions,month:1},{...conditions,month:11},{...conditions,area:'osaka-bay'},{...conditions,field:'rock'},{...conditions,month:2.5}])('does not invent unsupported fish for %o',c=>{
    expect(getFish(c)).toEqual([]);
  });
  it('uses the actual system month for initial conditions',()=>{
    expect(createDefaultBuild().conditions.month).toBe(new Date().getMonth()+1);
  });
});

describe('compatibility rules',()=>{
  it('recommends the named numeric rules without declaring all equipment compatible',()=>{
    const result=evaluateCompatibility({...defaultSelection});
    expect(result.find(r=>r.id==='rod-basket')?.status).toBe('recommended');
    expect(result.find(r=>r.id==='reel-line')?.status).toBe('recommended');
    expect(result.find(r=>r.id==='line-rig')?.status).toBe('recommended');
    expect(result.find(r=>r.id==='rod-reel')?.status).toBe('check');
    expect(result.find(r=>r.id==='safety-fit')?.status).toBe('check');
    expect(result.find(r=>r.id==='total-load')?.status).toBe('check');
    expect(result.some(r=>r.status==='avoid')).toBe(false);
  });
  it('explains a basket above rod maximum without discarding selected items',()=>{
    const selection={...defaultSelection,rod:'rod-2-300',basket:'basket-riseway-10'};
    const before={...selection};
    const result=evaluateCompatibility(selection);
    expect(result.find(r=>r.id==='rod-basket')).toMatchObject({status:'avoid',categoryIds:['rod','basket']});
    expect(result.find(r=>r.id==='rod-basket')?.reason).toContain('上限6号');
    expect(selection).toEqual(before);
  });
  it('flags the nominal rod limit because bait weight is still unknown',()=>{
    expect(evaluateCompatibility({...defaultSelection,rod:'rod-2-300'}).find(r=>r.id==='rod-basket')?.status).toBe('check');
  });
  it('re-evaluates to non-conflicting numeric configuration after reset',()=>{
    expect(evaluateCompatibility({...defaultSelection}).some(r=>r.status==='avoid')).toBe(false);
  });
  it('does not infer breaking strength from a finer main line',()=>{
    expect(evaluateCompatibility({...defaultSelection,line:'line-2',rig:'rig-8'}).find(r=>r.id==='line-rig')?.status).toBe('check');
  });
  it('exposes leader size outside the rod manufacturer range',()=>{
    expect(evaluateCompatibility({...defaultSelection}).find(r=>r.id==='rod-rig')?.status).toBe('check');
    expect(evaluateCompatibility({...defaultSelection,rod:'rod-2-300',rig:'rig-8'}).find(r=>r.id==='rod-rig')?.status).toBe('recommended');
  });
  it('limits generic bucket substitution to ground-level use',()=>{
    const bucket=evaluateCompatibility({...defaultSelection,bucket:'bucket-risu-8'}).find(r=>r.id==='bucket-use');
    expect(bucket?.status).toBe('check');
    expect(bucket?.reason).toContain('海に下ろす水くみ用途には使わない');
  });
  it('does not evaluate an owned rod using the catalog rod specification',()=>{
    const result=evaluateCompatibility({...defaultSelection,rod:'rod-2-300',basket:'basket-riseway-10'},['rod']);
    expect(result.find(r=>r.id==='owned-rod')?.status).toBe('check');
    expect(result.find(r=>r.id==='rod-basket')).toBeUndefined();
    expect(result.find(r=>r.id==='rod-reel')).toBeUndefined();
  });
  it('keeps the reel unverified when its numeric line capacity passes but the owned rod is unknown',()=>{
    const result=evaluateCompatibility({...defaultSelection},['rod']);
    expect(result.find(r=>r.id==='reel-line')?.status).toBe('recommended');
    expect(result.filter(r=>r.categoryIds.includes('reel')).some(r=>r.status==='check')).toBe(true);
    expect(result.find(r=>r.id==='owned-rod')?.categoryIds).toEqual(['rod','reel','basket','bait','rig']);
  });
  it.each([
    { owned:'rod',affected:['rod','reel','basket','bait','rig'] },
    { owned:'reel',affected:['reel','rod','line'] },
    { owned:'line',affected:['line','reel','rig'] },
    { owned:'rig',affected:['rig','line','rod'] },
    { owned:'basket',affected:['basket','rod','bait'] },
    { owned:'bait',affected:['bait','rod','basket'] },
    { owned:'bucket',affected:['bucket'] },
    { owned:'safety',affected:['safety'] },
  ] as const)('propagates owned $owned uncertainty only to its rule dependencies',({owned,affected})=>{
    const result=evaluateCompatibility({...defaultSelection},[owned]);
    expect(result.find(r=>r.id===`owned-${owned}`)).toMatchObject({status:'check',categoryIds:[...affected]});
  });
  it('does not make unrelated items uncertain because of an owned bucket',()=>{
    const result=evaluateCompatibility({...defaultSelection},['bucket']);
    expect(result.find(r=>r.id==='owned-bucket')?.categoryIds).toEqual(['bucket']);
    expect(result.find(r=>r.id==='reel-line')?.status).toBe('recommended');
    expect(result.filter(r=>r.categoryIds.includes('line')).every(r=>r.status==='recommended')).toBe(true);
  });
  it('reports empty and wrong-category slots without throwing',()=>{
    const result=evaluateCompatibility({...defaultSelection,rod:'',safety:'line-3'});
    expect(result.find(r=>r.id==='missing-rod')?.status).toBe('check');
    expect(result.find(r=>r.id==='missing-safety')?.status).toBe('check');
  });
  it('makes included line and duplicate purchase visible',()=>{
    expect(evaluateCompatibility({...defaultSelection,reel:'reel-2500'}).find(r=>r.id==='included-line')?.status).toBe('check');
  });
});

describe('safe share format',()=>{
  it('round-trips all selections, owned equipment and purchased checks',()=>{
    const build={...createDefaultBuild(conditions),checked:['rod'] as const,owned:['bucket'] as const};
    const mutable={...build,checked:[...build.checked],owned:[...build.owned]};
    expect(decodeBuild(encodeBuild(mutable))).toEqual(mutable);
  });
  it('preserves an intentionally empty slot',()=>{
    const build=createDefaultBuild(conditions);build.selection.bucket='';
    expect(decodeBuild(encodeBuild(build))?.selection.bucket).toBe('');
  });
  it('preserves unsupported input conditions to let the user edit them',()=>{
    const build=createDefaultBuild({...conditions,area:'osaka-bay'});
    expect(decodeBuild(encodeBuild(build))?.conditions.area).toBe('osaka-bay');
  });
  it.each(['','%bad','null','a'.repeat(7001),pack(null),pack([]),pack({v:2})])('rejects malformed or oversized shared data',value=>{
    expect(decodeBuild(value)).toBeNull();
  });
  it('rejects unknown products instead of accepting payload URLs',()=>{
    const build=createDefaultBuild(conditions);build.selection.rod='javascript:alert(1)';
    expect(decodeBuild(encodeBuild(build))).toBeNull();
  });
  it('rejects a valid product in the wrong category',()=>{
    const build=createDefaultBuild(conditions);build.selection.rod='line-3';
    expect(decodeBuild(encodeBuild(build))).toBeNull();
  });
  it.each([{month:0},{month:13},{month:'10'},{area:'unknown'},{field:'boat'}])('rejects invalid conditions %o',patch=>{
    const build=createDefaultBuild(conditions);
    expect(decodeBuild(pack({v:1,...build,conditions:{...build.conditions,...patch}}))).toBeNull();
  });
  it('rejects unknown purchased and owned categories',()=>{
    const build=createDefaultBuild(conditions);
    expect(decodeBuild(pack({v:1,...build,checked:['unknown']}))).toBeNull();
    expect(decodeBuild(pack({v:1,...build,owned:['unknown']}))).toBeNull();
  });
  it('rejects unsupported method IDs',()=>{
    const build=createDefaultBuild(conditions);
    expect(decodeBuild(pack({v:1,...build,methodId:'ajing'}))).toBeNull();
  });
  it('rejects a known fish outside its supported month',()=>{
    const build=createDefaultBuild({...conditions,month:4});
    expect(decodeBuild(pack({v:1,...build,fishId:'aji'}))).toBeNull();
  });
  it('rejects an empty target fish for a supported trip',()=>{
    const build=createDefaultBuild(conditions);
    expect(decodeBuild(pack({v:1,...build,fishId:''}))).toBeNull();
  });
  it('drops purchased checks for a cleared unowned slot',()=>{
    const build=createDefaultBuild(conditions);build.selection.rod='';build.checked=['rod'];
    expect(decodeBuild(encodeBuild(build))?.checked).toEqual([]);
  });
});

describe('external URLs',()=>{
  it('permits every curated product and purchase source',()=>{
    for (const p of products) {
      expect(safeExternalUrl(p.sourceUrl)).not.toBeNull();
      expect(safeExternalUrl(p.purchaseUrl!)).not.toBeNull();
    }
  });
  it.each(['javascript:alert(1)','data:text/html,hello','https://www.daiwa.com.attacker.invalid/','http://www.daiwa.com/','https://user:pass@www.daiwa.com/','https://www.daiwa.com:1234/','//www.daiwa.com/'])('rejects unsafe destination %s',value=>{
    expect(safeExternalUrl(value)).toBeNull();
  });
});
