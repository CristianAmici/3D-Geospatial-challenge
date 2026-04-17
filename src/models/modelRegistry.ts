import type { ModelConfig, Vector3Tuple } from './types';

export const sceneGlobalOrigin: Vector3Tuple | null = null;
export const sceneSourceRotation: Vector3Tuple = [-Math.PI / 2, 0, 0];

export const modelRegistry: readonly ModelConfig[] = [
  {
    id: 'N720_ac37',
    label: 'N720_ac37',
    url: '/models/N720_ac3765c7-6423-4f50-96a2-857d187b1bab.obj',
    visibleByDefault: true,
    scale: [1, 1, 1],
    localOffset: [0, 0, 0],
  },
  {
    id: 'RSE_7021',
    label: 'RSE_7021',
    url: '/models/RSE_7021ea73-8340-441a-b6a5-24a95a5b2a78.obj',
    visibleByDefault: false,
    scale: [1, 1, 1],
    localOffset: [0, 0, 0],
  },
];