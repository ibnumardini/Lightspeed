import { describe, expect, test } from 'bun:test';
import { contrastWithWhite, isLowContrast } from './color';
import {
  calcTimeStats,
  clampSpeed,
  formatBadgeSpeed,
  formatDuration,
  parseSpeed,
  resolveEffectiveSpeed,
} from './speed';

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
    expect(calcTimeStats(2887, 4350, 1)).toEqual({
      leftText: '24:23 left',
      deltaText: 'normal speed',
      deltaKind: 'normal',
    });
    expect(calcTimeStats(2887, 4350, 2)).toEqual({
      leftText: '12:12 left',
      deltaText: 'saves 12:12',
      deltaKind: 'faster',
    });
    expect(calcTimeStats(2887, 4350, 0.5)).toEqual({
      leftText: '48:46 left',
      deltaText: '+24:23 longer',
      deltaKind: 'slower',
    });
  });

  test('formatBadgeSpeed hides 1x, fits 4 chars, and handles OFF state', () => {
    expect(formatBadgeSpeed(1, true)).toBe('');
    expect(formatBadgeSpeed(1.5, true)).toBe('1.5×');
    expect(formatBadgeSpeed(1.25, true)).toBe('1.25');
    expect(formatBadgeSpeed(16, true)).toBe('16×');
    expect(formatBadgeSpeed(2, false)).toBe('OFF');
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
  test('preset dark accents pass WCAG AA contrast with white', () => {
    expect(isLowContrast('#0F766E')).toBe(false);
    expect(isLowContrast('#4338CA')).toBe(false);
    expect(contrastWithWhite('#0F766E')).toBeGreaterThan(4.5);
  });

  test('light custom colors trigger low-contrast warning', () => {
    expect(isLowContrast('#FACC15')).toBe(true);
    expect(isLowContrast('#FFFFFF')).toBe(true);
  });
});
