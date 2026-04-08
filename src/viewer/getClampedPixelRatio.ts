const MAX_RENDERER_PIXEL_RATIO = 2;

export function getClampedPixelRatio(): number {
  return Math.min(window.devicePixelRatio, MAX_RENDERER_PIXEL_RATIO);
}
