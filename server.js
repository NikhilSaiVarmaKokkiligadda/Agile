const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("./models/User");

const router = express.Router();
const ShareLink = require("./models/ShareLink"); // New schema for share links

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// ✅ Ensure upload directories exist
const uploadDir = path.join(__dirname, "uploads");
const cloud1Dir = path.join(uploadDir, "cloud1");
const cloud2Dir = path.join(uploadDir, "cloud2");
const cloud3Dir = path.join(uploadDir, "cloud3");

[cloud1Dir, cloud2Dir, cloud3Dir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ✅ Encryption Functions
const encryptAES = (buffer, key) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, Buffer.alloc(16, 0));
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
};

const encryptTripleDES = (buffer, key) => {
  const cipher = crypto.createCipheriv("des-ede3", key, Buffer.alloc(0));
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
};

const encryptRSA = (buffer, publicKey) => {
  return crypto.publicEncrypt(publicKey, buffer);
};

// Generate random encryption keys
const aesKey = crypto.randomBytes(32);
const tripleDesKey = crypto.randomBytes(24);
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Define Schema for File Storage
const ChunkSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  encryptedAESKey: { type: Buffer, required: true },
  chunks: [
    {
      chunkPath: { type: String, required: true },
      chunkIndex: { type: Number, required: true },
    },
  ],
  uploadDate: { type: Date, default: Date.now },
});

const Chunk = mongoose.model("Chunk", ChunkSchema);

/// ✅ Upload Route with Encryption
app.post("/upload", async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }

  const file = req.files.file;
  const filePath = path.join(uploadDir, file.name);

  file.mv(filePath, async (err) => {
    if (err) return res.status(500).send({ message: "Failed to upload file." });

    const fileBuffer = fs.readFileSync(filePath);
    const chunkSize = Math.ceil(fileBuffer.length / 3);
    const chunks = [
      fileBuffer.slice(0, chunkSize),
      fileBuffer.slice(chunkSize, chunkSize * 2),
      fileBuffer.slice(chunkSize * 2),
    ];

    // Encrypt each chunk
    const encryptedChunks = [
      encryptAES(chunks[0], aesKey), // AES for chunk 1
      encryptTripleDES(chunks[1], tripleDesKey), // 3DES for chunk 2
      encryptAES(chunks[2], aesKey), // AES for chunk 3
    ];

    // Encrypt AES key with RSA
    const encryptedAESKey = crypto.publicEncrypt(publicKey, aesKey);

    const cloudDirs = [cloud1Dir, cloud2Dir, cloud3Dir];
    const chunkPaths = encryptedChunks.map((chunk, index) => {
      const chunkFileName = `encrypted_chunk_${index + 1}_${file.name}`;
      const cloudDir = cloudDirs[index];
      const chunkPath = path.join(cloudDir, chunkFileName);

      fs.writeFileSync(chunkPath, chunk);
      return { chunkPath, chunkIndex: index + 1 };
    });

    try {
      const newChunk = new Chunk({
        fileName: file.name,
        encryptedAESKey,
        chunks: chunkPaths,
      });

      await newChunk.save();
      res.json({
        message: "File uploaded, encrypted, and stored successfully.",
        chunks: chunkPaths,
      });
    } catch (err) {
      console.error("Error saving chunk metadata:", err);
      res.status(500).send({ message: "Failed to save chunk metadata." });
    }
  });
});

app.get("/files", async (req, res) => {
  try {
    const files = await Chunk.find({}, "fileName uploadDate"); // Fetch file name & upload date

    if (!files.length) {
      return res
        .status(404)
        .json({ success: false, message: "No files found." });
    }

    res.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ✅ User Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;

    if (!name || !email || !phone || !username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res
      .status(201)
      .json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ✅ User Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // 🔍 Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }

    // 🔑 Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }

    res.json({
      success: true,
      message: "Login successful!",
      user: { username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});
app.get("/files", async (req, res) => {
  try {
    // Fetch file data from database or storage
    const files = await FileModel.find(); // Example: If using MongoDB

    if (!files.length) {
      return res.status(404).json({ message: "No files found" });
    }

    res.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate Shareable Link
router.post("/generate-share-link/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Check if file exists
    const file = await File.findById(fileId);
    if (!file)
      return res
        .status(404)
        .json({ success: false, message: "File not found" });

    // Generate a unique token for the session link
    const token = crypto.randomBytes(20).toString("hex");
    const expiry = Date.now() + 10 * 60 * 1000; // Link expires in 10 minutes

    // Store in database
    const shareLink = new ShareLink({ fileId, token, expiresAt: expiry });
    await shareLink.save();

    // Send response with the generated link
    const shareableLink = `http://localhost:3000/share/${token}`;
    res.json({ success: true, shareLink: shareableLink });
  } catch (error) {
    console.error("Error generating share link:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/generate-share-link/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Generate a temporary shareable link (Modify logic as needed)
    const shareLink = `https://agileservers.vercel.app/share/${fileId}?expires=${
      Date.now() + 10 * 60 * 1000
    }`;

    res.json({ success: true, shareLink });
  } catch (error) {
    console.error("Error generating share link:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
app.get("/share/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Check if the share link exists and is still valid
    if (!shareLinks[fileId] || Date.now() > shareLinks[fileId].expiresAt) {
      return res
        .status(401)
        .json({ success: false, message: "Link expired or invalid" });
    }

    // Fetch file details from the database (Assuming you store file metadata)
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // Send file details or a download link
    res.json({
      success: true,
      fileName: file.fileName,
      downloadURL: file.downloadURL,
    });
  } catch (error) {
    console.error("Error accessing shared file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

// ✅ Start the Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
// Define encryption algorithm and keys (must match encryption phase)
const ALGORITHMS = ["aes-256-cbc", "aes-192-cbc", "aes-128-cbc"];
const KEYS = [
  Buffer.from("0123456789abcdef0123456789abcdef"), // 32 bytes for AES-256
  Buffer.from("0123456789abcdef0123456789abcdef01234567"), // 24 bytes for AES-192
  Buffer.from("0123456789abcdef01234567"), // 16 bytes for AES-128
];
const IV = Buffer.from("1234567890abcdef"); // 16-byte IV (must match encryption)

// Function to decrypt a chunk
function decryptChunk(encryptedData, algorithm, key) {
  const decipher = crypto.createDecipheriv(algorithm, key, IV);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}

// Function to reconstruct the original file
function reconstructFile(chunkPaths, outputFilePath) {
  let finalBuffer = Buffer.alloc(0);

  chunkPaths.forEach((chunkPath, index) => {
    const encryptedData = fs.readFileSync(chunkPath);
    const decryptedChunk = decryptChunk(
      encryptedData,
      ALGORITHMS[index],
      KEYS[index]
    );
    finalBuffer = Buffer.concat([finalBuffer, decryptedChunk]);
  });

  fs.writeFileSync(outputFilePath, finalBuffer);
  console.log(`File successfully reconstructed: ${outputFilePath}`);
}

// Example usage:

const filePath =
  "C:\\Users\\eswar\\OneDrive\\Desktop\\Agile\\backend\\chunk1.enc";

if (!fs.existsSync(filePath)) {
  console.error(`Error: File ${filePath} does not exist.`);
  process.exit(1); // Stop execution
}

const encryptedData = fs.readFileSync(filePath);
console.log("File read successfully!");

