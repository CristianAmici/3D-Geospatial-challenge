import type { Scene } from 'three';
import {
  createMarkerMesh,
  createMarkerMeshResources,
  disposeMarkerMeshResources,
} from './createMarkerMesh';
import type { MarkerManager, MarkerPosition, MarkerRecord } from './types';

export function createMarkerManager(scene: Scene): MarkerManager {
  const markers: MarkerRecord[] = [];
  const markerMeshResources = createMarkerMeshResources();
  let markerCount = 0;
  let isDisposed = false;

  const removeAllMarkersFromScene = (): void => {
    for (const marker of markers) {
      scene.remove(marker.mesh);
    }
    markers.length = 0;
  };

  return {
    createMarker: (position: MarkerPosition): MarkerRecord => {
      if (isDisposed) {
        throw new Error('Cannot create markers after marker manager disposal.');
      }

      markerCount += 1;
      const markerName = `Marker ${markerCount}`;
      const markerMesh = createMarkerMesh(position, markerName, markerMeshResources);

      scene.add(markerMesh);

      const markerRecord: MarkerRecord = {
        id: markerCount,
        name: markerName,
        mesh: markerMesh,
        position: { ...position },
      };

      markers.push(markerRecord);
      return markerRecord;
    },
    getMarkers: (): readonly MarkerRecord[] => {
      return markers.slice();
    },
    clearMarkers: (): void => {
      removeAllMarkersFromScene();
    },
    dispose: (): void => {
      if (isDisposed) {
        return;
      }

      isDisposed = true;
      removeAllMarkersFromScene();
      disposeMarkerMeshResources(markerMeshResources);
    },
  };
}
