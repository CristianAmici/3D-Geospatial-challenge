import type { Scene } from 'three';
import type { Vector3Tuple } from '../models';
import type { SceneSpatialTransformer } from '../spatial';
import {
  createMarkerMesh,
  createMarkerMeshResources,
  disposeMarkerMeshResources,
} from './createMarkerMesh';
import type {
  CreateMarkerOptions,
  MarkerCoordinateSpace,
  MarkerManager,
  MarkerPosition,
  MarkerRecord,
} from './types';

interface CreateMarkerManagerOptions {
  spatialTransformer?: SceneSpatialTransformer;
}

const DEFAULT_COORDINATE_SPACE: MarkerCoordinateSpace = 'scene';
const ZERO_VECTOR3: Vector3Tuple = [0, 0, 0];

function toTuple(position: MarkerPosition): Vector3Tuple {
  return [position.x, position.y, position.z];
}

function toPosition(tuple: Vector3Tuple): MarkerPosition {
  return { x: tuple[0], y: tuple[1], z: tuple[2] };
}

export function createMarkerManager(
  scene: Scene,
  options: CreateMarkerManagerOptions = {},
): MarkerManager {
  const markers: MarkerRecord[] = [];
  const markerMeshResources = createMarkerMeshResources();
  const spatialTransformer = options.spatialTransformer;
  let markerCount = 0;
  let isDisposed = false;

  const removeAllMarkersFromScene = (): void => {
    for (const marker of markers) {
      scene.remove(marker.mesh);
    }
    markers.length = 0;
  };

  return {
    createMarker: (
      position: MarkerPosition,
      createOptions: CreateMarkerOptions = {},
    ): MarkerRecord => {
      if (isDisposed) {
        throw new Error('Cannot create markers after marker manager disposal.');
      }

      const coordinateSpace = createOptions.coordinateSpace ?? DEFAULT_COORDINATE_SPACE;
      const localOffset = createOptions.localOffset ?? ZERO_VECTOR3;
      const inputPosition = { ...position };
      const scenePositionTuple = coordinateSpace === 'source'
        ? (() => {
            if (!spatialTransformer) {
              throw new Error(
                'Cannot create marker in source coordinates without a spatial transformer.',
              );
            }

            return spatialTransformer.sourceToScene(toTuple(inputPosition), localOffset);
          })()
        : toTuple(inputPosition);
      const scenePosition = toPosition(scenePositionTuple);

      markerCount += 1;
      const markerName = `Marker ${markerCount}`;
      const markerMesh = createMarkerMesh(scenePosition, markerName, markerMeshResources);

      scene.add(markerMesh);

      const markerRecord: MarkerRecord = {
        id: markerCount,
        name: markerName,
        mesh: markerMesh,
        inputPosition,
        position: { ...scenePosition },
        coordinateSpace,
        transformTrace: {
          sourceInput: coordinateSpace === 'source' ? toTuple(inputPosition) : null,
          globalOrigin: spatialTransformer?.getGlobalOrigin() ?? null,
          localOffset,
          sceneRotation: spatialTransformer?.getSceneRotation() ?? ZERO_VECTOR3,
          finalScenePosition: scenePositionTuple,
        },
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
