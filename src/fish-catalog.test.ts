import { describe, expect, it } from 'vitest';
import { fishSpecies, methods, seasonality } from './catalog';
import { filterFish } from './fish-catalog';
import { createDefaultBuild, decodeBuild, encodeBuild, getFish, hasProductGuide, safeExternalUrl } from './domain';
import { candidatesFor, fishReason, rankedFish, resolveScreen } from './planner';

const conditions = { month:10, area:'tokyo-bay', field:'pier' };
const answers = { goal:'food', pace:'calm', budget:'30000' };
const expected = ['aji','saba','iwashi','madai','buri','hirame','karei','tsutsuika','suzuki','sawara','anago','kanpachi','hokke','nishin','kawahagi','tachiuo','kisu','mebaru','kasago','kurodai','aoriika','kouika','shimaaji','isaki','haze','bora','ainame','sayori','kamasu','mejina'];

describe('30 selectable beginner targets', () => {
  it('preserves exactly the agreed groups and popularity order', () => {
    expect(fishSpecies.map(f => f.id)).toEqual(expected);
    expect(new Set(fishSpecies.flatMap(f => [f.id])).size).toBe(30);
    expect(methods.filter(m => m.supported)).toHaveLength(12);
  });
  it('finds grouped species, local names, kanji, hiragana and half-width kana', () => {
    for (const query of ['ガシラ','がしら','ｶﾞｼﾗ','アラカブ','笠子']) expect(filterFish(fishSpecies,query).map(f => f.id)).toEqual(['kasago']);
    expect(filterFish(fishSpecies,'やりいか').map(f => f.id)).toEqual(['tsutsuika']);
    expect(filterFish(fishSpecies,'キビレ').map(f => f.id)).toEqual(['kurodai']);
    expect(filterFish(fishSpecies,'存在しない魚')).toEqual([]);
    expect(filterFish(fishSpecies,'','eging').map(f => f.id)).toEqual(['tsutsuika','aoriika','kouika']);
    expect(filterFish(fishSpecies,'アジ','eging')).toEqual([]);
  });
  it('does not turn national selection into fabricated local seasonality', () => {
    expect(seasonality.map(s => s.fishId)).toEqual(['aji','iwashi','saba']);
    expect(getFish({...conditions,month:11})).toEqual([]);
    const build = {...createDefaultBuild({...conditions,month:11}), answers};
    expect(rankedFish(build).map(f => f.id)).toEqual(expected);
    expect(fishReason(build,'nishin')).toContain('北日本');
    expect(fishReason({...build,conditions},'nishin')).not.toContain('東京湾の堤防の季節データ');
  });
  for (const fish of fishSpecies) {
    it(`restores ${fish.name} and each valid style with a separate product guide`, () => {
      expect(safeExternalUrl(fish.sourceUrl)).not.toBeNull();
      for (const methodId of fish.methodIds) {
        const method = methods.find(m => m.id === methodId)!;
        expect(method?.supported).toBe(true);
        expect(method.supplies.length).toBeGreaterThan(0);
        expect(method.steps).toHaveLength(3);
        expect(safeExternalUrl(method.sourceUrl)).not.toBeNull();
        const build = {...createDefaultBuild(conditions),answers,fishId:fish.id,methodId};
        expect(decodeBuild(encodeBuild(build))).toEqual(build);
        expect(resolveScreen('method',build)).toBe('method');
        expect(resolveScreen('builder',build)).toBe('builder');
        expect(hasProductGuide(build)).toBe(true);
        if(!['sabiki','uki-sabiki'].includes(methodId)) expect(candidatesFor(build,'rig').map(p=>p.id)).not.toContain('rig-6');
        expect(resolveScreen('checkout',build)).toBe('builder');
        const regional = {...build,conditions:{month:1,area:'osaka-bay',field:'surf'}};
        expect(decodeBuild(encodeBuild(regional))).toEqual(regional);
        expect(resolveScreen('builder',regional)).toBe('builder');
        expect(hasProductGuide(regional)).toBe(true);
      }
    });
  }
  it('rejects an unrelated style while preserving a selected target without a style', () => {
    const build = {...createDefaultBuild(conditions),answers,fishId:'aoriika',methodId:''};
    expect(decodeBuild(encodeBuild(build))).toEqual(build);
    expect(resolveScreen('builder',build)).toBe('method');
    expect(decodeBuild(encodeBuild({...build,methodId:'sabiki'}))).toBeNull();
    expect(resolveScreen('builder',{...build,methodId:'sabiki'})).toBe('method');
  });
});
