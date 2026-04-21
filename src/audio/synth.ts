import type { AudioContext, GainNode, OscillatorNode } from 'react-native-audio-api';

const A4_FREQ = 440;
const A4_MIDI = 69;

export function midiToFreq(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

export type Voice = {
  osc: OscillatorNode;
  gain: GainNode;
};

export function createVoice(ctx: AudioContext, dest: GainNode): Voice {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(dest);
  osc.start();
  return { osc, gain };
}

export function setVoicePitch(voice: Voice, midi: number, when: number): void {
  voice.osc.frequency.setValueAtTime(midiToFreq(midi), when);
}

export function rampVoiceGain(
  voice: Voice,
  target: number,
  ctx: AudioContext,
  durationSec: number
): void {
  const now = ctx.currentTime;
  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
  voice.gain.gain.linearRampToValueAtTime(target, now + durationSec);
}
