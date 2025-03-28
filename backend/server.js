const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Chunk = require("./models/chunk");
const bcrypt = require("bcryptjs");
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

 
const User = require("./models/User");
const router = express.Router();
const app = express();
const port = process.env.PORT || 4000;

// ✅ Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

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

// ✅ Decryption Functions
const decryptAES = (buffer, key) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.alloc(16, 0));
  return Buffer.concat([decipher.update(buffer), decipher.final()]);
};

const decryptTripleDES = (buffer, key) => {
  const decipher = crypto.createDecipheriv("des-ede3", key, Buffer.alloc(0));
  return Buffer.concat([decipher.update(buffer), decipher.final()]);
}

// Generate random encryption keys
const aesKey = crypto.randomBytes(32);
const tripleDesKey = crypto.randomBytes(24);
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});




// ✅ Upload Route with Encryption
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

    // Generate a unique AES key for this file
    const aesKey = crypto.randomBytes(32);

    // Encrypt each chunk
    const encryptedChunks = [
      encryptAES(chunks[0], aesKey), // AES for chunk 1
      encryptTripleDES(chunks[1], tripleDesKey), // 3DES for chunk 2
      encryptAES(chunks[2], aesKey), // AES for chunk 3
    ];

    // Encrypt AES key with RSA
    const encryptedAESKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      aesKey
    );

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
        userId: req.body.userId,
        encryptedAESKey, // Store the encrypted AES key
        chunks: chunkPaths,
      });

      await newChunk.save();
      console.log(newChunk);
      res.json({
        message: "File uploaded, encrypted, and stored successfully.",
        chunk: newChunk,
        chunks: chunkPaths,
      });
    } catch (err) {
      console.error("Error saving chunk metadata:", err);
      res.status(500).send({ message: "Failed to save chunk metadata." });
    }
  });
});
// ✅ Decrypt Route
app.post("/decrypt/:fileName", async (req, res) => {
  const { fileName } = req.params;
  if (!fileName) {
    return res.status(400).send({ message: "Missing fileName." });
  }

  try {
    const chunkData = await Chunk.findOne({ fileName });
    if (!chunkData) {
      return res.status(404).send({ message: "File not found." });
    }

    // Decrypt AES key with RSA
  // Decrypt AES key with RSA
const decryptedAESKey = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256", // Specify the hash algorithm
  },
  chunkData.encryptedAESKey
);
    const decryptedBuffers = chunkData.chunks.map((chunk, index) => {
      const encryptedBuffer = fs.readFileSync(chunk.chunkPath);
      if (index === 1) {
        return decryptTripleDES(encryptedBuffer, tripleDesKey);
      } else {
        return decryptAES(encryptedBuffer, decryptedAESKey);
      }
    });

   const reconstructedFile = Buffer.concat(decryptedBuffers);
   res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
   res.setHeader("Content-Type", "application/octet-stream");
   res.send(reconstructedFile);
  } catch (err) {
    console.error("Error decrypting file:", err);
    res.status(500).send({ message: "Failed to decrypt file." });
  }
});


// ✅ Generate Shareable Link
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

// ✅ Shareable Files
app.get("/files/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const files = await Chunk.find({userId}, "fileName uploadDate"); // Fetch file name & upload date

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
      user: { username: user.username, email: user.email , userId: user._id, phone: user.phone },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ✅ Send OTP Route
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  console.log(phone,process.env.TWILIO_SERVICE_SID,process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN,client);
  try {
    const verification = await  client.verify.v2.services("VA9f5753a7129983d4b4103a14a05a944f")
    .verifications
    .create({to: `+91${phone}` , channel: 'sms'})
    .then(verification => console.log(verification.sid));
   
      console.log('verified:',verification);

    res.json({ success: true, verification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Verify OTP Route
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to:`+91${phone}` ,
        code: otp,
      }) 
   
      console.log('verified:',verificationCheck);

    if (verificationCheck.status === "approved") {
      res.json({ success: true, message: "OTP verified!" });
    } else {
      res.json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});


// ✅ Start the Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});








