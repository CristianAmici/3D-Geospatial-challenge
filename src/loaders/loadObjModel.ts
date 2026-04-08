import { Box3, Group, Vector3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import type { BoundingBoxData, ModelConfig, Vector3Tuple } from '../models';

const VERTEX_LINE_PREFIX = /^(v|vn|vt|vp)\s/;

export interface LoadObjModelOptions {
  loader?: OBJLoader;
}

export interface LoadedObjModel {
  model: Group;
  originalBoundingBox: BoundingBoxData;
  originalCenter: Vector3Tuple;
}

function toTuple(vector: Vector3): Vector3Tuple {
  return [vector.x, vector.y, vector.z];
}

function createBoundingBoxData(bounds: Box3): BoundingBoxData {
  return {
    min: toTuple(bounds.min),
    max: toTuple(bounds.max),
    size: toTuple(bounds.getSize(new Vector3())),
  };
}

async function fetchObjSource(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch OBJ "${url}" (HTTP ${response.status})`);
  }

  return response.text();
}

function normalizeObjDecimalSeparators(objSource: string): string {
  if (!objSource.includes(',')) {
    return objSource;
  }

  let didNormalize = false;
  const normalizedLines = objSource.split(/\r?\n/).map((line) => {
    if (!VERTEX_LINE_PREFIX.test(line) || !line.includes(',')) {
      return line;
    }

    didNormalize = true;
    return line.replace(/,/g, '.');
  });

  return didNormalize ? normalizedLines.join('\n') : objSource;
}

export async function loadObjModel(
  config: ModelConfig,
  options: LoadObjModelOptions = {},
): Promise<LoadedObjModel> {
  const objLoader = options.loader ?? new OBJLoader();
  const objSource = await fetchObjSource(config.url);
  const normalizedObjSource = normalizeObjDecimalSeparators(objSource);
  const model = objLoader.parse(normalizedObjSource);

  model.name = config.label;
  model.userData.modelId = config.id;
  model.updateMatrixWorld(true);

  const originalBounds = new Box3().setFromObject(model);
  const originalBoundingBox = createBoundingBoxData(originalBounds);
  const originalCenter = toTuple(originalBounds.getCenter(new Vector3()));

  console.info('[model-loader] OBJ parsed', {
    id: config.id,
    url: config.url,
    originalCenter,
    originalBoundingBox,
  });

  return {
    model,
    originalBoundingBox,
    originalCenter,
  };
}
