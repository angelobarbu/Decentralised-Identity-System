const express = require("express");
const router = express.Router();
const DocumentController = require("../controllers/documentController");
const upload = require("../config/multer");

router.post("/verify-document", upload.single("idDocument"), DocumentController.verifyDocument);

module.exports = router;
