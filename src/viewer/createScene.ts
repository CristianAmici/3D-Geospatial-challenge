import { Color, Scene } from 'three';

export function createScene(): Scene {
  const scene = new Scene();
  scene.background = new Color('#15181d');
  return scene;
}
