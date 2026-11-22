import '@/assets/tokens.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DEFAULT_SETTINGS, settingsStorage } from '@/utils/storage';
import { applyCachedTheme, applyThemeVars } from '@/utils/theme';
import App from './App';

applyCachedTheme();

void settingsStorage
  .getValue()
  .catch(() => DEFAULT_SETTINGS)
  .then((initialSettings) => {
    applyThemeVars(initialSettings.theme, initialSettings.accent);
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App initialSettings={initialSettings} />
      </React.StrictMode>,
    );
  });
