import { Mesh, MeshStandardMaterial,SphereGeometry } from 'three';
import type { MarkerPosition } from './types';

export interface MarkerMeshResources {
  geometry: SphereGeometry;
  material: MeshStandardMaterial;
}

export function createMarkerMeshResources(): MarkerMeshResources {
  return {
    geometry: new SphereGeometry(0.25, 16, 16),
    material: new MeshStandardMaterial({
      color: '#03c924',
      emissive: '#2a120d',
      emissiveIntensity: 0.5,
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
