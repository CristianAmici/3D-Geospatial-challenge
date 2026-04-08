import type { Object3D } from 'three';
import type { ModelConfig, ModelSpatialMetadata } from './types';

type ModelManagerListener = () => void;

export interface ManagedModelEntry {
  id: string;
  model: Object3D;
  config: ModelConfig;
  spatialMetadata: ModelSpatialMetadata;
}

export interface ModelManager {
  addModel: (entry: ManagedModelEntry) => void;
  getModel: (id: string) => Object3D | undefined;
  getModelEntry: (id: string) => ManagedModelEntry | undefined;
  getModelEntries: () => readonly ManagedModelEntry[];
  getVisibleModelEntries: () => readonly ManagedModelEntry[];
  hasModel: (id: string) => boolean;
  removeModel: (id: string) => boolean;
  getEntries: () => ReadonlyArray<readonly [string, Object3D]>;
  clear: () => void;
  subscribe: (listener: ModelManagerListener) => () => void;
}

export function createModelManager(): ModelManager {
  const modelsById = new Map<string, ManagedModelEntry>();
  const listeners = new Set<ModelManagerListener>();

  const notifyListeners = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    addModel: (entry: ManagedModelEntry): void => {
      modelsById.set(entry.id, entry);
      notifyListeners();
    },
    getModel: (id: string): Object3D | undefined => {
      return modelsById.get(id)?.model;
    },
    getModelEntry: (id: string): ManagedModelEntry | undefined => {
      return modelsById.get(id);
    },
    getModelEntries: (): readonly ManagedModelEntry[] => {
      return Array.from(modelsById.values());
    },
    getVisibleModelEntries: (): readonly ManagedModelEntry[] => {
      return Array.from(modelsById.values()).filter((entry) => entry.model.visible);
    },
    hasModel: (id: string): boolean => {
      return modelsById.has(id);
    },
    removeModel: (id: string): boolean => {
      const wasRemoved = modelsById.delete(id);
      if (wasRemoved) {
        notifyListeners();
      }

      return wasRemoved;
    },
    getEntries: (): ReadonlyArray<readonly [string, Object3D]> => {
      return Array.from(modelsById.entries(), ([id, entry]) => [id, entry.model] as const);
    },
    clear: (): void => {
      if (modelsById.size === 0) {
        return;
      }

      modelsById.clear();
      notifyListeners();
    },
    subscribe: (listener: ModelManagerListener): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
