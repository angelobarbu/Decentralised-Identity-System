const DocumentService = require("../services/documentService");

class DocumentController {
  async verifyDocument(req, res, next) {
    try {
      const extractedData = await DocumentService.verifyDocument(req.file.path);
      res.json({ success: true, extractedData });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
