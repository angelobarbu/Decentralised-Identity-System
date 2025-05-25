const crypto = require("crypto-js");
const secretKey = require("../config/env").SECRET_KEY;
const { web3, identityContract } = require("../config/web3");

class IdentityService {

  async getIdentities(userAddress) {
    try {
      if (!userAddress || !web3.utils.isAddress(userAddress)) {
        throw new Error("Invalid or missing user address.");
      }

      const credentials = await identityContract.methods.getValidCredentials(userAddress).call();
      console.log("Fetched credentials:", credentials);

      const decryptedIdentities = credentials.map((cred) => {
        try {
          const bytes = crypto.AES.decrypt(cred.dataHash, secretKey);
          const decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));
  
          return {
            credentialId: cred.credentialId,
            issuer: cred.issuer,
            valid: cred.valid,
            ...decryptedData,
          };

        } catch (err) {
          console.error("Decryption failed for:", cred.dataHash);
          return { credentialId: cred.credentialId, issuer: cred.issuer, valid: cred.valid };
        }
      });
  
      return decryptedIdentities;

    } catch (error) {
      console.error("Error in identityService.getIdentities:", error);
      throw error; // Propagate error to controller
    }
  }



  async getAllIdentities(accounts) {
    try {
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("Invalid or missing user accounts.");
      }

      const allCredentials = await Promise.all(
        accounts.map(async (userAddress) => {
          const credentials = await identityContract.methods.getValidCredentials(userAddress).call();
          console.log(`Fetched credentials for ${userAddress}:`, credentials);

          const decryptedIdentities = credentials.map((cred) => {
            try {
              const bytes = crypto.AES.decrypt(cred.dataHash, secretKey);
              const decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));

              return {
                credentialId: cred.credentialId,
                issuer: cred.issuer,
                valid: cred.valid,
                ...decryptedData,
              };

            } catch (err) {
              console.error("Decryption failed for:", cred.dataHash);
              return { credentialId: cred.credentialId, issuer: cred.issuer, valid: cred.valid };
            }
          });

          return decryptedIdentities;
        })
      );

      return allCredentials;

    } catch (error) {
      console.error("Error in identityService.getAllIdentities:", error);
      throw error;
    }
  }



  async issueCredential({ userAddress, firstName, lastName, dob, nationality, idNumber, revalidate }) {
    try {

      console.log("Issuing identity:", userAddress, firstName, lastName, dob, nationality, idNumber, revalidate);

      if (!userAddress || !web3.utils.isAddress(userAddress)) {
        throw new Error("Invalid or missing user address.");
      }
    
      // Encrypt identity data using AES encryption
      const identityData = JSON.stringify({ firstName, lastName, dob, nationality, idNumber });
      const encryptedData = crypto.AES.encrypt(identityData, secretKey).toString();

      // Generate a deterministic credential ID based on user address and identity data
      const credentialId = web3.utils.keccak256(userAddress + firstName + lastName + dob + nationality + idNumber);

      // Estimate Gas Usage
      const gasEstimate = await identityContract.methods
        .issueCredential(userAddress, credentialId, encryptedData, revalidate)
        .estimateGas({ from: userAddress });

      console.log(`Estimated Gas to Issue: ${gasEstimate}`);
    
      // Issue Credential with User Paying Gas
      await identityContract.methods
        .issueCredential(userAddress, credentialId, encryptedData, revalidate)
        .send({ from: userAddress, gas: gasEstimate + 50000 }); // Add buffer for fluctuations

      console.log(`Identity issued successfully: ${credentialId}\nData: ${encryptedData}`);

    
      return { message: "Identity issued successfully!" };

    } catch (error) {

      // Credential already exists but is revoked
      const revalidateMessage = "Credential exists but is revoked. Set revalidate to true to revalidate it.";
      if (error.data?.reason === revalidateMessage) {
        return { message: revalidateMessage };
      }

      // Credential already exists and is valid
      const existsMessage = "Credential already exists and is valid";
      if (error.data?.reason === existsMessage) {
        return { message: existsMessage };
      }

      console.error("Error in identityService.issueCredential:", error);
      throw error; // Propagate error to controller
    }
  }


  async revokeCredential({ userAddress, firstName, lastName, dob, nationality, idNumber }) {
    try {

      console.log("Revoking identity:", userAddress, firstName, lastName, dob, nationality, idNumber);

      if (!userAddress || !web3.utils.isAddress(userAddress)) {
        throw new Error("Invalid or missing user address.");
      }

      // Encrypt identity data using AES encryption
      const identityData = JSON.stringify({ firstName, lastName, dob, nationality, idNumber });
      const encryptedData = crypto.AES.encrypt(identityData, secretKey).toString();

      // Generate a deterministic credential ID based on user address and encrypted data
      const credentialId = web3.utils.keccak256(userAddress + firstName + lastName + dob + nationality + idNumber);

      // Estimate Gas Usage
      const gasEstimate = await identityContract.methods
        .revokeCredential(userAddress, credentialId)
        .estimateGas({ from: userAddress });

      console.log(`Estimated Gas to Revoke: ${gasEstimate}`);

      await identityContract.methods
        .revokeCredential(userAddress, credentialId)
        .send({ from: userAddress, gas: gasEstimate + 50000 }); // Add buffer for fluctuations

      console.log(`Identity revoked successfully: ${credentialId}`);


      return { message: "Identity revoked successfully!" };
      
    } catch (error) {
      console.error("Error in identityService.revokeCredential:", error);
      throw error;
    }
  }


}

module.exports = new IdentityService();
