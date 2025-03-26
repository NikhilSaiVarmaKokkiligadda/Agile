const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signup); // POST route to handle user signup
router.post("/login", authController.login); // POST route to handle user login

module.exports = router;
