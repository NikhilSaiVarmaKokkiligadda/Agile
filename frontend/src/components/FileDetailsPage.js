import React from "react";
import { useParams } from "react-router-dom";

const FileDetailsPage = () => {
  const { fileName } = useParams();
  // Fetch the file details from the server (you can make another API call to get the details)

  return (
    <div>
      <h2>Details for {fileName}</h2>
      {/* Display file chunk details, encryption methods, etc. */}
    </div>
  );
};

export default FileDetailsPage;
