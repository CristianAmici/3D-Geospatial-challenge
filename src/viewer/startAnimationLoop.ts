import type { Cleanup, ViewerRenderContext } from './types';

interface StartAnimationLoopContext extends ViewerRenderContext {
  onBeforeRender?: () => void;
}

export function startAnimationLoop({
  scene,
  camera,
  renderer,
  controls,
  onBeforeRender,
}: StartAnimationLoopContext): Cleanup {
  let frameId = 0;

  const tick = (): void => {
    onBeforeRender?.();
    controls.update();
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(tick);
  };

  frameId = window.requestAnimationFrame(tick);

  return () => {
    window.cancelAnimationFrame(frameId);
  };
}
