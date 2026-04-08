import { Box3, Vector3 } from 'three';
import type { PerspectiveCamera } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const DEFAULT_PADDING = 1.4;
const MIN_CAMERA_DISTANCE = 1;
const MIN_CAMERA_NEAR = 0.01;
const MIN_NEAR_FAR_GAP = 10;
const MAX_FAR_NEAR_RATIO = 200000;
const HALF_FOV_FLOOR = 0.001;
const CLIPPING_EPSILON = 1e-6;

export function getBoundsRadius(bounds: Box3): number {
  const boundsSize = bounds.getSize(new Vector3());
  return Math.max(boundsSize.length() * 0.5, 1);
}

function updateCameraProjectionIfNeeded(camera: PerspectiveCamera, near: number, far: number): void {
  if (Math.abs(camera.near - near) < CLIPPING_EPSILON && Math.abs(camera.far - far) < CLIPPING_EPSILON) {
    return;
  }

  camera.near = near;
  camera.far = far;
  camera.updateProjectionMatrix();
}

export function updateCameraClippingForBounds(
  camera: PerspectiveCamera,
  controls: OrbitControls,
  boundsRadius: number,
): void {
  // Near/far follow camera distance plus scene scale to keep close inspection and far context usable.
  const distanceToTarget = camera.position.distanceTo(controls.target);
  const safeRadius = Math.max(boundsRadius, 1);
  const nearCandidate = Math.max(MIN_CAMERA_NEAR, Math.min(distanceToTarget / 200, safeRadius / 5));
  const farCandidate = Math.max(nearCandidate + MIN_NEAR_FAR_GAP, distanceToTarget + safeRadius * 3);
  const near = Math.max(nearCandidate, farCandidate / MAX_FAR_NEAR_RATIO);
  const far = Math.max(near + MIN_NEAR_FAR_GAP, farCandidate);

  updateCameraProjectionIfNeeded(camera, near, far);
}

export function fitCameraToBox(
  camera: PerspectiveCamera,
  controls: OrbitControls,
  bounds: Box3,
  padding = DEFAULT_PADDING,
): void {
  const boundsCenter = bounds.getCenter(new Vector3());
  const boundsRadius = getBoundsRadius(bounds);
  const halfVerticalFovInRadians = (camera.fov * Math.PI) / 360;
  const halfHorizontalFovInRadians = Math.atan(Math.tan(halfVerticalFovInRadians) * camera.aspect);
  const limitingHalfFov = Math.max(
    HALF_FOV_FLOOR,
    Math.min(halfVerticalFovInRadians, halfHorizontalFovInRadians),
  );
  const fitDistance = boundsRadius / Math.tan(limitingHalfFov);
  const cameraDistance = Math.max(fitDistance * padding, MIN_CAMERA_DISTANCE);

  const cameraDirection = camera.position.clone().sub(controls.target);
  if (cameraDirection.lengthSq() < 1e-6) {
    cameraDirection.set(1, 1, 1);
  }
  cameraDirection.normalize();

  camera.position.copy(boundsCenter).add(cameraDirection.multiplyScalar(cameraDistance));
  controls.target.copy(boundsCenter);
  updateCameraClippingForBounds(camera, controls, boundsRadius);
  controls.update();
}
