import React from 'react';

function VideoPlayer({ video }) {
  if (!video?.uid) return null;

  return (
    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
      <iframe
        src={`https://customer-drondu5fb5tb1vn2.cloudflarestream.com/${video.uid}/iframe?poster=https%3A%2F%2Fcustomer-drondu5fb5tb1vn2.cloudflarestream.com%2F${video.uid}%2Fthumbnails%2Fthumbnail.jpg`}
        loading="lazy"
        style={{
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default VideoPlayer;
