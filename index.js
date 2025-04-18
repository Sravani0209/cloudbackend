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

app.get('/images', async (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET
  };

  try {
    const data = await s3.listObjectsV2(params).promise();

    const images = data.Contents.map((item) => {
      return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`;
    });

    res.send(images);
  } catch (err) {
    console.error('S3 List Error:', err);
    res.status(500).send('Failed to list images.');
  }
});


app.listen(3000, () => {
  console.log('Backend listening on port 3000');
});
