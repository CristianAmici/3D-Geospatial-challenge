import { modelRegistry } from '../models';
import type { MarkerPosition } from '../markers';
import type { ViewerBootstrapContext } from '../viewer/types';

export interface ControlPanelHandle {
  dispose: () => void;
}

function createNumberInput(labelText: string, defaultValue: number): HTMLLabelElement {
  const label = document.createElement('label');
  label.className = 'viewer-control-panel__field';

  const text = document.createElement('span');
  text.textContent = labelText;

  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.1';
  input.value = String(defaultValue);
  input.className = 'viewer-control-panel__input';
  input.dataset.role = 'marker-coordinate';

  label.append(text, input);
  return label;
}

function getCoordinateValue(input: HTMLInputElement): number {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : 0;
}

function getMarkerPositionFromInputs(
  xInput: HTMLInputElement,
  yInput: HTMLInputElement,
  zInput: HTMLInputElement,
): MarkerPosition {
  return {
    x: getCoordinateValue(xInput),
    y: getCoordinateValue(yInput),
    z: getCoordinateValue(zInput),
  };
}

export function createControlPanel(viewerContext: ViewerBootstrapContext): ControlPanelHandle {
  const labelByModelId = new Map(modelRegistry.map((model) => [model.id, model.label]));
  const panelElement = document.createElement('aside');
  panelElement.className = 'viewer-control-panel';

  const title = document.createElement('h2');
  title.className = 'viewer-control-panel__title';
  title.textContent = 'Controls';

  const modelsSection = document.createElement('section');
  modelsSection.className = 'viewer-control-panel__section';

  const modelsTitle = document.createElement('h3');
  modelsTitle.className = 'viewer-control-panel__section-title';
  modelsTitle.textContent = 'Models';

  const modelList = document.createElement('div');
  modelList.className = 'viewer-control-panel__model-list';

  const focusAllButton = document.createElement('button');
  focusAllButton.type = 'button';
  focusAllButton.className = 'viewer-control-panel__button';
  focusAllButton.textContent = 'Focus All';

  modelsSection.append(modelsTitle, focusAllButton, modelList);

  const markerSection = document.createElement('section');
  markerSection.className = 'viewer-control-panel__section';

  const markerTitle = document.createElement('h3');
  markerTitle.className = 'viewer-control-panel__section-title';
  markerTitle.textContent = 'Marker';

  const xField = createNumberInput('X (CAD)', 0);
  const yField = createNumberInput('Y (CAD)', 0);
  const zField = createNumberInput('Z (CAD)', 0);
  const xInput = xField.querySelector('input');
  const yInput = yField.querySelector('input');
  const zInput = zField.querySelector('input');

  if (!xInput || !yInput || !zInput) {
    throw new Error('Failed to build marker coordinate inputs');
  }

  const createMarkerButton = document.createElement('button');
  createMarkerButton.type = 'button';
  createMarkerButton.className = 'viewer-control-panel__button';
  createMarkerButton.textContent = 'Add Marker';

  const clearMarkersButton = document.createElement('button');
  clearMarkersButton.type = 'button';
  clearMarkersButton.className = 'viewer-control-panel__button';
  clearMarkersButton.textContent = 'Clear Markers';

  markerSection.append(
    markerTitle,
    xField,
    yField,
    zField,
    createMarkerButton,
    clearMarkersButton,
  );
  panelElement.append(title, modelsSection, markerSection);
  document.body.appendChild(panelElement);

  const renderModelRows = (): void => {
    modelList.replaceChildren();

    const entries = viewerContext.modelManager.getEntries();
    if (entries.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.className = 'viewer-control-panel__empty';
      emptyState.textContent = 'No models loaded yet.';
      modelList.appendChild(emptyState);
      return;
    }

    for (const [modelId, model] of entries) {
      const row = document.createElement('label');
      row.className = 'viewer-control-panel__checkbox';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = model.visible;
      input.addEventListener('change', () => {
        model.visible = input.checked;
        if (input.checked) {
          viewerContext.focusModelById(modelId);
        } else {
          viewerContext.updateClippingFromVisibleModels();
        }

        console.log('[ui] Model visibility changed', {
          id: modelId,
          visible: input.checked,
        });
      });

      const text = document.createElement('span');
      const displayLabel = labelByModelId.get(modelId) ?? model.name;
      text.textContent = displayLabel || modelId;

      row.append(input, text);
      modelList.appendChild(row);
    }
  };

  const unsubscribeModelManager = viewerContext.modelManager.subscribe(() => {
    renderModelRows();
  });

  const handleFocusAllClick = (): void => {
    const didFocus = viewerContext.focusAllVisibleModels();
    console.log('[ui] Focus all visible models', {
      didFocus,
    });
  };

  const handleCreateMarkerClick = (): void => {
    const markerPosition = getMarkerPositionFromInputs(xInput, yInput, zInput);

    const marker = viewerContext.markerManager.createMarker(markerPosition, {
      coordinateSpace: 'source',
    });
    viewerContext.focusMarkerById(marker.id);

    console.log('[ui] Marker created', {
      id: marker.id,
      name: marker.name,
      coordinateSpace: marker.coordinateSpace,
      inputPosition: marker.inputPosition,
      scenePosition: marker.position,
    });
  };

  const handleClearMarkersClick = (): void => {
    viewerContext.markerManager.clearMarkers();
    console.log('[ui] Markers cleared');
  };

  createMarkerButton.addEventListener('click', handleCreateMarkerClick);
  clearMarkersButton.addEventListener('click', handleClearMarkersClick);
  focusAllButton.addEventListener('click', handleFocusAllClick);
  renderModelRows();

  let isDisposed = false;

  return {
    dispose: () => {
      if (isDisposed) {
        return;
      }

      isDisposed = true;
      unsubscribeModelManager();
      createMarkerButton.removeEventListener('click', handleCreateMarkerClick);
      clearMarkersButton.removeEventListener('click', handleClearMarkersClick);
      focusAllButton.removeEventListener('click', handleFocusAllClick);
      panelElement.remove();
    },
  };
}

