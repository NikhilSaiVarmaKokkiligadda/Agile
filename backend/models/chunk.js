const mongoose = require("mongoose");

const ChunkSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  encryptedAESKey: { type: Buffer, required: true },
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chunks: [
    {
      chunkPath: { type: String, required: true },
      chunkIndex: { type: Number, required: true },
    },
  ],
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chunk", ChunkSchema);
