import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDefaultBuild, decodeBuild, encodeBuild, safeExternalUrl } from './domain';
import { chooseIncludedLine, chooseOwned, chooseProduct, resolveScreen } from './planner';
import { buildPartStates, rigById, rigForBuild, rigs } from './rigs';
import { RigDiagram } from './RigDiagram';
import { fishSpecies } from './catalog';

describe('layered tackle illustrations', () => {
  it.each(rigs)('renders every named part of $name as an independent SVG layer', rig => {
    const markup = renderToStaticMarkup(createElement(RigDiagram, { rig }));
    expect(markup).toContain(`${rig.name}の道具全体図`);
    expect(new Set(rig.parts.map(p => p.id)).size).toBe(rig.parts.length);
    for (const p of rig.parts) expect(markup.match(new RegExp(`data-part="${p.id}"`, 'g'))).toHaveLength(1);
  });
  it('starts with grey parts and derives color only from explicit gear decisions', () => {
    const rig = rigById('sabiki')!;
    const empty = createDefaultBuild();
    expect(Object.values(buildPartStates(empty, rig)).every(s => s === 'missing')).toBe(true);
    const selected = chooseProduct(empty, 'rod', 'rod-3-300');
    const states = buildPartStates(selected, rig);
    expect(states.rod).toBe('selected');
    expect(states.reel).toBe('missing');
    const markup = renderToStaticMarkup(createElement(RigDiagram, { rig, states, activePart: 'reel' }));
    expect(markup).toContain('data-part="reel" data-state="missing" class="rig-part is-missing is-current"');
  });
  it('distinguishes hand-owned and included line, and clears included line after a reel change', () => {
    const rig = rigById('sabiki')!;
    let build = chooseProduct(chooseOwned(createDefaultBuild(), 'rod'), 'reel', 'reel-2500');
    expect(buildPartStates(build, rig).line).toBe('missing');
    build = chooseIncludedLine(build);
    expect(buildPartStates(build, rig)).toMatchObject({ rod: 'owned', reel: 'selected', line: 'included' });
    build = chooseProduct(build, 'reel', 'reel-cf2500');
    expect(buildPartStates(build, rig).line).toBe('missing');
  });
  it('restores the same visual states from a saved build URL and ignores purchase checkmarks', () => {
    const rig = rigById('sabiki')!;
    const build = chooseProduct(createDefaultBuild(), 'rod', 'rod-3-300');
    const restored = decodeBuild(encodeBuild(build))!;
    expect(buildPartStates(restored, rig)).toEqual(buildPartStates(build, rig));
    restored.checked = ['reel'];
    expect(buildPartStates(restored, rig).reel).toBe('missing');
    restored.selection.reel = 'rod-3-300';
    expect(buildPartStates(restored, rig).reel).toBe('missing');
  });
  it('makes all 12 reference diagrams available without a diagnosis or supported month', () => {
    const build = createDefaultBuild({ month: 11, area: 'tokyo-bay', field: 'pier' });
    expect(rigs).toHaveLength(12);
    for (const rig of rigs) expect(resolveScreen(`rigs/${rig.id}`, build)).toBe(`rigs/${rig.id}`);
    expect(resolveScreen('rigs/unknown', build)).toBe('rigs/sabiki');
  });
});

describe('target-specific rig diagrams',()=>{
  it('renders each named physical layer exactly once for every supported target and method',()=>{
    for(const fish of fishSpecies) for(const methodId of fish.methodIds) {
      const rig=rigForBuild({...createDefaultBuild(),fishId:fish.id,methodId});
      const markup=renderToStaticMarkup(createElement(RigDiagram,{rig}));
      for(const p of rig.parts) expect(markup.match(new RegExp(`data-part="${p.id}"`,'g')),`${fish.id}/${methodId}/${p.id}`).toHaveLength(1);
    }
  });
  it('uses the actual dedicated set structures for hokke, kamasu, sayori and tachiuo',()=>{
    const rig=(fishId:string,methodId:string)=>rigForBuild({...createDefaultBuild(),fishId,methodId});
    expect(rig('hokke','nage').parts.some(p=>p.id==='tenbin')).toBe(false);
    expect(rig('kamasu','sabiki').parts.some(p=>['basket','bait'].includes(p.id))).toBe(false);
    expect(rig('sayori','float').parts.some(p=>['stopper','sinker'].includes(p.id))).toBe(false);
    expect(rig('tachiuo','float').parts.find(p=>p.id==='sinker')?.description).toContain('タル付オモリ');
  });
});

describe('rig reference destinations',()=>{
  it('keeps all curated reference links usable through the fixed host policy',()=>{
    for(const rig of rigs) for(const source of rig.sources) expect(safeExternalUrl(source.url),source.url).not.toBeNull();
  });
});
