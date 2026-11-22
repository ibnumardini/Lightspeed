export const MIN_SPEED = 0.1;
export const MAX_SPEED = 16;
export const DEFAULT_SPEED = 1;

export function roundSpeed(v: number): number {
  return Math.round(v * 100) / 100;
}

export function clampSpeed(v: number): number {
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, roundSpeed(v)));
}

export function parseSpeed(raw: string): number | null {
  const cleaned = String(raw).trim().replace(',', '.').replace(/[x×\s]/gi, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < MIN_SPEED || n > MAX_SPEED) return null;
  return roundSpeed(n);
}

export function formatSpeed(v: number): string {
  return v.toFixed(2);
}

export function formatShortSpeed(v: number): string {
  return `${roundSpeed(v)}×`;
}

export function formatBadgeSpeed(v: number, enabled: boolean): string {
  if (!enabled) return 'OFF';
  if (nearSpeed(v, DEFAULT_SPEED)) return '';
  const s = String(roundSpeed(v));
  return s.length <= 3 ? `${s}×` : s.slice(0, 4);
}

export function nearSpeed(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001;
}

export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const total = Math.max(0, Math.round(sec));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export interface TimeStats {
  leftText: string;
  deltaText: string;
  deltaKind: 'normal' | 'faster' | 'slower';
  isLive: boolean;
  leftDuration: string;
  deltaDuration: string;
}

export function calcTimeStats(currentTime: number, duration: number, speed: number): TimeStats {
  if (!Number.isFinite(duration) || duration <= 0) {
    return {
      leftText: 'Live',
      deltaText: 'normal speed',
      deltaKind: 'normal',
      isLive: true,
      leftDuration: '',
      deltaDuration: '',
    };
  }
  const rem = Math.max(0, duration - Math.max(0, currentTime));
  const safeSpeed = clampSpeed(speed);
  const atSpeed = rem / safeSpeed;
  const delta = rem - atSpeed;
  const leftDuration = formatDuration(atSpeed);

  let deltaText = 'normal speed';
  let deltaKind: TimeStats['deltaKind'] = 'normal';
  let deltaDuration = '';
  if (!nearSpeed(safeSpeed, 1)) {
    if (delta > 0) {
      deltaDuration = formatDuration(delta);
      deltaText = `saves ${deltaDuration}`;
      deltaKind = 'faster';
    } else {
      deltaDuration = formatDuration(-delta);
      deltaText = `+${deltaDuration} longer`;
      deltaKind = 'slower';
    }
  }

  return {
    leftText: `${leftDuration} left`,
    deltaText,
    deltaKind,
    isLive: false,
    leftDuration,
    deltaDuration,
  };
}

export function resolveEffectiveSpeed(params: {
  enabled: boolean;
  tabId?: number;
  hostname?: string;
  tabSpeeds: Record<number, number>;
  siteSpeeds: Record<string, number>;
  allSpeed: number;
}): number {
  if (!params.enabled) return DEFAULT_SPEED;
  if (params.tabId !== undefined && params.tabId in params.tabSpeeds) {
    return clampSpeed(params.tabSpeeds[params.tabId]);
  }
  if (params.hostname && params.hostname in params.siteSpeeds) {
    return clampSpeed(params.siteSpeeds[params.hostname]);
  }
  return clampSpeed(params.allSpeed);
}

const INDONESIA_TZ = new Set([
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura',
  'Asia/Pontianak',
]);

export function detectIndonesiaRegion(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && INDONESIA_TZ.has(tz)) return true;
  } catch {
    // Fallback to navigator.language below
  }
  if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
    return navigator.language.toLowerCase().startsWith('id');
  }
  return false;
}
