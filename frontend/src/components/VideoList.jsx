import React from 'react';
import { Link } from 'react-router-dom';
import './VideoList.css';

function VideoList({ videos }) {
  if (!videos || videos.length === 0) {
    return <p>No videos found. Upload your first video!</p>;
  }

  return (
    <div className="video-list">
      {videos.map((video) => (
        <Link to={`/video/${video.uid}`} key={video.uid} className="video-item">
          <div className="video-thumbnail">
            <img src={video.thumbnail} alt={video.meta?.name || 'Video thumbnail'} />
            <span className="video-duration">{Math.round(video.duration)}s</span>
            <div className="video-status">{video.status.state}</div>
          </div>
          <div className="video-info">
            <h3>{video.meta?.name || 'Untitled Video'}</h3>
            <p className="video-date">{new Date(video.created).toLocaleDateString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default VideoList;