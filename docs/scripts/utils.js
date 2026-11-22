/* global React, htm */
export const html = htm.bind(React.createElement);

export const REPO_URL = 'https://github.com/ibnumardini/Lightspeed';
export const RELEASES_API = 'https://api.github.com/repos/ibnumardini/Lightspeed/releases';
export const PRIVACY_URL = './privacy.html';
// Replace with live Chrome Web Store & Firefox Add-ons URLs once published
export const CHROME_STORE_URL = 'https://github.com/ibnumardini/Lightspeed/releases';
export const FIREFOX_STORE_URL = 'https://github.com/ibnumardini/Lightspeed/releases';

export function isFirefoxBrowser() {
  return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent || '');
}

export function detectIndonesia() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura', 'Asia/Pontianak'].includes(tz)) {
      return true;
    }
  } catch {
    // Fallback to browser language
  }
  return (navigator.language || '').toLowerCase().startsWith('id');
}

export function detectInitialLang() {
  const saved = localStorage.getItem('lightspeed_site_lang');
  if (saved === 'en' || saved === 'id') return saved;
  return (navigator.language || '').toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function detectInitialTheme() {
  const saved = localStorage.getItem('lightspeed_site_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function parseReleaseLines(body) {
  if (!body) return [];
  return String(body)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^#{1,6}\s/.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, ''));
}

export function renderInlineCode(text) {
  const parts = String(text).split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`')
      ? html`<code key=${i}>${part.slice(1, -1)}</code>`
      : part,
  );
}

export function formatBytes(bytes) {
  if (!bytes || !Number.isFinite(bytes)) return '';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
