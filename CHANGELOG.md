# Changelog

All notable changes to this project are documented in this file.

## [1.0.1] - 2026-11-22

### Changed

- Updated Trakteer and Ko-fi support links in the popup and Settings page to point to the live profile URLs.
- Updated repository links to match the lowercase `ibnumardini/lightspeed` GitHub URL.

## [1.0.0] - 2026-11-22

### Added

- HTML5 video playback speed control from `0.1x` to `16x` across Chromium (MV3) and Firefox (MV2), including SPAs, Shadow DOM, and iframes.
- Scope selector to apply speed per tab, per site (saved locally), or globally across all tabs.
- Customizable quick speed presets (up to 10), preset or custom percentage fine-tune step buttons, and direct speed input.
- Rebindable keyboard shortcuts (`A` speed up, `D` slow down, `S` reset to `1x`) with automatic pause while typing in inputs.
- Live toolbar badge showing current speed (hidden at `1x`, `OFF` when paused) and a Now playing panel with remaining duration and time saved.
- Settings page with live popup preview, section visibility toggles, System/Light/Dark themes, 6 WCAG-checked accent presets plus custom color picker, and English / Bahasa Indonesia UI.
- Zero-telemetry local-only storage using `storage` and `tabs` permissions.
