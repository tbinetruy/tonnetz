import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nodeToPitchClass,
  triadAt,
  FIFTHS_PERIOD,
  MAJOR_THIRDS_PERIOD,
} from './lattice';

test('nodeToPitchClass: origin is C', () => {
  assert.equal(nodeToPitchClass(0, 0), 0);
});

test('nodeToPitchClass: (1,0) is G (perfect fifth above C)', () => {
  assert.equal(nodeToPitchClass(1, 0), 7);
});

test('nodeToPitchClass: (0,1) is E (major third above C)', () => {
  assert.equal(nodeToPitchClass(0, 1), 4);
});

test('nodeToPitchClass: (1,-1) is Eb (minor third above C)', () => {
  assert.equal(nodeToPitchClass(1, -1), 3);
});

test('nodeToPitchClass: wraps modulo 12', () => {
  assert.equal(nodeToPitchClass(12, 0), 0);
  assert.equal(nodeToPitchClass(0, 3), 0);
  assert.equal(nodeToPitchClass(12, 3), 0);
});

test('triadAt: (0.1, 0.1) is C major', () => {
  const t = triadAt(0.1, 0.1);
  assert.equal(t.quality, 'major');
  assert.equal(t.rootPitchClass, 0);
  assert.deepEqual(t.pitchClasses, [0, 4, 7]);
});

test('triadAt: (0.9, 0.9) is the E-minor adjacent to C', () => {
  const t = triadAt(0.9, 0.9);
  assert.equal(t.quality, 'minor');
  assert.equal(t.rootPitchClass, 4);
  assert.deepEqual(t.pitchClasses, [4, 7, 11]);
});

test('triadAt: (1.1, 0.1) is G major', () => {
  const t = triadAt(1.1, 0.1);
  assert.equal(t.quality, 'major');
  assert.equal(t.rootPitchClass, 7);
});

test('triadAt: covers all 24 triads', () => {
  const seen = new Set<string>();
  for (let x = 0; x < FIFTHS_PERIOD; x++) {
    for (let y = 0; y < MAJOR_THIRDS_PERIOD; y++) {
      seen.add(key(triadAt(x + 0.1, y + 0.1)));
      seen.add(key(triadAt(x + 0.9, y + 0.9)));
    }
  }
  assert.equal(seen.size, 24, `expected 24 triads, got ${seen.size}`);
  for (let pc = 0; pc < 12; pc++) {
    assert.ok(seen.has(`major:${pc}`), `missing major on pc ${pc}`);
    assert.ok(seen.has(`minor:${pc}`), `missing minor on pc ${pc}`);
  }
});

test('triadAt: wraps around the torus', () => {
  assert.deepEqual(triadAt(0.1, 0.1), triadAt(FIFTHS_PERIOD + 0.1, MAJOR_THIRDS_PERIOD + 0.1));
  assert.deepEqual(triadAt(0.1, 0.1), triadAt(-FIFTHS_PERIOD + 0.1, -MAJOR_THIRDS_PERIOD + 0.1));
});

test('triadAt: adjacent triangles share two pitch classes (voice leading)', () => {
  const a = triadAt(0.1, 0.1);
  const b = triadAt(0.9, 0.9);
  const shared = a.pitchClasses.filter((pc) => b.pitchClasses.includes(pc));
  assert.equal(shared.length, 2, 'major/minor neighbors across shared edge should share 2 notes');
});

function key(t: { quality: string; rootPitchClass: number }) {
  return `${t.quality}:${t.rootPitchClass}`;
}
