const express = require("express");
const IdentityController = require("../controllers/identityController");
const upload = require("../config/multer");
const { validateIdentity } = require("../middleware/identityValidator");

const router = express.Router();

router.get("/get-account-identities/:userAddress", IdentityController.getIdentities);
router.get("/get-all-identities", IdentityController.getAllIdentities);
router.post("/issue-identity", validateIdentity, upload.single("idDocument"), IdentityController.issueCredential);
router.post("/revoke-identity", IdentityController.revokeCredential);

module.exports = router;
