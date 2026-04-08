import { AxesHelper, GridHelper, Scene } from 'three';

export function addHelpers(scene: Scene): void {
  const axesHelper = new AxesHelper(5);
  const gridHelper = new GridHelper(40, 40, '#3d434d', '#252a31');

  scene.add(axesHelper);
  scene.add(gridHelper);
}
