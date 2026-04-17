import { Euler, Quaternion, Vector3 } from 'three';
import type { Vector3Tuple } from '../models';

export interface SpatialTransformContext {
  globalOrigin: Vector3Tuple | null;
  localOffset: Vector3Tuple;
  sceneRotation: Vector3Tuple;
}

const ZERO_VECTOR3: Vector3Tuple = [0, 0, 0];

function addTuple(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subtractTuple(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function rotateTuple(tuple: Vector3Tuple, rotation: Vector3Tuple): Vector3Tuple {
  const vector = new Vector3(tuple[0], tuple[1], tuple[2]);
  vector.applyEuler(new Euler(rotation[0], rotation[1], rotation[2], 'XYZ'));
  return [vector.x, vector.y, vector.z];
}

function inverseRotateTuple(tuple: Vector3Tuple, rotation: Vector3Tuple): Vector3Tuple {
  const vector = new Vector3(tuple[0], tuple[1], tuple[2]);
  const inverseRotation = new Quaternion()
    .setFromEuler(new Euler(rotation[0], rotation[1], rotation[2], 'XYZ'))
    .invert();
  vector.applyQuaternion(inverseRotation);
  return [vector.x, vector.y, vector.z];
}

export function sourceToScene(
  pointSource: Vector3Tuple,
  transformContext: SpatialTransformContext,
): Vector3Tuple {
  const globalOrigin = transformContext.globalOrigin ?? ZERO_VECTOR3;
  const localOffset = transformContext.localOffset;
  const sceneRotation = transformContext.sceneRotation;

  const translatedPoint = addTuple(subtractTuple(pointSource, globalOrigin), localOffset);
  return rotateTuple(translatedPoint, sceneRotation);
}

export function sceneToSource(
  pointScene: Vector3Tuple,
  transformContext: SpatialTransformContext,
): Vector3Tuple {
  const globalOrigin = transformContext.globalOrigin ?? ZERO_VECTOR3;
  const localOffset = transformContext.localOffset;

  const unrotatedPoint = inverseRotateTuple(pointScene, transformContext.sceneRotation);
  const withoutOffset = subtractTuple(unrotatedPoint, localOffset);
  return addTuple(withoutOffset, globalOrigin);
}
