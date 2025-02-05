const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { config } = require("../config/env");

class DocumentService {
  async verifyDocument(filePath) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post("https://api.ocr.space/parse/image", formData, {
      headers: { "apiKey": config.OCR_API_KEY, "Content-Type": "multipart/form-data" },
    });

    return response.data.ParsedResults[0].ParsedText;
  }
}

module.exports = new DocumentService();
