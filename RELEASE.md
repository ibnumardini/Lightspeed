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

1. Go to [github.com/ibnumardini/Lightspeed/releases/new](https://github.com/ibnumardini/Lightspeed/releases/new).
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
