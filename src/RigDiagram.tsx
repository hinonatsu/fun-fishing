import { useId, type ReactNode } from 'react';
import type { CategoryId } from './catalog';
import type { PartState, RigDefinition, RigPartId } from './rigs';

type Point = [number, number];
type Props = {
  rig: RigDefinition; states?: Partial<Record<RigPartId, PartState>>; activePart?: RigPartId;
  recentCategory?: CategoryId; miniature?: boolean;
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
    {feather && <><path d="M-2-6Q15-18 21-8L8 2Z" className="rig-fill" strokeWidth="1" /><path d="m4-5 12-5m-9 8 8-4" className="rig-detail" strokeWidth="1" /></>}
    <path d="M0-3V7C0 20 17 20 17 7V1L12 7" fill="none" strokeWidth="2" />
  </g>;
}
function Worm({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y}c8-4 15 1 10 7s-2 11 6 10`} className="rig-bait-stroke" fill="none" strokeWidth="4.2" />;
}
function Swivel({ y }: { y: number }) {
  return <g transform={`translate(112 ${y})`}><ellipse cy="-8" rx="3.5" ry="4" fill="none" /><rect x="-3" y="-3" width="6" height="8" rx="2" className="rig-metal" /><ellipse cy="9" rx="3.5" ry="4" fill="none" /></g>;
}
function Weight({ x = 112, y, inline = false }: { x?: number; y: number; inline?: boolean }) {
  return <g transform={`translate(${x} ${y})`}><circle cy="-18" r="3" fill="none" /><path d="M0-14C-3-14-14 5-11 12s19 8 22 0S3-14 0-14Z" className="rig-metal" />{inline && <path d="M0-16v34" className="rig-detail" strokeWidth="1.5" />}</g>;
}
function Float({ y = 127 }: { y?: number }) {
  return <g transform={`translate(112 ${y})`}><path d="M0-30V29" fill="none" /><path d="M0-23C-12-23-13 14 0 18 13 14 12-23 0-23Z" className="rig-soft" /><path d="M0-23C-6-23-9-12-8-4H8C9-12 6-23 0-23Z" className="rig-accent" /><path d="M-8-4H8" fill="none" /><path d="M0-39V-30" className="rig-accent-stroke" strokeWidth="3" /></g>;
}
function Stopper() {
  return <g><path d="m106 78 12 8m-12 0 12-8" fill="none" strokeWidth="2.5" /><circle cx="112" cy="96" r="3.6" className="rig-accent" /></g>;
}
function Basket({ y, x = 112 }: { x?: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><path d="M0-29v8" fill="none" /><path d="m-12-17-6 9 4 29q14 10 28 0l4-29-6-9Z" className="rig-fill" /><ellipse cy="-7" rx="18" ry="5" className="rig-soft" /><path d="M-15 2h30M-14 9h28M-13 16h26M-6-6v29M6-6v29" className="rig-detail" strokeWidth="1.1" /><path d="m-10 25 10 7 10-7Z" className="rig-metal" /></g>;
}
function Chum({ y, x = 112 }: { y: number; x?: number }) {
  return <g className="rig-chum" transform={`translate(${x} ${y})`}>{[[-7, -1], [4, 2], [-3, 8], [10, 13], [-16, 17], [2, 20]].map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx="2.5" ry="1.5" className="rig-bait-fill" stroke="none" />)}</g>;
}
function Rod() {
  return <g transform="translate(245 28) rotate(-21)"><path d="M0 0 4 245 5 291Q1 296-3 291L-4 245Z" className="rig-fill" /><path d="M-4 239H5V287H-4Z" className="rig-cork" /><path d="M-4 249H5M-4 277H5" fill="none" /><path d="M-1 13 1 227" className="rig-detail" strokeWidth="1" />{[27, 69, 115, 165, 214].map((y, i) => <g key={y}><path d={`M-2 ${y}h-7l-3 5 9-1Z`} className="rig-metal" strokeWidth={1 + i * .15} /><path d={`M-4 ${y - 3}h9`} fill="none" strokeWidth="2" /></g>)}</g>;
}
function Reel({ drum }: { drum: boolean }) {
  return drum ? <g transform="translate(313 270)"><path d="m8-17 8-11m-9 10 15-5" fill="none" strokeWidth="4" /><circle r="20" className="rig-fill" /><circle r="13" className="rig-soft" /><circle r="3" className="rig-metal" />{[0, 90, 180, 270].map(a => <circle key={a} cx="8" cy="0" r="2.8" transform={`rotate(${a})`} className="rig-metal" />)}<path d="m-13 13-8 7" fill="none" strokeWidth="3" /></g> : <g transform="translate(306 266) rotate(-21)"><path d="m13-10 10-12m-15 15L23-22" fill="none" strokeWidth="4" /><path d="M-7-5C-13 8-4 26 9 26l13-14-8-15Z" className="rig-fill" /><path d="m0 6 10 12 8-7" className="rig-detail" fill="none" /><path d="M-16-11q-12 17 0 28" fill="none" strokeWidth="2.2" /><path d="M-16-16h28v15q-14 8-28 0Z" className="rig-soft" /><ellipse cx="-2" cy="-16" rx="14" ry="5" className="rig-cork" /><path d="M-13-10H9M-13-6H9" className="rig-detail" strokeWidth="1" /><path d="m20 9 15 7 3-13" fill="none" strokeWidth="3" /><rect x="33" y="-3" width="10" height="7" rx="3" className="rig-metal" /></g>;
}
function Accessories({ part }: { part: 'bait' | 'bucket' | 'safety' }) {
  if (part === 'bait') return <g transform="translate(101 368)"><path d="m-16-19 34-4 4 42-35 4Z" className="rig-fill" /><path d="m-16-19 34-4 1 7-34 4Z" className="rig-cork" /><path d="m-8-27 16-2 4 7-19 2Z" className="rig-soft" /><path d="m-7-3 17-2M-6 4 7 3" className="rig-detail" strokeWidth="2" /><path d="m-7 12 12-1" className="rig-bait-stroke" strokeWidth="3" /></g>;
  if (part === 'bucket') return <g transform="translate(248 370)"><path d="M-23-12q2-32 23-32t23 32" fill="none" /><path d="m-26-12 7 33q19 10 38 0l7-33Z" className="rig-fill" /><ellipse cy="-12" rx="26" ry="8" className="rig-soft" /><ellipse cy="-12" rx="20" ry="4" className="rig-metal" /><path d="M-8-41H8" className="rig-cork-stroke" strokeWidth="5" /><path d="m-15 1 3 16m27-16-3 16" className="rig-detail" /></g>;
  return <g transform="translate(381 365)"><path d="m-22-20 12-7 10 8 10-8 12 7 7 23-12 5-3 22h-28l-3-22-12-5Z" className="rig-fill" /><path d="m-10-27 10 8-5 22-9 27m24-57-10 8 5 22 9 27" className="rig-soft" /><path d="M0-16v44" className="rig-detail" /><path d="M-14 7h28v5h-28m1 9h26v4h-26" className="rig-metal" strokeWidth="1" /></g>;
}

/** Each physical component has its own state layer; line and tackle stay connected in every template. */
export function RigDiagram({ rig, states, activePart, recentCategory, miniature = false }: Props) {
  const id = useId().replaceAll(':', '');
  const part = (partId: RigPartId, children: ReactNode) => {
    const item = rig.parts.find(p => p.id === partId);
    if (!item) return null;
    const state = states ? states[partId] || 'missing' : 'selected';
    return <g key={partId} data-part={partId} data-state={state} className={`rig-part is-${state}${activePart === partId ? ' is-current' : ''}${recentCategory && item.category === recentCategory ? ' just-selected' : ''}`}>{children}</g>;
  };
  const sabikiY = rig.id === 'uki-sabiki' ? [193, 225, 257] : [143, 189, 235];
  const cast = rig.id === 'nage' || rig.id === 'choi-nage';
  const castHooks = rig.id === 'nage' ? [222, 258, 294] : [239, 281];
  const castX = 184;
  const baitOnHooks = () => {
    if (cast) return castHooks.map(y => <Worm key={y} x={castX + 26} y={y + 9} />);
    if (rig.id === 'dozuki') return [162, 226].map(y => <Worm key={y} x={154} y={y + 13} />);
    if (rig.id === 'kago') return <><Worm x={184} y={307} /><Chum y={218} /></>;
    if (rig.id === 'hole') return <Worm x={110} y={305} />;
    if (rig.id === 'float') return <Worm x={110} y={291} />;
    if (rig.id === 'hechi') return <g transform="translate(116 304)"><ellipse rx="9" ry="6" className="rig-bait-fill" /><path d="m-7-3-8-5m8 10-8 5m21-10 8-5m-8 10 8 5m-18-13-6-8m17 8 6-8" className="rig-bait-stroke" fill="none" strokeWidth="1.6" /></g>;
    if (rig.id === 'bukkomi') return <Worm x={110} y={301} />;
    return <Chum y={rig.id === 'uki-sabiki' ? 286 : 277} />;
  };
  return <svg xmlns="http://www.w3.org/2000/svg" className={`rig-diagram${miniature ? ' miniature' : ''}`} viewBox="0 0 430 420" fill="none" role={miniature ? undefined : 'img'} aria-hidden={miniature || undefined} aria-labelledby={miniature ? undefined : `${id}-title ${id}-description`} focusable="false" data-rig={rig.id}>
    <title id={`${id}-title`}>{`${rig.name}の道具全体図`}</title>
    <desc id={`${id}-description`}>{rig.variant}。{rig.connection.join('、')}の順につながります。{activePart ? `いま選ぶ部分は${rig.parts.find(p => p.id === activePart)?.label}です。` : ''}番号は下の道具名と対応します。</desc>
    <g className="rig-scene" aria-hidden="true"><circle cx="219" cy="180" r="153" fill="#edf3ec" /><circle cx="216" cy="174" r="129" fill="#f5f8f2" /><path d="M43 326h342" stroke="#dce6da" strokeDasharray="3 7" /><text x="219" y="343" textAnchor="middle">いっしょに準備するもの</text><ellipse cx="108" cy="397" rx="31" ry="3" fill="#dfe8dc" /><ellipse cx="249" cy="397" rx="35" ry="3" fill="#dfe8dc" /><ellipse cx="379" cy="397" rx="29" ry="3" fill="#dfe8dc" /></g>
    {part('rod', <Rod />)}
    {part('reel', <Reel drum={rig.id === 'hechi'} />)}
    {part('line', <Thread d={`M299 250 320 229 298 170 276 115 258 65 245 28C205 3 112 25 112 75V${lineEnd[rig.id]}`} />)}
    {part('stopper', <Stopper />)}
    {part('float', <Float />)}
    {(rig.id === 'sabiki' || rig.id === 'uki-sabiki') && <>
      {part('rig', <><Thread d={`M112 ${rig.id === 'sabiki' ? 116 : 174}V${rig.id === 'sabiki' ? 261 : 274}`} />{sabikiY.map((y, i) => <g key={y}><Thread d={`M112 ${y}q18-1 ${i % 2 ? 34 : 27} 9`} /><Hook x={i % 2 ? 146 : 139} y={y + 12} feather /></g>)}<circle cx="112" cy={rig.id === 'sabiki' ? 118 : 175} r="3" className="rig-metal" /></>)}
      {part('basket', <Basket y={rig.id === 'sabiki' ? 287 : 298} />)}
    </>}
    {rig.id === 'float' && <>
      {part('swivel', <Swivel y={190} />)}
      {part('leader', <Thread d="M112 203V279" />)}
      {part('sinker', <><circle cx="112" cy="249" r="4.5" className="rig-metal" /><path d="m109 247 5 4" fill="none" strokeWidth="1" /></>)}
      {part('hook', <Hook x={112} y={283} />)}
    </>}
    {(rig.id === 'lure' || rig.id === 'eging') && <>
      {part('leader', <><path d="m108 164 8 3m-8 1 8 3" fill="none" /><Thread d="M112 171V229" /></>)}
      {part('snap', <g transform="translate(112 237)"><path d="m-3-8-3 12q5 9 10 0L1-6-3-8" fill="none" /><path d="M0 6v9" fill="none" /></g>)}
      {part('lure', <g transform="translate(112 256) rotate(12)"><path d="M0 0q25-21 78-7L96 3 76 7Q29 16 0 0Z" className="rig-fill" /><path d="M7-3Q41-15 76-7" className="rig-detail" fill="none" /><circle cx="14" cy="-2" r="2.5" className="rig-metal" /><path d="m4 4-5 7 12-3" className="rig-soft" /><path d="M38 11v6m39-9v7" fill="none" /><path d="M38 17v9m0-3-7-6m7 6 7-6m32-2v9m0-3-7-6m7 6 7-6" fill="none" strokeWidth="1.6" /></g>)}
      {part('egi', <g transform="translate(112 255) rotate(15)"><path d="M0 0q18-20 51-5L83 5 65 9Q26 17 0 0Z" className="rig-fill" /><path d="m10 8 8 17 13-14" className="rig-metal" /><path d="m25-8 5 14m11-12 5 13m10-8 5 9" className="rig-detail" strokeWidth="3" /><circle cx="12" cy="-2" r="2.5" className="rig-metal" /><path d="M80 5h15m-9 0 8-7m-8 7 8 7m-2-7 9-7m-9 7 9 7m-17-7 7-11m-7 11 7 11" fill="none" strokeWidth="1.5" /></g>)}
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
    {cast && <>
      {part('shock', <><path d="m108 130 8 3m-8 1 8 3" fill="none" /><Thread d="M112 137v29" heavy /></>)}
      {part('tenbin', <><path d={`M112 ${rig.id === 'nage' ? 166 : 165}v24h72`} fill="none" strokeWidth="2.6" /><circle cx="184" cy="190" r="3" className="rig-metal" /></>)}
      {part('sinker', <><Thread d="M112 190v15" /><Weight y={224} /></>)}
      {part('rig', <><Thread d={`M187 190q-3 5-3 15v${rig.id === 'nage' ? 108 : 87}`} />{castHooks.map(y => <g key={y}><Thread d={`M184 ${y}l25 8`} /><Hook x={209} y={y + 11} /></g>)}</>)}
    </>}
    {rig.id === 'dozuki' && <>
      {part('rig', <><circle cx="112" cy="118" r="3.5" className="rig-metal" /><Thread d="M112 122V276" />{[162, 226].map(y => <g key={y}><Thread d={`M112 ${y}l40 11`} /><Hook x={152} y={y + 14} /></g>)}</>)}
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
      {part('hook', <Hook x={184} y={298} />)}
    </>}
    {part('bait', <>{baitOnHooks()}<Accessories part="bait" /></>)}
    {part('bucket', <Accessories part="bucket" />)}
    {part('safety', <Accessories part="safety" />)}
    {!miniature && rig.parts.map((p, index) => {
      const point = terminalAnchors[rig.id][p.id] || commonAnchors[p.id];
      if (!point) return null;
      const state = states ? states[p.id] || 'missing' : 'selected';
      const current = activePart === p.id;
      const targets: Partial<Record<RigPartId, Point>> = { rod: [292, 150], reel: [314, 274], line: [168, 28], bait: [91, 367], bucket: [226, 367], safety: [359, 367] };
      const target = targets[p.id] || [point[0] < 100 ? 104 : point[0] > 200 ? 202 : 118, point[1]];
      const dx = target[0] - point[0], dy = target[1] - point[1], distance = Math.hypot(dx, dy);
      return <g key={p.id} transform={`translate(${point[0]} ${point[1]})`} className={`rig-marker is-${state}${current ? ' is-current' : ''}`} aria-hidden="true">{distance > 22 && <path d={`M${dx / distance * 12} ${dy / distance * 12}L${dx} ${dy}`} className="rig-callout" />}{current && <circle r="16" className="rig-marker-halo" />}<circle r="11" /><text textAnchor="middle" dy=".36em">{index + 1}</text></g>;
    })}
  </svg>;
}
