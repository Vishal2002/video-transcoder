import React, { useState } from 'react';
import axios from 'axios';
import './VideoUpload.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function VideoUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      
      setSuccess(true);
      setUploading(false);
      setFile(null);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setUploading(false);
      console.error(err);
    }
  };

  return (
    <div className="video-upload">
      <h2>Upload Video</h2>
      
      <form onSubmit={handleUpload}>
        <div className="file-input-container">
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && <p className="file-name">{file.name}</p>}
        </div>
        
        <button 
          type="submit" 
          disabled={!file || uploading}
          className={uploading ? 'uploading' : ''}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
        
        {uploading && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Video uploaded successfully! Now processing...</p>}
      </form>
    </div>
  );
}

export default VideoUpload;