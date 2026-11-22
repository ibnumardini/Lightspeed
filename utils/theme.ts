import { useEffect, useState } from 'react';
import type { ThemeMode } from '@/utils/storage';

export type ResolvedTheme = 'light' | 'dark';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(mode: ThemeMode | undefined, system: ResolvedTheme): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') return mode;
  return system;
}

const THEME_CACHE_KEY = 'ls_theme';
const ACCENT_CACHE_KEY = 'ls_accent';

export function applyCachedTheme(): void {
  if (typeof document === 'undefined') return;
  try {
    const cachedTheme = localStorage.getItem(THEME_CACHE_KEY);
    const theme: ResolvedTheme =
      cachedTheme === 'light' || cachedTheme === 'dark' ? cachedTheme : getSystemTheme();
    document.documentElement.dataset.theme = theme;
    const cachedAccent = localStorage.getItem(ACCENT_CACHE_KEY);
    if (cachedAccent) {
      document.documentElement.style.setProperty('--accent', cachedAccent);
    }
  } catch {
    document.documentElement.dataset.theme = getSystemTheme();
  }
}

export function applyThemeVars(mode: ThemeMode | undefined, accent?: string): void {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(mode, getSystemTheme());
  document.documentElement.dataset.theme = resolved;
  if (accent) {
    document.documentElement.style.setProperty('--accent', accent);
  }
  try {
    localStorage.setItem(THEME_CACHE_KEY, resolved);
    if (accent) localStorage.setItem(ACCENT_CACHE_KEY, accent);
  } catch {
    // Ignore storage quota / private mode errors
  }
}

export function useResolvedTheme(mode: ThemeMode | undefined): ResolvedTheme {
  const [system, setSystem] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light');
    setSystem(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = resolveTheme(mode, system);

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    try {
      localStorage.setItem(THEME_CACHE_KEY, resolved);
    } catch {
      // Ignore storage errors
    }
  }, [resolved]);

  return resolved;
}
