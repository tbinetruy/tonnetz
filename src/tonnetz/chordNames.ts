import type { Triad } from './lattice';

const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export function pitchClassName(pc: number): string {
  return NOTE_NAMES[((pc % 12) + 12) % 12];
}

export function chordName(triad: Triad): string {
  const root = pitchClassName(triad.rootPitchClass);
  return triad.quality === 'major' ? `${root} major` : `${root} minor`;
}
