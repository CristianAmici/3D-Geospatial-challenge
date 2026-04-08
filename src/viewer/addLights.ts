import { AmbientLight, DirectionalLight, Scene } from 'three';

export function addLights(scene: Scene): void {
  const ambientLight = new AmbientLight('#ffffff', 0.7);

  const keyDirectionalLight = new DirectionalLight('#ffffff', 0.8);
  keyDirectionalLight.position.set(8, 12, 6);

  const fillDirectionalLight = new DirectionalLight('#dfe7ff', 0.35);
  fillDirectionalLight.position.set(-10, 8, -8);

  scene.add(ambientLight);
  scene.add(keyDirectionalLight);
  scene.add(fillDirectionalLight);
}
