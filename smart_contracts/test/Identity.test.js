const Identity = artifacts.require("Identity");
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

contract("Identity", (accounts) => {
  const [issuer, user, anotherUser] = accounts;

  let instance;

  beforeEach(async () => {
    instance = await Identity.new();  // Fresh contract deployment
  });

  it("should return an empty array when no credentials exist", async () => {
    const credentials = await instance.getCredentials.call(anotherUser);
    assert.isArray(credentials, "The result should be an array");
    assert.equal(credentials.length, 0, "The array should be empty");
  });
  
  it("should return credentials after issuance", async () => {
    // Issue a credential
    await instance.issueCredential(user, "hash789", false, { from: issuer });
  
    // Fetch credentials
    const credentials = await instance.getCredentials.call(user);
    assert.isArray(credentials, "The result should be an array");
    assert.equal(credentials.length, 1, "The array should contain one credential");
    
    // Verify the credential details
    assert.equal(credentials[0].issuer, issuer, "Issuer should match");
    assert.equal(credentials[0].dataHash, "hash789", "Data hash should match");
    assert.isTrue(credentials[0].valid, "Credential should be valid");
  });
  
  it("should reflect revoked credentials as invalid", async () => {  
    // Issue a credential and revoke it
    await instance.issueCredential(user, "hashToRevoke", false, { from: issuer });
    await instance.revokeCredential(user, "hashToRevoke", { from: issuer });
  
    // Fetch credentials
    const credentials = await instance.getCredentials.call(user);
    const revokedCredential = credentials.find(cred => cred.dataHash === "hashToRevoke");
  
    assert.isDefined(revokedCredential, "Revoked credential should exist");
    assert.isFalse(revokedCredential.valid, "Revoked credential should be invalid");
  });
  
  it("should handle multiple credentials for the same user", async () => {
    // Issue multiple credentials
    await instance.issueCredential(user, "hash001", false, { from: issuer });
    await instance.issueCredential(user, "hash002", false, { from: issuer });
  
    // Fetch credentials
    const credentials = await instance.getCredentials.call(user);
    assert.equal(credentials.length, 2, "User should have two credentials");
  
    const dataHashes = credentials.map(cred => cred.dataHash);
    assert.includeMembers(dataHashes, ["hash001", "hash002"], "Both hashes should be present");
  });

  it("should issue a credential", async () => {
    await instance.issueCredential(user, "hash123", false, { from: issuer });
    const isValid = await instance.verifyCredential.call(user, "hash123");
    assert.isTrue(isValid, "Credential should be valid");
  });

  it("should revalidate an invalid credential", async () => {
    await instance.issueCredential(user, "hash123", false, { from: issuer }); // Issue first
    await instance.revokeCredential(user, "hash123", { from: issuer });
    let isValid = await instance.verifyCredential.call(user, "hash123");
    assert.isFalse(isValid, "Credential should be revoked");
    
    await instance.issueCredential(user, "hash123", true, { from: issuer });
    isValid = await instance.verifyCredential.call(user, "hash123");
    assert.isTrue(isValid, "Credential should be revalidated");
  });

  it("should not issue duplicate credentials if valid", async () => {
    await instance.issueCredential(user, "hash123", false, { from: issuer }); // Issue first
    try {
      await instance.issueCredential(user, "hash123", false, { from: issuer });
      assert.fail("Expected error not received");
    } catch (error) {
      assert(error.message.includes("Credential already exists and is valid"), `Expected "Credential already exists and is valid" but got ${error.message}`);
    }
  });

  it("should verify a credential", async () => {
    await instance.issueCredential(user, "hash123", false, { from: issuer }); // Issue credential

    const isValid = await instance.verifyCredential.call(user, "hash123");
    assert.isTrue(isValid, "Credential should be valid");
  });

  it("should revoke a credential", async () => {
    await instance.issueCredential(user, "hash123", false, { from: issuer }); // Issue first

    await instance.revokeCredential(user, "hash123", { from: issuer });
    const isValid = await instance.verifyCredential.call(user, "hash123");
    assert.isFalse(isValid, "Credential should be revoked");
  });

  it("should not revoke a non-existent credential", async () => {

    try {
      await instance.revokeCredential(user, "nonExistentHash", { from: issuer });
      assert.fail("Expected error not received");
    } catch (error) {
      assert(error.message.includes("Credential not found"), `Expected "Credential not found" but got ${error.message}`);
    }
  });

  it("should not revoke a credential by a non-issuer", async () => {
    // const instance = await Identity.deployed();
    instance = await Identity.deployed()

    await instance.issueCredential(user, "hash456", false, { from: issuer });
    try {
      await instance.revokeCredential(user, "hash456", { from: anotherUser });
      assert.fail("Expected error not received");
    } catch (error) {
      assert(error.message.includes("Only issuer can revoke"), `Expected "Only issuer can revoke" but got ${error.message}`);
    }
  });

  it("should handle load test for issuing, verifying, and revoking credentials", async function () {
    this.timeout(300000);
    const numOperations = 100;
    const issueTimes = [];
    const verifyTimes = [];
    const revokeTimes = [];
    
    const gasLimit = 3000000;

    console.log("Number of Operations:", numOperations);

    console.time("Load Test - Issue Credentials");
    for (let i = 0; i < numOperations; i++) {
      const user = accounts[i % accounts.length];
      const dataHash = `hash${i}`;
      const startTime = new Date().getTime();
      await instance.issueCredential(user, dataHash, false, { from: user, gas: gasLimit });
      const endTime = new Date().getTime();
      issueTimes.push(endTime - startTime);
    }
    console.timeEnd("Load Test - Issue Credentials");

    console.time("Load Test - Verify Credentials");
    for (let i = 0; i < numOperations; i++) {
      const user = accounts[i % accounts.length];
      const dataHash = `hash${i}`;
      const startTime = new Date().getTime();
      await instance.verifyCredential.call(user, dataHash);
      const endTime = new Date().getTime();
      verifyTimes.push(endTime - startTime);
    }
    console.timeEnd("Load Test - Verify Credentials");

    console.time("Load Test - Revoke Credentials");
    for (let i = 0; i < numOperations; i++) {
      const user = accounts[i % accounts.length];
      const dataHash = `hash${i}`;
      const startTime = new Date().getTime();
      await instance.revokeCredential(user, dataHash, { from: user, gas: gasLimit });
      const endTime = new Date().getTime();
      revokeTimes.push(endTime - startTime);
    }
    console.timeEnd("Load Test - Revoke Credentials");

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
    
      fs.writeFileSync(path.resolve(__dirname, 'test-results.json'), JSON.stringify(results, null, 2));
      console.log('Results saved to test-results.json');
    
  });
});
