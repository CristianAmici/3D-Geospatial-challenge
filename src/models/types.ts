export type Vector3Tuple = readonly [number, number, number];

export interface BoundingBoxData {
  min: Vector3Tuple;
  max: Vector3Tuple;
  size: Vector3Tuple;
}

export interface ModelSpatialMetadata {
  originalCenter: Vector3Tuple;
  originalBoundingBox: BoundingBoxData;
  appliedGlobalOffset: Vector3Tuple;
  appliedLocalOffset: Vector3Tuple;
  finalSceneCenter: Vector3Tuple;
}

export interface ModelConfig {
  id: string;
  label: string;
  url: string;
  visibleByDefault: boolean;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  localOffset?: Vector3Tuple;
}
