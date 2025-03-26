import React from "react";

const Header = () => {
  return (
    <header style={styles.header}>
      <nav style={styles.navbar}>
        {/* Updated Cloud Storage Image */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/1162/1162453.png"
          alt="Secure Cloud Storage"
          style={styles.logo}
        />
        <ul style={styles.navLinks}>
          <li>
            <a href="/" style={styles.link}>
              Home
            </a>
          </li>
          <li>
            <a href="/services" style={styles.link}>
              Services
            </a>
          </li>
          <li>
            <a href="/login" style={styles.link}>
              Login
            </a>
          </li>
          <li>
            <a href="/signup" style={styles.link}>
              Sign Up
            </a>
          </li>
          <li>
            <a href="/help" style={styles.link}>
              Help
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    position: "fixed", // Make the header fixed at the top
    top: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#e3f2fd", // Light Blue
    padding: "15px 20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    zIndex: 1000, // Ensure it's on top of the content
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    height: "50px",
    width: "auto",
  },
  navLinks: {
    listStyleType: "none",
    display: "flex",
    gap: "20px",
  },
  link: {
    color: "#000000", // Dark Black
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "color 0.3s ease",
  },
};

export default Header;
