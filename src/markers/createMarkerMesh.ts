import { Mesh, MeshStandardMaterial,SphereGeometry } from 'three';
import type { MarkerPosition } from './types';

export interface MarkerMeshResources {
  geometry: SphereGeometry;
  material: MeshStandardMaterial;
}

const MARKER_RADIUS = 20;
const MARKER_WIDTH_SEGMENTS = 24;
const MARKER_HEIGHT_SEGMENTS = 24;

export function createMarkerMeshResources(): MarkerMeshResources {
  return {
    geometry: new SphereGeometry(MARKER_RADIUS, MARKER_WIDTH_SEGMENTS, MARKER_HEIGHT_SEGMENTS),
    material: new MeshStandardMaterial({
      color: '#03c924',
      emissive: '#035c10',
      emissiveIntensity: 0.8,
    }),
  };
}

export function createMarkerMesh(
  position: MarkerPosition,
  name: string,
  resources: MarkerMeshResources,
): Mesh {
  const markerMesh = new Mesh(resources.geometry, resources.material);
  markerMesh.position.set(position.x, position.y, position.z);
  markerMesh.name = name;
  return markerMesh;
}

export function disposeMarkerMeshResources(resources: MarkerMeshResources): void {
  resources.geometry.dispose();
  resources.material.dispose();
}
