export interface AccentSwatch {
  hex: string;
  name: string;
}

export const PRESET_ACCENTS: AccentSwatch[] = [
  { hex: '#0F766E', name: 'Teal' },
  { hex: '#0E7490', name: 'Ocean' },
  { hex: '#047857', name: 'Emerald' },
  { hex: '#4338CA', name: 'Indigo' },
];

export const PRESET_HEX_SET = new Set(PRESET_ACCENTS.map((s) => s.hex.toUpperCase()));

export const SUPPORT_URLS = {
  indonesia: 'https://trakteer.id',
  global: 'https://ko-fi.com',
} as const;

export const PRIVACY_URL = 'https://github.com/ibnumardini/Lightspeed/blob/main/PRIVACY.md';
export const WEBSITE_URL = 'https://ibnumardini.github.io/lightspeed/';

export function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 0;
  const channels = [0, 2, 4]
    .map((i) => parseInt(clean.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastWithWhite(hex: string): number {
  return 1.05 / (relativeLuminance(hex) + 0.05);
}

export function isLowContrast(hex: string): boolean {
  return contrastWithWhite(hex) < 4.5;
}
