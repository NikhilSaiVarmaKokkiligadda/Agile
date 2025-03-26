require("dotenv").config();
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send OTP
exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  try {

    const verification = await client.verify
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms", // Can be 'sms' or 'call'
      });
      console.log('verified:',verification);

    res.json({ success: true, verification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const verificationCheck = await client.verify
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${phone}`,
        code: otp,
      });

    if (verificationCheck.status === "approved") {
      res.json({ success: true, message: "OTP verified!" });
    } else {
      res.json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
