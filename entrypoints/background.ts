import type { RuntimeMessage, TabStateResponse, VideoInfo } from '@/utils/messaging';
import {
  clampSpeed,
  DEFAULT_SPEED,
  formatBadgeSpeed,
  resolveEffectiveSpeed,
} from '@/utils/speed';
import {
  allSpeedStorage,
  type ScopeMode,
  settingsStorage,
  siteSpeedsStorage,
} from '@/utils/storage';

const SESSION_TAB_SPEEDS_KEY = 'lightspeed:tabSpeeds';

function extractHostname(url?: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.hostname;
  } catch {
    return '';
  }
}

export default defineBackground(() => {
  let tabSpeeds: Record<number, number> = {};
  let sessionLoaded = false;

  async function loadTabSpeeds(): Promise<Record<number, number>> {
    if (sessionLoaded) return tabSpeeds;
    sessionLoaded = true;
    try {
      const session = browser.storage?.session;
      if (session) {
        const res = await session.get(SESSION_TAB_SPEEDS_KEY);
        const stored = res?.[SESSION_TAB_SPEEDS_KEY];
        if (stored && typeof stored === 'object') {
          tabSpeeds = stored as Record<number, number>;
        }
      }
    } catch {
      // Firefox MV2 may not support storage.session; in-memory map is used.
    }
    return tabSpeeds;
  }

  async function saveTabSpeeds(): Promise<void> {
    try {
      const session = browser.storage?.session;
      if (session) {
        await session.set({ [SESSION_TAB_SPEEDS_KEY]: tabSpeeds });
      }
    } catch {
      // Ignore if session storage is unavailable.
    }
  }

  async function sendToTab<T = unknown>(
    tabId: number,
    message: RuntimeMessage,
  ): Promise<T | null> {
    try {
      return (await browser.tabs.sendMessage(tabId, message)) as T;
    } catch {
      return null;
    }
  }

  async function getActiveTab() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab ?? null;
  }

  async function updateTabBadge(
    tabId: number,
    speed: number,
    enabled: boolean,
    accent: string,
  ): Promise<void> {
    const actionApi = browser.action ?? browser.browserAction;
    if (!actionApi) return;
    const text = formatBadgeSpeed(speed, enabled);
    const bg = enabled ? accent : '#5F7672';
    try {
      await Promise.all([
        actionApi.setBadgeText({ tabId, text }),
        actionApi.setBadgeBackgroundColor({ tabId, color: bg }),
        actionApi.setBadgeTextColor?.({ tabId, color: '#FFFFFF' }),
      ]);
    } catch {
      // Ignore if tab closed before badge update completed.
    }
  }

  async function broadcastEffectiveSpeed(tabIds?: number[]): Promise<void> {
    const [settings, allSpeed, siteSpeeds, currentTabSpeeds] = await Promise.all([
      settingsStorage.getValue(),
      allSpeedStorage.getValue(),
      siteSpeedsStorage.getValue(),
      loadTabSpeeds(),
    ]);

    const tabs = tabIds
      ? (await Promise.all(tabIds.map((id) => browser.tabs.get(id).catch(() => null)))).filter(
          (t): t is NonNullable<typeof t> => t !== null,
        )
      : await browser.tabs.query({});

    await Promise.all(
      tabs.map(async (tab) => {
        if (tab.id === undefined) return;
        const hostname = extractHostname(tab.url);
        const speed = resolveEffectiveSpeed({
          enabled: settings.enabled,
          tabId: tab.id,
          hostname,
          tabSpeeds: currentTabSpeeds,
          siteSpeeds,
          allSpeed,
        });
        await updateTabBadge(tab.id, speed, settings.enabled, settings.accent);
        if (!hostname) return;
        await sendToTab(tab.id, {
          type: 'APPLY_SPEED',
          speed,
          enabled: settings.enabled,
        });
      }),
    );
  }

  async function applySpeedChange(
    newSpeed: number,
    scope: ScopeMode,
    tabId?: number,
    hostname?: string,
  ): Promise<number> {
    const clamped = clampSpeed(newSpeed);
    const currentTabSpeeds = await loadTabSpeeds();

    if (scope === 'tab' && tabId !== undefined) {
      currentTabSpeeds[tabId] = clamped;
      await saveTabSpeeds();
      await broadcastEffectiveSpeed([tabId]);
    } else if (scope === 'site' && hostname) {
      const siteSpeeds = { ...(await siteSpeedsStorage.getValue()), [hostname]: clamped };
      await siteSpeedsStorage.setValue(siteSpeeds);
      const allTabs = await browser.tabs.query({});
      const matchingIds: number[] = [];
      for (const t of allTabs) {
        if (t.id !== undefined && extractHostname(t.url) === hostname) {
          delete currentTabSpeeds[t.id];
          matchingIds.push(t.id);
        }
      }
      await saveTabSpeeds();
      await broadcastEffectiveSpeed(matchingIds);
    } else {
      await allSpeedStorage.setValue(clamped);
      await siteSpeedsStorage.setValue({});
      tabSpeeds = {};
      await saveTabSpeeds();
      await broadcastEffectiveSpeed();
    }

    return clamped;
  }

  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId in tabSpeeds) {
      delete tabSpeeds[tabId];
      void saveTabSpeeds();
    }
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    void broadcastEffectiveSpeed([tabId]);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete' || changeInfo.url) {
      void broadcastEffectiveSpeed([tabId]);
    }
  });

  settingsStorage.watch(() => {
    void broadcastEffectiveSpeed();
  });

  void broadcastEffectiveSpeed();

  browser.runtime.onMessage.addListener(
    (message: RuntimeMessage, sender): Promise<unknown> | undefined => {
      if (!message || typeof message !== 'object') return undefined;

      switch (message.type) {
        case 'GET_TAB_STATE':
          return (async (): Promise<TabStateResponse> => {
            const [tab, settings, allSpeed, siteSpeeds, currentTabSpeeds] = await Promise.all([
              getActiveTab(),
              settingsStorage.getValue(),
              allSpeedStorage.getValue(),
              siteSpeedsStorage.getValue(),
              loadTabSpeeds(),
            ]);
            const hostname = extractHostname(tab?.url);
            const restricted = !tab?.id || !hostname;
            const speed = resolveEffectiveSpeed({
              enabled: settings.enabled,
              tabId: tab?.id,
              hostname,
              tabSpeeds: currentTabSpeeds,
              siteSpeeds,
              allSpeed,
            });
            const video =
              !restricted && tab?.id !== undefined
                ? await sendToTab<VideoInfo>(tab.id, { type: 'QUERY_VIDEO' })
                : null;
            return {
              speed,
              enabled: settings.enabled,
              scope: settings.scope,
              hostname,
              video,
              restricted,
            };
          })();

        case 'SET_SPEED':
          return (async () => {
            const settings = await settingsStorage.getValue();
            const scope = message.scope ?? settings.scope;
            const tab = sender.tab ?? (await getActiveTab());
            const hostname = extractHostname(tab?.url);
            const speed = await applySpeedChange(message.speed, scope, tab?.id, hostname);
            return { speed };
          })();

        case 'SET_SCOPE':
          return (async () => {
            const settings = await settingsStorage.getValue();
            await settingsStorage.setValue({ ...settings, scope: message.scope });
            return { ok: true };
          })();

        case 'TOGGLE_POWER':
          return (async () => {
            const settings = await settingsStorage.getValue();
            await settingsStorage.setValue({ ...settings, enabled: message.enabled });
            await broadcastEffectiveSpeed();
            return { enabled: message.enabled };
          })();

        case 'RESET_ALL':
          return (async () => {
            const settings = await settingsStorage.getValue();
            await Promise.all([
              settingsStorage.setValue({ ...settings, enabled: true, scope: 'tab' }),
              allSpeedStorage.setValue(DEFAULT_SPEED),
              siteSpeedsStorage.setValue({}),
            ]);
            tabSpeeds = {};
            await saveTabSpeeds();
            await broadcastEffectiveSpeed();
            return { speed: DEFAULT_SPEED, enabled: true, scope: 'tab' as ScopeMode };
          })();

        case 'TOGGLE_PLAY':
          return (async () => {
            const tab = await getActiveTab();
            if (!tab?.id) return null;
            return await sendToTab<VideoInfo>(tab.id, { type: 'VIDEO_TOGGLE_PLAY' });
          })();

        case 'GET_MY_SPEED':
          return (async () => {
            const [settings, allSpeed, siteSpeeds, currentTabSpeeds] = await Promise.all([
              settingsStorage.getValue(),
              allSpeedStorage.getValue(),
              siteSpeedsStorage.getValue(),
              loadTabSpeeds(),
            ]);
            const hostname = extractHostname(sender.tab?.url);
            const speed = resolveEffectiveSpeed({
              enabled: settings.enabled,
              tabId: sender.tab?.id,
              hostname,
              tabSpeeds: currentTabSpeeds,
              siteSpeeds,
              allSpeed,
            });
            return { speed, enabled: settings.enabled };
          })();

        case 'SHORTCUT_DELTA':
          return (async () => {
            const [settings, allSpeed, siteSpeeds, currentTabSpeeds] = await Promise.all([
              settingsStorage.getValue(),
              allSpeedStorage.getValue(),
              siteSpeedsStorage.getValue(),
              loadTabSpeeds(),
            ]);
            if (!settings.enabled) return { speed: DEFAULT_SPEED, enabled: false };
            const hostname = extractHostname(sender.tab?.url);
            const current = resolveEffectiveSpeed({
              enabled: true,
              tabId: sender.tab?.id,
              hostname,
              tabSpeeds: currentTabSpeeds,
              siteSpeeds,
              allSpeed,
            });
            const speed = await applySpeedChange(
              current + message.delta,
              settings.scope,
              sender.tab?.id,
              hostname,
            );
            return { speed, enabled: true };
          })();

        case 'SHORTCUT_RESET':
          return (async () => {
            const settings = await settingsStorage.getValue();
            if (!settings.enabled) return { speed: DEFAULT_SPEED, enabled: false };
            const hostname = extractHostname(sender.tab?.url);
            const speed = await applySpeedChange(
              DEFAULT_SPEED,
              settings.scope,
              sender.tab?.id,
              hostname,
            );
            return { speed, enabled: true };
          })();

        default:
          return undefined;
      }
    },
  );
});
