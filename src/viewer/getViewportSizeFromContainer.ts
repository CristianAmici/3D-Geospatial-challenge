import type { ViewerViewportSize } from './types';

export function getViewportSizeFromContainer(container: HTMLElement): ViewerViewportSize {
  return {
    width: Math.max(container.clientWidth, 1),
    height: Math.max(container.clientHeight, 1),
  };
}
