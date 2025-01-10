const express = require('express');
const router = express.Router();
const galleryControllers = require('../Controllers/gallery');
const multer = require('multer');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');

// Define storage for the gallery file (in memory)
const storageGallery = multer.memoryStorage();
const uploadGallery = multer({ storage: storageGallery });

function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`
            const { parentPort, workerData } = require('worker_threads');
            const sharp = require('sharp');
            const path = require('path');
            const fs = require('fs');

            // Image compression function running in worker thread
            async function compressImage(data) {
                const { buffer, outputPath, quality, maxWidth, maxHeight } = data;
                
                try {
                    await sharp(buffer)
                        .jpeg({ quality: quality || 95 })
                        .resize(maxWidth || 1200, maxHeight || 1200, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .toFile(outputPath);

                    return true;
                } catch (error) {
                    throw error;
                }
            }

            // Handle messages from main thread
            parentPort.on('message', async (data) => {
                try {
                    await compressImage(data);
                    parentPort.postMessage({ success: true });
                } catch (error) {
                    parentPort.postMessage({ error: error.message });
                }
            });
        `, { eval: true });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });

        worker.postMessage(workerData);
    });
}

async function compressAndSaveGalleryImage(file, destinationPath, options = {}) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + '.jpg';
    const outputPath = path.join(destinationPath, filename);

    // Ensure destination directory exists
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    try {
        // Run compression in worker thread
        await runWorker({
            buffer: file.buffer,
            outputPath,
            quality: options.quality || 95,
            maxWidth: options.maxWidth || 1200,
            maxHeight: options.maxHeight || 1200
        });

        return filename;
    } catch (error) {
        // Clean up file in case of error
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        throw error;
    }
}

// Create gallery with compression
router.post('/create', uploadGallery.fields([
    { name: 'Gallery', maxCount: 1 },
    { name: 'GalleryImage', maxCount: 1 }
]), async (req, res, next) => {
    try {
        try {
            if (req.files && req.files['GalleryImage'] && req.files['GalleryImage'][0]) {
                const galleryImageFile = req.files['GalleryImage'][0];
                const filename = await compressAndSaveGalleryImage(
                    galleryImageFile,
                    './public/images/gallery',
                    {
                        quality: 95,
                        maxWidth: 1200,
                        maxHeight: 1200
                    }
                );
                req.files['GalleryImage'][0].filename = filename;
            }


            // Call the gallery creation controller
            galleryControllers.CreateGallery(req, res, next);
        } catch (error) {
            console.error('Error processing gallery image:', error);
            return res.status(500).json({
                error: 'Failed to process gallery image',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Error during gallery creation:', error);
        next(error);
    }
});

// Update gallery with compression
router.patch('/update/:id', uploadGallery.fields([
    { name: 'Gallery', maxCount: 1 },
    { name: 'GalleryImage', maxCount: 1 }
]), async (req, res, next) => {
    try {
        if (req.files?.['GalleryImage']) {
            const galleryImageFile = req.files['GalleryImage'][0];
            try {
                const filename = await compressAndSaveGalleryImage(
                    galleryImageFile,
                    './public/images/gallery',
                    {
                        quality: 95,
                        maxWidth: 1200,
                        maxHeight: 1200
                    }
                );
                req.files['GalleryImage'][0].filename = filename;
            } catch (error) {
                console.error('Error processing gallery image:', error);
                return res.status(500).json({
                    error: 'Failed to process gallery image',
                    details: error.message
                });
            }
        }

        // Call the gallery update controller
        galleryControllers.UpdateGallery(req, res, next);
    } catch (error) {
        console.error('Error during gallery update:', error);
        next(error);
    }
});

// Read gallery
router.post('/read', galleryControllers.ReadGallery);

// Delete gallery
router.delete('/delete/:id', galleryControllers.DeleteGallery);

module.exports = router;