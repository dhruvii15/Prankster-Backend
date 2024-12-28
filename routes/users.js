const express = require('express');
const router = express.Router();
const userControllers = require('../Controllers/users');
const coverControllers = require('../Controllers/cover');
const prankControllers = require('../Controllers/prank');
const audioControllers = require('../Controllers/audio');
const adminControllers = require('../Controllers/admin');
const notificationControllers = require('../Controllers/notification');
const multer = require('multer');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs').promises;

// Define storage for uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`
            const { parentPort, workerData } = require('worker_threads');
            const sharp = require('sharp');
            const path = require('path');
            const fs = require('fs').promises;

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

async function compressAndSaveImage(file, destinationPath, options = {}) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + '.jpg';
    const outputPath = path.join(destinationPath, filename);

    // Ensure destination directory exists
    try {
        await fs.mkdir(destinationPath, { recursive: true });
    } catch (error) {
        console.error('Error creating directory:', error);
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
        try {
            await fs.unlink(outputPath);
        } catch (unlinkError) {
            console.error('Error cleaning up file:', unlinkError);
        }
        throw error;
    }
}

// ================================= Cover page ===============================
router.post('/cover/create', upload.array('CoverURL', 5), async (req, res, next) => {
    try {
        const compressedFiles = [];

        // Process each uploaded file in parallel
        const compressionPromises = req.files.map(file => 
            compressAndSaveImage(file, './public/images/cover')
                .then(filename => compressedFiles.push(filename))
        );

        await Promise.all(compressionPromises);
        req.compressedFiles = compressedFiles;
        
        coverControllers.Create(req, res, next);
    } catch (error) {
        console.error('Error processing cover images:', error);
        next(error);
    }
});

router.post('/cover/emoji', upload.none(), coverControllers.Emoji);

router.post('/cover/realistic', upload.none(), coverControllers.Realistic);

router.post('/cover/read', coverControllers.Read);

router.patch('/cover/update/:id', upload.single('CoverURL'), async (req, res, next) => {
    try {
        const compressedFiles = [];
        if (req.file) {
            const filename = await compressAndSaveImage(req.file, './public/images/cover');
            compressedFiles.push(filename);
        }

        req.compressedFiles = compressedFiles;
        coverControllers.Update(req, res, next);
    } catch (error) {
        console.error('Error updating cover:', error);
        next(error);
    }
});

router.delete('/cover/delete/:id', coverControllers.Delete);

router.post('/cover/TagName/read', coverControllers.ReadTagName);

// =============================== Category ==============================
router.post('/category/all', upload.none(), audioControllers.FoundAudio);

// =============================== user upload ================================
router.post('/users/read', userControllers.UserRead);

router.delete('/users/delete/:id', userControllers.UserDelete);

// ==================================== Spin ======================================
router.post('/spin', upload.none(), userControllers.Spin);

// ========================================= Share =============================================
router.get('/public/images/cover/:id/:imageName', prankControllers.Share);

router.get('/public/images/user/:id/:imageName', prankControllers.UserShare);

router.get('/public/images/adminPrank/:id/:imageName', adminControllers.Share);

// ========================================= Notification =============================================
router.post('/notification/create', notificationControllers.Create);

router.post('/notification/read', notificationControllers.Read);

router.patch('/notification/update/:id', notificationControllers.Update);

router.delete('/notification/delete/:id', notificationControllers.Delete);

module.exports = router;