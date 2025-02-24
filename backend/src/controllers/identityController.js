const IdentityService = require("../services/identityService");
const { web3 } = require("../config/web3");


class IdentityController {

  async getIdentities(req, res, next) {
    try {
      console.log("Received request to get identities for user:", req.params.userAddress);

      const credentials = await IdentityService.getIdentities(req.params.userAddress);

      res.json({ success: true, credentials });
    } catch (error) {
      next(error);
    }
  }


  async getAllIdentities(req, res, next) {
    try {
      console.log("Received request to get all identities for accounts:", req.query.accounts);

      const credentials = await IdentityService.getAllIdentities(req.query.accounts);

      res.json({ success: true, credentials });
    } catch (error) {
      next(error);
    }
  }


  async issueCredential(req, res, next) {
    try {
      const { userAddress, firstName, lastName, dob, nationality, idNumber, revalidate } = req.body;

      console.log("Received request to issue identity for user:", 
        userAddress,
        firstName,
        lastName,
        dob,
        nationality,
        idNumber,
        revalidate
      );

      const result = await IdentityService.issueCredential({
        userAddress,
        firstName,
        lastName,
        dob,
        nationality,
        idNumber,
        revalidate,
      });

      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }


  async revokeCredential(req, res, next) {
    try {
      const { userAddress, firstName, lastName, dob, nationality, idNumber } = req.body;

      console.log("Received request to revoke identity for user:",
        userAddress,
        firstName,
        lastName,
        dob,
        nationality,
        idNumber
      );

      const result = await IdentityService.revokeCredential({
        userAddress,
        firstName,
        lastName,
        dob,
        nationality,
        idNumber,
      });

      res.json({ success: true, message: "Identity revoked successfully" });
    } catch (error) {
      next(error);
    }
  }

  
}

module.exports = new IdentityController();
