import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const browserFlag = process.argv.indexOf('-b');
const browser = browserFlag !== -1 && process.argv[browserFlag + 1] ? process.argv[browserFlag + 1] : 'chrome';
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

execSync(`bunx wxt zip -b ${browser}`, { cwd: root, stdio: 'inherit' });

const outputDir = path.join(root, '.output');
const zipFile = `lightspeed-${version}-${browser}.zip`;
const srcZip = path.join(outputDir, zipFile);
if (!fs.existsSync(srcZip)) {
  throw new Error(`Expected zip "${zipFile}" not found in .output/`);
}

const distDir = path.join(root, 'dist');
fs.mkdirSync(distDir, { recursive: true });
fs.copyFileSync(srcZip, path.join(distDir, zipFile));

console.log(`Copied -> dist/${zipFile}`);
