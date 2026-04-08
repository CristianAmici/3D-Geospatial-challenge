import { createApp } from './createApp';
import type { AppContext, BootstrapOptions } from './types';

function getRootElement(rootId: string): HTMLElement {
  const root = document.getElementById(rootId);
  if (!root) {
    throw new Error(`Missing root element with id "${rootId}"`);
  }

  return root;
}

export function bootstrapApp(options: BootstrapOptions = {}): AppContext {
  const rootId = options.rootId ?? 'app';
  const appContext = createApp(getRootElement(rootId));

  window.addEventListener(
    'beforeunload',
    () => {
      appContext.dispose();
    },
    { once: true },
  );

  return appContext;
}
