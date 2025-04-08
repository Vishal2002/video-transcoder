// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import VideoList from './components/VideoList';
import './App.css';
import 'video.js/dist/video-js.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Video Transcoding Platform</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/videos`);
      setVideos(response.data.videos);
      setLoading(false);
    } catch (err) {
      setError('Failed to load videos');
      setLoading(false);
      console.error(err);
    }
  };

  const handleUploadSuccess = () => {
    fetchVideos();
  };

  return (
    <div className="home">
      <VideoUpload onUploadSuccess={handleUploadSuccess} />
      
      <div className="video-list-container">
        <h2 style={{color:'white'}} >Your Videos</h2>
        {loading ? (
          <p>Loading videos...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <VideoList videos={videos} />
        )}
      </div>
    </div>
  );
}

function VideoDetails() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoId = window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/video/${videoId}`);
        console.log(response.data,"res");
        setVideo(response.data.video);
        setLoading(false);
      } catch (err) {
        setError('Failed to load video details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  if (loading) return <div>Loading video details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!video) return <div>Video not found</div>;

  return (
    <div className="video-details">
      <h2 style={{color:'white'}} >{video.meta?.name || 'Untitled Video'}</h2>
      <VideoPlayer video={video} />
      <div style={{color:'black'}} className="video-info">
        <p>Status: {video.status.state}</p>
        <p>Duration: {Math.round(video.duration)} seconds</p>
        <p>Uploaded: {new Date(video.created).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default App;