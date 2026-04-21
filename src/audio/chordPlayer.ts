import { AudioContext, GainNode } from 'react-native-audio-api';
import { createVoice, rampVoiceGain, setVoicePitch, Voice } from './synth';
import type { Triad } from '../tonnetz/lattice';

const ROOT_MIDI = 60; // middle C
const VOICE_GAIN = 0.22;
const CROSSFADE_SEC = 0.12;
const MASTER_RAMP_SEC = 0.08;

export class ChordPlayer {
  private ctx: AudioContext;
  private master: GainNode;
  private voices: Voice[];
  private currentKey: string | null = null;

  constructor() {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    this.voices = [
      createVoice(this.ctx, this.master),
      createVoice(this.ctx, this.master),
      createVoice(this.ctx, this.master),
    ];
    this.ctx.resume().catch(() => {});
  }

  setMasterGain(target: number): void {
    const clamped = Math.max(0, Math.min(1, target));
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(clamped, now + MASTER_RAMP_SEC);
  }

  setTriad(triad: Triad): void {
    const key = `${triad.quality}:${triad.rootPitchClass}`;
    if (key === this.currentKey) return;
    this.currentKey = key;

    const rootMidi = ROOT_MIDI + triad.rootPitchClass;
    const thirdInterval = triad.quality === 'major' ? 4 : 3;
    const newMidis = [rootMidi, rootMidi + thirdInterval, rootMidi + 7];

    const now = this.ctx.currentTime;
    this.voices.forEach((v, i) => {
      setVoicePitch(v, newMidis[i], now);
      rampVoiceGain(v, VOICE_GAIN, this.ctx, CROSSFADE_SEC);
    });
  }

  dispose(): void {
    this.ctx.close().catch(() => {});
  }
}
