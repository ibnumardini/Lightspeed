# Release Process

## 1. Version bump + changelog + zip + push

1. Update `CHANGELOG.md`: add a new `## [x.y.z] - YYYY-MM-DD` section at the top with the changes.
2. Bump `version` in `package.json` to match.
3. Run checks:

   ```bash
   bun run compile
   bun test
   ```

4. Commit: `chore: release version x.y.z`
5. Build the zips:

   ```bash
   bun run zip
   bun run zip:firefox
   ```

6. Commit the generated `dist/lightspeed-x.y.z-chrome.zip` and `dist/lightspeed-x.y.z-firefox.zip`.
7. Push: `git push`

## 2. GitHub release

1. Go to [github.com/ibnumardini/lightspeed/releases/new](https://github.com/ibnumardini/lightspeed/releases/new).
2. Tag: `vx.y.z` (create on publish), target: `master`.
3. Title: `x.y.z`
4. Release notes: paste the matching section from `CHANGELOG.md`.
5. Attach both zips from `dist/`: `lightspeed-x.y.z-chrome.zip` and `lightspeed-x.y.z-firefox.zip`.
6. Publish release.

## 3. Chrome Web Store

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Select Lightspeed (or click New Item for the first submission), open the Package tab, and upload `dist/lightspeed-x.y.z-chrome.zip` (version must be higher than the currently published one).
3. Update listing metadata (description, screenshots, privacy disclosures) if changed.
4. Click Submit for Review and confirm.
5. Leave "Publish automatically" checked to go live right after approval, or uncheck it to publish manually later.

## 4. Firefox Add-ons (AMO)

1. Go to the [AMO Developer Hub](https://addons.mozilla.org/developers/) and open the Lightspeed listing (or Submit a New Add-on for the first release).
2. Click Upload New Version and select `dist/lightspeed-x.y.z-firefox.zip`.
3. Wait for the automatic validator to pass and fix any blocking errors it reports.
4. Select compatible platforms.
5. Source code declaration: WXT bundles and minifies the React/TypeScript build, so if AMO requests source code, upload `.output/lightspeed-x.y.z-sources.zip` (generated automatically by `bun run zip:firefox`) and note the build commands (`bun install && bun run build:firefox`).
6. Enter release notes for this version (paste the changelog entry).
7. Submit for review.

## 5. Microsoft Edge Add-ons

1. Go to [Microsoft Partner Center (Edge)](https://partner.microsoft.com/dashboard/microsoftedge/overview) and open the Lightspeed listing (or click Create new extension for the first submission; individual developer registration is free).
2. Upload the same Chromium package: `dist/lightspeed-x.y.z-chrome.zip`.
3. Update Properties if needed (Category: `Productivity`, Website: `https://ibnumardini.github.io/lightspeed/`, Privacy policy: `https://ibnumardini.github.io/lightspeed/privacy.html`, Support: `hi@mardini.dev`).
4. In Store listings, upload `assets/store/edge-logo-300x300.png` (`300×300`), the `1280×800` screenshots (`assets/store/screenshot-*.png`), and optional promotional tiles (`promo-small-440x280.png`, `promo-marquee-1400x560.png`).
5. Add brief Notes for certification explaining `storage` (local preferences and per-site speeds) and `tabs` (active tab hostname for scope and toolbar badge), with zero telemetry.
6. Click Publish to submit for review.
