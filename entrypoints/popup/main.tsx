import '@/assets/tokens.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { RuntimeMessage, TabStateResponse } from '@/utils/messaging';
import { DEFAULT_SETTINGS, settingsStorage } from '@/utils/storage';
import { applyCachedTheme, applyThemeVars } from '@/utils/theme';
import App from './App';

applyCachedTheme();

const initialTabStatePromise = Promise.race([
  browser.runtime
    .sendMessage({ type: 'GET_TAB_STATE' } satisfies RuntimeMessage)
    .then((res) => (res as TabStateResponse | undefined) ?? null)
    .catch(() => null),
  new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 250)),
]);

void Promise.all([
  settingsStorage.getValue().catch(() => DEFAULT_SETTINGS),
  initialTabStatePromise,
]).then(([initialSettings, initialTabState]) => {
  applyThemeVars(initialSettings.theme, initialSettings.accent);
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App initialSettings={initialSettings} initialTabState={initialTabState} />
    </React.StrictMode>,
  );
});
