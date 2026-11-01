import { useId, useRef, useState, type ReactNode } from 'react';
import type { CategoryId } from './catalog';
import type { PartState, RigDefinition, RigPartId } from './rigs';
import { RigHoverLabel } from './RigHoverLabel';
import { GearIllustration } from './GearArtwork';

type Point = [number, number];
type Props = {
  rig: RigDefinition; states?: Partial<Record<RigPartId, PartState>>; activePart?: RigPartId;
  recentCategory?: CategoryId; miniature?: boolean;
  highlightedPart?: RigPartId; onPartHover?: (part?: RigPartId) => void; onPartSelect?: (part:RigPartId)=>void;
};
const lineEnd = { sabiki: 116, float: 190, lure: 165, hole: 160, bukkomi: 145, nage: 130, 'choi-nage': 165, dozuki: 116, 'uki-sabiki': 174, eging: 165, hechi: 165, kago: 186 };
const commonAnchors: Partial<Record<RigPartId, Point>> = { rod: [331, 150], reel: [346, 274], line: [189, 58], bait: [63, 367], bucket: [209, 367], safety: [344, 367] };
const terminalAnchors: Record<RigDefinition['id'], Partial<Record<RigPartId, Point>>> = {
  sabiki: { rig: [61, 192], basket: [63, 293] },
  float: { stopper: [61, 86], float: [61, 131], swivel: [64, 190], leader: [63, 231], sinker: [163, 251], hook: [61, 299] },
  lure: { leader: [61, 192], snap: [61, 238], lure: [63, 285] },
  hole: { leader: [61, 200], burakuri: [61, 281] },
  bukkomi: { sinker: [61, 162], cushion: [157, 193], swivel: [61, 214], leader: [61, 254], hook: [61, 308] },
  nage: { shock: [62, 142], tenbin: [61, 181], sinker: [61, 230], rig: [247, 251] },
  'choi-nage': { tenbin: [61, 182], sinker: [61, 230], rig: [248, 266] },
  dozuki: { rig: [62, 194], sinker: [62, 300] },
  'uki-sabiki': { stopper: [61, 86], float: [61, 130], rig: [61, 220], basket: [61, 302] },
  eging: { leader: [61, 193], snap: [61, 238], egi: [62, 284] },
  hechi: { leader: [62, 209], sinker: [61, 275], hook: [62, 312] },
  kago: { stopper: [61, 86], float: [61, 130], tenbin: [61, 193], basket: [61, 232], leader: [242, 260], hook: [237, 311] },
};

function Thread({ d, heavy = false }: { d: string; heavy?: boolean }) {
  return <path d={d} className="rig-thread" strokeWidth={heavy ? 3 : 1.9} fill="none" />;
}
function Hook({ x, y, feather = false }: { x: number; y: number; feather?: boolean }) {
  return <g transform={`translate(${x} ${y})`}>
    {feather && <><path d="M-2-6Q15-18 21-8L8 2Z" className="rig-soft" strokeWidth=".6" /><path d="m2-4 16-7m-13 9 11-5m-8 7 9-4" className="rig-detail" strokeWidth=".65" /><path d="m7-4 11-2" stroke="#e8c1ac" strokeWidth=".7" /></>}
    <ellipse cy="-4" rx="1.3" ry="2" fill="none" strokeWidth="1.1" />
    <path d="M0-2V7C0 20 17 20 17 7V1L12 7" fill="none" strokeWidth="2.2" />
    <path d="M-.5 0v7c0 11 14 12 16 2" stroke="#e4edef" strokeOpacity=".65" fill="none" strokeWidth=".65" />
    <path d="m17 1-1 7-2-2Z" className="rig-metal" strokeWidth=".5" />
  </g>;
}
function Worm({ x, y }: { x: number; y: number }) {
  return <g><path d={`M${x} ${y}c8-4 15 1 10 7s-2 11 6 10`} className="rig-bait-stroke" fill="none" strokeWidth="4.2" /><path d={`M${x} ${y-1}c8-4 15 1 10 7s-2 11 6 10`} stroke="#f6c5a6" strokeOpacity=".6" fill="none" strokeWidth=".8" /><path d={`m${x+3} ${y-2} 1 4m4-4-1 4m4-1-3 2m2 3-3-1m2 5-3-1m5 4-1 3`} className="rig-detail" strokeWidth=".6" /></g>;
}
function Swivel({ y }: { y: number }) {
  return <GearIllustration category="swivel" x="102" y={y-13} width="20" height="29" viewBox="96 25 48 130" shadow={false}/>;
}
function Weight({ x = 112, y, inline = false }: { x?: number; y: number; inline?: boolean }) {
  return <g><GearIllustration category="sinker" x={x-16} y={y-22} width="32" height="45" viewBox="80 25 82 130" shadow={false}/>{inline && <path d={`M${x} ${y-19}v40`} className="rig-detail" strokeWidth="1.2" />}</g>;
}
function Float({ y = 127, inline=false }: { y?: number; inline?:boolean }) {
  return <g transform={`translate(${inline?112:138} ${y})`}><g transform="rotate(-17)"><GearIllustration category="float" x="-20" y="-42" width="40" height="76" viewBox="80 20 80 144" shadow={false}/></g>{!inline&&<><circle cy="31" r="2.6" className="rig-metal"/><path d="M0 31h-26v-4" fill="none"/><ellipse cx="-26" cy="24" rx="3" ry="4" className="rig-metal"/></>}</g>;
}
function Stopper({inline=false}:{inline?:boolean}) {
  return <g><path d="m106 78 12 8m-12 0 12-8" fill="none" strokeWidth="2.5" /><circle cx="112" cy="96" r="3.6" className="rig-accent" /><circle cx="112" cy={inline?157:165} r="3" className="rig-accent"/><rect x="109" y={inline?161:169} width="6" height="7" rx="2" className="rig-cork"/></g>;
}
function Basket({ y, x = 112 }: { x?: number; y: number }) {
  return <GearIllustration category="basket" x={x-21} y={y-32} width="42" height="66" viewBox="80 19 80 140" shadow={false}/>;
}
function RocketBasket({y}:{y:number}) {
  return <g transform={`translate(112 ${y})`}><path d="M0-29v9m0 40v10" fill="none"/><path d="M-10-19q10-15 20 0l4 27-6 12H-8L-14 8Z" className="rig-soft"/><path d="M-11-7h22M-12 1h24M-10 9h20M-5-15v30M5-15v30" className="rig-detail"/></g>;
}
function Chum({ y, x = 112 }: { y: number; x?: number }) {
  return <g className="rig-chum" transform={`translate(${x} ${y})`}>{[[-7, -1], [4, 2], [-3, 8], [10, 13], [-16, 17], [2, 20]].map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx="2.5" ry="1.5" className="rig-bait-fill" stroke="none" />)}</g>;
}
function Rod() {
  return <g transform="translate(245 28) rotate(-21)"><GearIllustration category="rod" variant="vertical-rod" x="-14" y="-2" width="28" height="300" shadow={false}/></g>;
}
function Reel({ drum }: { drum: boolean }) {
  if (drum) return <g><GearIllustration category="reel" variant="drum" x="272" y="226" width="94" height="82" viewBox="60 27 140 125" shadow={false}/></g>;
  // The catalogue image is level; turn only the rig-diagram instance so its reel foot follows the rod.
  return <g transform="rotate(32 322 266)"><GearIllustration category="reel" x="267" y="221" width="110" height="90" shadow={false}/></g>;
}
function Accessories({ part }: { part: 'bait' | 'bucket' | 'safety' }) {
  const frames = { bait: [65, 333, 72, 68], bucket: [206, 325, 84, 76], safety: [345, 332, 72, 69] };
  const [x, y, width, height] = frames[part];
  return <GearIllustration category={part} x={x} y={y} width={width} height={height} viewBox="55 22 143 135" shadow={false}/>;
}

/** Each physical component has its own state layer; line and tackle stay connected in every template. */
export function RigDiagram({ rig, states, activePart, recentCategory, miniature = false, highlightedPart, onPartHover, onPartSelect }: Props) {
  const sayori=rig.variant==='サヨリ用完成仕掛け', kamasu=rig.variant==='カマス用サビキ', tachiuo=rig.variant==='タチウオ用完成仕掛け', hokke=rig.variant==='ホッケ用投げ胴突式';
  const id = useId().replaceAll(':', '');
  const diagram = useRef<SVGSVGElement>(null);
  const [hoveredPart, setHoveredPart] = useState<RigPartId>();
  const highlight = onPartHover ? highlightedPart : hoveredPart;
  const hoverPart = onPartHover || setHoveredPart;
  const part = (partId: RigPartId, children: ReactNode) => {
    const item = rig.parts.find(p => p.id === partId);
    if (!item) return null;
    const state = states ? states[partId] || 'missing' : 'selected';
    return <g key={partId} data-part={partId} data-state={state} className={`rig-part is-${state}${activePart === partId ? ' is-current' : ''}${highlight === partId ? ' is-highlighted' : ''}${recentCategory && item.category === recentCategory ? ' just-selected' : ''}`}
      onClick={onPartSelect?()=>onPartSelect(partId):undefined} style={onPartSelect?{cursor:'pointer'}:undefined}
      onPointerEnter={miniature ? undefined : e => { if (e.pointerType !== 'touch') hoverPart(partId); }} onPointerLeave={miniature ? undefined : () => hoverPart(undefined)}>
      {!miniature && <g className="rig-hit-area" aria-hidden="true">{partId === 'line' ? <Thread d={`M245 28C205 3 112 25 112 75V${lineEnd[rig.id]}`} /> : children}</g>}{children}
    </g>;
  };
  const sabikiY = kamasu?[140,175,210,245]:rig.id === 'uki-sabiki' ? [181,205,229,253] : [143, 189, 235];
  const cast = rig.id === 'nage' || rig.id === 'choi-nage';
  const castHooks = [239,281];
  const castX = 184;
  const baitOnHooks = () => {
    if(hokke) return [196,252].map(y=><Worm key={y} x={154} y={y+13}/>);
    if (cast) return castHooks.map(y => <Worm key={y} x={castX + 26} y={y + 9} />);
    if (rig.id === 'dozuki') return [153,205,257].map(y => <Worm key={y} x={154} y={y + 13} />);
    if (rig.id === 'kago') return <Worm x={184} y={307} />;
    if (rig.id === 'hole') return <Worm x={110} y={305} />;
    if (rig.id === 'float') return <Worm x={110} y={291} />;
    if (rig.id === 'hechi') return <g transform="translate(116 304)"><ellipse rx="9" ry="6" className="rig-bait-fill" /><path d="m-7-3-8-5m8 10-8 5m21-10 8-5m-8 10 8 5m-18-13-6-8m17 8 6-8" className="rig-bait-stroke" fill="none" strokeWidth="1.6" /></g>;
    if (rig.id === 'bukkomi') return <Worm x={110} y={301} />;
    return <Chum y={rig.id === 'uki-sabiki' ? 286 : 277} />;
  };
  return <><svg ref={diagram} xmlns="http://www.w3.org/2000/svg" className={`rig-diagram${miniature ? ' miniature' : ''}${highlight ? ' has-highlight' : ''}`} viewBox="0 0 430 420" fill="none" role={miniature ? undefined : 'img'} aria-hidden={miniature || undefined} aria-label={miniature ? undefined : `${rig.name}の道具全体図`} aria-describedby={miniature ? undefined : `${id}-description`} focusable="false" data-rig={rig.id} data-highlighted-part={highlight} onPointerLeave={miniature ? undefined : () => hoverPart(undefined)}>
    <desc id={`${id}-description`}>{rig.variant}。{rig.connection.join('、')}の順につながります。{activePart ? `いま選ぶ部分は${rig.parts.find(p => p.id === activePart)?.label}です。` : ''}番号は下の道具名と対応します。</desc>
    <g className="rig-scene" aria-hidden="true"><circle cx="219" cy="180" r="153" fill="#edf3ec" /><circle cx="216" cy="174" r="129" fill="#f5f8f2" /><path d="M43 326h342" stroke="#dce6da" strokeDasharray="3 7" /><text x="219" y="343" textAnchor="middle">いっしょに準備するもの</text><ellipse cx="108" cy="397" rx="31" ry="3" fill="#dfe8dc" /><ellipse cx="249" cy="397" rx="35" ry="3" fill="#dfe8dc" /><ellipse cx="379" cy="397" rx="29" ry="3" fill="#dfe8dc" /></g>
    {part('rod', <Rod />)}
    {part('reel', <Reel drum={rig.id === 'hechi'} />)}
    {part('line', <Thread d={`M299 250 314 231 295 177 277 128 261 84 246 46 245 28C205 3 112 25 112 75V${sayori?85:lineEnd[rig.id]}`} />)}
    {part('stopper', <><Stopper inline={rig.id==='float'&&!tachiuo} />{tachiuo&&<rect x="117" y="174" width="6" height="20" rx="3" className="rig-accent"/>}</>)}
    {part('float', sayori?<><Float y={112} inline/><Thread d="M112 141v9M112 223v45"/>{[226,243,260].map(y=><ellipse key={y} cx="112" cy={y} rx="5" ry="7" className="rig-accent"/>)}<rect x="109" y="269" width="6" height="5" className="rig-metal"/></>:<Float inline={rig.id==='float'&&!tachiuo} />)}
    {(rig.id === 'sabiki' || rig.id === 'uki-sabiki') && <>
      {part('rig', <><Thread d={`M112 ${rig.id === 'sabiki' ? 116 : 174}V${rig.id === 'sabiki' ? 261 : 274}`} />{sabikiY.map((y, i) => <g key={y}><Thread d={`M112 ${y}q18-1 ${i % 2 ? 34 : 27} 9`} /><Hook x={i % 2 ? 146 : 139} y={y + 12} feather /></g>)}<circle cx="112" cy={rig.id === 'sabiki' ? 118 : 175} r="3" className="rig-metal" /></>)}
      {part('basket', <Basket y={rig.id === 'sabiki' ? 287 : 298} />)}
      {kamasu&&part('sinker',<><path d="M112 261v9" fill="none"/><rect x="106" y="270" width="12" height="44" rx="4" className="rig-metal"/></>)}
    </>}
    {rig.id === 'float' && <>
      {part('swivel', sayori?<><Swivel y={87}/><Swivel y={210}/></>:<Swivel y={tachiuo?184:190} />)}
      {part('leader', <Thread d={`M112 ${sayori?274:tachiuo?235:203}V279`} />)}
      {part('sinker', tachiuo?<><Thread d="M112 193v5"/><Weight y={215}/></>:<ellipse cx="112" cy="176" rx="5" ry="7" className="rig-metal"/>)}
      {sayori&&part('basket',<RocketBasket y={174}/>)}
      {part('hook', <><Hook x={112} y={283} /></>)}
    </>}
    {(rig.id === 'lure' || rig.id === 'eging') && <>
      {part('leader', <><path d="m108 164 8 3m-8 1 8 3" fill="none" /><Thread d="M112 171V229" /></>)}
      {part('snap', <g transform="translate(112 237)"><path d="m-3-8-3 12q5 9 10 0L1-6-3-8" fill="none" /><path d="M0 6v9" fill="none" /></g>)}
      {part('lure', rig.variant.includes('メタルジグ')?<g transform="translate(112 251)"><path d="M0 0 8 18 1 43-7 20Z" className="rig-fill"/><circle cy="-2" r="3" className="rig-metal"/><path d="M1 43v8m0 0-7-7m7 7 7-7" fill="none"/></g>:rig.variant==='ブレード付きルアー'?<g transform="translate(112 251)"><path d="M0 0q18-5 36 10L18 23 2 13Z" className="rig-fill"/><circle cx="7" cy="5" r="2" className="rig-metal"/><path d="M31 14v8"/><ellipse cx="31" cy="30" rx="7" ry="11" className="rig-metal"/><Hook x={9} y={24}/></g>:rig.variant==='チヌ用ポッパー'?<g transform="translate(112 256) rotate(12)"><path d={rig.variant==='チヌ用ポッパー'?'M0-8q39-7 75 8Q38 12 0 8Z':'M0 0q25-21 78-7L96 3 76 7Q29 16 0 0Z'} className="rig-fill" /><path d="M7-3Q41-15 76-7" className="rig-detail" fill="none" /><circle cx="14" cy="-2" r="2.5" className="rig-metal" />{rig.variant==='チヌ用ポッパー'?<ellipse cy="0" rx="3" ry="8" className="rig-accent"/>:<path d="m4 4-5 7 12-3" className="rig-soft"/>}<path d="M38 11v6m39-9v7" fill="none" /><path d="M38 17v9m0-3-7-6m7 6 7-6m32-2v9m0-3-7-6m7 6 7-6" fill="none" strokeWidth="1.6" /></g>:<GearIllustration category="lure" x="101" y="232" width="118" height="81" viewBox="33 50 180 124" shadow={false}/>)}
      {part('egi', <GearIllustration category="egi" x="101" y="234" width="116" height="76" viewBox="33 50 180 118" shadow={false}/>)}
    </>}
    {rig.id === 'hole' && <>
      {part('leader', <><path d="m108 160 8 3m-8 1 8 3" fill="none" /><Thread d="M112 168V247" /></>)}
      {part('burakuri', <><path d="M112 247v5m0 35v14" fill="none" /><path d="m112 252-11 23 11 13 11-13Z" className="rig-accent" /><path d="m101 275 11-4 11 4" fill="none" /><Hook x={112} y={302} /></>)}
    </>}
    {rig.id === 'bukkomi' && <>
      {part('sinker', <><Thread d="M112 145v43" /><Weight y={164} inline /></>)}
      {part('cushion', <rect x="108.5" y="188" width="7" height="13" rx="2" className="rig-cork" />)}
      {part('swivel', <Swivel y={213} />)}
      {part('leader', <Thread d="M112 226V291" />)}
      {part('hook', <Hook x={112} y={295} />)}
    </>}
    {cast && !hokke && <>
      {part('shock', <><path d="m108 130 8 3m-8 1 8 3" fill="none" /><Thread d="M112 137v29" heavy /></>)}
      {part('tenbin', <><path d={`M112 ${rig.id === 'nage' ? 166 : 165}v24h72`} fill="none" strokeWidth="2.6" /><circle cx="184" cy="190" r="3" className="rig-metal" /></>)}
      {part('sinker', <><Thread d="M112 190v15" /><Weight y={224} /></>)}
      {part('rig', <><Thread d={`M187 190q-3 5-3 15v${rig.id === 'nage' ? 108 : 87}`} />{castHooks.map(y => <g key={y}><Thread d={`M184 ${y}l25 8`} /><Hook x={209} y={y + 11} /></g>)}</>)}
    </>}
    {hokke&&<>
      {part('shock',<><path d="m108 130 8 3m-8 1 8 3"/><Thread d="M112 137v27" heavy/></>)}
      {part('rig',<><Swivel y={174}/><Thread d="M112 187V278"/>{[196,252].map(y=><g key={y}><Thread d={`M112 ${y}l40 11`}/><Hook x={152} y={y+14}/></g>)}</>)}
      {part('sinker',<><Thread d="M112 278v6"/><Weight y={302}/></>)}
    </>}
    {rig.id === 'dozuki' && <>
      {part('rig', <><circle cx="112" cy="118" r="3.5" className="rig-metal" /><Thread d="M112 122V276" />{[153,205,257].map(y => <g key={y}><Thread d={`M112 ${y}l40 11`} /><Hook x={152} y={y + 14} /></g>)}</>)}
      {part('sinker', <><Thread d="M112 276v7" /><Weight y={301} /></>)}
    </>}
    {rig.id === 'hechi' && <>
      {part('leader', <><path d="m108 165 8 3m-8 1 8 3" fill="none" /><Thread d="M112 173V290" /></>)}
      {part('sinker', <circle cx="112" cy="289" r="5" className="rig-metal" />)}
      {part('hook', <Hook x={112} y={298} />)}
      <g className="rig-scene" aria-hidden="true"><path d="M165 273h10v45h-10Z" fill="#dce4da" /><path d="m168 282 5 4m-5 14 5 4" stroke="#bccbbd" /><text x="187" y="294">壁際</text></g>
    </>}
    {rig.id === 'kago' && <>
      {part('tenbin', <><path d="M112 186v12h61" fill="none" strokeWidth="2.6" /><circle cx="173" cy="198" r="3" className="rig-metal" /></>)}
      {part('basket', <Basket y={225} />)}
      {part('leader', <Thread d="M176 198C225 230 218 267 184 293" />)}
      {part('hook', <><Hook x={184} y={298} /><Thread d="M210 251l-25 2"/><Hook x={185} y={256} feather/></>)}
    </>}
    {part('bait', <>{baitOnHooks()}<Accessories part="bait" /></>)}
    {part('chum', <><Chum y={sayori?174:218}/><g transform="translate(30 5)"><Accessories part="bait"/></g></>)}
    {part('bucket', <Accessories part="bucket" />)}
    {part('safety', <Accessories part="safety" />)}
    {!miniature && rig.parts.map((p, index) => {
      const point = (hokke?({rig:[62,213],sinker:[62,301]} as Partial<Record<RigPartId,Point>>)[p.id]:undefined) || (sayori?({float:[61,111],basket:[62,174],swivel:[61,207],leader:[62,264],hook:[62,299],chum:[164,367]} as Partial<Record<RigPartId,Point>>)[p.id]:kamasu&&p.id==='sinker'?[62,293] as Point:undefined) || (p.id==='chum'?[164,367] as Point:undefined) || terminalAnchors[rig.id][p.id] || commonAnchors[p.id];
      if (!point) return null;
      const state = states ? states[p.id] || 'missing' : 'selected';
      const current = activePart === p.id;
      const targets: Partial<Record<RigPartId, Point>> = { rod: [292, 150], reel: [314, 274], line: [168, 28], bait: [91, 367], bucket: [226, 367], safety: [359, 367] };
      const target = targets[p.id] || [point[0] < 100 ? 104 : point[0] > 200 ? 202 : 118, point[1]];
      const dx = target[0] - point[0], dy = target[1] - point[1], distance = Math.hypot(dx, dy);
      return <g key={p.id} data-part-label={p.id} transform={`translate(${point[0]} ${point[1]})`} className={`rig-marker is-${state}${current ? ' is-current' : ''}${highlight === p.id ? ' is-highlighted' : ''}`} aria-hidden="true" onPointerEnter={e => { if (e.pointerType !== 'touch') hoverPart(p.id); }} onPointerLeave={() => hoverPart(undefined)}>{distance > 22 && <path d={`M${dx / distance * 12} ${dy / distance * 12}L${dx} ${dy}`} className="rig-callout" />}{current && <circle r="16" className="rig-marker-halo" />}<circle r="11" /><text textAnchor="middle" dy=".36em">{index + 1}</text></g>;
    })}
  </svg>{!miniature && <RigHoverLabel parts={rig.parts} diagram={diagram} />}</>;
}
