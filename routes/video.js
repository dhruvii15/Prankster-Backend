const express = require('express');
const router = express.Router();
const videoControllers = require('../Controllers/video');
const multer = require('multer');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');

// Define storage for the video file (in memory)
const storageVideo = multer.memoryStorage();

// Set up Multer for video uploads
const uploadVideo = multer({ storage: storageVideo });

function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`
            const { parentPort, workerData } = require('worker_threads');
            const ffmpeg = require('fluent-ffmpeg');
            const fs = require('fs');

            // Compression function running in worker thread
            async function compressVideo(data) {
                const { inputPath, outputPath } = data;
                
                return new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .output(outputPath)
                        .videoCodec('libx264')
                        .audioCodec('aac')
                        .outputOptions('-preset fast')
                        .on('end', () => {
                            // Delete the original file after compression
                            fs.unlinkSync(inputPath);
                            resolve(true);
                        })
                        .on('error', (err) => {
                            fs.unlinkSync(inputPath);
                            reject(err);
                        })
                        .run();
                });
            }

            // Handle messages from main thread
            parentPort.on('message', async (data) => {
                try {
                    await compressVideo(data);
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

async function compressAndSaveVideo(file, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalFilename = file.fieldname + '-' + uniqueSuffix + '.mp4';
    const compressedFilename = file.fieldname + '-' + uniqueSuffix + '-compressed.mp4';
    const originalFilePath = path.join(destinationPath, originalFilename);
    const compressedFilePath = path.join(destinationPath, compressedFilename);

    // Ensure destination directory exists
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    // Save the uploaded video
    fs.writeFileSync(originalFilePath, file.buffer);

    try {
        // Run compression in worker thread
        await runWorker({
            inputPath: originalFilePath,
            outputPath: compressedFilePath
        });

        return compressedFilename;
    } catch (error) {
        // Clean up files in case of error
        if (fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath);
        if (fs.existsSync(compressedFilePath)) fs.unlinkSync(compressedFilePath);
        throw error;
    }
}

// Create video with compression
router.post('/create', uploadVideo.fields([{ name: 'Video', maxCount: 1 }]), async (req, res, next) => {
    try {
        if (!req.files || !req.files['Video']) {
            return res.status(400).send('No video file uploaded.');
        }

        const compressedFile = await compressAndSaveVideo(req.files['Video'][0], './public/images/video');
        req.compressedVideoFile = compressedFile;
        videoControllers.CreateVideo(req, res, next);
    } catch (error) {
        console.error('Error during video creation:', error);
        next(error);
    }
});

// Update video with compression
router.patch('/update/:id', uploadVideo.fields([{ name: 'Video', maxCount: 1 }]), async (req, res, next) => {
    try {
        if (req.files?.['Video']) {
            const compressedFile = await compressAndSaveVideo(req.files['Video'][0], './public/images/video');
            req.compressedVideoFile = compressedFile;
        }
        videoControllers.UpdateVideo(req, res, next);
    } catch (error) {
        console.error('Error during video update:', error);
        next(error);
    }
});

// Read video
router.post('/read', videoControllers.ReadVideo);

// Delete video
router.delete('/delete/:id', videoControllers.DeleteVideo);

module.exports = router;