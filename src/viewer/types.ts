import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ModelManager, Vector3Tuple } from '../models';
import type { MarkerManager } from '../markers';

export type Cleanup = () => void;

export interface ViewerViewportSize {
  width: number;
  height: number;
}

export interface ViewerCoreContext {
  container: HTMLElement;
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
}

export type ViewerRenderContext = Pick<
  ViewerCoreContext,
  'scene' | 'camera' | 'renderer' | 'controls'
>;

export interface ViewerBootstrapContext extends ViewerCoreContext {
  modelManager: ModelManager;
  markerManager: MarkerManager;
  getSceneGlobalOrigin: () => Vector3Tuple | null;
  focusModelById: (modelId: string) => boolean;
  focusAllVisibleModels: () => boolean;
  focusMarkerById: (markerId: number) => boolean;
  updateClippingFromVisibleModels: () => void;
  dispose: () => void;
}
