import type { Vector3Tuple } from '../models';
import type { SceneSpatialTransformer } from './types';
import { sceneToSource, sourceToScene, type SpatialTransformContext } from './coordinateTransforms';

interface CreateSceneSpatialTransformerOptions {
  initialGlobalOrigin?: Vector3Tuple | null;
  sceneRotation?: Vector3Tuple;
}

const ZERO_VECTOR3: Vector3Tuple = [0, 0, 0];

export function createSceneSpatialTransformer({
  initialGlobalOrigin = null,
  sceneRotation = ZERO_VECTOR3,
}: CreateSceneSpatialTransformerOptions = {}): SceneSpatialTransformer {
  let globalOrigin: Vector3Tuple | null = initialGlobalOrigin;

  const getTransformContext = (localOffset: Vector3Tuple = ZERO_VECTOR3): SpatialTransformContext => {
    return {
      globalOrigin,
      localOffset,
      sceneRotation,
    };
  };

  return {
    getGlobalOrigin: () => globalOrigin,
    setGlobalOrigin: (origin: Vector3Tuple): void => {
      globalOrigin = origin;
    },
    ensureGlobalOrigin: (fallbackOrigin: Vector3Tuple): Vector3Tuple => {
      if (!globalOrigin) {
        globalOrigin = fallbackOrigin;
      }

      return globalOrigin;
    },
    getSceneRotation: (): Vector3Tuple => {
      return sceneRotation;
    },
    getTransformContext,
    sourceToScene: (
      sourcePosition: Vector3Tuple,
      localOffset: Vector3Tuple = ZERO_VECTOR3,
    ): Vector3Tuple => {
      return sourceToScene(sourcePosition, getTransformContext(localOffset));
    },
    sceneToSource: (
      scenePosition: Vector3Tuple,
      localOffset: Vector3Tuple = ZERO_VECTOR3,
    ): Vector3Tuple => {
      return sceneToSource(scenePosition, getTransformContext(localOffset));
    },
  };
}
