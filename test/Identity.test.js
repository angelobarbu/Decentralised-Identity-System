const Identity = artifacts.require("Identity");

contract("Identity", (accounts) => {
  const [issuer, user, anotherUser] = accounts;

  it("should issue a credential", async () => {
    const instance = await Identity.deployed();
    await instance.issueCredential(user, "hash123", { from: issuer });
    const isValid = await instance.verifyCredential.call(user, "hash123");
    assert.isTrue(isValid, "Credential should be valid");
  });

  it("should not issue duplicate credentials", async () => {
    const instance = await Identity.deployed();
    try {
      await instance.issueCredential(user, "hash123", { from: issuer });
      assert.fail("Expected error not received");
    } catch (error) {
      assert(error.message.includes("Credential already exists"), `Expected "Credential already exists" but got ${error.message}`);
    }
  });

  it("should verify a credential", async () => {
    const instance = await Identity.deployed();
    const isValid = await instance.verifyCredential.call(user, "hash123");
    assert.isTrue(isValid, "Credential should be valid");
  });

  it("should revoke a credential", async () => {
    const instance = await Identity.deployed();
    await instance.revokeCredential(user, "hash123", { from: issuer });
    const isValid = await instance.verifyCredential.call(user, "hash123");
    assert.isFalse(isValid, "Credential should be revoked");
  });

  it("should not revoke a non-existent credential", async () => {
    const instance = await Identity.deployed();
    try {
      await instance.revokeCredential(user, "nonExistentHash", { from: issuer });
      assert.fail("Expected error not received");
    } catch (error) {
      assert(error.message.includes("Credential not found"), `Expected "Credential not found" but got ${error.message}`);
    }
  });

  it("should not revoke a credential by a non-issuer", async () => {
    const instance = await Identity.deployed();
    await instance.issueCredential(user, "hash456", { from: issuer });
    try {
      await instance.revokeCredential(user, "hash456", { from: anotherUser });
      assert.fail("Expected error not received");
    } catch (error) {
      assert(error.message.includes("Only issuer can revoke"), `Expected "Only issuer can revoke" but got ${error.message}`);
    }
  });
});
