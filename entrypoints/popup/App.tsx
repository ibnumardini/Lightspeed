import React, { useEffect, useMemo, useState } from 'react';
import { PopupView } from '@/components/PopupView';
import { resolveLang } from '@/utils/i18n';
import type { RuntimeMessage, TabStateResponse, VideoInfo } from '@/utils/messaging';
import { clampSpeed, DEFAULT_SPEED, detectIndonesiaRegion } from '@/utils/speed';
import {
  DEFAULT_SETTINGS,
  type ScopeMode,
  type Settings,
  settingsStorage,
} from '@/utils/storage';
import { useResolvedTheme } from '@/utils/theme';

export default function App({ initialSettings = DEFAULT_SETTINGS }: { initialSettings?: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [hostname, setHostname] = useState<string>('');
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [restricted, setRestricted] = useState<boolean>(false);

  const isIndonesia = useMemo(() => detectIndonesiaRegion(), []);
  const resolvedTheme = useResolvedTheme(settings.theme);
  const resolvedLang = resolveLang(settings.lang);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accent);
    try {
      localStorage.setItem('ls_accent', settings.accent);
    } catch {
      // Ignore storage errors
    }
  }, [settings.accent]);

  useEffect(() => {
    void settingsStorage.getValue().then(setSettings);
    const unwatch = settingsStorage.watch((next) => {
      if (next) setSettings(next);
    });
    return () => unwatch();
  }, []);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const res = (await browser.runtime.sendMessage({
          type: 'GET_TAB_STATE',
        } satisfies RuntimeMessage)) as TabStateResponse | undefined;
        if (!active || !res) return;
        setSpeed(res.speed);
        setHostname(res.hostname);
        setVideo(res.video);
        setRestricted(res.restricted);
      } catch {
        // Ignore transient messaging errors when popup closes
      }
    };

    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 1000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const handleTogglePower = () => {
    const nextEnabled = !settings.enabled;
    setSettings((prev) => ({ ...prev, enabled: nextEnabled }));
    void browser.runtime.sendMessage({
      type: 'TOGGLE_POWER',
      enabled: nextEnabled,
    } satisfies RuntimeMessage);
  };

  const handleResetAll = () => {
    setSpeed(DEFAULT_SPEED);
    setSettings((prev) => ({ ...prev, enabled: true, scope: 'tab' }));
    void browser.runtime.sendMessage({ type: 'RESET_ALL' } satisfies RuntimeMessage);
  };

  const handleChangeScope = (scope: ScopeMode) => {
    setSettings((prev) => ({ ...prev, scope }));
    void browser.runtime.sendMessage({
      type: 'SET_SCOPE',
      scope,
    } satisfies RuntimeMessage);
  };

  const handleChangeSpeed = (next: number) => {
    const clamped = clampSpeed(next);
    setSpeed(clamped);
    void browser.runtime.sendMessage({
      type: 'SET_SPEED',
      speed: clamped,
      scope: settings.scope,
    } satisfies RuntimeMessage);
  };

  const handleTogglePlay = async () => {
    try {
      const updated = (await browser.runtime.sendMessage({
        type: 'TOGGLE_PLAY',
      } satisfies RuntimeMessage)) as VideoInfo | null;
      if (updated) setVideo(updated);
    } catch {
      // Ignore if tab has no video
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setSettings((prev) => {
      const next = { ...prev, theme: nextTheme } as Settings;
      void settingsStorage.setValue(next);
      return next;
    });
  };

  const handleToggleLang = () => {
    const nextLang = resolvedLang === 'id' ? 'en' : 'id';
    setSettings((prev) => {
      const next = { ...prev, lang: nextLang } as Settings;
      void settingsStorage.setValue(next);
      return next;
    });
  };

  const handleOpenSettings = () => {
    void browser.runtime.openOptionsPage();
  };

  return (
    <PopupView
      enabled={settings.enabled}
      scope={settings.scope}
      speed={speed}
      vis={settings.vis}
      quickSpeeds={settings.quickSpeeds}
      smallStep={settings.smallStep}
      bigStep={settings.bigStep}
      shortcutsEnabled={settings.shortcutsEnabled ?? true}
      keys={settings.keys}
      accent={settings.accent}
      theme={resolvedTheme}
      lang={resolvedLang}
      isIndonesia={isIndonesia}
      hostname={hostname}
      video={video}
      restricted={restricted}
      onTogglePower={handleTogglePower}
      onResetAll={handleResetAll}
      onChangeScope={handleChangeScope}
      onChangeSpeed={handleChangeSpeed}
      onTogglePlay={() => void handleTogglePlay()}
      onToggleTheme={handleToggleTheme}
      onToggleLang={handleToggleLang}
      onOpenSettings={handleOpenSettings}
    />
  );
}
