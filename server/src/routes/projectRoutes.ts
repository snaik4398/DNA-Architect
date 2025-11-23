import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { uploadFile } from '../utils/storage';

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer for memory storage (we need buffers)
const upload = multer({ storage: multer.memoryStorage() });

// Get all projects (thumbnails only)
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                location: true,
                thumbnailBlob: true, // Send the blob
            }
        });

        // Convert Buffer to Base64 for frontend display if needed, 
        // or send as is and let frontend handle it.
        // Here we'll map it to a base64 string for easier consumption.
        const projectsWithBase64 = projects.map(p => ({
            ...p,
            thumbnail: `data:image/jpeg;base64,${p.thumbnailBlob.toString('base64')}`,
            thumbnailBlob: undefined // Remove raw buffer from response
        }));

        res.json(projectsWithBase64);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get single project details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// Create new project
router.post('/', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 15 },
    { name: 'model', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, architectName, areaSqFt, location, description, youtubeUrl } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files['thumbnail'] || !files['thumbnail'][0]) {
            return res.status(400).json({ error: 'Thumbnail is required' });
        }

        // Validate image count (5-15)
        const projectImages = files['images'] || [];
        if (projectImages.length < 2 || projectImages.length > 15) {
            return res.status(400).json({ error: 'Please upload between 2 and 15 project images.' });
        }

        const thumbnailBuffer = files['thumbnail'][0].buffer;

        // Upload assets
        let mainImageUrl = '';
        let modelUrl = '';
        let simulationVideoUrl = '';
        const imageUrls: string[] = [];

        if (files['mainImage']) {
            mainImageUrl = await uploadFile(files['mainImage'][0], 'images');
        }

        // Upload multiple images
        for (const file of projectImages) {
            const url = await uploadFile(file, 'images');
            imageUrls.push(url);
        }

        if (files['model']) {
            modelUrl = await uploadFile(files['model'][0], 'models');
        }
        if (files['video']) {
            simulationVideoUrl = await uploadFile(files['video'][0], 'videos');
        }

        const newProject = await prisma.project.create({
            data: {
                title,
                architectName,
                areaSqFt: parseFloat(areaSqFt),
                location,
                description,
                thumbnailBlob: thumbnailBuffer,
                mainImageUrl,
                images: imageUrls,
                modelUrl,
                youtubeUrl,
                simulationVideoUrl,
            },
        });

        res.status(201).json(newProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Note: In a real app, we should also delete files from GCP here.
        await prisma.project.delete({
            where: { id },
        });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

export default router;
