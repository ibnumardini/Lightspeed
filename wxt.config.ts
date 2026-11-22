import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Lightspeed - Video Speed Controller Pro',
    short_name: 'Lightspeed',
    description: 'Simple, fast video playback speed controller for any website.',
    permissions: ['storage', 'tabs'],
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
    browser_specific_settings: {
      gecko: {
        id: 'lightspeed@ibnu.mardini.dev',
        strict_min_version: '109.0',
      },
    },
  },
});
