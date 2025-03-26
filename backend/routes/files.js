const express = require("express");
const router = express.Router();
const File = require("../models/File"); // Import the File model

// Route to get all uploaded files
router.get("/files", async (req, res) => {
  try {
    const files = await File.find();
    res.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to handle file downloads
router.get("/download/:fileId", async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res.json({ success: true, downloadUrl: file.fileUrl });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
