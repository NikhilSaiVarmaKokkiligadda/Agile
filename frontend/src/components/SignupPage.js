import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState(""); // Success/Error message
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    return password.length >= 6; // Example validation (min 6 characters)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!validatePassword(formData.password)) {
      setMessage("❌ Password must be at least 6 characters long.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("✅ User registered successfully! Redirecting to login...");
        setMessageType("success");

        // Redirect to login page after 2.5 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } else {
        setMessage(`❌ ${result.message}`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage("❌ An error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <br />
      <br />
      <div className="signup-container">
        <div className="signup-form">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            {["name", "email", "phone", "username", "password"].map((field) => (
              <div key={field}>
                <label htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  id={field}
                  name={field}
                  placeholder={`Enter your ${field}`}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            <button type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          {message && (
            <p
              className={
                messageType === "success" ? "success-message" : "error-message"
              }
            >
              {message}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;
