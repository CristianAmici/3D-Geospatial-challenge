import {
  AxesHelper,
  GridHelper,

  Scene,
} from 'three';

const AXES_SIZE = 40;
const GRID_SIZE = 2000;
const GRID_DIVISIONS = 100;

export function addHelpers(scene: Scene): void {
  const axesHelper = new AxesHelper(AXES_SIZE);
  const gridHelper = new GridHelper(GRID_SIZE, GRID_DIVISIONS, '#3d434d', '#252a31');

  scene.add(axesHelper);
  scene.add(gridHelper);
}
