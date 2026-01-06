/* eslint-env node */
import { execSync } from 'child_process';
console.log('Running custom build script...');
execSync('npx next build', { stdio: 'inherit' });