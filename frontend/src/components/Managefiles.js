import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import "./Managefiles.css";
import ThreeCloudsAnimation from "./animation";
const ManageFiles = () => {
  const [files, setFiles] = useState([]);
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [actionType, setActionType] = useState(""); // 'download' or 'share'
  const [loading, setLoading] = useState(true);
  const [shareLinks, setShareLinks] = useState({}); // Store links per file
  const [showAnimation, setShowAnimation] = useState(false);
 const [fil, setFile] = useState("");
 const [file, setFileName] = useState("");
  useEffect(() => {
  
   openOtpModal();

  }, []);
  const onComplete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/decrypt/${file}`, {
        method: "POST",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch the file");
      }
  
      // Convert the response to a blob
      const blob = await response.blob();
  
      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file; // Use the file name for the download
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error retrieving file. Please try again.");
    } finally {
      // Hide the animation after 5 seconds
      setTimeout(() => {
        setShowAnimation(false);
      }, 5000);
    }
  };
  // Generate shareable link with expiration
  const handleShare = (fileId) => {
    fetch(`http://localhost:5000/generate-share-link/${fileId}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShareLinks((prev) => ({ ...prev, [fileId]: data.shareLink }));

          // Copy share link to clipboard
          if (navigator.clipboard) {
            navigator.clipboard
              .writeText(data.shareLink)
              .then(() => alert("Share link copied to clipboard!"))
              .catch(() => alert("Failed to copy link. Please copy manually."));
          }
        } else {
          alert("Failed to generate share link.");
        }
      })
      .catch((err) => console.error("Error generating share link:", err));
  };

  // 🔹 Handle secure file reconstruction and download
  const handleDownload = async (fileId, fileName) => {setShowAnimation(true);
    setFileName(fileName);
    setFile(fileId);
    //setShowAnimation(true);
    //setActionType("download");
    //setSelectedFile(fileId);
    //openOtpModal();
    //setShowAnimation(true);
  };

  const handleOtpSubmit = async () => {
    if (otp.trim().length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({otp: otp ,phone: localStorage.getItem("phone")}),
      });

      const result = await response.json();

      if (result.success) {
        alert("OTP verified successfully.");
        setShowOtpModal(false);
        setOtp("");   
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found in localStorage");
          setLoading(false);
          return;
        }
    
        fetch(`http://localhost:5000/files/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFiles(data.files);
          } else {
            console.error("No files found");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching files:", err);
          setLoading(false);
        });
      } else {
        alert("Invalid OTP. Please try again.");
        setOtp("");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtp("");
      alert("Error verifying OTP. Please try again.");
    }
  };

  // Function to send OTP to user's mobile/email
const sendOtp = async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID not found.");
      return;
    }

    const response = await fetch("http://localhost:5000/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({userId: userId, phone: localStorage.getItem("phone") }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("OTP sent successfully.");
      alert("OTP sent to your registered mobile.");
    } else {
      alert("Failed to send OTP. Please try again.");
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    alert("Error sending OTP. Please try again.");
  }
};

// Open OTP modal and send OTP
const openOtpModal = () => {
  setShowOtpModal(true);
  sendOtp(); // Call sendOtp when the modal is triggered
};
  return (
    <div>
      <div className="container">
        <h2>📂 Manage Uploaded Files</h2>

        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No files found.</p>
        ) : (
          <table border="1">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Upload Date</th>
                <th>Download</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>{file.fileName}</td>
                  <td>
                    {file.uploadDate
                      ? new Date(file.uploadDate).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDownload(file._id, file.fileName)}
                    >
                      Download
                    </button>
                  </td>
                  <td>
                    <button
                      className="share-button"
                      onClick={() => handleShare(file._id)}
                    >
                      Share
                    </button>
                    {shareLinks[file._id] && (
                      <div className="share-link">
                        <input
                          type="text"
                          value={shareLinks[file._id]}
                          readOnly
                        />
                        <small>Expires in 10 minutes</small>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
           {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <h3>🔒 Enter OTP to {actionType === "download" ? "Download" : "Share"}</h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
            />
            <div className="button-group">
              <button className="btn-success" onClick={handleOtpSubmit}>
                Submit
              </button>
              <button className="btn-danger" onClick={() => setShowOtpModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        {showAnimation && (
        <div className="otp-modal" >
      <div style={{ backgroundColor: "rgba(255, 255, 255, 0.99)", color: "white", borderRadius: "1rem", width:"600px",height:"500px", alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <ThreeCloudsAnimation onComplete={onComplete}/>
   </div>
        </div>
      )}

      </div>
      <Footer />
    </div>
  );
};

export default ManageFiles;




