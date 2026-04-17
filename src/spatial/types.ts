import type { Vector3Tuple } from '../models';
import type { SpatialTransformContext } from './coordinateTransforms';

export interface SceneSpatialTransformer {
  getGlobalOrigin: () => Vector3Tuple | null;
  setGlobalOrigin: (origin: Vector3Tuple) => void;
  ensureGlobalOrigin: (fallbackOrigin: Vector3Tuple) => Vector3Tuple;
  getSceneRotation: () => Vector3Tuple;
  getTransformContext: (localOffset?: Vector3Tuple) => SpatialTransformContext;
  sourceToScene: (sourcePosition: Vector3Tuple, localOffset?: Vector3Tuple) => Vector3Tuple;
  sceneToSource: (scenePosition: Vector3Tuple, localOffset?: Vector3Tuple) => Vector3Tuple;
}
