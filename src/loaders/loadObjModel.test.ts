import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three';
import type { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadObjModel } from './loadObjModel';
import type { ModelConfig } from '../models';

class FakeObjLoader {
  public readonly parse = vi.fn((objSource: string) => {
    const group = new Group();
    const mesh = new Mesh(new BoxGeometry(2, 4, 6), new MeshBasicMaterial());
    mesh.position.set(1, 2, 3);
    group.add(mesh);
    group.userData.source = objSource;
    return group;
  });
}

const TEST_MODEL_CONFIG: ModelConfig = {
  id: 'test-model',
  label: 'Test Model',
  url: '/models/test.obj',
  visibleByDefault: true,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loadObjModel', () => {
  it('normalizes decimal commas in vertex-related lines before parsing', async () => {
    const source = [
      'o name,with,comma',
      'v 1,5 2,5 3,5',
      'vn 0,0 1,0 0,0',
      'vt 0,2 0,8',
      'vp 10,1 20,2 30,3',
    ].join('\n');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(source, { status: 200 }));
    const fakeLoader = new FakeObjLoader();

    const result = await loadObjModel(TEST_MODEL_CONFIG, {
      loader: fakeLoader as unknown as OBJLoader,
    });

    expect(fetchMock).toHaveBeenCalledWith('/models/test.obj');
    expect(fakeLoader.parse).toHaveBeenCalledTimes(1);
    const parsedSource = fakeLoader.parse.mock.calls[0]?.[0] ?? '';
    expect(parsedSource).toContain('o name,with,comma');
    expect(parsedSource).toContain('v 1.5 2.5 3.5');
    expect(parsedSource).toContain('vn 0.0 1.0 0.0');
    expect(parsedSource).toContain('vt 0.2 0.8');
    expect(parsedSource).toContain('vp 10.1 20.2 30.3');
    expect(result.model.name).toBe('Test Model');
    expect(result.model.userData.modelId).toBe('test-model');
  });

  it('returns original geometry metadata', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('v 0 0 0', { status: 200 }));
    const fakeLoader = new FakeObjLoader();

    const result = await loadObjModel(TEST_MODEL_CONFIG, {
      loader: fakeLoader as unknown as OBJLoader,
    });

    expect(result.originalCenter).toEqual([1, 2, 3]);
    expect(result.originalBoundingBox.size).toEqual([2, 4, 6]);
  });

  it('throws when the OBJ source request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Not found', { status: 404 }));

    await expect(loadObjModel(TEST_MODEL_CONFIG)).rejects.toThrow(
      'Failed to fetch OBJ "/models/test.obj" (HTTP 404)',
    );
  });
});
