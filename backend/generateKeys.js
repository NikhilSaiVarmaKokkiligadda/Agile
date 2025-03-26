const crypto = require("crypto");
const fs = require("fs");

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048, // Key size
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: "your-secure-passphrase",
  },
});

// Save keys to files
fs.writeFileSync("public_key.pem", publicKey);
fs.writeFileSync("private_key.pem", privateKey);

console.log("✅ RSA Key Pair Generated Successfully!");
