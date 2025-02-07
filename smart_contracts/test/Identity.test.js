const Identity = artifacts.require("Identity");
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

contract("Identity", (accounts) => {
  const [issuer, user, anotherUser] = accounts;
  let instance;

  beforeEach(async () => {
    instance = await Identity.new(); // Fresh contract deployment
  });

  function generateCredentialId(userAddress, rawData) {
    return Web3.utils.keccak256(userAddress + rawData); // Simulating backend credential ID generation
  }

  it("should return an empty array when no credentials exist", async () => {
    const credentials = await instance.getCredentials.call(anotherUser);
    assert.isArray(credentials, "The result should be an array");
    assert.equal(credentials.length, 0, "The array should be empty");
  });

  it("should return credentials after issuance", async () => {
    const rawData = "mockEncryptedData123";
    const credentialId = generateCredentialId(user, rawData);

    await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });

    const credentials = await instance.getCredentials.call(user);
    assert.isArray(credentials, "The result should be an array");
    assert.equal(credentials.length, 1, "The array should contain one credential");

    assert.equal(credentials[0].issuer, issuer, "Issuer should match");
    assert.equal(credentials[0].credentialId, credentialId, "Credential ID should match");
    assert.isTrue(credentials[0].valid, "Credential should be valid");
  });

  it ("should return valid credentials only", async () => {
    const rawData1 = "mockEncryptedData123";
    const rawData2 = "mockEncryptedData456";
    const credentialId1 = generateCredentialId(user, rawData1);
    const credentialId2 = generateCredentialId(user, rawData2);

    await instance.issueCredential(user, credentialId1, rawData1, false, { from: issuer });
    await instance.issueCredential(user, credentialId2, rawData2, false, { from: issuer });

    await instance.revokeCredential(user, credentialId2, { from: issuer });

    const validCredentials = await instance.getValidCredentials.call(user);

    assert.isArray(validCredentials, "The result should be an array");
    assert.equal(validCredentials.length, 1, "Only one credential should be valid");
    assert.equal(validCredentials[0].credentialId, credentialId1, "Valid credential ID should match");
  });


  it("should reflect revoked credentials as invalid", async () => {
    const rawData = "mockEncryptedDataToRevoke";
    const credentialId = generateCredentialId(user, rawData);

    await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });
    await instance.revokeCredential(user, credentialId, { from: issuer });

    const credentials = await instance.getCredentials.call(user);
    const revokedCredential = credentials.find((cred) => cred.credentialId === credentialId);

    assert.isDefined(revokedCredential, "Revoked credential should exist");
    assert.isFalse(revokedCredential.valid, "Revoked credential should be invalid");
  });

  it("should handle multiple credentials for the same user", async () => {
    const rawData1 = "mockEncryptedData001";
    const rawData2 = "mockEncryptedData002";
    const credentialId1 = generateCredentialId(user, rawData1);
    const credentialId2 = generateCredentialId(user, rawData2);

    await instance.issueCredential(user, credentialId1, rawData1, false, { from: issuer });
    await instance.issueCredential(user, credentialId2, rawData2, false, { from: issuer });

    const credentials = await instance.getCredentials.call(user);
    assert.equal(credentials.length, 2, "User should have two credentials");

    const credentialIds = credentials.map((cred) => cred.credentialId);
    assert.includeMembers(credentialIds, [credentialId1, credentialId2], "Both credential IDs should be present");
  });

  it("should issue a credential", async () => {
    const rawData = "mockEncryptedData123";
    const credentialId = generateCredentialId(user, rawData);

    await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });

    const isValid = await instance.verifyCredential.call(user, credentialId);
    assert.isTrue(isValid, "Credential should be valid");
  });

  it("should revalidate an invalid credential", async () => {
    const rawData = "mockEncryptedData123";
    const credentialId = generateCredentialId(user, rawData);

    await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });
    await instance.revokeCredential(user, credentialId, { from: issuer });

    let isValid = await instance.verifyCredential.call(user, credentialId);
    assert.isFalse(isValid, "Credential should be revoked");

    await instance.issueCredential(user, credentialId, rawData, true, { from: issuer });
    isValid = await instance.verifyCredential.call(user, credentialId);
    assert.isTrue(isValid, "Credential should be revalidated");
  });

  it("should not issue duplicate credentials if valid", async () => {
    const rawData = "mockEncryptedData123";
    const credentialId = generateCredentialId(user, rawData);

    await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });

    try {
      await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });
      assert.fail("Expected error not received");
    } catch (error) {
      assert(error.message.includes("Credential already exists and is valid"), `Expected "Credential already exists and is valid" but got ${error.message}`);
    }
  });

  it("should verify a credential", async () => {
    const rawData = "mockEncryptedData123";
    const credentialId = generateCredentialId(user, rawData);

    await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });

    const isValid = await instance.verifyCredential.call(user, credentialId);
    assert.isTrue(isValid, "Credential should be valid");
  });

  it("should revoke a credential", async () => {
    const rawData = "mockEncryptedData123";
    const credentialId = generateCredentialId(user, rawData);

    await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });
    await instance.revokeCredential(user, credentialId, { from: issuer });

    const isValid = await instance.verifyCredential.call(user, credentialId);
    assert.isFalse(isValid, "Credential should be revoked");
  });

  it("should not revoke a non-existent credential", async () => {
    try {
      await instance.revokeCredential(user, "nonExistentCredentialId", { from: issuer });
      assert.fail("Expected error not received");
    } catch (error) {
      assert(error.message.includes("Credential not found"), `Expected "Credential not found" but got ${error.message}`);
    }
  });

  it("should not revoke a credential by a non-issuer", async () => {
    const rawData = "mockEncryptedData456";
    const credentialId = generateCredentialId(user, rawData);

    await instance.issueCredential(user, credentialId, rawData, false, { from: issuer });

    try {
      await instance.revokeCredential(user, credentialId, { from: anotherUser });
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
      const credentialId = web3.utils.keccak256(`Credential-${i}-${user}`);
  
      const startTime = new Date().getTime();
      await instance.issueCredential(user, credentialId, false, { from: accounts[0], gas: gasLimit }); // Always issued by accounts[0]
      const endTime = new Date().getTime();
      issueTimes.push(endTime - startTime);
    }
    console.timeEnd("Load Test - Issue Credentials");
  
    console.time("Load Test - Verify Credentials");
    for (let i = 0; i < numOperations; i++) {
      const user = accounts[i % accounts.length];
      const credentialId = web3.utils.keccak256(`Credential-${i}-${user}`);
  
      const startTime = new Date().getTime();
      await instance.verifyCredential.call(user, credentialId);
      const endTime = new Date().getTime();
      verifyTimes.push(endTime - startTime);
    }
    console.timeEnd("Load Test - Verify Credentials");
  
    console.time("Load Test - Revoke Credentials");
    for (let i = 0; i < numOperations; i++) {
      const user = accounts[i % accounts.length];
      const credentialId = web3.utils.keccak256(`Credential-${i}-${user}`);
  
      const startTime = new Date().getTime();
      await instance.revokeCredential(user, credentialId, { from: accounts[0], gas: gasLimit }); // Revoked by accounts[0] (issuer)
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
