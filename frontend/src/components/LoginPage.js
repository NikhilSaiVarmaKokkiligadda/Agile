import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("https://agileservers.vercel.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("Result Object:", result);
      
        // Accessing nested user object
        const { userId, username, email, phone } = result.user;
      
        // ✅ Save correct values to localStorage
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        localStorage.setItem("phone", phone);
        navigate("/upload");
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
