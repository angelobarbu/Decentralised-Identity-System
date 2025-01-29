require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const crypto = require("crypto-js");
const axios = require("axios");
const multer = require("multer");

const app = express();
app.use(cors({ origin: "http://localhost:3001" })); // Allow React frontend
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

const web3 = new Web3("http://127.0.0.1:7545"); // Ganache RPC URL
const Identity = require("../build/contracts/Identity.json");
const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS;
const identityContract = new web3.eth.Contract(Identity.abi, contractAddress);

// **GET Identities Route (Fixed)**
app.get("/get-identities/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.params;
    const credentials = await identityContract.methods.getCredentials(userAddress).call();
    res.json({ success: true, credentials });
  } catch (error) {
    console.error("Error fetching identities:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// **Verify ID Document via OCR API**
app.post("/verify-document", upload.single("idDocument"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const apiKey = process.env.OCR_API_KEY;

    const formData = new FormData();
    formData.append("file", filePath);

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      { headers: { "apiKey": apiKey, "Content-Type": "multipart/form-data" } }
    );

    const extractedData = response.data.ParsedResults[0].ParsedText;
    res.json({ success: true, extractedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// **Issue Identity (Hash & Store in Blockchain)**
app.post("/issue-identity", upload.single("idDocument"), async (req, res) => {
  try {
    const { userAddress, firstName, lastName, dob, nationality, idNumber } = req.body;
    const filePath = req.file.path;

    const apiKey = process.env.OCR_API_KEY;
    const formData = new FormData();
    formData.append("file", filePath);

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      { headers: { "apiKey": apiKey, "Content-Type": "multipart/form-data" } }
    );

    const extractedData = response.data.ParsedResults[0].ParsedText;

    if (!extractedData.includes(firstName) || !extractedData.includes(lastName)) {
      return res.status(400).json({ success: false, message: "Document verification failed" });
    }

    const identityHash = crypto.SHA256(firstName + lastName + dob + nationality + idNumber).toString();

    const existingCredential = await identityContract.methods.credentialExists(userAddress, identityHash).call();
    if (existingCredential) {
      return res.status(400).json({ success: false, message: "Identity already exists" });
    }

    const accounts = await web3.eth.getAccounts();
    await identityContract.methods.issueCredential(userAddress, identityHash).send({ from: accounts[0] });

    res.json({ success: true, message: "Identity issued on blockchain" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
