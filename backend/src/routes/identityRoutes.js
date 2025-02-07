const express = require("express");
const router = express.Router();
const IdentityController = require("../controllers/identityController");
const upload = require("../config/multer");

router.get("/get-identities/:userAddress", IdentityController.getIdentities);
router.post("/issue-identity", upload.single("idDocument"), IdentityController.issueCredential);
router.post("/revoke-identity", IdentityController.revokeCredential);

module.exports = router;
