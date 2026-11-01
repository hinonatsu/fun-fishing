import { fishArtworkModels } from './fish-artwork';
import './fish-artwork.css';

/** The heading names the fish; its shared illustration stays decorative. */
export function FishArtwork({ species, className }: { species: string; className?: string }) {
  if (!Object.hasOwn(fishArtworkModels, species)) return null;
  return <img
    className={['fish-artwork', className].filter(Boolean).join(' ')}
    src={`${import.meta.env.BASE_URL}images/fish/${species}.webp`}
    width={1200}
    height={800}
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    draggable={false}
    data-artwork-species={species}
    data-artwork-model={fishArtworkModels[species as keyof typeof fishArtworkModels]}
  />;
}
