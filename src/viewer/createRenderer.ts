import { SRGBColorSpace, WebGLRenderer } from 'three';
import type { ViewerViewportSize } from './types';
import { getClampedPixelRatio } from './getClampedPixelRatio';

export function createRenderer({ width, height }: ViewerViewportSize): WebGLRenderer {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(getClampedPixelRatio());
  renderer.setSize(width, height, false);
  renderer.domElement.style.display = 'block';
  return renderer;
}
