import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { fitCameraToBox, updateCameraClippingForBounds } from './fitCameraToBox';

function createControlsStub(target = new Vector3(0, 0, 0)): {
  controls: OrbitControls;
  updateSpy: ReturnType<typeof vi.fn>;
} {
  const update = vi.fn();

  return {
    controls: {
      target,
      update,
    } as unknown as OrbitControls,
    updateSpy: update,
  };
}

describe('fitCameraToBox', () => {
  it('moves camera and target to frame the provided bounds', () => {
    const camera = new PerspectiveCamera(60, 16 / 9, 0.1, 1000);
    camera.position.set(20, 20, 20);
    const { controls, updateSpy } = createControlsStub(new Vector3(0, 0, 0));
    const bounds = new Box3(new Vector3(-10, -2, -4), new Vector3(10, 2, 4));

    fitCameraToBox(camera, controls, bounds);

    expect(controls.target.x).toBeCloseTo(0);
    expect(controls.target.y).toBeCloseTo(0);
    expect(controls.target.z).toBeCloseTo(0);
    expect(camera.position.length()).toBeGreaterThan(0);
    expect(camera.far).toBeGreaterThan(camera.near);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps a bounded far/near ratio for depth precision', () => {
    const camera = new PerspectiveCamera(60, 1.6, 0.1, 1000);
    camera.position.set(5000, 5000, 5000);
    const { controls } = createControlsStub(new Vector3(0, 0, 0));

    updateCameraClippingForBounds(camera, controls, 50000);

    expect(camera.near).toBeGreaterThan(0);
    expect(camera.far).toBeGreaterThan(camera.near);
    expect(camera.far / camera.near).toBeLessThanOrEqual(200000);
  });
});
