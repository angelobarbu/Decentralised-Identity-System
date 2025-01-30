const fs = require('fs-extra');
const path = require('path');

const srcFile = path.resolve(__dirname, 'build/contracts/Identity.json');
const destDir = path.resolve(__dirname, '../frontend/src/contracts');
const destFile = path.resolve(destDir, 'Identity.json');

fs.ensureDirSync(destDir); // Ensure the destination directory exists
fs.copyFileSync(srcFile, destFile); // Copy the file
console.log(`ABI copied to ${destFile}`);
