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
        <Link to={`/video/${video.guid}`} key={video.guid} className="video-item">
          <div className="video-thumbnail">
            <img src={`https://vz-137e7755-f54.b-cdn.net/78c93fdb-82ab-4c7b-95e4-65a3d5780508/${video.thumbnailFileName}`} alt={video.title || 'Video thumbnail'} />
            <span className="video-duration">{Math.round(video.duration)}s</span>
            <div className="video-status">{video.status.state}</div>
          </div>
          <div className="video-info">
            <h3>{video.title || 'Untitled Video'}</h3>
            <p className="video-date">{new Date(video.created).toLocaleDateString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default VideoList;