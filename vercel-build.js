const { execSync } = require('child_process');
console.log('Running custom build script...');
execSync('npx next build', { stdio: 'inherit' });