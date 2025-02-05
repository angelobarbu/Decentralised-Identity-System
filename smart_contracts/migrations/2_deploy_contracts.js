const fs = require('fs-extra');
const path = require('path');
const Identity = artifacts.require("Identity");


const srcFile = path.resolve(__dirname, '../build/contracts/Identity.json');
const abiFileName = 'Identity.json';

const frontendDestDir = path.resolve(__dirname, '../../frontend/src/contracts');
const backendDestDir = path.resolve(__dirname, '../../backend/src/contracts');


function copyAbiToDir(destDir) {
  const destFile = path.resolve(destDir, abiFileName);

  fs.ensureDirSync(destDir); // Ensure the destination directory exists
  fs.copyFileSync(srcFile, destFile); // Copy the file
  console.log(`ABI copied to ${destFile}`);
}


module.exports = function(deployer) {
  deployer.deploy(Identity).then(() => {
    // Copy ABI to frontend/src/contracts
    copyAbiToDir(frontendDestDir);

    // Copy ABI to backend/src/contracts
    copyAbiToDir(backendDestDir);
  });
};
