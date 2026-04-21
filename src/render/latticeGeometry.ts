import * as THREE from 'three';
import { FIFTHS_PERIOD, MAJOR_THIRDS_PERIOD } from '../tonnetz/lattice';

export const TORUS_R = 1.5;
export const TORUS_r = 0.55;

export function torusPoint(u: number, v: number, lift = 0): THREE.Vector3 {
  const theta = (u / FIFTHS_PERIOD) * Math.PI * 2;
  const phi = (v / MAJOR_THIRDS_PERIOD) * Math.PI * 2;
  const r = TORUS_r + lift;
  const x = (TORUS_R + r * Math.cos(phi)) * Math.cos(theta);
  const y = (TORUS_R + r * Math.cos(phi)) * Math.sin(theta);
  const z = r * Math.sin(phi);
  return new THREE.Vector3(x, y, z);
}

export function buildTonnetzMesh(): THREE.Group {
  const group = new THREE.Group();

  const torusGeom = new THREE.TorusGeometry(TORUS_R, TORUS_r, 40, 96);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0x1f2333,
    metalness: 0.2,
    roughness: 0.7,
    transparent: true,
    opacity: 0.6,
  });
  group.add(new THREE.Mesh(torusGeom, torusMat));

  const nodeGeom = new THREE.SphereGeometry(0.055, 14, 14);
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0xf2b84b, emissive: 0x442d08 });
  for (let x = 0; x < FIFTHS_PERIOD; x++) {
    for (let y = 0; y < MAJOR_THIRDS_PERIOD; y++) {
      const p = torusPoint(x, y, 0.005);
      const m = new THREE.Mesh(nodeGeom, nodeMat);
      m.position.copy(p);
      group.add(m);
    }
  }

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x7a8dae,
    transparent: true,
    opacity: 0.55,
  });
  const edgePositions: number[] = [];
  const pushEdge = (a: THREE.Vector3, b: THREE.Vector3) => {
    edgePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
  };
  const EDGE_LIFT = 0.005;
  for (let x = 0; x < FIFTHS_PERIOD; x++) {
    for (let y = 0; y < MAJOR_THIRDS_PERIOD; y++) {
      const a = torusPoint(x, y, EDGE_LIFT);
      const b = torusPoint(x + 1, y, EDGE_LIFT);
      const c = torusPoint(x, y + 1, EDGE_LIFT);
      const d = torusPoint(x + 1, y, EDGE_LIFT);
      const e = torusPoint(x, y + 1, EDGE_LIFT);
      pushEdge(a, b);
      pushEdge(a, c);
      pushEdge(d, e);
    }
  }
  const edgeGeom = new THREE.BufferGeometry();
  edgeGeom.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
  group.add(new THREE.LineSegments(edgeGeom, edgeMat));

  return group;
}

export function createCursor(): THREE.Mesh {
  const geom = new THREE.SphereGeometry(0.11, 18, 18);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(geom, mat);
  return mesh;
}
