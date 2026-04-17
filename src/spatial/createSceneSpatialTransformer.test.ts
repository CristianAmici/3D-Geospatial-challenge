import { describe, expect, it } from 'vitest';
import { createSceneSpatialTransformer } from './createSceneSpatialTransformer';

describe('createSceneSpatialTransformer', () => {
  it('applies global origin translation without rotation', () => {
    const transformer = createSceneSpatialTransformer({
      initialGlobalOrigin: [100, 200, 300],
    });

    const scenePosition = transformer.sourceToScene([110, 220, 330]);

    expect(scenePosition).toEqual([10, 20, 30]);
  });

  it('applies shared scene rotation around X axis', () => {
    const transformer = createSceneSpatialTransformer({
      initialGlobalOrigin: [0, 0, 0],
      sceneRotation: [-Math.PI / 2, 0, 0],
    });

    const scenePosition = transformer.sourceToScene([10, 20, 30]);

    expect(scenePosition[0]).toBeCloseTo(10);
    expect(scenePosition[1]).toBeCloseTo(30);
    expect(scenePosition[2]).toBeCloseTo(-20);
  });

  it('converts back from scene coordinates to source coordinates', () => {
    const transformer = createSceneSpatialTransformer({
      initialGlobalOrigin: [100, 200, 300],
      sceneRotation: [-Math.PI / 2, 0, 0],
    });

    const scenePosition = transformer.sourceToScene([110, 220, 330], [1, 2, 3]);
    const sourcePosition = transformer.sceneToSource(scenePosition, [1, 2, 3]);

    expect(sourcePosition[0]).toBeCloseTo(110);
    expect(sourcePosition[1]).toBeCloseTo(220);
    expect(sourcePosition[2]).toBeCloseTo(330);
  });

  it('resolves global origin once from first fallback', () => {
    const transformer = createSceneSpatialTransformer();

    const firstOrigin = transformer.ensureGlobalOrigin([1, 2, 3]);
    const secondOrigin = transformer.ensureGlobalOrigin([99, 99, 99]);

    expect(firstOrigin).toEqual([1, 2, 3]);
    expect(secondOrigin).toEqual([1, 2, 3]);
    expect(transformer.getGlobalOrigin()).toEqual([1, 2, 3]);
  });
});
