import React, { useState, useEffect } from 'react';

function VideoPlayer({ video }) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Reset loading state when a new video is loaded
    if (video?.guid) {
      setIsLoading(true);
    }
  }, [video?.guid]);

  if (!video?.guid) return null;

  // Extract the library ID from environment or pass it as a prop
  const BUNNY_STREAM_LIBRARY_ID = '408622'; // This should be passed as a prop or from environment

  return (
    <div className="video-player-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
      
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${BUNNY_STREAM_LIBRARY_ID}/${video.guid}`}
          loading="lazy"
          style={{
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export default VideoPlayer;