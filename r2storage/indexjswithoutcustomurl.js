
// Load environment variables from .env file

require('dotenv').config();



const express = require('express');

const multer = require('multer');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');



// --- R2 Configuration from .env ---

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

const PROJECT_DIRECTORY = 'project-assets'; // You can hardcode this or use another ENV var



// 1. Configure the S3 Client for Cloudflare R2

const R2 = new S3Client({

    region: 'auto', // Cloudflare R2 uses 'auto'

    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,

    credentials: {

        accessKeyId: process.env.R2_ACCESS_KEY_ID,

        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,

    },

});



// 2. Configure Multer to store the file in memory (RAM)

// We use memory storage because it gives us the file buffer

// needed to directly stream the data to R2.

const upload = multer({ storage: multer.memoryStorage() });



const app = express();

const PORT = 3000;



/**

 * Uploads a file buffer to Cloudflare R2.

 * @param {Buffer} fileBuffer - The buffer of the file to upload.

 * @param {string} fileName - The desired file name (key).

 * @param {string} mimeType - The file's MIME type (e.g., 'image/png').

 * @returns {string} The public URL of the uploaded object.

 */

async function uploadFileToR2(fileBuffer, fileName, mimeType) {

    // Construct the unique Key (path) in the bucket

    // This creates the structure: <bucket>/<project-assets>/<image1>.png

    const objectKey = `${PROJECT_DIRECTORY}/${fileName}`;



    const command = new PutObjectCommand({

        Bucket: BUCKET_NAME,

        Key: objectKey,

        Body: fileBuffer,

        ContentType: mimeType,

        // Optional: Set cache control headers for performance

        CacheControl: 'max-age=31536000',

    });



    await R2.send(command);



    // Assuming your R2 bucket is public and using the R2.dev gateway

    const publicUrl = `https://pub-${ACCOUNT_ID}.r2.dev/${objectKey}`;

    return publicUrl;

}



// ---------------------------------------------------------------------

// 3. Express Route for Single Image Upload

// `upload.single('image')` expects a field named 'image' in the form data

// ---------------------------------------------------------------------

app.post('/api/upload-image', upload.single('image'), async (req, res) => {

    // Check if a file was actually uploaded

    if (!req.file) {

        return res.status(400).send('No file uploaded.');

    }



    const file = req.file;



    try {

        // Use the original filename to maintain consistency (e.g., Image1.png)

        const publicUrl = await uploadFileToR2(

            file.buffer,

            file.originalname,

            file.mimetype

        );



        console.log(`Uploaded: ${publicUrl}`);



        res.status(200).json({

            message: 'File uploaded successfully!',

            filename: file.originalname,

            url: publicUrl,

        });

    } catch (error) {

        console.error('R2 Upload Error:', error);

        res.status(500).json({ error: 'Failed to upload file to R2.' });

    }

});





// Change this:

// app.post('/api/upload-image', upload.single('image'), async (req, res) => {



// To this (handles up to 15 files under the field name 'images'):

app.post('/api/upload-multiple', upload.array('images', 15), async (req, res) => {

    if (!req.files || req.files.length === 0) {

        return res.status(400).send('No files uploaded.');

    }



    const uploadPromises = req.files.map(file =>

        uploadFileToR2(file.buffer, file.originalname, file.mimetype)

    );



    try {

        // Wait for all uploads to complete

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

});