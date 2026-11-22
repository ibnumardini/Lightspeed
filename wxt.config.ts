import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  zip: {
    artifactTemplate: 'lightspeed-{{version}}-{{browser}}.zip',
    sourcesTemplate: 'lightspeed-{{version}}-sources.zip',
  },
  manifest: {
    name: 'Lightspeed - Video Speed Controller Pro',
    short_name: 'Lightspeed',
    description: 'Video speed controller for your browser. Quick presets, fine-tune steps, and custom speeds up to 16x.',
    homepage_url: 'https://ibnumardini.github.io/lightspeed/',
    author: 'Muhammad Fatkurozi' as any,
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
        data_collection_permissions: {
          required: ['none'],
        },
      } as any,
    },
  },
});
