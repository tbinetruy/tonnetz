export const FIFTHS_PERIOD = 12;
export const MAJOR_THIRDS_PERIOD = 3;

const PERFECT_FIFTH = 7;
const MAJOR_THIRD = 4;
const MINOR_THIRD = 3;

export type Triad = {
  quality: 'major' | 'minor';
  rootPitchClass: number;
  pitchClasses: [number, number, number];
};

export function nodeToPitchClass(x: number, y: number): number {
  return mod(PERFECT_FIFTH * x + MAJOR_THIRD * y, 12);
}

export function triadAt(u: number, v: number): Triad {
  const uw = mod(u, FIFTHS_PERIOD);
  const vw = mod(v, MAJOR_THIRDS_PERIOD);
  const cellX = Math.floor(uw);
  const cellY = Math.floor(vw);
  const xi = uw - cellX;
  const yi = vw - cellY;
  const cellRoot = nodeToPitchClass(cellX, cellY);

  if (xi + yi < 1) {
    return {
      quality: 'major',
      rootPitchClass: cellRoot,
      pitchClasses: [cellRoot, mod(cellRoot + MAJOR_THIRD, 12), mod(cellRoot + PERFECT_FIFTH, 12)],
    };
  }
  const root = mod(cellRoot + MAJOR_THIRD, 12);
  return {
    quality: 'minor',
    rootPitchClass: root,
    pitchClasses: [root, mod(root + MINOR_THIRD, 12), mod(root + PERFECT_FIFTH, 12)],
  };
}

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}
