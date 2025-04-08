// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Upload to R2
async function uploadToR2(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath);
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: 'video/mp4',
  });

  return r2Client.send(command);
}


// Routes
app.post('/upload', upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      console.log('File received:', req.file.path, 'Size:', req.file.size);
      
      // 1. Upload to R2 for backup/archive
      await uploadToR2(req.file.path, req.file.filename);
      console.log('Uploaded to R2 successfully');
      
      // 2. Get the R2 URL for the uploaded file
      const r2Url = `https://${process.env.R2_PUBLIC_DOMAIN}/${req.file.filename}`;
      
      // 3. Tell Cloudflare Stream to copy from R2 instead of uploading directly
      // This approach is more reliable for large files
      const videoData = await copyFromR2ToStream(r2Url, req.file.originalname);
      console.log('Stream transcoding initiated successfully');
      
      // Delete local file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: 'Video uploaded and processing',
        videoId: videoData.uid,
        videoData
      });
    } catch (error) {
      console.error('Error in upload process:', error);
      
      // Clean up the file if it exists
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      
      res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
  });
  
  // Function to copy from R2 to Stream
  async function copyFromR2ToStream(sourceUrl, videoName) {
    try {
      console.log('Initiating copy from R2 to Stream...');
      
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/copy`,
        {
          url: sourceUrl,
          meta: {
            name: videoName
          },
          requireSignedURLs: false // Set to true for better security if needed
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Copy to Stream initiated successfully');
      return response.data.result;
    } catch (error) {
      console.error('Error copying to Stream:', error.response ? error.response.data : error);
      throw error;
    }
  }
// Get video info
app.get('/video/:videoId', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${req.params.videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    res.json({ success: true, video: response.data.result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get video info', error: error.message });
  }
});

// Get all videos
app.get('/videos', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    res.json({ success: true, videos: response.data.result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get videos', error: error.message });
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});