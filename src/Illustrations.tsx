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

export { GearIllustration } from './GearArtwork';
