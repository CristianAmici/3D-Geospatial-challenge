import { Box3, Group, Vector3 } from 'three';
import type { PerspectiveCamera, Scene } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { loadObjModel } from '../loaders';
import { modelRegistry } from '../models';
import type { ModelManager, ModelSpatialMetadata, Vector3Tuple } from '../models';
import type { SceneSpatialTransformer } from '../spatial';
import { fitCameraToBox } from './fitCameraToBox';

const ZERO_VECTOR3: Vector3Tuple = [0, 0, 0];

interface LoadRegistryModelsIntoSceneContext {
  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
  modelManager: ModelManager;
  spatialTransformer: SceneSpatialTransformer;
  isDisposed: () => boolean;
  onGlobalOriginResolved?: (globalOrigin: Vector3Tuple) => void;
  onSceneBoundsResolved?: (sceneBounds: Box3) => void;
}

function toTuple(vector: Vector3): Vector3Tuple {
  return [vector.x, vector.y, vector.z];
}

function tupleToVector3(tuple: Vector3Tuple): Vector3 {
  return new Vector3(tuple[0], tuple[1], tuple[2]);
}

function negateTuple(tuple: Vector3Tuple): Vector3Tuple {
  return [-tuple[0], -tuple[1], -tuple[2]];
}

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

function getCombinedAllModelsBounds(modelManager: ModelManager): Box3 | null {
  const entries = modelManager.getModelEntries();
  const combinedBounds = new Box3();
  let hasBounds = false;

  for (const entry of entries) {
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

function createSceneModelWrapper(
  modelId: string,
  label: string,
  parsedModel: Group,
  visibleByDefault: boolean,
  rotation: Vector3Tuple | undefined,
  scale: Vector3Tuple | undefined,
): Group {
  const wrapper = new Group();
  wrapper.name = label;
  wrapper.userData.modelId = modelId;
  wrapper.visible = visibleByDefault;
  wrapper.add(parsedModel);

  if (rotation) {
    wrapper.rotation.set(...rotation);
  }

  if (scale) {
    wrapper.scale.set(...scale);
  }

  return wrapper;
}

export async function loadRegistryModelsIntoScene({
  scene,
  camera,
  controls,
  modelManager,
  spatialTransformer,
  isDisposed,
  onGlobalOriginResolved,
  onSceneBoundsResolved,
}: LoadRegistryModelsIntoSceneContext): Promise<void> {
  const objLoader = new OBJLoader();
  const configuredGlobalOrigin = spatialTransformer.getGlobalOrigin();
  if (configuredGlobalOrigin) {
    onGlobalOriginResolved?.(configuredGlobalOrigin);
  }

  for (const modelConfig of modelRegistry) {
    if (isDisposed()) {
      return;
    }

    try {
      const loadedModel = await loadObjModel(modelConfig, { loader: objLoader });

      if (isDisposed()) {
        return;
      }

      const resolvedGlobalOrigin = spatialTransformer.getGlobalOrigin();
      if (!resolvedGlobalOrigin) {
        // First successfully loaded model anchors scene-space origin.
        const nextGlobalOrigin = spatialTransformer.ensureGlobalOrigin(loadedModel.originalCenter);
        onGlobalOriginResolved?.(nextGlobalOrigin);
      }

      const appliedLocalOffset = modelConfig.localOffset ?? ZERO_VECTOR3;
      const globalOrigin = spatialTransformer.getGlobalOrigin();
      const appliedGlobalOffset = globalOrigin ? negateTuple(globalOrigin) : ZERO_VECTOR3;
      const scenePosition = spatialTransformer.sourceToScene(ZERO_VECTOR3, appliedLocalOffset);

      loadedModel.model.position.copy(tupleToVector3(scenePosition));
      loadedModel.model.rotation.set(...spatialTransformer.getSceneRotation());
      loadedModel.model.updateMatrixWorld(true);

      const sceneModel = createSceneModelWrapper(
        modelConfig.id,
        modelConfig.label,
        loadedModel.model,
        modelConfig.visibleByDefault,
        modelConfig.rotation,
        modelConfig.scale,
      );
      sceneModel.updateMatrixWorld(true);

      scene.add(sceneModel);

      const finalSceneCenter = toTuple(new Box3().setFromObject(sceneModel).getCenter(new Vector3()));
      const spatialMetadata: ModelSpatialMetadata = {
        originalCenter: loadedModel.originalCenter,
        originalBoundingBox: loadedModel.originalBoundingBox,
        appliedGlobalOffset,
        appliedLocalOffset,
        finalSceneCenter,
      };

      modelManager.addModel({
        id: modelConfig.id,
        model: sceneModel,
        config: modelConfig,
        spatialMetadata,
      });

      console.info('[viewer] Model added to scene', {
        id: modelConfig.id,
        visible: sceneModel.visible,
        spatialMetadata,
      });
    } catch (error) {
      console.error('[viewer] Failed to load OBJ model', {
        id: modelConfig.id,
        url: modelConfig.url,
        error,
      });
    }
  }

  const allModelsBounds = getCombinedAllModelsBounds(modelManager);
  if (allModelsBounds) {
    onSceneBoundsResolved?.(allModelsBounds.clone());
  }

  const visibleModelsBounds = getCombinedVisibleModelsBounds(modelManager);
  if (!visibleModelsBounds) {
    return;
  }

  fitCameraToBox(camera, controls, visibleModelsBounds);
}
