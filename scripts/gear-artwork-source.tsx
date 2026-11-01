import { useId, type SVGProps } from 'react';

type ArtworkProps = {
  category: string;
  variant?: 'drum' | 'vertical-rod';
  shadow?: boolean;
} & SVGProps<SVGSVGElement>;

/** Shared material definitions for the original equipment drawings. */
export function GearMaterials({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-steel`} x2="1" y2="0">
        <stop stopColor="#46515d"/><stop offset=".17" stopColor="#9daab4"/><stop offset=".35" stopColor="#f4f7f8"/><stop offset=".48" stopColor="#b9c4cc"/><stop offset=".65" stopColor="#75828f"/><stop offset=".83" stopColor="#e7edf0"/><stop offset="1" stopColor="#535f6b"/>
      </linearGradient>
      <linearGradient id={`${id}-lead`} x1="0" y1="0" x2="1" y2=".5">
        <stop stopColor="#c3c9cc"/><stop offset=".3" stopColor="#a0a8ac"/><stop offset=".55" stopColor="#727d85"/><stop offset="1" stopColor="#444e57"/>
      </linearGradient>
      <linearGradient id={`${id}-graphite`} x2="1" y2="0">
        <stop stopColor="#111b22"/><stop offset=".35" stopColor="#4b5e6b"/><stop offset=".48" stopColor="#81939d"/><stop offset=".6" stopColor="#263742"/><stop offset="1" stopColor="#111920"/>
      </linearGradient>
      <linearGradient id={`${id}-gold`} x2="0" y2="1">
        <stop stopColor="#665431"/><stop offset=".15" stopColor="#dfc58b"/><stop offset=".36" stopColor="#fff0ba"/><stop offset=".52" stopColor="#a78848"/><stop offset=".7" stopColor="#d9ba77"/><stop offset="1" stopColor="#78603a"/>
      </linearGradient>
      <linearGradient id={`${id}-cork`} x2="1" y2="0">
        <stop stopColor="#81613f"/><stop offset=".28" stopColor="#c5a477"/><stop offset=".5" stopColor="#e2c495"/><stop offset=".8" stopColor="#bea076"/><stop offset="1" stopColor="#8d6b43"/>
      </linearGradient>
      <linearGradient id={`${id}-blue`} x1="0" y1="0" x2=".8" y2="1">
        <stop stopColor="#6f9ca8"/><stop offset=".27" stopColor="#467c8e"/><stop offset=".65" stopColor="#235065"/><stop offset="1" stopColor="#152e40"/>
      </linearGradient>
      <linearGradient id={`${id}-orange`} x1="0" y1="0" x2="1" y2=".25">
        <stop stopColor="#ad3c16"/><stop offset=".25" stopColor="#ef712a"/><stop offset=".48" stopColor="#ffa857"/><stop offset=".75" stopColor="#e96926"/><stop offset="1" stopColor="#a73817"/>
      </linearGradient>
      <linearGradient id={`${id}-red`} x2="1" y2=".2">
        <stop stopColor="#8a2429"/><stop offset=".3" stopColor="#ef6251"/><stop offset=".52" stopColor="#ff8c69"/><stop offset=".75" stopColor="#d64237"/><stop offset="1" stopColor="#7f202b"/>
      </linearGradient>
      <linearGradient id={`${id}-pearl`} x2=".25" y2="1">
        <stop stopColor="#fffef8"/><stop offset=".35" stopColor="#e9edef"/><stop offset=".6" stopColor="#c1cdd3"/><stop offset=".78" stopColor="#f2f5f4"/><stop offset="1" stopColor="#9eafb8"/>
      </linearGradient>
      <linearGradient id={`${id}-fish`} x2=".15" y2="1">
        <stop stopColor="#1b4158"/><stop offset=".24" stopColor="#468491"/><stop offset=".46" stopColor="#b7dedb"/><stop offset=".6" stopColor="#f6eee2"/><stop offset=".82" stopColor="#d1d2c7"/><stop offset="1" stopColor="#788c96"/>
      </linearGradient>
      <linearGradient id={`${id}-clear`} x2=".6" y2="1">
        <stop stopColor="#ffffff" stopOpacity=".8"/><stop offset=".4" stopColor="#bfd3da" stopOpacity=".35"/><stop offset=".7" stopColor="#f4ffff" stopOpacity=".85"/><stop offset="1" stopColor="#809ba7" stopOpacity=".55"/>
      </linearGradient>
      <radialGradient id={`${id}-rubber`} cx=".35" cy=".25" r=".8">
        <stop stopColor="#55626a"/><stop offset=".45" stopColor="#2b363f"/><stop offset="1" stopColor="#111a22"/>
      </radialGradient>
      <radialGradient id={`${id}-shadow`}>
        <stop stopColor="#173743" stopOpacity=".2"/><stop offset="1" stopColor="#173743" stopOpacity="0"/>
      </radialGradient>
      <pattern id={`${id}-carbon`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <path d="M0 0h2v2H0zm2 2h2v2H2Z" fill="#c6d2d8" fillOpacity=".15" stroke="none"/>
      </pattern>
      <pattern id={`${id}-fabric`} width="3" height="3" patternUnits="userSpaceOnUse">
        <path d="M0 .5h3M.5 0v3" stroke="#132731" strokeOpacity=".18" strokeWidth=".45"/>
      </pattern>
      <pattern id={`${id}-mesh`} width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="m0 5 5-5 5 5-5 5Z" stroke="#486779" strokeOpacity=".65" strokeWidth=".65"/>
      </pattern>
      <pattern id={`${id}-scales`} width="8" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 0q4 6 8 0M-4 3q4 6 8 0m0 0q4 6 8 0" stroke="#effffa" strokeOpacity=".36" strokeWidth=".6"/>
      </pattern>
    </defs>
  );
}

/** Original material studies of equipment categories, rather than specific products. */
export function GearIllustration({ category, variant, shadow = true, className = '', ...props }: ArtworkProps) {
  const id = `gear-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const paint = (name: string) => `url(#${id}-${name})`;
  return <svg viewBox={variant === 'vertical-rod' ? '-14 -2 28 300' : '0 0 240 180'} fill="none" stroke="#46515a" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round" {...props} className={`gear-artwork ${className}`} data-gear-artwork={category} aria-hidden="true" focusable="false">
    <GearMaterials id={id}/>
    {shadow && variant !== 'vertical-rod' && <ellipse cx="120" cy="158" rx="83" ry="10" fill={paint('shadow')} stroke="none"/>}
    <g data-gear-drawing={category}>
      {category === 'rod' && <g transform={variant === 'vertical-rod' ? undefined : 'translate(195 22) rotate(49) scale(.69)'}>
        <path d="M-.65 0 .8 0 4.1 241H-4Z" fill={paint('graphite')} stroke="#253642" strokeWidth=".5"/>
        <path d="M-2.8 137H2.9L4 239H-4Z" fill={paint('carbon')} stroke="none"/>
        <path d="M-.4 11 1.5 231" stroke="#b4c9d4" strokeOpacity=".5" strokeWidth=".55"/>
        {[12, 53, 100, 152, 209].map((y, i) => <g key={y}>
          <path d={`M${-1.1 - i * .55} ${y}h${4 + i * .3}`} stroke="#bba26a" strokeWidth="2.5"/>
          <path d={`M${-1.1 - i * .55} ${y + 2}l${-4 - i} 3 1 ${3 + i} ${4 + i} -3Z`} fill={paint('steel')} stroke="#495963" strokeWidth=".6"/>
          <ellipse cx={-5 - i * .7} cy={y + 5} rx={1.5 + i * .35} ry={2 + i * .3} fill="#263b47" stroke="#ccd7db" strokeWidth=".7"/>
        </g>)}
        <path d="M-4.4 235H4.5v18h-8.9Z" fill={paint('graphite')}/>
        <path d="M-4.8 238h10m-10 3h10m-10 9h10" stroke="#c0c9ce" strokeWidth="1.1"/>
        <path d="M-5 254H5v35q-5 4-10 0Z" fill={paint('cork')} stroke="#8f7657"/>
        {[260, 269, 278, 285].map((y, i) => <path key={y} d={`m${i % 2 ? -3 : 1} ${y}h2.2m-5 2h1.4`} stroke="#735b3d" strokeOpacity=".55" strokeWidth=".8"/>)}
        <path d="M-5 289H5v5q-5 3-10 0Z" fill={paint('rubber')}/>
        <path d="M-5 254H5m-10 33H5" stroke="#ead5b5" strokeWidth=".6"/>
      </g>}
      {category === 'reel' && (variant === 'drum' ? <g transform="translate(122 95)">
        <path d="M-12-44h28l3 9-11 12" stroke={paint('steel')} strokeWidth="6"/>
        <circle r="49" fill={paint('graphite')} stroke="#293c46" strokeWidth="2"/>
        <circle r="42" fill={paint('steel')}/><circle r="35" fill={paint('rubber')}/>
        <circle r="29" fill={paint('gold')}/><circle r="22" fill={paint('graphite')}/>
        {[0, 60, 120, 180, 240, 300].map(a => <ellipse key={a} cx="34" cy="0" rx="3.5" ry="6" transform={`rotate(${a})`} fill="#1d2b34" stroke="#e4eaec" strokeWidth=".5"/>)}
        <circle r="6" fill={paint('steel')}/><path d="m0 0-22 24" stroke={paint('steel')} strokeWidth="6"/>
        <ellipse cx="-25" cy="26" rx="9" ry="12" fill={paint('rubber')} transform="rotate(35 -25 26)"/>
      </g> : <g>
        <path d="m120 82 10-42 24-3 6 4-30 5-4 40" fill={paint('graphite')} strokeWidth="1.3"/>
        <path d="M126 40h33" stroke="#aebdc6" strokeWidth="3"/>
        <path d="M98 91q-9 17 2 36l24 16 25-17 5-28-23-16Z" fill={paint('graphite')} stroke="#26323c" strokeWidth="1.2"/>
        <path d="m111 99 14 9 20-12-4 29-17 11-14-12Z" fill={paint('blue')}/>
        <path d="m117 107 7 20 13-8" stroke="#a6b6bc" strokeWidth="1.4"/>
        <circle cx="139" cy="113" r="4" fill={paint('steel')}/><path d="m137 113h4" stroke="#42525c"/>
        <path d="M86 69C58 84 65 115 91 119" stroke="#3b4c58" strokeWidth="3.5"/>
        <path d="M86 69C58 84 65 115 91 119" stroke={paint('steel')} strokeWidth="1.9"/>
        <g transform="rotate(-22 103 79)">
          <path d="M77 70v27q26 14 52-1V70Z" fill={paint('gold')} stroke="#766446"/>
          <path d="M80 77v14q23 11 46 0V77Z" fill="#c8ccab" stroke="#7a8c84"/>
          {[78, 81, 84, 87, 90].map(y => <path key={y} d={`M81 ${y}q22 11 44 0`} stroke="#f1edc8" strokeWidth=".9"/>)}
          <ellipse cx="103" cy="70" rx="27" ry="10" fill={paint('gold')} stroke="#7c6b49"/>
          <ellipse cx="103" cy="68" rx="20" ry="6.5" fill={paint('graphite')}/>
          <ellipse cx="103" cy="67" rx="10" ry="4.4" fill={paint('steel')}/>
          <path d="M76 98q27 14 54-1" stroke={paint('steel')} strokeWidth="3"/>
        </g>
        <path d="m147 113 23 12 8-28" stroke="#3e4d57" strokeWidth="5.5"/>
        <path d="m147 112 23 11 7-26" stroke={paint('steel')} strokeWidth="3"/>
        <rect x="169" y="84" width="21" height="14" rx="6" fill={paint('rubber')} transform="rotate(20 179 91)"/>
        <path d="m174 87 11 4" stroke="#839199" strokeWidth=".7"/>
        <path d="m100 131 15 9" stroke="#d3b574" strokeWidth="2"/>
      </g>)}
      {['line', 'leader', 'shock'].includes(category) && <g>
        <ellipse cx="113" cy="132" rx="56" ry="20" fill={paint('graphite')}/>
        <path d="M58 72v57q55 29 110 0V72Z" fill={paint('clear')} stroke="#8299a5"/>
        <path d="M65 80v45q48 23 96 0V80Z" fill={category === 'line' ? '#7d9e8b' : category === 'shock' ? '#d9b68b' : '#d3e0df'} stroke="none"/>
        {Array.from({length: 15}, (_, i) => <path key={i} d={`M66 ${82 + i * 3}q47 22 94 0`} stroke={category === 'line' ? '#bed2a7' : category === 'shock' ? '#f3dbbb' : '#f4ffff'} strokeWidth="1.15" strokeOpacity=".9"/>)}
        <path d="M58 124q55 29 110 0v8q-55 29-110 0Z" fill={paint('clear')}/>
        <ellipse cx="113" cy="70" rx="57" ry="21" fill={paint('graphite')}/>
        <ellipse cx="113" cy="68" rx="49" ry="16" fill={paint('pearl')}/>
        <ellipse cx="113" cy="67" rx="20" ry="8" fill={paint('steel')}/>
        <ellipse cx="113" cy="67" rx="11" ry="4.5" fill="#263e4c"/>
        <path d="M75 60q36-12 74 1m-75 14q38 12 76-1" stroke={category === 'line' ? '#4b7d64' : category === 'shock' ? '#ab794c' : '#4e8192'} strokeWidth="3"/>
        <path d="M166 115c43-8 48 26 24 30-12 2-19-5-11-10" stroke="#92a8ae" strokeWidth="1.1"/>
        <path d="M71 87v34" stroke="#ffffff" strokeOpacity=".6" strokeWidth="2"/>
      </g>}
      {category === 'rig' && <g>
        <ellipse cx="109" cy="25" rx="3" ry="5" stroke={paint('steel')} strokeWidth="1.5"/>
        <path d="M109 30v116" stroke="#89a9ae" strokeWidth="1"/>
        {[43, 77, 111].map((y, i) => <g key={y}>
          <path d={`M109 ${y}q15-3 35 10v12q0 12-9 11-7-1-7-9l5 4`} stroke={paint('steel')} strokeWidth="1.6"/>
          <path d={`m144 ${y+9}-10-4-14 11 12-2 8 5Z`} fill={paint('pearl')} stroke="#a7a08e" strokeWidth=".4"/>
          <path d={`m139 ${y+10}-15 6m13-3-11 7`} stroke={i % 2 ? '#f0adc3' : '#ecce98'} strokeWidth=".9"/>
          <path d={`M109 ${y+16}l-27 8v10q0 10-8 9-6-1-6-8l4 3`} stroke={paint('steel')} strokeWidth="1.4"/>
          <path d={`m81 ${y+23}-8-3-13 9 13-1 5 4Z`} fill={paint('clear')} stroke="#acb6ba" strokeWidth=".4"/>
          <circle cx="109" cy={y} r="1.4" fill="#d9e4e1" stroke="#809a9e" strokeWidth=".5"/>
        </g>)}
        <path d="M109 145v8" stroke="#a7b7c1" strokeWidth="2"/>
        <ellipse cx="109" cy="155" rx="3.5" ry="5" stroke={paint('steel')} strokeWidth="1.5"/>
      </g>}
      {category === 'basket' && <g>
        <ellipse cx="120" cy="28" rx="4" ry="6" stroke={paint('steel')} strokeWidth="2"/>
        <path d="M120 34v10" stroke="#9cabb4" strokeWidth="2"/>
        <path d="M96 53q24-19 48 0l8 24-7 59q-25 18-50 0l-7-59Z" fill={paint('blue')}/>
        <ellipse cx="120" cy="54" rx="24" ry="8" fill={paint('graphite')}/>
        <ellipse cx="120" cy="76" rx="32" ry="10" fill={paint('blue')}/>
        <path d="M94 79q26 12 52 0l-6 53q-20 13-40 0Z" fill="#1b3944"/>
        {[88, 100, 112, 124].map(y => <path key={y} d={`M96 ${y}q24 11 48 0`} stroke="#88b3b4" strokeWidth="2.4"/>)}
        {[-18, -9, 0, 9, 18].map(x => <path key={x} d={`M${120+x} 83l${-x*.2} 51`} stroke={x === 0 ? '#becdd2' : paint('steel')} strokeWidth="1.6"/>)}
        <path d="M96 135q24 15 48 0l-7 15q-17 10-34 0Z" fill={paint('lead')}/>
        <path d="M99 58 94 74m48-15 4 15" stroke="#c6e1df" strokeOpacity=".6"/>
      </g>}
      {['bait', 'chum'].includes(category) && <g transform="rotate(-7 120 94)">
        <path d="M75 45q45-6 90 0l7 101q-50 8-103 0Z" fill={paint('pearl')} stroke="#899ba1"/>
        <path d="m75 45 7-10h75l8 10Z" fill={paint('blue')}/>
        <path d="M75 46h90v17H74Z" fill={paint('blue')}/>
        <path d="m71 132 99-1 2 15q-50 8-103 0Z" fill={paint('orange')} stroke="#ba6c43"/>
        <path d="M81 71h77v51H79Z" fill="#eee3cd" stroke="#d0bca1"/>
        <path d="M86 78h45m-45 6h27" stroke="#526a70" strokeWidth="2"/>
        {category === 'bait' ? <>
          <path d="M99 107c-8-15 18-22 27-12s-8 20-15 12c-6-8 13-12 20-2" stroke="#b77965" strokeWidth="6"/>
          <path d="M99 105c-5-10 18-17 25-10s-6 15-12 10" stroke="#e5b198" strokeWidth="2"/>
          <path d="m104 97-2-3m7 0-1-3m7 1 1-3m6 5 3-1m-4 10 3 2m-11-1-2 3" stroke="#895e51" strokeWidth="1"/>
        </> : <>
          <path d="M93 111q-4-17 20-17 28 1 33 18Z" fill="#bf8c68" stroke="#a27052"/>
          {Array.from({length: 16}, (_, i) => <ellipse key={i} cx={98+i%6*8} cy={101+Math.floor(i/6)*5} rx="2.7" ry="1.3" transform={`rotate(${i*31} ${98+i%6*8} ${101+Math.floor(i/6)*5})`} fill={i%2 ? '#e0b98e' : '#8e5f48'} stroke="none"/>)}
        </>}
        <path d="m78 66-2 62m84-61 5 60" stroke="#ffffff" strokeWidth="2.5" strokeOpacity=".7"/>
        <path d="M78 140h83m-79 3h77" stroke="#f7cfac" strokeWidth=".7"/>
      </g>}
      {category === 'bucket' && <g>
        <path d="M77 78C67 13 172 13 163 78" stroke="#354652" strokeWidth="4"/>
        <path d="M78 76C72 17 167 17 162 76" stroke={paint('steel')} strokeWidth="2"/>
        <path d="M71 76 83 140q37 19 75 0l11-64Z" fill={paint('blue')} stroke="#2d5365"/>
        <path d="m82 88 9 46q30 13 60 0l7-46" stroke="#9ab9c1" strokeOpacity=".7"/>
        <ellipse cx="120" cy="76" rx="49" ry="17" fill={paint('blue')}/>
        <ellipse cx="120" cy="75" rx="42" ry="12" fill="#173c50"/>
        <ellipse cx="120" cy="79" rx="36" ry="7" fill="#6599a6" stroke="#8bb9c3" strokeWidth=".6"/>
        <path d="M82 73q37-14 75 1M79 81q42 15 82-1" stroke="#d0e0e2" strokeOpacity=".75"/>
        <rect x="102" y="27" width="36" height="10" rx="5" fill={paint('rubber')}/>
        <path d="M108 30h24" stroke="#71828a"/>
        <circle cx="74" cy="78" r="3" fill={paint('steel')}/><circle cx="166" cy="78" r="3" fill={paint('steel')}/>
        <path d="M167 81c35 9 27 41 11 49s-14-12 0-5c26 14 5 31-8 23" stroke="#d2bd91" strokeWidth="2.4"/>
        <path d="M167 81c35 9 27 41 11 49s-14-12 0-5c26 14 5 31-8 23" stroke="#8c7d63" strokeDasharray="1 3" strokeWidth=".9"/>
      </g>}
      {category === 'safety' && <g>
        <path d="m84 44 20-12 16 13 16-13 20 12 11 40-18 10-3 53H94l-3-53-18-10Z" fill={paint('graphite')} stroke="#223440" strokeWidth="1.3"/>
        <path d="m103 37 13 11-8 34 7 62H97l-3-55-11-8 8-32Z" fill={paint('orange')} stroke="#a7522c"/>
        <path d="m137 37-13 11 8 34-7 62h18l3-55 11-8-8-32Z" fill={paint('orange')} stroke="#a7522c"/>
        <path d="m103 37 13 11-8 34 7 62H97l-3-55-11-8 8-32Zm34 0-13 11 8 34-7 62h18l3-55 11-8-8-32Z" fill={paint('fabric')} stroke="none"/>
        <path d="M120 49v94" stroke="#bcc4bf" strokeWidth="2" strokeDasharray="1 1.6"/>
        <rect x="117" y="80" width="6" height="9" rx="1" fill={paint('steel')}/>
        <path d="M92 101h56v7H92zm3 25h50v7H95Z" fill={paint('rubber')} stroke="#1d2e38"/>
        {[101, 126].map(y => <g key={y}><rect x="112" y={y-1} width="17" height="9" rx="2" fill="#28343c"/><rect x="116" y={y+1} width="7" height="5" rx=".7" fill="#747f85"/><path d={`M125 ${y+1}v5`} stroke="#b7c2c7"/></g>)}
        <path d="m91 50-4 18m62-18 4 18" stroke="#f2eee0" strokeWidth="5"/>
        <path d="m99 90 10-1 2 8-11 1Zm31-1 11 1-1 8-11-1Z" fill="#a75025" stroke="#ffc48b" strokeWidth=".6"/>
        <path d="m96 52 4-6m38 0 6 5M97 114h11m24 0h11" stroke="#ffd2a4" strokeWidth=".6" strokeDasharray="1 1.5"/>
      </g>}
      {category === 'float' && <g transform="rotate(17 120 94)">
        <path d="M120 24v128" stroke="#344653" strokeWidth="2.5"/>
        <path d="M120 25v28" stroke="#f17c30" strokeWidth="4"/>
        <path d="M119 26v26" stroke="#ffd08c" strokeWidth=".8"/>
        <path d="M120 29v3m0 7v3" stroke="#fff3ce" strokeWidth="4"/>
        <path d="M120 52c-27 0-30 47-18 65 9 13 27 13 36 0 12-18 9-65-18-65Z" fill={paint('pearl')} stroke="#81949d"/>
        <path d="M120 52c-18 0-25 23-25 39h50c0-16-7-39-25-39Z" fill={paint('orange')} stroke="#af5528"/>
        <path d="M96 91h48v5H96Z" fill={paint('graphite')} stroke="none"/>
        <path d="M106 69q-7 13-7 19" stroke="#fff4dc" strokeWidth="2.8" strokeOpacity=".8"/>
        <ellipse cx="120" cy="155" rx="3" ry="5" stroke={paint('steel')} strokeWidth="1.5"/>
      </g>}
      {category === 'hook' && <g transform="rotate(16 120 94)">
        <ellipse cx="98" cy="37" rx="6" ry="9" stroke="#48535e" strokeWidth="4"/>
        <ellipse cx="98" cy="37" rx="6" ry="9" stroke={paint('steel')} strokeWidth="2.4"/>
        <path d="M98 46v61c0 51 59 51 59 4V86l-12 19" stroke="#303d49" strokeWidth="5"/>
        <path d="M97 46v61c0 49 58 49 58 4V89" stroke={paint('steel')} strokeWidth="2.6"/>
        <path d="m157 86-2 21-6-6Z" fill="#bbc6cc" stroke="#3f505e"/>
      </g>}
      {category === 'snap' && <g transform="rotate(22 120 90)">
        <path d="M113 38c-18 26-26 63-24 82 2 32 61 30 61 0 0-21-13-48-27-71l-10-11 14 3" stroke="#475662" strokeWidth="4"/>
        <path d="M113 38c-18 26-26 63-24 82 2 32 61 30 61 0 0-21-13-48-27-71l-10-11 14 3" stroke={paint('steel')} strokeWidth="2"/>
        <path d="m108 49 19-8 8 13-13 8m-24 65q23 15 43 0" stroke={paint('steel')} strokeWidth="2.6"/>
      </g>}
      {category === 'swivel' && <g transform="rotate(22 120 90)">
        <ellipse cx="120" cy="48" rx="11" ry="19" stroke="#3e4e5c" strokeWidth="4"/>
        <ellipse cx="120" cy="48" rx="11" ry="19" stroke={paint('steel')} strokeWidth="2"/>
        <ellipse cx="120" cy="131" rx="11" ry="19" stroke="#3e4e5c" strokeWidth="4"/>
        <ellipse cx="120" cy="131" rx="11" ry="19" stroke={paint('steel')} strokeWidth="2"/>
        <path d="M116 64h8v52h-8Z" fill={paint('steel')}/>
        <rect x="107" y="69" width="26" height="43" rx="11" fill={paint('graphite')}/>
        <path d="M112 73q-4 18 0 33m4-32v31" stroke="#8a9aab" strokeWidth="1.2"/>
        <ellipse cx="120" cy="71" rx="9" ry="3" fill={paint('steel')}/><ellipse cx="120" cy="110" rx="9" ry="3" fill={paint('steel')}/>
      </g>}
      {category === 'burakuri' && <g>
        <ellipse cx="119" cy="31" rx="4" ry="6" stroke={paint('steel')} strokeWidth="2"/>
        <path d="m119 38-26 36 26 27 26-27Z" fill={paint('red')} stroke="#8c3b36"/>
        <path d="m119 38-7 37 7 26-26-27Z" fill="#f5b18d" fillOpacity=".38" stroke="none"/>
        <path d="m94 74 25-6 25 6m-25-35v29" stroke="#ffbc90" strokeOpacity=".6"/>
        <path d="M119 101v20" stroke="#b09e7c" strokeWidth="2.1"/>
        <path d="M119 119v15c0 28 29 27 29 0v-12l-6 8" stroke="#45515c" strokeWidth="3"/>
        <path d="M118 119v15c0 26 29 25 29 0" stroke={paint('steel')} strokeWidth="1.5"/>
      </g>}
      {category === 'sinker' && <g transform="rotate(15 120 94)">
        <ellipse cx="120" cy="38" rx="5" ry="8" stroke={paint('steel')} strokeWidth="2"/>
        <path d="M120 46c-5 0-33 52-31 71 2 35 60 35 62 0 2-19-26-71-31-71Z" fill={paint('lead')} stroke="#65737e"/>
        <path d="M115 57q-21 41-19 62" stroke="#e4e8e8" strokeOpacity=".7" strokeWidth="2.5"/>
        <path d="M121 52v90" stroke="#46535d" strokeOpacity=".4" strokeWidth=".7"/>
        <path d="m103 121 8-3 3 8-8 3Z" stroke="#67767e" strokeWidth=".6"/>
      </g>}
      {category === 'cushion' && <g>
        <path d="M55 132 181 49" stroke="#9ab1b3" strokeWidth=".9"/>
        {[0, 1, 2].map(i => <g key={i} transform={`translate(${90+i*29} ${109-i*19}) rotate(56)`}>
          <rect x="-10" y="-16" width="20" height="32" rx="9" fill={paint('clear')} stroke="#c29c74"/>
          <rect x="-8" y="-14" width="16" height="28" rx="7" fill="#edc091" fillOpacity=".55" stroke="none"/>
          <path d="M0-16v32" stroke="#b58e64" strokeWidth="1"/><path d="M-6-10v18" stroke="#fff7e3" strokeWidth="2"/>
          <ellipse cy="-13" rx="3" ry="1.5" fill="#937952" stroke="none"/>
        </g>)}
      </g>}
      {category === 'stopper' && <g>
        <path d="M56 140 177 35" stroke="#a4b9bd" strokeWidth="1"/>
        <path d="m151 54 11-7m-8 1 8 6m-5-9 9 6" stroke="#9b3439" strokeWidth="2.2"/>
        <ellipse cx="140" cy="68" rx="7" ry="8" fill={paint('orange')}/><ellipse cx="140" cy="68" rx="2" ry="2.5" fill="#746251"/>
        <ellipse cx="119" cy="87" rx="7" ry="10" transform="rotate(46 119 87)" fill={paint('rubber')}/>
        <path d="m119 89 15 18" stroke={paint('steel')} strokeWidth="2.3"/><ellipse cx="140" cy="114" rx="5" ry="9" transform="rotate(-36 140 114)" stroke={paint('steel')} strokeWidth="1.8"/>
        <rect x="89" y="107" width="12" height="21" rx="6" transform="rotate(46 95 117)" fill={paint('rubber')}/>
        <path d="m160 42 10-2m-6-6 3 6" stroke="#d4ab92" strokeWidth="1"/>
      </g>}
      {category === 'tenbin' && <g>
        <ellipse cx="94" cy="32" rx="4" ry="6" stroke={paint('steel')} strokeWidth="2"/>
        <path d="M94 38v61q0 5 5 5h82" stroke="#46545c" strokeWidth="3.2"/>
        <path d="M93 38v61q0 6 6 6h82" stroke={paint('steel')} strokeWidth="1.6"/>
        <ellipse cx="187" cy="104" rx="6" ry="4" stroke={paint('steel')} strokeWidth="2"/>
        <path d="M94 105v13" stroke="#99adb9" strokeWidth="2"/>
        <path d="m94 117-15 31q15 12 30 0Z" fill={paint('lead')}/>
        <path d="m92 122-8 25" stroke="#d0d7db" strokeWidth="1.7"/>
        <path d="M90 86h8v14h-8Z" fill={paint('orange')} stroke="#b55c2b"/>
      </g>}
      {category === 'lure' && <g transform="rotate(-13 120 90)">
        <path d="M47 87q47-43 122-11l31 15-31 9Q91 125 47 87Z" fill={paint('fish')} stroke="#5a7881"/>
        <path d="M47 87q47-43 122-11l31 15-31 9Q91 125 47 87Z" fill={paint('scales')} stroke="none"/>
        <path d="M49 83q46-31 118-8" stroke="#254859" strokeWidth="3"/>
        <path d="M79 73q11 13 2 30" stroke="#738b8e" strokeWidth=".8"/>
        <path d="M81 93q42 14 87-1" stroke="#fff7e0" strokeWidth="1.6"/>
        <path d="m54 96-12 16 25-11Z" fill={paint('clear')} stroke="#8aabb5"/>
        <circle cx="65" cy="84" r="6" fill={paint('gold')}/><circle cx="65" cy="84" r="3.4" fill="#182832"/><circle cx="63.5" cy="82.5" r="1.1" fill="white" stroke="none"/>
        <ellipse cx="44" cy="87" rx="4" ry="3" stroke={paint('steel')} strokeWidth="1.4"/>
        {[108, 180].map((x, i) => <g key={x} transform={`translate(${x} ${i ? 98 : 111})`}>
          <ellipse ry="4" rx="3" stroke={paint('steel')} strokeWidth="1.2"/>
          <path d="M0 4v19m0-3c-15 5-16-7-12-11l1 5m11 6c15 5 16-7 12-11l-1 5M0 20l-4-8" stroke="#4d5d69" strokeWidth="1.7"/>
          <path d="M-1 5v14m-9-6q-1 7 8 7" stroke="#e4ecee" strokeWidth=".7"/>
        </g>)}
      </g>}
      {category === 'egi' && <g transform="rotate(-11 120 90)">
        <path d="M47 90q21-43 70-19l60 29-16 10Q94 122 47 90Z" fill={paint('orange')} stroke="#9e644c"/>
        <path d="M47 90q21-43 70-19l60 29-16 10Q94 122 47 90Z" fill={paint('fabric')} stroke="none"/>
        <path d="M53 82q25-24 64-9l45 23" stroke="#f4b99b" strokeWidth="1.5"/>
        {[87, 108, 130, 150].map((x, i) => <path key={x} d={`m${x} ${70+i*7}-6 10 13 5-7 16`} stroke="#653e39" strokeWidth="3" strokeOpacity=".8"/>)}
        <path d="m67 105 10 27 20-21Z" fill={paint('lead')} stroke="#65737a"/><path d="m76 111 4 13" stroke="#e0e4e1"/>
        <path d="m58 99-19 11 26-5" fill={paint('pearl')} stroke="#9eada8" strokeWidth=".5"/>
        <circle cx="62" cy="86" r="6" fill={paint('gold')}/><circle cx="62" cy="86" r="3" fill="#182a36"/><circle cx="60" cy="84" r="1" fill="white" stroke="none"/>
        <path d="M176 101h27" stroke="#98aab5" strokeWidth="2.8"/>
        {[184, 194].map(x => <g key={x}>
          <path d={`M${x} 101q17-3 13-16m-13 16q17 3 13 16m-13-16q11-10 7-17m-7 17q11 10 7 17m-7-17h14`} stroke="#526372" strokeWidth="1.3"/>
          <path d={`m${x+1} 100 10-5m-10 7 10 5`} stroke="#c6d0d7" strokeWidth=".7"/>
        </g>)}
        <ellipse cx="44" cy="90" rx="4" ry="3" stroke={paint('steel')} strokeWidth="1.4"/>
      </g>}
      {category === 'net' && <g>
        <path d="m106 105-53 48" stroke="#263b48" strokeWidth="8"/>
        <path d="m105 105-53 48" stroke={paint('graphite')} strokeWidth="5"/>
        <path d="m69 140-15 13" stroke={paint('rubber')} strokeWidth="9"/>
        <path d="m95 114-5 4" stroke={paint('steel')} strokeWidth="7"/>
        <path d="M82 65q10 90 65 71 26-12 37-64Z" fill={paint('clear')} stroke="#78939d"/>
        <path d="M82 65q10 90 65 71 26-12 37-64Z" fill={paint('mesh')} stroke="none"/>
        <ellipse cx="133" cy="66" rx="53" ry="34" transform="rotate(-10 133 66)" fill={paint('clear')} stroke="#425c6d" strokeWidth="3"/>
        <ellipse cx="133" cy="66" rx="50" ry="31" transform="rotate(-10 133 66)" fill={paint('mesh')} stroke="#b8cbd0" strokeWidth="1.4"/>
        <path d="M87 74q11 48 51 61m35-46q-3 30-27 44M111 98q7 27 28 37" stroke="#71909c" strokeWidth=".7"/>
        <path d="m105 99-8 12" stroke={paint('steel')} strokeWidth="8"/>
      </g>}
      {category === 'pliers' && <g transform="rotate(-18 120 91)">
        <path d="m106 85-7-49 12 17 9 29 9-29 12-17-7 49-14 13Z" fill={paint('steel')} stroke="#647580"/>
        <path d="m110 54 6 20m14-20-6 20" stroke="#667782" strokeWidth="1.2" strokeDasharray="1 2"/>
        <path d="m110 91-8 16-9 34m37-50 8 16 9 34" stroke="#40525e" strokeWidth="12"/>
        <path d="m106 106-11 35m39-35 11 35" stroke={paint('blue')} strokeWidth="13"/>
        <path d="m103 109-8 27m42-27 8 27" stroke="#8eb5bd" strokeWidth="2.3"/>
        <path d="M108 101q12 14 24 0" stroke={paint('steel')} strokeWidth="1.8"/>
        <circle cx="120" cy="88" r="10" fill={paint('steel')}/><circle cx="120" cy="88" r="4" fill={paint('graphite')}/><path d="m117 88h6" stroke="#e2e9e8"/>
        <ellipse cx="94" cy="145" rx="3" ry="4" stroke={paint('steel')} strokeWidth="1.5"/>
      </g>}
      {category === 'cooler' && <g>
        <path d="M69 73 92 62h85l-13 14Z" fill={paint('pearl')}/>
        <path d="M66 72h99v74H66Z" fill={paint('pearl')} stroke="#869da6"/>
        <path d="m165 72 18-12v73l-18 13Z" fill={paint('blue')} stroke="#4f7487"/>
        <path d="M61 58 81 47h101l5 12-22 16H61Z" fill={paint('pearl')} stroke="#7e939f"/>
        <path d="M61 58h104v17H61Z" fill={paint('blue')}/>
        <path d="m165 58 18-11 4 12-22 16Z" fill={paint('graphite')}/>
        <path d="M90 47V32q0-6 6-6h43q6 0 6 6v15" stroke="#304c5c" strokeWidth="6"/>
        <path d="M93 44V33q0-4 4-4h42q3 0 3 4v11" stroke="#a6b8bf" strokeWidth="1.5"/>
        {[82, 141].map(x => <g key={x}><rect x={x} y="71" width="10" height="19" rx="2" fill={paint('graphite')}/><rect x={x+2} y="74" width="6" height="8" rx="1" fill={paint('steel')}/></g>)}
        <rect x="97" y="102" width="36" height="16" rx="3" fill="#cbdadf" stroke="#a9bfc8"/>
        <path d="M72 96v39h84m15-51 7-4v31l-7 4" stroke="#f9ffff" strokeWidth="1.5"/>
        <path d="M72 146h17m53 0h17" stroke="#304a59" strokeWidth="4"/>
        <circle cx="152" cy="132" r="3.5" fill={paint('steel')}/>
      </g>}
    </g>
  </svg>;
}

export const gearArtworkCategories = ["rod", "reel", "line", "rig", "basket", "bait", "bucket", "safety", "float", "stopper", "sinker", "leader", "swivel", "hook", "tenbin", "snap", "lure", "egi", "burakuri", "cushion", "shock", "net", "pliers", "cooler", "chum"] as const;
