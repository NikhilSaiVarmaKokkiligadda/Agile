import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "./upload.css";

const UploadPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedChunks, setUploadedChunks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFile(null);
    setFileName("");
    setFileType("");
    setUploadSuccess(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileType(selectedFile.type);
    }
  };

  const validateFile = () => {
    const allowedFileTypes = {
      Audio: ["audio/mp3", "audio/wav", "audio/aac"],
      Video: ["video/mp4", "video/avi", "video/mov"],
      Photo: ["image/png", "image/jpeg", "image/svg+xml"],
      PDF: [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    };

    if (!file) {
      alert("Please select a file to upload.");
      return false;
    }

    if (!allowedFileTypes[selectedCategory].includes(fileType)) {
      alert(`Invalid file type for ${selectedCategory}.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFile()) {
      return;
    }

    setUploading(true);
    setUploadSuccess(false); const userid = localStorage.getItem("userId");
  
    if (!userid) {
      console.error("User ID is not found in localStorage.");
      setUploading(false);
      return;
    }
  
    console.log("User ID:", userid);
    console.log(userid);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userid);
    formData.append("category", selectedCategory);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
     
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setUploadedChunks(result.chunks);
        setUploadSuccess(true);
        setUploading(false);
        setTimeout(() => {
          navigate("/chunks", { state: { chunks: result.chunks } });
        }, 2000);
      } else {
        alert("File upload failed: " + result.message);
        setUploading(false);
      }
    } catch (error) {
      alert("Error uploading file: " + error.message);
      setUploading(false);
    }
  };

  const handleManageFiles = () => {
    navigate("/manage-files"); // Redirect to Manage Files page
  };

  return (
    <div>
      <Header />
      <div className="upload-container">
        <div className="upload-header">
          <h2>Upload Your File</h2>
          <div className="categories">
            <button onClick={() => handleCategoryChange("Audio")}>
              Audio (MP3, WAV, AAC)
            </button>
            <button onClick={() => handleCategoryChange("Video")}>
              Video (MP4, AVI, MOV)
            </button>
            <button onClick={() => handleCategoryChange("Photo")}>
              Photo (PNG, JPG, SVG)
            </button>
            <button onClick={() => handleCategoryChange("PDF")}>
              PDF/Text (PDF, TXT, DOCX)
            </button>
          </div>
        </div>

        {selectedCategory && (
          <div className="upload-section">
            <h3>Upload a {selectedCategory} File</h3>
            <form onSubmit={handleSubmit}>
              <div className="file-input-container">
                <input
                  type="file"
                  accept={
                    selectedCategory === "Audio"
                      ? ".mp3, .wav, .aac"
                      : selectedCategory === "Video"
                      ? ".mp4, .avi, .mov"
                      : selectedCategory === "Photo"
                      ? ".png, .jpg, .svg"
                      : ".pdf, .txt, .docx"
                  }
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
              {file && (
                <div className="file-info">
                  <p>
                    <b>Selected File:</b> {fileName}
                  </p>
                </div>
              )}
              <button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            {uploadSuccess && (
              <div className="success-message">
                <p>File uploaded successfully! Redirecting...</p>
              </div>
            )}
          </div>
        )}

        <div className="manage-files-btn-container">
          <button
            onClick={handleManageFiles}
            className="manage-files-btn"
            disabled={uploading}
          >
            Manage Files
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadPage;
