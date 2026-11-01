import { useId, type SVGProps } from 'react';
import './gear-artwork.css';

type ArtworkProps = {
  category: string;
  variant?: 'drum' | 'vertical-rod';
  shadow?: boolean;
} & SVGProps<SVGSVGElement>;

/** Locally authored SVGs share the same materials across product cards and rigs. */
export function GearIllustration({ category, variant, shadow = true, className = '', ...props }: ArtworkProps) {
  const id = `gear-shadow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const vertical = variant === 'vertical-rod';
  const file = vertical ? 'rod-vertical' : variant === 'drum' ? 'reel-drum' : category;
  const source = `${import.meta.env.BASE_URL}images/gear/${encodeURIComponent(file)}.svg`;
  return <svg viewBox={vertical ? '-14 -2 28 300' : '0 0 240 180'} fill="none" {...props} className={`gear-artwork ${className}`} data-gear-artwork={category} aria-hidden="true" focusable="false">
    {shadow && !vertical && <>
      <defs><radialGradient id={id}><stop stopColor="#173743" stopOpacity=".2"/><stop offset="1" stopColor="#173743" stopOpacity="0"/></radialGradient></defs>
      <ellipse cx="120" cy="158" rx="83" ry="10" fill={`url(#${id})`}/>
    </>}
    <image href={source} x={vertical ? -14 : 0} y={vertical ? -2 : 0} width={vertical ? 28 : 240} height={vertical ? 300 : 180}/>
  </svg>;
}
