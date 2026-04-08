import type { PerspectiveCamera, WebGLRenderer } from 'three';
import { getViewportSizeFromContainer } from './getViewportSizeFromContainer';
import { getClampedPixelRatio } from './getClampedPixelRatio';
import type { Cleanup } from './types';

interface ResizeHandlerContext {
  container: HTMLElement;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

export function setupResizeHandler({ container, camera, renderer }: ResizeHandlerContext): Cleanup {
  const resize = (): void => {
    const { width, height } = getViewportSizeFromContainer(container);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(getClampedPixelRatio());
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });

  resizeObserver.observe(container);
  window.addEventListener('resize', resize);
  resize();

  return () => {
    window.removeEventListener('resize', resize);
    resizeObserver.disconnect();
  };
}
