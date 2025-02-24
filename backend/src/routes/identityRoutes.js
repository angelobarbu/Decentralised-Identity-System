const express = require("express");
const router = express.Router();
const IdentityController = require("../controllers/identityController");
const upload = require("../config/multer");

router.get("/get-account-identities/:userAddress", IdentityController.getIdentities);
router.get("/get-all-identities", IdentityController.getAllIdentities);
router.post("/issue-identity", upload.single("idDocument"), IdentityController.issueCredential);
router.post("/revoke-identity", IdentityController.revokeCredential);

module.exports = router;
