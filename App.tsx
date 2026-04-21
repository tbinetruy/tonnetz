import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useOrientation } from './src/sensor/useOrientation';
import { TorusScene } from './src/render/TorusScene';
import { ChordHud } from './src/ui/ChordHud';
import { FIFTHS_PERIOD, MAJOR_THIRDS_PERIOD, triadAt } from './src/tonnetz/lattice';
import { ChordPlayer } from './src/audio/chordPlayer';

const YAW_PER_FIFTH = 0.32;
const PITCH_PER_THIRD = 0.38;
const BASE_GAIN = 0.06;
const MOTION_GAIN_SCALE = 0.55;
const MAX_GAIN = 0.65;

export default function App() {
  const [offset, setOffset] = useState({ yaw: 0, pitch: 0 });
  const orientation = useOrientation(offset);

  const u = wrap(orientation.yaw / YAW_PER_FIFTH, FIFTHS_PERIOD);
  const v = wrap(orientation.pitch / PITCH_PER_THIRD, MAJOR_THIRDS_PERIOD);
  const triad = useMemo(() => triadAt(u, v), [u, v]);

  const playerRef = useRef<ChordPlayer | null>(null);
  useEffect(() => {
    const player = new ChordPlayer();
    playerRef.current = player;
    return () => player.dispose();
  }, []);

  useEffect(() => {
    playerRef.current?.setTriad(triad);
  }, [triad.quality, triad.rootPitchClass]);

  useEffect(() => {
    const target = Math.min(
      MAX_GAIN,
      BASE_GAIN + orientation.angularVelocity * MOTION_GAIN_SCALE
    );
    playerRef.current?.setMasterGain(target);
  }, [orientation.angularVelocity]);

  const handleRecenter = () => {
    setOffset((prev) => ({
      yaw: prev.yaw + orientation.yaw,
      pitch: prev.pitch + orientation.pitch,
    }));
  };

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <TorusScene cursorUV={{ u, v }} />
      <ChordHud triad={triad} onRecenter={handleRecenter} />
    </View>
  );
}

function wrap(value: number, period: number): number {
  const m = value % period;
  return m < 0 ? m + period : m;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0c12' },
});
