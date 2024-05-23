const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const Identity = require('./build/contracts/Identity.json');

async function runLoadTest() {
  const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  const contract = new web3.eth.Contract(
    Identity.abi,
    Identity.networks[5777].address
  );

  console.time('Total Load Test Time');

  const numOperations = 100; // Number of operations to simulate
  const issueTimes = [];
  const verifyTimes = [];
  const revokeTimes = [];

  const gasLimit = 3000000; // Set a higher gas limit

  // Issue Credentials
  console.time('Issue Credentials');
  for (let i = 0; i < numOperations; i++) {
    const user = accounts[i % accounts.length];
    const dataHash = `hash${i}`;
    const startTime = new Date().getTime();
    await contract.methods.issueCredential(user, dataHash).send({ from: user, gas: gasLimit });
    const endTime = new Date().getTime();
    issueTimes.push(endTime - startTime);
  }
  console.timeEnd('Issue Credentials');

  // Verify Credentials
  console.time('Verify Credentials');
  for (let i = 0; i < numOperations; i++) {
    const user = accounts[i % accounts.length];
    const dataHash = `hash${i}`;
    const startTime = new Date().getTime();
    await contract.methods.verifyCredential(user, dataHash).call();
    const endTime = new Date().getTime();
    verifyTimes.push(endTime - startTime);
  }
  console.timeEnd('Verify Credentials');

  // Revoke Credentials
  console.time('Revoke Credentials');
  for (let i = 0; i < numOperations; i++) {
    const user = accounts[i % accounts.length];
    const dataHash = `hash${i}`;
    const startTime = new Date().getTime();
    await contract.methods.revokeCredential(user, dataHash).send({ from: user, gas: gasLimit });
    const endTime = new Date().getTime();
    revokeTimes.push(endTime - startTime);
  }
  console.timeEnd('Revoke Credentials');

  console.timeEnd('Total Load Test Time');

  const avgIssueTime = issueTimes.reduce((a, b) => a + b, 0) / issueTimes.length;
  const avgVerifyTime = verifyTimes.reduce((a, b) => a + b, 0) / verifyTimes.length;
  const avgRevokeTime = revokeTimes.reduce((a, b) => a + b, 0) / revokeTimes.length;

  console.log(`Average Issue Time: ${avgIssueTime} ms`);
  console.log(`Average Verify Time: ${avgVerifyTime} ms`);
  console.log(`Average Revoke Time: ${avgRevokeTime} ms`);

  // Save results to a file
  const results = {
    numOperations,
    avgIssueTime,
    avgVerifyTime,
    avgRevokeTime,
    issueTimes,
    verifyTimes,
    revokeTimes
  };

  fs.writeFileSync(path.resolve(__dirname, 'loadTestResults.json'), JSON.stringify(results, null, 2));
  console.log('Results saved to loadTestResults.json');
}

runLoadTest().catch(console.error);
