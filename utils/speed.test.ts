import { describe, expect, test } from 'bun:test';
import { contrastWithWhite, isLowContrast, PRESET_ACCENTS } from './color';
import {
  calcTimeStats,
  clampSpeed,
  formatBadgeSpeed,
  formatDuration,
  parseSpeed,
  resolveEffectiveSpeed,
} from './speed';
import { resolveLang } from './i18n';
import { resolveTheme } from './theme';

describe('speed utils', () => {
  test('parseSpeed handles decimals, commas, × suffix, and bounds', () => {
    expect(parseSpeed('1.5')).toBe(1.5);
    expect(parseSpeed('2,25x')).toBe(2.25);
    expect(parseSpeed(' 3× ')).toBe(3);
    expect(parseSpeed('0.1')).toBe(0.1);
    expect(parseSpeed('16')).toBe(16);
    expect(parseSpeed('0.05')).toBeNull();
    expect(parseSpeed('16.1')).toBeNull();
    expect(parseSpeed('')).toBeNull();
    expect(parseSpeed('abc')).toBeNull();
  });

  test('clampSpeed bounds and rounds to 2 decimals', () => {
    expect(clampSpeed(0.01)).toBe(0.1);
    expect(clampSpeed(25)).toBe(16);
    expect(clampSpeed(1.236)).toBe(1.24);
  });

  test('formatDuration formats mm:ss and h:mm:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(4350)).toBe('1:12:30');
  });

  test('calcTimeStats computes normal, faster, and slower deltas', () => {
    expect(calcTimeStats(2887, 4350, 1)).toMatchObject({
      leftText: '24:23 left',
      deltaText: 'normal speed',
      deltaKind: 'normal',
    });
    expect(calcTimeStats(2887, 4350, 2)).toMatchObject({
      leftText: '12:12 left',
      deltaText: 'saves 12:12',
      deltaKind: 'faster',
    });
    expect(calcTimeStats(2887, 4350, 0.5)).toMatchObject({
      leftText: '48:46 left',
      deltaText: '+24:23 longer',
      deltaKind: 'slower',
    });
  });

  test('formatBadgeSpeed respects always, non-default, hidden modes and OFF state', () => {
    expect(formatBadgeSpeed(1, true)).toBe('1×');
    expect(formatBadgeSpeed(1, true, 'always')).toBe('1×');
    expect(formatBadgeSpeed(1.5, true, 'always')).toBe('1.5×');
    expect(formatBadgeSpeed(1.25, true, 'always')).toBe('1.25');
    expect(formatBadgeSpeed(16, true, 'always')).toBe('16×');
    expect(formatBadgeSpeed(2, false, 'always')).toBe('OFF');

    expect(formatBadgeSpeed(1, true, 'non-default')).toBe('');
    expect(formatBadgeSpeed(1.5, true, 'non-default')).toBe('1.5×');
    expect(formatBadgeSpeed(2, false, 'non-default')).toBe('OFF');

    expect(formatBadgeSpeed(1, true, 'hidden')).toBe('');
    expect(formatBadgeSpeed(2, true, 'hidden')).toBe('');
    expect(formatBadgeSpeed(2, false, 'hidden')).toBe('');
  });

  test('resolveEffectiveSpeed follows enabled > tab > site > all priority', () => {
    const base = {
      tabId: 10,
      hostname: 'www.youtube.com',
      tabSpeeds: { 10: 2.5 },
      siteSpeeds: { 'www.youtube.com': 1.75 },
      allSpeed: 1.25,
    };
    expect(resolveEffectiveSpeed({ ...base, enabled: false })).toBe(1);
    expect(resolveEffectiveSpeed({ ...base, enabled: true })).toBe(2.5);
    expect(resolveEffectiveSpeed({ ...base, enabled: true, tabSpeeds: {} })).toBe(1.75);
    expect(
      resolveEffectiveSpeed({ ...base, enabled: true, tabSpeeds: {}, siteSpeeds: {} }),
    ).toBe(1.25);
  });
});

describe('color utils', () => {
  test('all preset accents pass WCAG AA contrast with white', () => {
    for (const swatch of PRESET_ACCENTS) {
      expect(isLowContrast(swatch.hex)).toBe(false);
      expect(contrastWithWhite(swatch.hex)).toBeGreaterThan(4.5);
    }
  });

  test('light custom colors trigger low-contrast warning', () => {
    expect(isLowContrast('#FACC15')).toBe(true);
    expect(isLowContrast('#FFFFFF')).toBe(true);
  });
});

describe('theme & i18n utils', () => {
  test('resolveTheme respects explicit light/dark and falls back to system', () => {
    expect(resolveTheme('light', 'dark')).toBe('light');
    expect(resolveTheme('dark', 'light')).toBe('dark');
    expect(resolveTheme('system', 'dark')).toBe('dark');
    expect(resolveTheme(undefined, 'light')).toBe('light');
  });

  test('resolveLang respects explicit en/id and falls back to browser', () => {
    expect(resolveLang('en', 'id')).toBe('en');
    expect(resolveLang('id', 'en')).toBe('id');
    expect(resolveLang('auto', 'id')).toBe('id');
    expect(resolveLang(undefined, 'en')).toBe('en');
  });
});
