import { useId } from 'react';
import { FishIllustration } from './Illustrations';

type Shape = 'fish'|'bream'|'flat'|'squid'|'cuttlefish'|'eel'|'ribbon'|'slender'|'rock';
const styles: Record<string, [Shape,string]> = {
  madai:['bream','#CB8F89'], buri:['fish','#6F9C8C'], hirame:['flat','#9A9879'], karei:['flat','#99917B'],
  tsutsuika:['squid','#BA9892'], suzuki:['fish','#829D9D'], sawara:['slender','#77999A'], anago:['eel','#929A83'],
  kanpachi:['fish','#9AA77B'], hokke:['fish','#979D83'], nishin:['slender','#789F9F'], kawahagi:['bream','#B5A78A'],
  tachiuo:['ribbon','#9AAEB8'], kisu:['slender','#B3AA94'], mebaru:['rock','#9F987A'], kasago:['rock','#B68A77'],
  kurodai:['bream','#87999A'], aoriika:['squid','#96A891'], kouika:['cuttlefish','#B19E88'], shimaaji:['fish','#9DA67D'],
  isaki:['fish','#A8A17A'], haze:['slender','#ADA185'], bora:['fish','#8D9B92'], ainame:['rock','#A69A79'],
  sayori:['slender','#8CA9AC'], kamasu:['slender','#A8AB91'], mejina:['bream','#788E87'],
};

/** Original shape illustrations: fish groups are represented, not identified from a photograph. */
export function FishArtwork({ species }: { species: string }) {
  const id = useId().replaceAll(':','');
  if (species === 'aji' || species === 'saba' || species === 'iwashi') return <FishIllustration species={species} />;
  const [shape,color] = styles[species] || ['fish','#8DA69C'];
  const body = shape === 'bream' ? 'M48 87Q95 8 179 47L217 75L250 48L239 86L252 120L216 101Q105 160 48 87Z'
    : shape === 'rock' ? 'M43 90L65 62L88 56L97 39L111 49L126 35L138 49L153 43L167 56L187 58L215 77L247 59L239 88L250 115L213 104L191 124L168 117L143 135L122 121L98 129L83 111Q56 113 43 90Z'
    : shape === 'flat' ? 'M42 90Q95 23 179 54L216 78L252 62L244 90L252 116L214 102Q103 152 42 90Z'
    : shape === 'eel' ? 'M35 86Q62 63 97 76Q157 99 192 89Q228 80 257 65Q243 115 193 116Q141 121 94 102Q58 97 35 86Z'
    : shape === 'ribbon' ? 'M32 82L48 73Q129 64 209 81L264 88Q210 95 143 100L60 96Z'
    : shape === 'slender' ? 'M32 88Q83 63 151 72L222 81L254 61L244 89L255 109L221 99Q111 116 32 88Z'
    : 'M43 87Q104 22 206 74L247 45L234 86L249 123L206 103Q104 145 43 87Z';
  const isSquid = shape === 'squid' || shape === 'cuttlefish';
  return <svg viewBox="0 0 290 170" fill="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id={`${id}-fish`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={color} /><stop offset=".55" stopColor="#D2D9C7" /><stop offset="1" stopColor="#EBEBDC" /></linearGradient></defs>
    <ellipse cx="146" cy="144" rx="91" ry="6" fill="#193E4B" opacity=".055" />
    {isSquid ? <>
      <path d={shape === 'cuttlefish' ? 'M87 39Q164 8 221 61Q242 91 212 115Q159 143 87 113Q65 82 87 39Z' : 'M91 56L173 24L238 84L170 132L91 107Q117 83 91 56Z'} fill={color} opacity=".45" stroke={color} strokeWidth="2" />
      <path d={shape === 'cuttlefish' ? 'M85 57Q174 24 222 80Q181 136 84 108Z' : 'M87 64L230 84L87 105Q115 84 87 64Z'} fill={`url(#${id}-fish)`} stroke={color} strokeWidth="1.3" />
      {[0,1,2,3,4,5].map(i => <path key={i} d={`M91 ${69+i*6}Q${62-i*3} ${55+i*10} ${42+i*2} ${73+i*7}`} stroke={color} strokeWidth="4" strokeLinecap="round" />)}
      <path d="M86 76Q44 47 25 65M85 98Q43 124 24 107" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="94" cy="82" rx="8" ry="9" fill="#EAE7D2" stroke={color} /><circle cx="92" cy="82" r="4" fill="#2E484C" /><circle cx="91" cy="80" r="1.4" fill="white" />
      <path d="M127 71L170 78M125 82L183 85M125 95L167 92" stroke={color} opacity=".5" strokeWidth="1.5" />
    </> : <>
      {!['eel','ribbon','flat','rock'].includes(shape) && <path d="M102 59L120 37L142 48L170 58M132 114L153 132L171 112" fill={color} opacity=".6" stroke={color} />}
      <path d={body} fill={`url(#${id}-fish)`} stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={shape === 'flat' ? 'M79 89Q143 75 212 90' : 'M77 89Q143 94 216 88'} stroke={color} opacity=".5" strokeWidth="1.5" />
      {shape === 'flat' ? <><circle cx="67" cy="81" r="5" fill="#304C4C" /><circle cx="78" cy="70" r="5" fill="#304C4C" /><path d="M99 60L112 72M131 54L142 65M165 65L173 74M99 115L110 104M142 125L149 112M180 112L187 102" stroke={color} strokeWidth="1.5" /></> : <><path d="M80 70Q93 88 78 105M98 93L122 110L105 111Z" stroke={color} fill={color} fillOpacity=".35" /><circle cx={shape === 'ribbon' ? 48 : 59} cy="84" r="6" fill="#EAE7D2" stroke={color} /><circle cx={shape === 'ribbon' ? 47 : 58} cy="84" r="3.5" fill="#2E484C" /><circle cx={shape === 'ribbon' ? 46 : 57} cy="82" r="1.1" fill="white" /></>}
      {species === 'sayori' && <path d="M34 88L12 90L36 92" stroke={color} strokeWidth="2" />}
      {['buri','kanpachi','shimaaji','isaki'].includes(species) && <path d="M87 84Q154 78 218 88" stroke="#B9B671" strokeWidth="3" opacity=".8" />}
      {['kasago','ainame','hokke','sawara'].includes(species) && [103,124,145,166,187].map(x => <path key={x} d={`M${x} 69l-7 9 8 12-5 13`} stroke={color} opacity=".7" strokeWidth="3" />)}
    </>}
  </svg>;
}
