import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerLinks}>
        <Link to="/help" style={styles.link}>
          Help
        </Link>
        <Link to="/privacy-policy" style={styles.link}>
          Privacy Policy
        </Link>
        <Link to="/terms" style={styles.link}>
          Terms & Conditions
        </Link>
        <Link to="/raise-ticket" style={styles.link}>
          Raise a Ticket
        </Link>
      </div>
      <p style={styles.footerText}>
        &copy; 2025 Agile Cloud Encryption. All Rights Reserved.
      </p>
    </footer>
  );
};

// Inline styles with animations
const styles = {
  footer: {
    backgroundColor: "#e3f2fd",
    color: "#000", // Change text color to black for the footer text
    padding: "10px 20px",
    textAlign: "center",
    position: "fixed",
    bottom: "0",
    width: "100%",
    boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
    animation: "slideUp 0.5s ease-out",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginBottom: "10px",
  },
  link: {
    color: "#000", // Change link color to black
    textDecoration: "none",
    fontWeight: "bold",
    transition: "color 0.3s, transform 0.3s",
  },
  footerText: {
    fontSize: "14px",
    marginTop: "10px",
    animation: "fadeIn 1s ease-in-out",
  },

  // Animations
  "@keyframes slideUp": {
    "0%": { transform: "translateY(100%)" },
    "100%": { transform: "translateY(0)" },
  },

  "@keyframes fadeIn": {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
};

// Adding hover effect for the links
styles.linkHover = {
  ":hover": {
    color: "#4caf50", // This will change the color to green when hovered
    transform: "scale(1.1)",
  },
};

export default Footer;
