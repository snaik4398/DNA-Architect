// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// --- R2 Configuration from .env ---
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_CUSTOM_DOMAIN = process.env.R2_CUSTOM_DOMAIN; // ⬅️ NEW: Custom Domain Variable
const PROJECT_DIRECTORY = 'project-assets';

// 1. Configure the S3 Client for Cloudflare R2 (No Change Needed Here)
// NOTE: Uploads MUST use the cloudflarestorage.com endpoint, not the custom domain.
const R2 = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

// 2. Configure Multer (No Change Needed)
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 3000;

/**
 * Uploads a file buffer to Cloudflare R2.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} fileName - The desired file name (key).
 * @param {string} mimeType - The file's MIME type (e.g., 'image/png').
 * @returns {string} The custom domain URL of the uploaded object.
 */
async function uploadFileToR2(fileBuffer, fileName, mimeType) {
    // Construct the unique Key (path) in the bucket
    const objectKey = `${PROJECT_DIRECTORY}/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: mimeType,
        CacheControl: 'max-age=31536000',
    });

    // await R2.send(command);
    const r2Response = await R2.send(command);

    // ⬅️ Modification: Log the response object
    console.log("--- R2 PUT Object Response ---");
    console.log(r2Response);
    console.log("------------------------------");


    console.log(`##Uploaded: ${objectKey}`);
    console.log(`##Bucket: ${BUCKET_NAME}`);
    console.log(`##Custom Domain: ${R2_CUSTOM_DOMAIN}`);


    // ⬅️ MODIFICATION HERE: Construct the URL using the custom domain
    // R2_CUSTOM_DOMAIN already includes https://
    const publicUrl = `${R2_CUSTOM_DOMAIN}/${objectKey}`;
    return publicUrl;
}

// ---------------------------------------------------------------------
// Express Route for Single Image Upload (No further changes needed)
// ---------------------------------------------------------------------
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    // ... (rest of the /api/upload-image route remains the same)
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const file = req.file;

    try {
        const publicUrl = await uploadFileToR2(
            file.buffer,
            file.originalname,
            file.mimetype
        );

        console.log(`Uploaded: ${publicUrl}`);

        res.status(200).json({
            message: 'File uploaded successfully!',
            filename: file.originalname,
            url: publicUrl, // This will now be the custom domain URL
        });
    } catch (error) {
        console.error('R2 Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload file to R2.' });
    }
});


// Express Route for Multiple Upload (No changes needed, as it calls the updated uploadFileToR2)
app.post('/api/upload-multiple', upload.array('images', 15), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    const uploadPromises = req.files.map(file =>
        uploadFileToR2(file.buffer, file.originalname, file.mimetype)
    );

    try {
        const urls = await Promise.all(uploadPromises);

        res.status(200).json({
            message: 'All files uploaded successfully!',
            urls: urls,
        });
    } catch (error) {
        console.error('Batch R2 Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload some files to R2.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`R2 Bucket: ${BUCKET_NAME}`);
    console.log(`Custom Domain: ${R2_CUSTOM_DOMAIN}`);
});