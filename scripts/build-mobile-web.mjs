import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const assetsTargetDir = path.resolve(rootDir, 'mobile', 'android', 'app', 'src', 'main', 'assets', 'webapp');

console.log('Building mobile Vite app...');
execSync('npm run build:mobile', { cwd: rootDir, stdio: 'inherit' });

console.log('Cleaning old mobile assets...');
if (fs.existsSync(assetsTargetDir)) {
  fs.rmSync(assetsTargetDir, { recursive: true, force: true });
}
fs.mkdirSync(assetsTargetDir, { recursive: true });

console.log(`Copying production build to Android assets: ${assetsTargetDir}`);
fs.cpSync(distDir, assetsTargetDir, { recursive: true });

console.log('Mobile assets successfully packaged and copied!');
