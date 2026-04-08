import { Object3D } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createModelManager } from './modelManager';
import type { ManagedModelEntry } from './modelManager';

function createEntry(id: string, visible = true): ManagedModelEntry {
  const model = new Object3D();
  model.name = id;
  model.visible = visible;

  return {
    id,
    model,
    config: {
      id,
      label: id,
      url: `/models/${id}.obj`,
      visibleByDefault: visible,
    },
    spatialMetadata: {
      originalCenter: [0, 0, 0],
      originalBoundingBox: {
        min: [0, 0, 0],
        max: [1, 1, 1],
        size: [1, 1, 1],
      },
      appliedGlobalOffset: [0, 0, 0],
      appliedLocalOffset: [0, 0, 0],
      finalSceneCenter: [0.5, 0.5, 0.5],
    },
  };
}

describe('createModelManager', () => {
  it('adds and retrieves entries by id', () => {
    const manager = createModelManager();
    const entry = createEntry('model-a');

    manager.addModel(entry);

    expect(manager.hasModel('model-a')).toBe(true);
    expect(manager.getModel('model-a')).toBe(entry.model);
    expect(manager.getModelEntry('model-a')).toBe(entry);
    expect(manager.getEntries()).toHaveLength(1);
  });

  it('returns only visible models from getVisibleModelEntries', () => {
    const manager = createModelManager();
    const visibleEntry = createEntry('visible-model', true);
    const hiddenEntry = createEntry('hidden-model', false);

    manager.addModel(visibleEntry);
    manager.addModel(hiddenEntry);

    const visibleEntries = manager.getVisibleModelEntries();
    expect(visibleEntries).toHaveLength(1);
    expect(visibleEntries[0]?.id).toBe('visible-model');
  });

  it('notifies subscribers on mutating actions', () => {
    const manager = createModelManager();
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);

    manager.addModel(createEntry('model-a'));
    manager.removeModel('model-a');
    manager.clear();

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    manager.addModel(createEntry('model-b'));
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
