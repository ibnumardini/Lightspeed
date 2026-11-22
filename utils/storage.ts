import { storage } from 'wxt/utils/storage';

export type ScopeMode = 'tab' | 'site' | 'all';

export interface PopupVisibility {
  scope: boolean;
  fine: boolean;
  manual: boolean;
  quick: boolean;
  now: boolean;
}

export interface ShortcutKeys {
  up: string;
  down: string;
  reset: string;
}

export interface Settings {
  enabled: boolean;
  scope: ScopeMode;
  vis: PopupVisibility;
  quickSpeeds: number[];
  smallStep: number;
  bigStep: number;
  keys: ShortcutKeys;
  accent: string;
  customColor: string | null;
}

export const DEFAULT_QUICK_SPEEDS = [1, 2, 3, 4, 5];

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  scope: 'tab',
  vis: {
    scope: true,
    fine: true,
    manual: true,
    quick: true,
    now: true,
  },
  quickSpeeds: [...DEFAULT_QUICK_SPEEDS],
  smallStep: 1,
  bigStep: 5,
  keys: {
    up: 'A',
    down: 'D',
    reset: 'S',
  },
  accent: '#0F766E',
  customColor: null,
};

export const settingsStorage = storage.defineItem<Settings>('local:lightspeed:settings', {
  fallback: DEFAULT_SETTINGS,
});

export const allSpeedStorage = storage.defineItem<number>('local:lightspeed:allSpeed', {
  fallback: 1,
});

export const siteSpeedsStorage = storage.defineItem<Record<string, number>>(
  'local:lightspeed:siteSpeeds',
  {
    fallback: {},
  },
);
