import { Storage } from '@google-cloud/storage';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// --- Local Storage Setup ---
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- GCP Storage Setup ---
// Assumes gcp-key.json is in the server root or configured via env
// Only initialize if we are likely to use it or let it fail gracefully if key is missing when used
const gcpKeyPath = path.join(__dirname, '../../gcp-key.json');
let storage: Storage | null = null;
let bucket: any = null;

if (fs.existsSync(gcpKeyPath) || process.env.GCP_PROJECT_ID) {
    try {
        storage = new Storage({
            keyFilename: fs.existsSync(gcpKeyPath) ? gcpKeyPath : undefined,
            projectId: process.env.GCP_PROJECT_ID,
        });
        const bucketName = process.env.GCP_BUCKET_NAME || 'dna-architect-assets';
        bucket = storage.bucket(bucketName);
    } catch (error) {
        console.warn('Failed to initialize GCP Storage:', error);
    }
}

// --- Cloudflare R2 Setup ---
let r2Client: S3Client | null = null;
if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    try {
        r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });
    } catch (error) {
        console.warn('Failed to initialize R2 Client:', error);
    }
}

export const uploadToLocal = async (file: Express.Multer.File, folder: string): Promise<string> => {
    if (!file) return '';

    const targetFolder = path.join(uploadDir, folder);
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const filePath = path.join(targetFolder, fileName);

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, file.buffer, (err) => {
            if (err) {
                reject(err);
            } else {
                // Return relative path for serving
                resolve(`/uploads/${folder}/${fileName}`);
            }
        });
    });
};

export const uploadToGCP = async (file: Express.Multer.File, folder: string): Promise<string> => {
    if (!file) return '';
    if (!bucket) throw new Error('GCP Storage not initialized');

    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
        resumable: false,
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);
    });
};

export const uploadToR2 = async (file: Express.Multer.File, folder: string): Promise<string> => {
    if (!file) return '';
    if (!r2Client) throw new Error('R2 Client not initialized');

    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrlBase = process.env.R2_PUBLIC_URL;

    if (!bucketName) throw new Error('R2_BUCKET_NAME not configured');

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        await r2Client.send(command);
        // Return public URL if configured, otherwise construct it (assuming public access or worker)
        if (publicUrlBase) {
            return `${publicUrlBase}/${fileName}`;
        }
        return `https://${bucketName}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;
    } catch (error) {
        console.error('R2 Upload Error:', error);
        throw error;
    }
};

export const uploadFile = async (file: Express.Multer.File, folder: string): Promise<string> => {
    const provider = process.env.STORAGE_PROVIDER || 'local';

    if (provider === 'gcp') {
        return uploadToGCP(file, folder);
    } else if (provider === 'r2') {
        return uploadToR2(file, folder);
    } else {
        return uploadToLocal(file, folder);
    }
};
