import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Triad } from '../tonnetz/lattice';
import { chordName } from '../tonnetz/chordNames';

type Props = {
  triad: Triad;
  onRecenter: () => void;
};

export function ChordHud({ triad, onRecenter }: Props) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Text style={styles.chord}>{chordName(triad)}</Text>
      <TouchableOpacity style={styles.btn} onPress={onRecenter} activeOpacity={0.7}>
        <Text style={styles.btnText}>recenter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  chord: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '200',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 10,
  },
  btn: {
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
