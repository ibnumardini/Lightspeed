# Changelog

All notable changes to this project are documented in this file.

## [1.1.1] - 2026-11-23

### Added

- Toolbar badge visibility setting in Settings > Appearance (`Always show`, `Hide at 1×`, and `Always hide`), defaulting to `Always show` so `1×` stays visible on the extension icon.

### Changed

- Reordered the popup controls to place `Playback speed` above `Quick speed`.
- Refined Dark mode surfaces, borders, and neutral text tones for cleaner contrast with less accent color bleed.
- Replaced the popup Settings sliders icon with a cog icon.
- Updated landing page and store screenshots to match the latest UI.

### Fixed

- Preloaded the active tab playback state in parallel with settings before mounting the popup, eliminating the brief `1×` quick-speed flash on open.

## [1.1.0] - 2026-11-23

### Added

- Expandable `+0.5×` micro-tab on each Quick speed button with smooth symmetric flip when a `.5×` speed is active.
- On/off toggle for keyboard shortcuts in Settings (hides shortcut hints and disables key listeners when turned off).
- Scroll wheel and Up/Down arrow support on the speed input (`Shift` uses big step) plus press-and-hold repeat on `−`/`+` step buttons.
- Live playback progress bar, playing status indicator, and time-saved pill in the Now playing card.

### Changed

- Enhanced Dark mode contrast, surface separation, borders, and scope track depth.
- Compacted the Playback speed `Apply` bar so it appears only when editing or invalid, moving the live percentage readout next to the section label.
- Completed Bahasa Indonesia localization across the popup and Settings page, unified the `Reset` button label with a bolder rounded icon, and flattened the popup footer row into a single flex layout.

### Fixed

- Eliminated initial theme/accent flash when opening the popup or Settings by caching resolved theme variables and waiting for local settings before mounting React.
- Prevented header subtitle text from overlapping the Reset button in narrower layouts.

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
