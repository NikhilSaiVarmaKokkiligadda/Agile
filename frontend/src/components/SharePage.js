import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`https://agileservers.vercel.app/share/${fileId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFile(data);
        } else {
          setError(data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load file.");
        setLoading(false);
      });
  }, [fileId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Shared File: {file.fileName}</h2>
      <a href={file.downloadURL} download>
        <button>Download</button>
      </a>
    </div>
  );
};

export default SharePage;
