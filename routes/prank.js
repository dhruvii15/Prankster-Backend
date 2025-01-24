const express = require('express');
const router = express.Router();
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const prankControllers = require('../Controllers/prank');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs').promises; // Use promises-based fs
const fsSync = require('fs'); // Keep sync version for critical operations
const sanitizeBody = require('../middlewares/sanitizeBody');

ffmpeg.setFfmpegPath(ffmpegPath);

// Constants for better maintainability
const CONSTANTS = {
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    UPLOAD_DIR: './public/images/user',
    IMAGE_QUALITY: 85, // Reduced from 95 for better compression
    MAX_IMAGE_DIMENSION: 1000, // Reduced from 1200
    AUDIO_BITRATE: '96k', // Reduced from 128k
    VIDEO_PRESET: 'veryfast', // Changed from 'fast' for better speed
    WORKER_POOL_SIZE: 4 // Number of workers in the pool
};

// Worker Pool Management (Main Thread)
if (isMainThread) {
    class WorkerPool {
        constructor(size) {
            this.workers = [];
            this.queue = [];
            this.init(size);
        }

        init(size) {
            for (let i = 0; i < size; i++) {
                const worker = new Worker(__filename);
                worker.on('message', (result) => {
                    worker.busy = false;
                    worker.currentResolve(result);
                    this.processQueue();
                });
                worker.busy = false;
                this.workers.push(worker);
            }
        }

        async processFile(data) {
            return new Promise((resolve, reject) => {
                const availableWorker = this.workers.find(w => !w.busy);
                if (availableWorker) {
                    availableWorker.busy = true;
                    availableWorker.currentResolve = resolve;
                    availableWorker.postMessage(data);
                } else {
                    this.queue.push({ data, resolve });
                }
            });
        }

        processQueue() {
            if (this.queue.length > 0) {
                const availableWorker = this.workers.find(w => !w.busy);
                if (availableWorker) {
                    const { data, resolve } = this.queue.shift();
                    availableWorker.busy = true;
                    availableWorker.currentResolve = resolve;
                    availableWorker.postMessage(data);
                }
            }
        }
    }

    // Initialize multer with optimized settings
    const storage = multer.memoryStorage();
    const upload = multer({
        storage,
        fileFilter: (req, file, cb) => {
            const isValidFile = file.fieldname === 'CoverImage' ? 
                file.mimetype.startsWith('image/') :
                file.mimetype.match(/^(image|audio|video)\//);
            cb(null, isValidFile);
        },
        limits: { fileSize: CONSTANTS.MAX_FILE_SIZE }
    });

    // Create worker pool
    const workerPool = new WorkerPool(CONSTANTS.WORKER_POOL_SIZE);

    router.post('/create', upload.fields([
        { name: 'CoverImage', maxCount: 1 },
        { name: 'File', maxCount: 1 }
    ]), sanitizeBody ,  async (req, res, next) => {
        try {
            if (!fsSync.existsSync(CONSTANTS.UPLOAD_DIR)) {
                await fs.mkdir(CONSTANTS.UPLOAD_DIR, { recursive: true });
            }

            const processFiles = [];

            // Process files using worker pool
            for (const fieldName of ['CoverImage', 'File']) {
                if (req.files?.[fieldName]) {
                    const file = req.files[fieldName][0];
                    const fileType = file.mimetype.startsWith('image/') ? 'image' :
                        file.mimetype.startsWith('audio/') ? 'audio' : 'video';

                    processFiles.push(
                        workerPool.processFile({
                            type: fileType,
                            file,
                            destinationPath: CONSTANTS.UPLOAD_DIR
                        }).then(result => {
                            if (result.success) {
                                req.files[fieldName][0].filename = result.filename;
                            } else {
                                throw new Error(result.error);
                            }
                        })
                    );
                }
            }

            await Promise.all(processFiles);
            await prankControllers.Create(req, res, next);
        } catch (error) {
            next(error);
        }
    });

    router.post('/open-link', upload.none(), sanitizeBody ,  prankControllers.Open);
    router.post('/update', upload.none(), sanitizeBody ,  prankControllers.Update);
    router.post('/create/changes', upload.fields([
        { name: 'CoverImage', maxCount: 1 },
        { name: 'File', maxCount: 1 }
    ]), sanitizeBody, prankControllers.Create2);
    
    router.post('/update/changes', upload.none(), sanitizeBody, prankControllers.Update2);
    

} else {
    // Worker Thread Code
    const compressionHandlers = {
        async image(file, destinationPath) {
            const filename = `${file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
            const fullPath = path.join(destinationPath, filename);

            await sharp(file.buffer)
                .jpeg({ quality: CONSTANTS.IMAGE_QUALITY })
                .resize(CONSTANTS.MAX_IMAGE_DIMENSION, CONSTANTS.MAX_IMAGE_DIMENSION, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toFile(fullPath);

            return filename;
        },

        async audio(file, destinationPath) {
            const filename = `${file.fieldname}-${Date.now()}-compressed.mp3`;
            const tempFile = path.join(destinationPath, `temp-${filename}`);
            const outputPath = path.join(destinationPath, filename);

            await fs.writeFile(tempFile, file.buffer);

            try {
                await new Promise((resolve, reject) => {
                    ffmpeg(tempFile)
                        .output(outputPath)
                        .audioCodec('libmp3lame')
                        .audioBitrate(CONSTANTS.AUDIO_BITRATE)
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                });

                await fs.unlink(tempFile);
                return filename;
            } catch (error) {
                await fs.unlink(tempFile).catch(() => {});
                throw error;
            }
        },

        async video(file, destinationPath) {
            const filename = `${file.fieldname}-${Date.now()}-compressed.mp4`;
            const tempFile = path.join(destinationPath, `temp-${filename}`);
            const outputPath = path.join(destinationPath, filename);

            await fs.writeFile(tempFile, file.buffer);

            try {
                await new Promise((resolve, reject) => {
                    ffmpeg(tempFile)
                        .output(outputPath)
                        .videoCodec('libx264')
                        .audioCodec('aac')
                        .outputOptions('-preset', CONSTANTS.VIDEO_PRESET)
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                });

                await fs.unlink(tempFile);
                return filename;
            } catch (error) {
                await fs.unlink(tempFile).catch(() => {});
                throw error;
            }
        }
    };

    // Worker message handler
    parentPort.on('message', async ({ type, file, destinationPath }) => {
        try {
            const handler = compressionHandlers[type];
            if (!handler) throw new Error('Invalid file type');
            
            const filename = await handler(file, destinationPath);
            parentPort.postMessage({ success: true, filename });
        } catch (error) {
            parentPort.postMessage({ success: false, error: error.message });
        }
    });
}

if (isMainThread) {
    module.exports = router;
}