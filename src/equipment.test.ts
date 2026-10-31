import { describe, expect, it } from 'vitest';
import { allCategories, fishSpecies, products } from './catalog';
import { createDefaultBuild, decodeBuild, encodeBuild, evaluateMethodCompatibility, type FishingBuild } from './domain';
import { coveringProduct, equipmentFor, equipmentProfile, productApplies, requiredEquipment } from './equipment';
import { canComplete, candidatesFor, chooseProduct, hasChoice, isPrepared, priceComparison, recommendedProduct, switchFishingPlan } from './planner';

const plan=(fishId:string,methodId:string):FishingBuild=>({...createDefaultBuild({month:11,area:'osaka-bay',field:'pier'}),fishId,methodId,answers:{goal:'first',pace:'calm',budget:'30000'}});
describe('all method equipment',()=>{
  it('registers every product in a real equipment category and retains necessary landing gear',()=>{
    for(const p of products) {
      expect(allCategories.some(c=>c.id===p.category),p.id).toBe(true);
      for(const id of p.fishIds||[]) expect(fishSpecies.some(f=>f.id===id),`${p.id}/${id}`).toBe(true);
      for(const id of p.provides||[]) expect(allCategories.some(c=>c.id===id),`${p.id}/${id}`).toBe(true);
    }
    for(const methodId of ['kago','hechi']) expect(requiredEquipment(plan('kurodai',methodId)).some(c=>c.id==='net')).toBe(true);
  });
  for(const fish of fishSpecies) for(const methodId of fish.methodIds) it(`${fish.id}/${methodId} has a purchasable, non-conflicting required setup`,()=>{
    let build=plan(fish.id,methodId);
    for(const c of requiredEquipment(build)) {
      if(hasChoice(build,c.id)) continue;
      const candidate=recommendedProduct(build,c.id);
      expect(candidate,`${fish.id}/${methodId}/${c.id}: ${candidatesFor(build,c.id).map(p=>p.id).join(',')}`).toBeDefined();
      if(candidate) build=chooseProduct(build,c.id,candidate.id);
    }
    expect(canComplete(build)).toBe(true);
    expect(decodeBuild(encodeBuild(build))).toEqual(build);
  });
  it('does not require optional equipment to proceed',()=>{
    expect(requiredEquipment(plan('aoriika','eging')).some(c=>c.id==='bucket')).toBe(false);
  });
  it('keeps light eging and normal eging products separate',()=>{
    expect(equipmentProfile(plan('tsutsuika','eging'))).toBe('light-eging');
    expect(candidatesFor(plan('tsutsuika','eging'),'egi').every(p=>p.technical.egiSize!<2.5)).toBe(true);
    expect(candidatesFor(plan('aoriika','eging'),'egi').every(p=>p.technical.egiSize!>=2.5)).toBe(true);
  });
  it('restores independent method and target drafts through share URLs',()=>{
    const a=chooseProduct(plan('aji','sabiki'),'rod','rod-3-300');
    const b=switchFishingPlan(a,'aoriika','eging');
    expect(b.selection.rod).toBe('');
    expect(switchFishingPlan(decodeBuild(encodeBuild(b))!,'aji','sabiki').selection.rod).toBe('rod-3-300');
  });
  it('derives set coverage and removes it when the selected set is removed',()=>{
    const kit=products.find(p=>p.provides?.includes('stopper')&&productApplies(plan('aji','float'),p))!;
    expect(kit).toBeDefined();
    const selected=chooseProduct(plan('aji','float'),'stopper',kit.id);
    expect(coveringProduct(selected,'stopper')?.id).toBe(kit.id);
    const cleared=chooseProduct(selected,kit.category,'');
    expect(hasChoice(cleared,'stopper')).toBe(false);
    expect(equipmentFor(cleared).some(c=>c.id==='stopper')).toBe(true);
  });
});

describe('units, included parts and stale selections',()=>{
  it('does not turn PE capacity into nylon capacity or compare different materials as equal strength',()=>{
    let b=chooseProduct(plan('aoriika','eging'),'reel','reel-crest-lt2500');
    b=chooseProduct(b,'line','line-3');
    expect(evaluateMethodCompatibility(b).find(r=>r.id==='reel-line')?.status).toBe('check');
    b=chooseProduct(b,'rod','rod-lurenist-86ml');
    b=chooseProduct(b,'line','line-pitbull4-04');
    expect(evaluateMethodCompatibility(b).find(r=>r.id==='rod-pe')?.status).toBe('avoid');
  });
  it('counts a completed set only once for price, weight and preparation',()=>{
    let b=chooseProduct(plan('aji','float'),'float','float-kit-ha176-m');
    b=chooseProduct(b,'rod','rod-3-300');
    const mass=evaluateMethodCompatibility(b).find(r=>r.id==='rod-load')!;
    expect(mass.status).toBe('check');
    expect(mass.reason).toContain('合計3.75g');
    expect(priceComparison(b).rows.map(r=>r.product.id)).toEqual(['rod-3-300','float-kit-ha176-m']);
    expect(isPrepared(b,'hook')).toBe(false);
    expect(isPrepared({...b,checked:['float']},'hook')).toBe(true);
    expect(evaluateMethodCompatibility(b).some(r=>r.id.startsWith('duplicate-'))).toBe(false);
  });
  it('keeps a separately chosen duplicate and makes its extra purchase visible',()=>{
    let b=chooseProduct(plan('kurodai','float'),'float','float-kit-ha176-l');
    b=chooseProduct(b,'leader','leader-yamatoyo-2');
    expect(coveringProduct(b,'leader')).toBeUndefined();
    expect(priceComparison(b).rows.some(r=>r.category==='leader')).toBe(true);
    expect(evaluateMethodCompatibility(b).find(r=>r.id==='duplicate-float')?.status).toBe('check');
  });
  it('never uses inactive sets or sinkers to cover or constrain the current method',()=>{
    const b=plan('aoriika','eging');
    b.selection.float='float-kit-ha176-m';
    b.selection.sinker='sinker-nasu25';
    b.selection.rod='rod-lurenist-86ml';
    b.selection.egi='egi-k-30-005';
    expect(hasChoice(b,'leader')).toBe(false);
    expect(evaluateMethodCompatibility(b).find(r=>r.id==='rod-load')?.reason).toContain('合計16g');
  });
  it('rejects malformed or foreign draft categories without accepting external data',()=>{
    const b=switchFishingPlan(plan('aji','sabiki'),'aoriika','eging');
    const invalid={...b,drafts:{...b.drafts,'aji:sabiki':{...b.drafts!['aji:sabiki'],selection:{...b.selection,evil:'https://example.com'}}}};
    expect(decodeBuild(encodeBuild(invalid))).toBeNull();
  });
});

describe('multi-target draft persistence',()=>{
  it('can restore all 69 supported target/method drafts without exceeding the shared-data limit',()=>{
    let b=plan('aji','sabiki');
    for(const fish of fishSpecies) for(const methodId of fish.methodIds) {
      b=switchFishingPlan(b,fish.id,methodId);
      for(const c of requiredEquipment(b)) if(!hasChoice(b,c.id)) {
        const p=recommendedProduct(b,c.id)!;
        b=chooseProduct(b,c.id,p.id);
      }
    }
    b=switchFishingPlan(b,'aji','sabiki');
    expect(encodeBuild(b).length).toBeLessThanOrEqual(65000);
    expect(decodeBuild(encodeBuild(b))).toEqual(b);
  });
});

describe('keeping the catch',()=>{
  it('offers a longer cooler for larger fish and a compact one for small fish',()=>{
    const large={...plan('suzuki','lure'),answers:{keep:'eat'}};
    const small={...plan('iwashi','sabiki'),answers:{keep:'eat'}};
    expect(equipmentFor(large).some(c=>c.id==='cooler')).toBe(true);
    expect(recommendedProduct(large,'cooler')?.id).toBe('cooler-lighttrunk-s3200');
    expect(recommendedProduct(small,'cooler')?.id).toBe('cooler-minicool2-s650');
    expect(equipmentFor(plan('suzuki','lure')).some(c=>c.id==='cooler')).toBe(false);
  });
});
