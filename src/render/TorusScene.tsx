import React, { useRef } from 'react';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { buildTonnetzMesh, createCursor, torusPoint } from './latticeGeometry';

type Props = {
  cursorUV: { u: number; v: number };
};

export function TorusScene({ cursorUV }: Props) {
  const cursorUVRef = useRef(cursorUV);
  cursorUVRef.current = cursorUV;

  return (
    <GLView
      style={{ flex: 1 }}
      onContextCreate={(gl: ExpoWebGLRenderingContext) => {
        const renderer = new Renderer({ gl });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.setClearColor(0x0b0c12, 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          42,
          gl.drawingBufferWidth / gl.drawingBufferHeight,
          0.1,
          100
        );
        camera.position.set(0, -4.2, 3.2);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const dir = new THREE.DirectionalLight(0xffffff, 0.9);
        dir.position.set(2, -2, 4);
        scene.add(dir);
        const rim = new THREE.DirectionalLight(0x6688ff, 0.35);
        rim.position.set(-3, 3, -2);
        scene.add(rim);

        scene.add(buildTonnetzMesh());
        const cursor = createCursor();
        scene.add(cursor);

        let raf = 0;
        const animate = () => {
          raf = requestAnimationFrame(animate);
          const { u, v } = cursorUVRef.current;
          cursor.position.copy(torusPoint(u, v, 0.18));
          renderer.render(scene, camera);
          gl.endFrameEXP();
        };
        animate();
      }}
    />
  );
}
