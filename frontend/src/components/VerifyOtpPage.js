import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Footer from "./Footer"; // Import Footer
import Header from "./Header"; // Import Header
import "./VerifyOtp.css";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(""); // Success/Error messages
  const [loading, setLoading] = useState(false); // Loading state
  const [phone, setPhone] = useState(""); // Phone number from storage
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Retrieve phone number from localStorage
  useEffect(() => {
    const storedPhone = localStorage.getItem("userPhone");
    if (!storedPhone) {
      setMessage("⚠️ No phone number found. Please login again.");
    }
    setPhone(storedPhone);
  }, []);

  // Function to Request OTP
  const requestOtp = async () => {
    setLoading(true);
    setMessage("🔄 Sending OTP...");
    try {
      const response = await fetch("https://agileservers.vercel.app/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }), // Send phone number to backend
      });

      const result = await response.json();
      if (result.success) {
        setMessage("✅ OTP sent successfully!");
      } else {
        setMessage("⚠️ Failed to send OTP. Try again.");
      }
    } catch (error) {
      setMessage("⚠️ An error occurred while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Function to Verify OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate OTP (must be a 6-digit number)
    if (!/^\d{6}$/.test(otp)) {
      setMessage("⚠️ OTP must be a 6-digit number.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://agileservers.vercel.app/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }), // Send phone & OTP
      });

      const result = await response.json();

      if (result.success) {
        setMessage("✅ OTP Verified! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard"); // Redirect after 2 seconds
        }, 2000);
      } else {
        setMessage("❌ Invalid OTP. Please try again.");
      }
    } catch (error) {
      setMessage("⚠️ An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="verify-otp-container">
        <div className="verify-otp-form">
          <h2>Verify OTP</h2>
          {phone ? (
            <>
              <button onClick={requestOtp} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <form onSubmit={handleSubmit}>
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  pattern="\d{6}"
                  placeholder="Enter 6-digit OTP"
                  required
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            </>
          ) : (
            <p>⚠️ Please login again to receive an OTP.</p>
          )}

          {/* Display success/error message */}
          {message && <p>{message}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyOtpPage;
