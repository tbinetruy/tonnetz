import { useEffect, useRef, useState } from 'react';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';

export type Orientation = {
  yaw: number;
  pitch: number;
  roll: number;
  angularVelocity: number;
};

export type CalibrationOffset = { yaw: number; pitch: number };

const SMOOTHING = 0.18;
const UPDATE_MS = 16;

export function useOrientation(offset: CalibrationOffset): Orientation {
  const [orientation, setOrientation] = useState<Orientation>({
    yaw: 0, pitch: 0, roll: 0, angularVelocity: 0,
  });
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  useEffect(() => {
    let cancelled = false;
    DeviceMotion.setUpdateInterval(UPDATE_MS);

    const smoothed = { yaw: 0, pitch: 0, roll: 0 };
    let initialized = false;
    let lastTime: number | null = null;
    let lastYaw = 0;
    let lastPitch = 0;

    const sub = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
      if (cancelled || !data.rotation) return;
      const { alpha, beta, gamma } = data.rotation;
      if (!initialized) {
        smoothed.yaw = alpha;
        smoothed.pitch = beta;
        smoothed.roll = gamma;
        lastYaw = alpha;
        lastPitch = beta;
        initialized = true;
      } else {
        smoothed.yaw = SMOOTHING * alpha + (1 - SMOOTHING) * smoothed.yaw;
        smoothed.pitch = SMOOTHING * beta + (1 - SMOOTHING) * smoothed.pitch;
        smoothed.roll = SMOOTHING * gamma + (1 - SMOOTHING) * smoothed.roll;
      }

      const now = Date.now();
      let omega = 0;
      if (lastTime != null) {
        const dt = (now - lastTime) / 1000;
        if (dt > 0) {
          const dy = smoothed.yaw - lastYaw;
          const dp = smoothed.pitch - lastPitch;
          omega = Math.sqrt(dy * dy + dp * dp) / dt;
        }
      }
      lastTime = now;
      lastYaw = smoothed.yaw;
      lastPitch = smoothed.pitch;

      const off = offsetRef.current;
      setOrientation({
        yaw: smoothed.yaw - off.yaw,
        pitch: smoothed.pitch - off.pitch,
        roll: smoothed.roll,
        angularVelocity: omega,
      });
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return orientation;
}
