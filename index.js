const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  };

  try {
    const result = await s3.upload(params).promise();
    res.json({ url: result.Location });
  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed.');
  }
});

app.listen(3000, () => {
  console.log('Backend listening on port 3000');
});
