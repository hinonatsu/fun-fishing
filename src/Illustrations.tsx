import { useId } from "react";

/** Original illustrations. These represent categories and species, not product photographs. */
export function FishIllustration({ species, className }: { species: "aji" | "iwashi" | "saba"; className?: string }) {
  const id = useId().replaceAll(":", "");
  const slim = species === "iwashi";
  const body = slim
    ? "M52 83C84 52 149 54 211 77L240 59L233 87L242 111L210 98C147 120 83 113 52 83Z"
    : species === "saba"
      ? "M43 87C80 40 159 38 214 75L248 47L237 84L250 118L214 96C151 136 81 126 43 87Z"
      : "M43 86C77 38 151 29 208 72L246 43L233 84L247 123L207 101C154 142 78 132 43 86Z";
  return <svg className={className} viewBox="0 0 290 170" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-body`} x1="140" y1="43" x2="140" y2="130" gradientUnits="userSpaceOnUse">
        <stop stopColor={species === "saba" ? "#397C88" : species === "iwashi" ? "#4D919E" : "#769E91"} />
        <stop offset=".38" stopColor="#9BBEB7" /><stop offset=".56" stopColor="#DEE8D9" /><stop offset=".8" stopColor="#EEF0DD" /><stop offset="1" stopColor="#A8C5BB" />
      </linearGradient>
      <linearGradient id={`${id}-fin`} x1="140" y1="35" x2="140" y2="140"><stop stopColor="#69998D" /><stop offset="1" stopColor="#BDCEAB" /></linearGradient>
      <clipPath id={`${id}-clip`}><path d={body} /></clipPath>
    </defs>
    <ellipse cx="147" cy="143" rx="96" ry="6" fill="#193E4B" opacity=".055" />
    {slim ? <>
      <path d="m121 60 15-18 25 20m-27 49 20 17 10-18" fill={`url(#${id}-fin)`} stroke="#6B9990" strokeWidth=".9" />
      <path d="m131 45 5 14m5-11 2 12m5-6 1 7" stroke="#D6DFC4" strokeWidth=".7" />
    </> : <>
      <path d="m95 56 13-22 10 6 13-9 8 12 20-2 18 16" fill={`url(#${id}-fin)`} stroke="#608F83" strokeWidth=".9" />
      <path d="m107 36 7 17m4-13 5 12m8-19 5 17m3-8 5 10m7-8 4 10m8-9 5 12" stroke="#D1DAC2" strokeWidth=".8" />
      <path d="m117 121 20 20 17-21m36-12 13 13 3-21" fill={`url(#${id}-fin)`} stroke="#6B9990" strokeWidth=".9" />
      <path d="m132 125 6 12m5-13 0 10m54-24 5 9" stroke="#DEE1C5" strokeWidth=".8" />
    </>}
    <path d={body} fill={`url(#${id}-body)`} stroke="#719C96" strokeWidth="1.2" strokeLinejoin="round" />
    <g clipPath={`url(#${id}-clip)`}>
      <path d={slim ? "M71 76C126 73 171 78 219 85" : "M67 75C119 59 170 69 219 83"} stroke="#477F83" strokeWidth={slim ? "6" : "1.4"} opacity={slim ? ".6" : ".42"} />
      <path d={slim ? "M77 90C128 93 173 93 214 90" : "M86 92C136 91 172 89 216 88"} stroke="#F9F8DD" strokeWidth="2" opacity=".8" />
      {species === "saba" && <g stroke="#2C6472" strokeWidth="2.3" opacity=".65" strokeLinecap="round">
        <path d="m100 45-4 13 10 7-4 9m17-31-5 12 11 7-5 10m17-30-4 12 10 8-6 10m18-27-6 9 10 10-5 9m18-23-6 9 10 9-6 8m20-19-6 7 8 9-4 7m18-16-4 8 7 9" />
      </g>}
      {species === "iwashi" && <g fill="#397A84" opacity=".75">
        {[99, 118, 137, 156, 175, 194].map((x) => <circle key={x} cx={x} cy={82 + (x - 99) * .035} r="2" />)}
      </g>}
      {species === "aji" && <g stroke="#718E6F" strokeWidth=".8" opacity=".7">
        <path d="m160 86 3 6m3-6 3 6m3-6 3 6m3-6 3 6m3-6 3 6m3-6 3 6m3-6 3 6m3-6 3 6m3-6 3 6" />
      </g>}
      <path d="M228 81 244 49m-16 36 18 33m-16-33 15 15m-15-15 12-24" stroke="#D7E0C6" strokeWidth="1" opacity=".9" />
    </g>
    <path d={slim ? "M81 65Q96 85 79 103" : "M81 56Q105 86 81 117"} stroke="#648D87" strokeWidth="1.3" />
    <path d={slim ? "m94 87 28 10-13 6z" : "m100 90 29 18-17 6z"} fill="#95B5A1" stroke="#729989" strokeWidth=".9" />
    <path d={slim ? "m97 88 18 11" : "m103 92 19 16"} stroke="#E3E7CB" strokeWidth=".8" />
    <circle cx={slim ? "68" : "65"} cy={slim ? "79" : "80"} r={slim ? "6.7" : "7.8"} fill="#E5DFC0" stroke="#789787" />
    <circle cx={slim ? "67" : "64"} cy={slim ? "79" : "80"} r={slim ? "3.4" : "4.2"} fill="#243F46" />
    <circle cx={slim ? "66" : "63"} cy={slim ? "78" : "78.5"} r="1.15" fill="#FAF7DF" />
    <path d={slim ? "m52 83 12 5-7 2" : "m43 86 14 5-9 3"} stroke="#577B79" strokeWidth="1" strokeLinecap="round" />
  </svg>;
}

export function GearIllustration({ category, className }: { category: string; className?: string }) {
  const id = useId().replaceAll(":", "");
  const line = "#426674";
  const pale = "#DCE9E4";
  const mid = "#A9C7BF";
  const dark = "#2D5665";
  const common = { stroke: line, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg className={className} viewBox="0 0 240 180" fill="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id={`${id}-metal`} x1="80" y1="50" x2="158" y2="130"><stop stopColor="#F2F4E9" /><stop offset=".5" stopColor="#C3D6CD" /><stop offset="1" stopColor="#8BAEA8" /></linearGradient></defs>
    <ellipse cx="120" cy="155" rx="58" ry="5" fill="#1D4A56" opacity=".055" />
    {category === "rod" && <g {...common}>
      <path d="m65 142 111-116" strokeWidth="3" /><path d="m57 150 26-28" stroke="#A99770" strokeWidth="8" /><path d="m59 148 23-25" stroke="#C5B48E" strokeWidth="4" />
      <path d="m87 119 11-9m16-15 9-8m18-18 8-7m12-14 6-5" strokeWidth="3" />
      <path d="m96 108 3 7 5-5-6-3m24-25 3 6 4-4-5-3m23-24 2 5 4-3-4-3m18-19 1 4 3-3-3-3" strokeWidth="1.2" />
      <path d="m175 26-2 30-9 34" stroke="#A0BDB4" strokeWidth=".8" /><path d="m58 151-4 5" strokeWidth="3" />
    </g>}
    {category === "reel" && <g {...common}>
      <path d="m115 77 5-30 18-6m-18 6h-13m31-6 8 2" strokeWidth="5" />
      <path d="M96 103q-5 18 12 30l31-8 7-31-18-16z" fill={dark} />
      <path d="m100 103 13 19 24-7 4-21" fill={mid} /><path d="m128 78 12 16m-29 36 27-7" stroke="#85A89E" />
      <path d="M89 79q-17 23 1 42m2-40q-14 20-2 36" stroke="#A8BCB1" strokeWidth="3" />
      <ellipse cx="104" cy="85" rx="24" ry="16" fill={`url(#${id}-metal)`} transform="rotate(-26 104 85)" />
      <path d="m83 89 6 12q24 10 43-17l-6-12" fill={pale} /><ellipse cx="104" cy="80" rx="24" ry="10" transform="rotate(-26 104 80)" fill={mid} />
      <path d="m89 83 29-14m-27 18 29-14m-27 18 29-14" stroke="#DFE7D3" strokeWidth="1" />
      <path d="m144 106 18 9 4-20" strokeWidth="4" /><path d="m162 96 4-9 11 4-4 11z" fill={dark} />
    </g>}
    {["line","leader","shock"].includes(category) && <g {...common}>
      <ellipse cx="115" cy="127" rx="45" ry="16" fill={mid} /><path d="M70 71v55q43 27 90 0V71" fill={`url(#${id}-metal)`} />
      <path d="M78 87q36 19 74 0m-74 8q36 19 74 0m-74 8q36 19 74 0m-74 8q36 19 74 0" stroke="#87ADA4" strokeWidth="1" />
      <ellipse cx="115" cy="71" rx="45" ry="17" fill={pale} /><ellipse cx="115" cy="70" rx="22" ry="8" fill="#A9C4BB" /><ellipse cx="115" cy="69" rx="9" ry="4" fill="#648D87" />
      <path d="M160 112q35 3 27 26-6 14-20 7" stroke="#88ADA6" strokeWidth="1.3" />
      <path d="M85 83q29 8 58-1" stroke="#F2F5E9" />
    </g>}
    {category === "rig" && <g {...common}>
      <path d="M111 25v123" stroke="#8AAFA4" strokeWidth="1.2" /><circle cx="111" cy="27" r="3" />
      {[52, 82, 112].map((y) => <g key={y}>
        <path d={`m111 ${y} 26 10v9q0 8-6 8t-6-8l2 3`} strokeWidth="1.5" />
        <path d={`m124 ${y + 4} 11-4-3 13-11-3z`} fill="#D9C5B8" stroke="#B99F91" strokeWidth=".8" />
        <path d={`m111 ${y + 12} -24 10v8q0 7-6 7t-6-7l2 2`} strokeWidth="1.5" />
        <path d={`m83 ${y + 19} 10-7 2 11-10 4z`} fill={pale} stroke="#8AAFA4" strokeWidth=".8" />
      </g>)}
      <path d="m107 147 4-7 4 7-4 6z" fill={mid} strokeWidth="1" />
    </g>}
    {category === "basket" && <g {...common}>
      <path d="M120 27v11m-3-11q3-4 6 0" strokeWidth="1.5" />
      <path d="m106 46-14 27 7 59q20 12 42 0l7-59-14-27z" fill={pale} /><ellipse cx="120" cy="74" rx="28" ry="10" fill={mid} />
      <path d="M98 86q22 10 44 0m-42 13q20 9 40 0m-39 12q19 9 38 0m-37 12q18 9 36 0m-34-45 4 54m24-54-4 54m-8-52v55" stroke="#6B968B" strokeWidth="1.2" />
      <path d="M106 46h28l4 6h-36z" fill={dark} /><path d="M120 139v7" /><ellipse cx="120" cy="151" rx="8" ry="11" fill={`url(#${id}-metal)`} />
    </g>}
    {category === "bait" && <g {...common}>
      <path d="m80 61 78-8 12 87-78 8z" fill={pale} /><path d="m80 61 78-8 2 15-78 8z" fill={mid} /><path d="m90 141 78-8 2 7-78 8z" fill={mid} />
      <path d="m95 87 53-6 3 28-53 6z" fill="#EDF1E5" stroke="none" />
      <path d="m106 95 13-2m-12 8 24-3" stroke="#90A89A" strokeWidth="2" />
      <path d="M115 120q-7-10 5-15 12-1 8 7-2 6-10 3m10-3 8 4m-17-12-4-5m-5 16-7 2" stroke="#BB9C86" strokeWidth="1.7" />
      <path d="m86 59 5-10 59-7 8 11" fill="#E9EBDD" />
    </g>}
    {category === "bucket" && <g {...common}>
      <path d="M76 73q3-44 44-44t44 44" strokeWidth="3" /><path d="m72 75 11 65q37 18 74 0l11-65" fill={`url(#${id}-metal)`} />
      <ellipse cx="120" cy="74" rx="48" ry="16" fill={mid} /><ellipse cx="120" cy="74" rx="40" ry="11" fill="#6E9A93" /><path d="M81 77q40 14 79 0" stroke="#DCE9DA" />
      <path d="m89 91 7 42m58-42-7 42" stroke="#E7EDE0" strokeWidth="2" /><path d="M74 73v17m92-17v17" strokeWidth="4" />
      <path d="M104 32h31" stroke="#A69D7D" strokeWidth="6" /><path d="M102 32h33" stroke="#C8B894" strokeWidth="3" />
    </g>}
    {category === "safety" && <g {...common}>
      <path d="m84 44 20-11 16 12 16-12 20 11 14 41-19 9-5 51h-52l-5-51-19-9z" fill={mid} />
      <path d="m104 33 16 12-9 44-9 7-8 49m42-112-16 12 9 44 9 7 8 49" fill={pale} /><path d="M120 46v98" stroke="#F6F4E7" strokeWidth="3" />
      <path d="M98 99h18v7H98zm26 0h18v7h-18zM98 124h18v7H98zm26 0h18v7h-18z" fill={dark} strokeWidth="1" />
      <path d="m87 50 5 18m56-18-4 18" stroke="#EDEAD3" strokeWidth="5" /><path d="M103 111v8m34-8v8" stroke="#7C9F91" />
    </g>}
    {category === 'float' && <g {...common}><path d="M120 25v128"/><ellipse cx="120" cy="92" rx="23" ry="40" fill={pale}/><path d="M98 86q2-35 22-35t22 35Z" fill="#ba8e57"/><path d="M120 25v24" stroke="#ba8e57" strokeWidth="5"/></g>}
    {['hook','snap','swivel','burakuri'].includes(category) && <g {...common}><path d="M96 43v63c0 48 54 48 54 0V87l-15 16" strokeWidth="5"/><circle cx="96" cy="35" r="8" fill={pale}/>{category==='burakuri'&&<path d="m96 45-20 26 20 24 20-24Z" fill={mid}/>}</g>}
    {['sinker','cushion','stopper'].includes(category) && <g {...common}><path d="M120 30v113"/><ellipse cx="120" cy="98" rx="24" ry="35" fill={`url(#${id}-metal)`}/><circle cx="120" cy="49" r="7" fill={mid}/></g>}
    {category==='tenbin'&&<g {...common}><path d="M90 35v60h85" strokeWidth="4"/><path d="m90 98-17 39h34Z" fill={mid}/><circle cx="177" cy="95" r="5"/></g>}
    {['lure','egi'].includes(category)&&<g {...common}><path d="M45 91q50-55 125-14l30 15-29 18Q95 141 45 91Z" fill={mid}/><circle cx="66" cy="88" r="5" fill={dark}/><path d="M119 120v24m0-4-10-10m10 10 10-10m58-37 19-16m-19 16 19 15"/>{category==='egi'&&<path d="m83 115 13 23 15-16" fill={pale}/>}</g>}
    {category==='chum'&&<g {...common}><path d="M75 45h90v96H75Z" fill={pale}/><path d="M75 45h90v15H75Z" fill={mid}/><path d="M96 91h49m-49 14h35" strokeWidth="5"/></g>}
    {category==='net'&&<g {...common}><ellipse cx="132" cy="61" rx="45" ry="30" fill={pale}/><path d="M88 61q44 110 89 0m-81-17 72 36m-62-45 63 36M99 78l64-37m-73 25 57-32M121 91l-38 58"/></g>}
    {category==='pliers'&&<g {...common}><path d="m90 35 18 50-28 54m70-104-18 50 28 54" strokeWidth="10"/><circle cx="120" cy="88" r="9" fill={pale}/></g>}
    {category==='cooler'&&<g {...common}><rect x="66" y="65" width="109" height="77" rx="9" fill={pale}/><rect x="61" y="55" width="119" height="19" rx="5" fill={mid}/><path d="M92 53V33h59v20m-37 22v13h15V75"/></g>}
  </svg>;
}
