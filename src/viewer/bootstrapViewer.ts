import { Box3, Vector3 } from 'three';
import { addHelpers } from './addHelpers';
import { addLights } from './addLights';
import { createModelManager, sceneGlobalOrigin, sceneSourceRotation } from '../models';
import { createMarkerManager } from '../markers';
import { createCamera } from './createCamera';
import { createControls } from './createControls';
import { createRenderer } from './createRenderer';
import { createScene } from './createScene';
import { getViewportSizeFromContainer } from './getViewportSizeFromContainer';
import { fitCameraToBox, getBoundsRadius, updateCameraClippingForBounds } from './fitCameraToBox';
import { loadRegistryModelsIntoScene } from './loadRegistryModelsIntoScene';
import { setupResizeHandler } from './setupResizeHandler';
import { startAnimationLoop } from './startAnimationLoop';
import type { ViewerBootstrapContext } from './types';
import type { ModelManager, Vector3Tuple } from '../models';
import { createSceneSpatialTransformer } from '../spatial';

const MARKER_FOCUS_FALLBACK_SIZE = 80;
const MARKER_FOCUS_EXPANSION = 20;

function getCombinedVisibleModelsBounds(modelManager: ModelManager): Box3 | null {
  const visibleEntries = modelManager.getVisibleModelEntries();
  const combinedBounds = new Box3();
  let hasBounds = false;

  for (const entry of visibleEntries) {
    const modelBounds = new Box3().setFromObject(entry.model);
    if (modelBounds.isEmpty()) {
      continue;
    }

    if (!hasBounds) {
      combinedBounds.copy(modelBounds);
      hasBounds = true;
      continue;
    }

    combinedBounds.union(modelBounds);
  }

  return hasBounds ? combinedBounds : null;
}

export function bootstrapViewer(container: HTMLElement): ViewerBootstrapContext {
  const initialViewportSize = getViewportSizeFromContainer(container);

  const scene = createScene();
  const camera = createCamera(initialViewportSize.width / initialViewportSize.height);
  const renderer = createRenderer(initialViewportSize);
  const controls = createControls(camera, renderer.domElement);
  const modelManager = createModelManager();
  const spatialTransformer = createSceneSpatialTransformer({
    initialGlobalOrigin: sceneGlobalOrigin,
    sceneRotation: sceneSourceRotation,
  });
  const markerManager = createMarkerManager(scene, { spatialTransformer });

  addLights(scene);
  addHelpers(scene);

  container.appendChild(renderer.domElement);

  const stopResizeHandling = setupResizeHandler({ container, camera, renderer });
  let clippingBoundsRadius = 1;
  let sceneBoundsRadius = 1;
  const stopAnimationLoop = startAnimationLoop({
    scene,
    camera,
    renderer,
    controls,
    onBeforeRender: () => {
      updateCameraClippingForBounds(camera, controls, clippingBoundsRadius);
    },
  });

  let isDisposed = false;
  let resolvedSceneGlobalOrigin: Vector3Tuple | null = spatialTransformer.getGlobalOrigin();

  const updateClippingFromVisibleModels = (): void => {
    const visibleBounds = getCombinedVisibleModelsBounds(modelManager);
    clippingBoundsRadius = visibleBounds ? getBoundsRadius(visibleBounds) : sceneBoundsRadius;
  };

  const focusModelById = (modelId: string): boolean => {
    const modelEntry = modelManager.getModelEntry(modelId);
    if (!modelEntry) {
      return false;
    }

    const modelBounds = new Box3().setFromObject(modelEntry.model);
    if (modelBounds.isEmpty()) {
      return false;
    }

    fitCameraToBox(camera, controls, modelBounds);
    clippingBoundsRadius = getBoundsRadius(modelBounds);
    return true;
  };

  const focusAllVisibleModels = (): boolean => {
    const bounds = getCombinedVisibleModelsBounds(modelManager);
    if (!bounds) {
      return false;
    }

    fitCameraToBox(camera, controls, bounds, 1.8);
    clippingBoundsRadius = getBoundsRadius(bounds);
    return true;
  };

  const focusMarkerById = (markerId: number): boolean => {
    const marker = markerManager.getMarkers().find((entry) => entry.id === markerId);
    if (!marker) {
      return false;
    }

    const markerBounds = new Box3().setFromObject(marker.mesh);
    if (markerBounds.isEmpty()) {
      markerBounds.setFromCenterAndSize(
        new Vector3(marker.position.x, marker.position.y, marker.position.z),
        new Vector3(
          MARKER_FOCUS_FALLBACK_SIZE,
          MARKER_FOCUS_FALLBACK_SIZE,
          MARKER_FOCUS_FALLBACK_SIZE,
        ),
      );
    } else {
      markerBounds.expandByScalar(MARKER_FOCUS_EXPANSION);
    }

    fitCameraToBox(camera, controls, markerBounds);
    clippingBoundsRadius = getBoundsRadius(markerBounds);
    return true;
  };

  void loadRegistryModelsIntoScene({
    scene,
    camera,
    controls,
    modelManager,
    spatialTransformer,
    isDisposed: () => isDisposed,
    onGlobalOriginResolved: (globalOrigin) => {
      resolvedSceneGlobalOrigin = globalOrigin;
    },
    onSceneBoundsResolved: (sceneBounds: Box3) => {
      sceneBoundsRadius = getBoundsRadius(sceneBounds);
      clippingBoundsRadius = sceneBoundsRadius;
    },
  });

  return {
    container,
    scene,
    camera,
    renderer,
    controls,
    modelManager,
    markerManager,
    getSceneGlobalOrigin: () => resolvedSceneGlobalOrigin,
    focusModelById,
    focusAllVisibleModels,
    focusMarkerById,
    updateClippingFromVisibleModels,
    dispose: () => {
      if (isDisposed) {
        return;
      }

      isDisposed = true;
      stopAnimationLoop();
      stopResizeHandling();
      controls.dispose();

      for (const [, model] of modelManager.getEntries()) {
        scene.remove(model);
      }
      modelManager.clear();
      markerManager.dispose();

      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
