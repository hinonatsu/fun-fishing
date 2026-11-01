import { useId } from 'react';
import { fishDrawings, type FinDrawing } from './fish-artwork-data';

function Fin({ drawing, fill, ink }: { drawing: FinDrawing; fill: string; ink: string }) {
  return <g stroke={ink} strokeLinejoin="round">
    <path d={drawing.outline} fill={fill} strokeWidth=".85" />
    {drawing.rays && <path d={drawing.rays} strokeWidth=".65" opacity=".65" />}
  </g>;
}

function Eye({ at, ink, squid = false, cuttlefish = false }: { at: readonly [number, number, number]; ink: string; squid?: boolean; cuttlefish?: boolean }) {
  const [x, y, r] = at;
  return <g>
    <circle cx={x} cy={y} r={r + .8} fill={ink} opacity=".22" />
    <circle cx={x} cy={y} r={r} fill={squid ? '#c8bc84' : '#d7c99b'} stroke={ink} strokeWidth=".7" />
    {cuttlefish
      ? <path d={`M${x-r*.7} ${y-r*.15}q${r*.3} ${-r*.5} ${r*.47} 0t${r*.47} 0t${r*.47} 0`} stroke="#182d30" strokeWidth={r*.27} strokeLinecap="round" />
      : <circle cx={x - .25} cy={y} r={r * .58} fill="#182d30" />}
    <circle cx={x - r * .24} cy={y - r * .27} r={r * .17} fill="#fcfff4" opacity=".95" />
  </g>;
}

/** Deterministic spots: no random render changes or repeated SVG identifiers. */
function Speckles({ light = false }: { light?: boolean }) {
  return <g fill={light ? '#e7d9ad' : '#4d4932'} opacity={light ? '.48' : '.32'}>
    {Array.from({ length: 65 }, (_, i) => <ellipse key={i}
      cx={53 + (i * 37 % 173)} cy={49 + (i * 29 % 82)}
      rx={.65 + (i % 4) * .45} ry={.6 + (i % 3) * .3} />)}
  </g>;
}

function Scutes({ start = 166, end = 230, y = 90 }: { start?: number; end?: number; y?: number }) {
  return <g stroke="#647557" strokeWidth=".7" fill="#d8d7ae">
    {Array.from({ length: Math.floor((end - start) / 4) }, (_, i) => {
      const x = start + i * 4;
      return <path key={i} d={`M${x} ${y - 2}l3 2-3 2-1-2Z`} />;
    })}
  </g>;
}

function FishMarkings({ species }: { species: string }) {
  switch (species) {
    case 'aji': return <>
      <path d="M74 85Q124 76 157 87L232 90" stroke="#d1be64" strokeWidth="2.2" opacity=".55" />
      <Scutes /><ellipse cx="72" cy="79" rx="3" ry="2.2" fill="#384e46" />
    </>;
    case 'saba': return <g stroke="#214b59" strokeWidth="2.3" opacity=".85" strokeLinecap="round">
      {[82, 96, 110, 124, 138, 152, 166, 180, 194, 208].map((x, i) => <path key={x}
        d={`M${x} ${53 + i * 1.2}q-7 7 1 12t0 12q-5 3-2 6`} />)}
    </g>;
    case 'iwashi': return <g fill="#36576a" opacity=".88">
      {[86, 104, 122, 140, 158, 176, 194, 210].map((x, i) => <ellipse key={x} cx={x} cy={86 + i * .65} rx="2.25" ry="2.1" />)}
    </g>;
    case 'madai': return <g fill="#66a9b9" stroke="#bfdfd5" strokeWidth=".35">
      {[[92,57],[108,51],[125,52],[142,57],[159,64],[177,73],[97,73],[115,68],[133,70],[151,76],[169,84],[108,88],[127,85],[146,92],[166,98]].map(([x,y]) => <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.65" ry="1.1" transform={`rotate(-18 ${x} ${y})`} />)}
    </g>;
    case 'buri': return <path d="M40 85Q119 80 178 87L236 89" stroke="#c9b44b" strokeWidth="3" opacity=".8" />;
    case 'kanpachi': return <>
      <path d="M42 87Q120 80 184 88L237 90" stroke="#cfb54e" strokeWidth="4" opacity=".86" />
      <path d="M64 57L46 78L40 87" stroke="#62573b" strokeWidth="7" opacity=".82" />
    </>;
    case 'sawara': return <g fill="#536975" opacity=".8">
      {Array.from({length: 7}, (_, row) => <g key={row}>
        {[83, 101, 119, 137, 155, 173, 191, 209].map((x, i) => <ellipse key={x}
          cx={x + (row % 2) * 7} cy={73 + row * 5.3 + i * .3} rx="1.6" ry="1.35" />)}
      </g>)}
    </g>;
    case 'hirame': return <>
      <Speckles /><Speckles light />
      <g fill="#66583b" stroke="#b4a07a" strokeWidth="1" opacity=".8">
        {[[99,63],[133,57],[170,77],[114,110],[156,117],[195,99]].map(([x,y]) => <ellipse key={x} cx={x} cy={y} rx="4" ry="3" />)}
      </g>
    </>;
    case 'karei': return <><Speckles /><Speckles light />
      <path d="M83 68Q115 58 137 72M104 117Q147 133 181 110" stroke="#b6a57b" strokeWidth="4" opacity=".2" />
    </>;
    case 'anago': return <>
      <path d="M27 90Q51 88 73 102Q138 143 205 132Q243 128 259 105" stroke="#ece7ca" strokeWidth="7" opacity=".8" />
      <g fill="#f4edcf">{[[58,85],[71,93],[84,101],[98,108],[113,115],[129,121],[146,126],[164,130],[182,132],[201,131],[219,127],[236,119],[248,108],[255,96]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="1.6" />)}</g>
    </>;
    case 'hokke': return <>
      <g stroke="#635f43" strokeWidth="6" opacity=".34">{[94,119,144,169,194].map(x => <path key={x} d={`M${x} 65q-9 22 0 49`} />)}</g>
      <Speckles /><Speckles light />
    </>;
    case 'kawahagi': return <>
      <g stroke="#8e7c55" strokeWidth="4" opacity=".45">
        <path d="M111 47L99 75L107 89L100 112M147 47L133 73L150 93L137 126M179 69L162 84L174 109" />
      </g><Speckles light />
    </>;
    case 'tachiuo': return <>
      <path d="M39 86Q119 84 179 98T266 96" stroke="#fbfff8" strokeWidth="2.1" opacity=".95" />
      <path d="M57 96Q158 109 224 105" stroke="#8295a7" strokeWidth="1" opacity=".7" />
    </>;
    case 'kisu': return <>
      <path d="M64 87Q136 82 210 91L238 91" stroke="#d3b778" strokeWidth="2.2" opacity=".6" />
      <path d="M77 95Q146 99 209 96" stroke="#fff8dd" strokeWidth="1.3" opacity=".9" />
    </>;
    case 'mebaru': return <g stroke="#544931" strokeWidth="8" opacity=".28">
      <path d="M99 51L100 91M127 49L128 94M153 57L154 99M178 69L177 103M201 84L198 103" />
    </g>;
    case 'kasago': return <>
      <g fill="#773d2d" opacity=".57">
        <path d="M85 61L105 67L96 87L107 98L88 108L75 91ZM128 62L144 69L138 94L149 110L129 126L114 107ZM168 68L185 81L175 99L189 115L168 126L154 107ZM206 83L217 91L207 103L215 113L197 122L194 99Z" />
      </g><Speckles light />
      <g fill="#efcf9f" opacity=".8">{[[60,109],[95,78],[114,91],[144,78],[158,112],[187,95],[204,102]].map(([x,y]) => <path key={x} d={`M${x} ${y}l4-2 3 3-2 4-5-1Z`} />)}</g>
    </>;
    case 'kurodai': return <g stroke="#3c4d4c" strokeWidth="6" opacity=".24">
      {[101,123,145,167,189].map(x => <path key={x} d={`M${x} 43q-4 42 1 88`} />)}
    </g>;
    case 'shimaaji': return <>
      <path d="M45 84Q126 78 182 87L232 91" stroke="#d1b746" strokeWidth="4" opacity=".87" />
      <ellipse cx="76" cy="75" rx="3.4" ry="2.7" fill="#384d45" /><Scutes start={180} />
    </>;
    case 'isaki': return <g stroke="#65583b" strokeWidth="3.4" opacity=".85">
      <path d="M53 78Q124 51 212 84M54 88Q128 68 221 91M60 101Q138 90 214 98" />
    </g>;
    case 'haze': return <>
      <g fill="#73613d" opacity=".65">{[95,115,135,155,175,196,216].map((x,i) => <ellipse key={x} cx={x} cy={98 + Math.sin(i) * 2} rx="4.8" ry="3.3" />)}</g>
      <Speckles /><Speckles light />
    </>;
    case 'bora': return <>
      <g stroke="#687e6e" strokeWidth="1.2" opacity=".7"><path d="M73 75Q136 67 211 86M77 83Q145 78 222 91M79 92Q148 88 228 96M79 100Q150 101 217 101M89 108Q152 111 197 107" /></g>
      <ellipse cx="78" cy="91" rx="3.4" ry="2.6" fill="#4d6256" />
    </>;
    case 'ainame': return <>
      <g stroke="#635333" strokeWidth="9" opacity=".4"><path d="M94 66L99 118M122 67L128 123M150 72L157 121M179 79L186 113M207 87L209 107" /></g>
      <Speckles /><Speckles light />
    </>;
    case 'sayori': return <>
      <path d="M81 90L244 93" stroke="#e9f9eb" strokeWidth="2.2" />
      <path d="M12 93L21 93" stroke="#c75c41" strokeWidth="2.5" strokeLinecap="round" />
    </>;
    case 'kamasu': return <path d="M67 87Q149 81 217 93L238 93" stroke="#b9a156" strokeWidth="2.4" opacity=".55" />;
    case 'mejina': return <>
      <path d="M46 93L57 95" stroke="#223b3b" strokeWidth="2.5" />
      <path d="M86 68Q144 50 196 85" stroke="#7fa39b" strokeWidth="3" opacity=".23" />
    </>;
    default: return null;
  }
}

function Finlets({ species, fill, ink }: { species: string; fill: string; ink: string }) {
  if (species !== 'saba' && species !== 'sawara') return null;
  return <g fill={fill} stroke={ink} strokeWidth=".65" strokeLinejoin="round">
    {Array.from({ length: species === 'saba' ? 5 : 8 }, (_, i) => {
      const x = 207 + i * (species === 'saba' ? 5 : 3.5);
      const top = 79 + i * (species === 'saba' ? .9 : .65);
      const bottom = 100 - i * (species === 'saba' ? .95 : .7);
      return <g key={i}><path d={`M${x} ${top}l2-5 3 6Z`} /><path d={`M${x} ${bottom}l2 5 3-6Z`} /></g>;
    })}
  </g>;
}

const squidDrawings = {
  tsutsuika: {
    model: 'ヤリイカ', ink: '#96645c', color: '#c49486',
    mantle: 'M111 72Q172 63 258 85Q172 107 111 98Q119 85 111 72Z',
    fins: 'M174 71Q195 49 217 44L258 85L216 126Q194 120 174 100L222 86Z',
    head: 'M113 76L101 72Q86 70 80 81L81 94Q97 101 113 95Z',
  },
  aoriika: {
    model: 'アオリイカ', ink: '#776d46', color: '#c4b887',
    mantle: 'M112 65Q164 51 220 67Q243 74 253 85Q241 101 220 106Q166 121 112 105Q120 85 112 65Z',
    fins: 'M115 68Q115 40 162 37Q222 34 253 85Q223 138 162 135Q116 133 115 103L221 85Z',
    head: 'M114 73L99 69Q85 71 80 82L81 95Q96 102 114 98Z',
  },
  kouika: {
    model: 'コウイカ', ink: '#78614c', color: '#b7a086',
    mantle: 'M115 62Q160 44 207 55Q245 64 249 85Q247 107 209 116Q162 128 115 107Q125 85 115 62Z',
    fins: 'M113 61Q159 36 209 46Q251 54 257 82L255 89Q249 116 210 124Q160 137 113 109L127 103Q176 125 219 109Q240 98 242 85Q239 67 214 61Q168 48 126 68Z',
    head: 'M118 73L100 68Q85 69 79 81L81 97Q96 104 118 98Z',
  },
} as const;

function Squid({ species, id }: { species: keyof typeof squidDrawings; id: string }) {
  const drawing = squidDrawings[species];
  const arms = [
    'M85 76Q64 69 47 57Q40 51 36 55', 'M84 78Q61 73 40 68Q29 66 29 71',
    'M83 81Q58 79 35 80Q22 80 23 85', 'M83 84Q59 85 43 88Q31 91 28 86',
    'M83 87Q62 91 44 97Q32 103 28 98', 'M84 90Q64 101 46 108Q36 111 34 106',
    'M86 94Q70 112 54 118Q45 120 42 115', 'M88 97Q78 121 62 126Q53 128 51 123',
  ];
  return <>
    <defs>
      <linearGradient id={`${id}-mantle`} x1="170" y1="51" x2="174" y2="121" gradientUnits="userSpaceOnUse">
        <stop stopColor={drawing.color} /><stop offset=".42" stopColor="#eee6c8" /><stop offset=".65" stopColor="#e5ddbd" /><stop offset="1" stopColor={drawing.color} />
      </linearGradient>
      <clipPath id={`${id}-mantle-clip`}><path d={drawing.mantle} /></clipPath>
      <pattern id={`${id}-chromatophores`} width="7" height="6" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="2" r=".65" fill={drawing.ink} /><circle cx="5" cy="5" r=".45" fill={drawing.ink} />
      </pattern>
    </defs>
    <path d={drawing.fins} fill={drawing.color} fillOpacity=".37" stroke={drawing.ink} strokeWidth=".9" />
    <path d={drawing.fins} fill={`url(#${id}-chromatophores)`} opacity=".3" />
    <g fill="none" stroke={drawing.ink} strokeLinecap="round">
      <g data-squid-tentacles="2" strokeWidth="1.8">
        <path d="M86 79Q60 57 36 45Q21 38 12 46" /><path d="M87 95Q58 123 31 133Q18 137 11 129" />
      </g>
      <g strokeWidth="4"><path d="M18 42Q13 42 10 48" /><path d="M18 134Q12 134 9 128" /></g>
      <g data-squid-arms="8" strokeWidth="3.3">{arms.map((d,i) => <path key={i} d={d} />)}</g>
      <g stroke="#e4d5b7" strokeWidth="1.2">{arms.map((d,i) => <path key={i} d={d} />)}</g>
    </g>
    <path d={drawing.head} fill={`url(#${id}-mantle)`} stroke={drawing.ink} strokeWidth=".9" />
    <path data-fish-body="true" d={drawing.mantle} fill={`url(#${id}-mantle)`} stroke={drawing.ink} strokeWidth="1" />
    <g clipPath={`url(#${id}-mantle-clip)`}>
      <path d={drawing.mantle} fill={`url(#${id}-chromatophores)`} opacity=".56" />
      {species === 'aoriika' && <g stroke="#847349" strokeWidth="3" opacity=".55">
        <path d="M138 58L134 76M155 55L151 75M172 56L169 75M189 58L186 77M206 62L203 79M222 69L218 81M138 111L134 95M156 115L152 96M174 115L170 97M192 112L189 96M210 108L206 94M225 100L221 91" />
      </g>}
      {species === 'kouika' && <>
        <g stroke="#72583e" strokeWidth="1.4" opacity=".55">
          {Array.from({length: 11}, (_,i) => <path key={i} d={`M${131+i*9} 53q-7 9-2 16m2 5q-5 5-1 8m1 11q-6 9-1 16m1 5l-1 6`} />)}
        </g>
        <path d={drawing.mantle} fill={`url(#${id}-chromatophores)`} opacity=".6" />
        <g fill="#fff5d6" opacity=".75">{Array.from({length: 32}, (_,i) => <ellipse key={i} cx={127+i*31%107} cy={60+i*23%53} rx="1.1" ry=".7" />)}</g>
      </>}
      {species === 'tsutsuika' && <path d="M124 81Q187 74 245 84M124 90Q184 98 245 87" stroke="#a46059" strokeWidth="1.2" opacity=".38" />}
      <path d="M132 84Q184 78 230 85" stroke="#fffae5" strokeWidth="2" opacity=".55" />
    </g>
    <path d="M112 74Q117 85 112 97" stroke={drawing.ink} strokeWidth="1.1" />
    <Eye at={[94, 85, 7.3]} ink={drawing.ink} squid cuttlefish={species === 'kouika'} />
  </>;
}

/** Each catalog group uses one documented representative species, never a generic silhouette. */
export function FishArtwork({ species, className }: { species: string; className?: string }) {
  const id = `fish-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const squidSpecies = Object.hasOwn(squidDrawings, species) ? species as keyof typeof squidDrawings : undefined;
  const drawing = Object.hasOwn(fishDrawings, species) ? fishDrawings[species] : undefined;
  if (!drawing && !squidSpecies) return null;
  const model = drawing?.model ?? squidDrawings[squidSpecies!].model;
  return <svg className={className} viewBox="0 0 290 170" fill="none" aria-hidden="true" focusable="false" data-artwork-species={species}>
    <title>{model}</title>
    <ellipse cx="147" cy="150" rx="99" ry="4" fill="#193e4b" opacity=".045" />
    {squidSpecies ? <Squid species={squidSpecies} id={id} /> : drawing && <>
      <defs>
        <linearGradient id={`${id}-body`} x1="140" y1={drawing.smooth ? '65' : '35'} x2="140" y2={drawing.smooth ? '135' : '137'} gradientUnits="userSpaceOnUse">
          <stop stopColor={drawing.colors[0]} /><stop offset=".36" stopColor={drawing.colors[1]} /><stop offset=".78" stopColor={drawing.colors[2]} /><stop offset="1" stopColor={drawing.colors[1]} />
        </linearGradient>
        <linearGradient id={`${id}-fin`} x1="130" y1="25" x2="140" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor={drawing.colors[4]} /><stop offset=".55" stopColor={drawing.colors[1]} /><stop offset="1" stopColor={drawing.colors[4]} />
        </linearGradient>
        <pattern id={`${id}-scales`} width="7" height="6" patternUnits="userSpaceOnUse">
          <path d="M-3.5 0Q0 6 3.5 0M3.5 0Q7 6 10.5 0M0 3Q3.5 9 7 3" stroke={drawing.colors[3]} strokeWidth=".4" />
        </pattern>
        <clipPath id={`${id}-clip`}><path d={drawing.body} /></clipPath>
      </defs>
      <g transform={drawing.mirror ? 'translate(290 0) scale(-1 1)' : undefined}>
        {drawing.fins.map((fin,i) => <Fin key={i} drawing={fin} fill={`url(#${id}-fin)`} ink={drawing.colors[3]} />)}
        {drawing.tail && <Fin drawing={drawing.tail} fill={`url(#${id}-fin)`} ink={drawing.colors[3]} />}
        <Finlets species={species} fill={drawing.colors[4]} ink={drawing.colors[3]} />
        <path data-fish-body="true" d={drawing.body} fill={`url(#${id}-body)`} stroke={drawing.colors[3]} strokeWidth="1.1" strokeLinejoin="round" />
        <g clipPath={`url(#${id}-clip)`}>
          {!drawing.smooth && !drawing.flat && <path d={drawing.body} fill={`url(#${id}-scales)`} opacity=".28" />}
          <FishMarkings species={species} />
          {drawing.lateral && <path d={drawing.lateral} stroke={drawing.colors[3]} strokeWidth=".75" opacity=".5" />}
        </g>
        {drawing.gill && <path d={drawing.gill} stroke={drawing.colors[3]} strokeWidth="1.1" opacity=".9" />}
        {drawing.pectoral && <Fin drawing={drawing.pectoral} fill={`url(#${id}-fin)`} ink={drawing.colors[3]} />}
        <Eye at={drawing.eye} ink={drawing.colors[3]} />
        {drawing.secondEye && <Eye at={drawing.secondEye} ink={drawing.colors[3]} />}
        <path d={drawing.mouth} stroke={drawing.colors[3]} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>}
  </svg>;
}
