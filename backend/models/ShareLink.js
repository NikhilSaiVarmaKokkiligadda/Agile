const mongoose = require("mongoose");

const shareLinkSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("ShareLink", shareLinkSchema);
