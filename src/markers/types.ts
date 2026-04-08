import type { Mesh } from 'three';

export interface MarkerPosition {
  x: number;
  y: number;
  z: number;
}

export interface MarkerRecord {
  id: number;
  name: string;
  mesh: Mesh;
  position: MarkerPosition;
}

export interface MarkerManager {
  createMarker: (position: MarkerPosition) => MarkerRecord;
  getMarkers: () => readonly MarkerRecord[];
  clearMarkers: () => void;
  dispose: () => void;
}
