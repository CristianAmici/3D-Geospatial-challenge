import type { Mesh } from 'three';
import type { Vector3Tuple } from '../models';

export interface MarkerPosition {
  x: number;
  y: number;
  z: number;
}

export type MarkerCoordinateSpace = 'scene' | 'source';

export interface CreateMarkerOptions {
  coordinateSpace?: MarkerCoordinateSpace;
  localOffset?: Vector3Tuple;
}

export interface MarkerTransformTrace {
  sourceInput: Vector3Tuple | null;
  globalOrigin: Vector3Tuple | null;
  localOffset: Vector3Tuple;
  sceneRotation: Vector3Tuple;
  finalScenePosition: Vector3Tuple;
}

export interface MarkerRecord {
  id: number;
  name: string;
  mesh: Mesh;
  inputPosition: MarkerPosition;
  position: MarkerPosition;
  coordinateSpace: MarkerCoordinateSpace;
  transformTrace: MarkerTransformTrace;
}

export interface MarkerManager {
  createMarker: (position: MarkerPosition, options?: CreateMarkerOptions) => MarkerRecord;
  getMarkers: () => readonly MarkerRecord[];
  clearMarkers: () => void;
  dispose: () => void;
}
