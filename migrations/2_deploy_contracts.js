const Identity = artifacts.require("Identity");
const { exec } = require('child_process');

module.exports = function(deployer) {
  deployer.deploy(Identity).then(() => {
    exec('node copy-abi.js', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error executing script: ${err}`);
        return;
      }
      console.log(stdout);
      console.error(stderr);
    });
  });
};
