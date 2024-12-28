const express = require('express');
const router = express.Router();
const categoryControllers = require('../Controllers/category');
const multer = require('multer');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');

// Define storage for category image (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
                        .resize(maxWidth || 800, maxHeight || 800, {
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

async function compressAndSaveCategoryImage(file, destinationPath, options = {}) {
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
            maxWidth: options.maxWidth || 800,
            maxHeight: options.maxHeight || 800
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

// Create category with image compression
router.post('/create', upload.single('CategoryImage'), async (req, res, next) => {
    try {
        if (req.file) {
            try {
                const filename = await compressAndSaveCategoryImage(
                    req.file,
                    './public/images/category',
                    {
                        quality: 95,
                        maxWidth: 800,
                        maxHeight: 800
                    }
                );
                req.file.filename = filename;
            } catch (error) {
                console.error('Error processing category image:', error);
                return res.status(500).json({
                    error: 'Failed to process category image',
                    details: error.message
                });
            }
        }

        // Call the category creation controller
        categoryControllers.Create(req, res, next);
    } catch (error) {
        console.error('Error during category creation:', error);
        next(error);
    }
});

// Find categories
router.post('', upload.none(), categoryControllers.Found);

// Read category
router.post('/read', categoryControllers.Read);

// Update category with image compression
router.patch('/update/:id', upload.single('CategoryImage'), async (req, res, next) => {
    try {
        if (req.file) {
            try {
                const filename = await compressAndSaveCategoryImage(
                    req.file,
                    './public/images/category',
                    {
                        quality: 95,
                        maxWidth: 800,
                        maxHeight: 800
                    }
                );
                req.file.filename = filename;
            } catch (error) {
                console.error('Error processing category image:', error);
                return res.status(500).json({
                    error: 'Failed to process category image',
                    details: error.message
                });
            }
        }

        // Call the category update controller
        categoryControllers.Update(req, res, next);
    } catch (error) {
        console.error('Error during category update:', error);
        next(error);
    }
});

// Delete category
router.delete('/delete/:id', categoryControllers.Delete);

module.exports = router;