import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Home.css";

const Home = () => {
  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: 'url("./components/Images/cloud.jpg")',
      }}
    >
      <Header />
      <main style={styles.main}>
        <h1 style={styles.title}>
          <br />
          <br />
          <br />
          <br />
          Welcome to Agile Cloud Encryption
        </h1>
        <p style={styles.description}>
          Secure your files with cutting-edge encryption technologies.
        </p>
        <div style={styles.buttonContainer}>
          <a href="/login" style={styles.link}>
            <button style={styles.button}>Login</button>
          </a>
          <a href="/signup" style={styles.link}>
            <button style={styles.button}>Sign Up</button>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // To add a dark overlay to the image
  },
  main: {
    flex: 1,
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "rgba(15, 75, 92, 0.8)", // Transparent background for a smooth overlay
    color: "white", // Ensure text is visible on dark background
    borderRadius: "10px",
    margin: "0 auto",
    width: "90%",
    maxWidth: "800px", // Limit width for better readability on large screens
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // Subtle shadow for depth
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "20px",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },
  description: {
    fontSize: "1.5rem",
    marginTop: "20px",
    marginBottom: "40px",
    lineHeight: "1.5",
    maxWidth: "700px",
    margin: "0 auto",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap", // For responsiveness on smaller screens
  },
  button: {
    padding: "15px 30px",
    fontSize: "1.2rem",
    backgroundColor: "#0d6efd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease-in-out",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  buttonHover: {
    transform: "scale(1.05)",
  },
  link: {
    textDecoration: "none",
  },
};

export default Home;
