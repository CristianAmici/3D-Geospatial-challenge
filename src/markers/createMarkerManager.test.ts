import { Scene } from 'three';
import { describe, expect, it } from 'vitest';
import { createMarkerManager } from './createMarkerManager';
import { createSceneSpatialTransformer } from '../spatial';

describe('createMarkerManager', () => {
  it('creates markers in scene-space by default', () => {
    const scene = new Scene();
    const manager = createMarkerManager(scene);

    const marker = manager.createMarker({ x: 1, y: 2, z: 3 });

    expect(marker.coordinateSpace).toBe('scene');
    expect(marker.inputPosition).toEqual({ x: 1, y: 2, z: 3 });
    expect(marker.position).toEqual({ x: 1, y: 2, z: 3 });
    expect(marker.transformTrace.sourceInput).toBeNull();
    expect(marker.mesh.position.x).toBe(1);
    expect(marker.mesh.position.y).toBe(2);
    expect(marker.mesh.position.z).toBe(3);
  });

  it('converts source coordinates to scene-space when requested', () => {
    const scene = new Scene();
    const spatialTransformer = createSceneSpatialTransformer({
      initialGlobalOrigin: [10, 20, 30],
      sceneRotation: [0, 0, 0],
    });
    const manager = createMarkerManager(scene, {
      spatialTransformer,
    });

    const marker = manager.createMarker(
      { x: 100, y: 200, z: 300 },
      { coordinateSpace: 'source', localOffset: [1, 2, 3] },
    );

    expect(marker.coordinateSpace).toBe('source');
    expect(marker.inputPosition).toEqual({ x: 100, y: 200, z: 300 });
    expect(marker.position).toEqual({ x: 91, y: 182, z: 273 });
    expect(marker.transformTrace.sourceInput).toEqual([100, 200, 300]);
    expect(marker.transformTrace.globalOrigin).toEqual([10, 20, 30]);
    expect(marker.transformTrace.localOffset).toEqual([1, 2, 3]);
    expect(marker.mesh.position.x).toBe(91);
    expect(marker.mesh.position.y).toBe(182);
    expect(marker.mesh.position.z).toBe(273);
  });
});
