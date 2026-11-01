import { FishArtwork } from './FishArtwork';

/** All fish entry points share the anatomically specific catalog artwork. */
export function FishIllustration({ species, className }: { species: "aji" | "iwashi" | "saba"; className?: string }) {
  return <FishArtwork species={species} className={className} />;
}

export { GearIllustration } from './GearArtwork';
