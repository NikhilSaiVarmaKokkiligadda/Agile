import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import "./chunks.css";

const ChunkPage = () => {
  const location = useLocation();
  const { chunks } = location.state || {}; // Get chunks from the passed state

  return (
    <div>
      <Header />
      <div className="chunk-container">
        <h2>Uploaded File Chunks</h2>

        {chunks ? (
          <div className="chunks-list">
            {chunks.map((chunk, index) => (
              <div key={index} className="chunk-box">
                <p>Chunk {index + 1}:</p>
                <ul>
                  <li>
                    <strong>Path:</strong> {chunk.chunkPath}
                  </li>
                  <li>
                    <strong>Encryption Type:</strong> {chunk.encryptionType}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>No chunks to display.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ChunkPage;
