import { bootstrapViewer } from '../viewer/bootstrapViewer';
import type { AppContext } from './types';
import { createControlPanel } from '../ui/createControlPanel';

export function createApp(root: HTMLElement): AppContext {
  root.replaceChildren();

  const viewerContainer = document.createElement('div');
  viewerContainer.className = 'viewer-root';
  root.appendChild(viewerContainer);

  const viewerContext = bootstrapViewer(viewerContainer);
  const controlPanel = createControlPanel(viewerContext);
  let isDisposed = false;

  return {
    ...viewerContext,
    dispose: () => {
      if (isDisposed) {
        return;
      }

      isDisposed = true;
      controlPanel.dispose();
      viewerContext.dispose();
    },
  };
}
