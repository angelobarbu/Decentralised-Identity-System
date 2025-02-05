const crypto = require("crypto-js");
const secretKey = require("../config/env").SECRET_KEY;
const { web3, identityContract } = require("../config/web3");

class IdentityService {

  async getIdentities(userAddress) {
    try {
      if (!userAddress || !web3.utils.isAddress(userAddress)) {
        throw new Error("Invalid or missing user address.");
      }

      const credentials = await identityContract.methods.getCredentials(userAddress).call();
      console.log("Fetched credentials:", credentials);

      const decryptedIdentities = credentials.map((cred) => {
        try {
          const bytes = crypto.AES.decrypt(cred.dataHash, secretKey);
          const decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));
  
          return {
            issuer: cred.issuer,
            valid: cred.valid,
            ...decryptedData,
          };

        } catch (err) {
          console.error("Decryption failed for:", cred.dataHash);
          return { issuer: cred.issuer, valid: cred.valid };
        }
      });
  
      return decryptedIdentities;

    } catch (error) {
      console.error("Error in identityService.getIdentities:", error);
      throw error; // Propagate error to controller
    }
  }


  async issueCredential({ userAddress, firstName, lastName, dob, nationality, idNumber }) {
    try {
      if (!userAddress || !web3.utils.isAddress(userAddress)) {
        throw new Error("Invalid or missing user address.");
      }
    
      // const identityHash = crypto.SHA256(firstName + lastName + dob + nationality + idNumber).toString();
      // Encrypt identity data using AES encryption
      const identityData = JSON.stringify({ firstName, lastName, dob, nationality, idNumber });
      const encryptedData = crypto.AES.encrypt(identityData, secretKey).toString();

      // Estimate Gas Usage
      const gasEstimate = await identityContract.methods
        .issueCredential(userAddress, encryptedData, false)
        .estimateGas({ from: userAddress });

      console.log(`Estimated Gas to Issue: ${gasEstimate}`);
    
      // Issue Credential with User Paying Gas
      await identityContract.methods
        .issueCredential(userAddress, encryptedData, false)
        .send({ from: userAddress, gas: gasEstimate + 50000 }); // Add buffer for fluctuations

      console.log("Identity issued successfully:", encryptedData);

    
      return { message: "Identity issued successfully!" };

    } catch (error) {
      console.error("Error in identityService.issueCredential:", error);
      throw error; // Propagate error to controller
    }
  }


  async revokeCredential({ userAddress, firstName, lastName, dob, nationality, idNumber }) {
    try {
      if (!userAddress || !web3.utils.isAddress(userAddress)) {
        throw new Error("Invalid or missing user address.");
      }

      const identityData = JSON.stringify({ firstName, lastName, dob, nationality, idNumber });
      const encryptedData = crypto.AES.encrypt(identityData, secretKey).toString();

      console.log("Revoking identity for user:", userAddress, encryptedData);

      // Estimate Gas Usage
      const gasEstimate = await identityContract.methods
        .revokeCredential(userAddress, encryptedData)
        .estimateGas({ from: userAddress });

      console.log(`Estimated Gas to Revoke: ${gasEstimate}`);

      await identityContract.methods
        .revokeCredential(userAddress, identityHash)
        .send({ from: userAddress, gas: gasEstimate + 50000 }); // Add buffer for fluctuations

      console.log(`Identity revoked successfully: ${identityHash}`);


      return { message: "Identity revoked successfully!" };
      
    } catch (error) {
      console.error("Error in identityService.revokeCredential:", error);
      throw error;
    }
  }


}

module.exports = new IdentityService();
