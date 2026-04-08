import { PerspectiveCamera } from 'three';

export function createCamera(aspect: number): PerspectiveCamera {
  const camera = new PerspectiveCamera(60, aspect, 0.1, 1000);
  camera.position.set(12, 10, 12);
  return camera;
}
