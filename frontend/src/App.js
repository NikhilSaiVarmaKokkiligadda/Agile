import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import pages
import Home from "./components/Home";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import VerifyOtpPage from "./components/VerifyOtpPage";
import DashboardPage from "./components/DashboardPage"; // ✅ Corrected Import
import UploadPage from "./components/UploadPage";
import ChunksPage from "./components/ChunksPage";
import FileDetailsPage from "./components/FileDetailsPage";
import ManageFiles from "./components/Managefiles";
import SharePage from "./components/SharePage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />{" "}
        {/* ✅ Ensure Dashboard is registered */}
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/chunks" element={<ChunksPage />} />
        <Route path="/file-details/:fileName" element={<FileDetailsPage />} />
        <Route path="/manage-files" element={<ManageFiles />} />
        <Route path="/share/:fileId" element={<SharePage />} />
      </Routes>
    </Router>
  );
};

export default App;
