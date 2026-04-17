import type { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createControls(
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
): OrbitControls {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxDistance = 100000;
  controls.minDistance = 1;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 1.1;
  controls.target.set(0, 0, 0);
  controls.update();
  return controls;
}
