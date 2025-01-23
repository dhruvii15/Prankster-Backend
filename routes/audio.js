const express = require('express');
const router = express.Router();
const audioControllers = require('../Controllers/audio');
const multer = require('multer');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const sanitizeBody = require('../middlewares/sanitizeBody');

// Define storage for the audio file (in memory)
const storageAudio = multer.memoryStorage();

// Set up Multer for audio uploads
const uploadAudio = multer({ storage: storageAudio });

function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`
            const { parentPort, workerData } = require('worker_threads');
            const ffmpeg = require('fluent-ffmpeg');
            const fs = require('fs');

            // Compression function running in worker thread
            async function compressAudio(data) {
                const { inputPath, outputPath } = data;
                
                return new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .output(outputPath)
                        .audioCodec('libmp3lame')
                        .audioBitrate('128k')
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
                    await compressAudio(data);
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

async function compressAndSaveAudio(file, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalFilename = file.fieldname + '-' + uniqueSuffix + '.mp3';
    const compressedFilename = file.fieldname + '-' + uniqueSuffix + '-compressed.mp3';
    const originalFilePath = path.join(destinationPath, originalFilename);
    const compressedFilePath = path.join(destinationPath, compressedFilename);

    // Ensure destination directory exists
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    // Save the uploaded audio
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

// Function to save the audio image
function saveAudioImage(imageFile, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const imageFilename = imageFile.fieldname + '-' + uniqueSuffix + path.extname(imageFile.originalname);
    const imageFilePath = path.join(destinationPath, imageFilename);

    // Check if the destination directory exists, create it if it doesn't
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    // Save the image to the specified path
    fs.writeFileSync(imageFilePath, imageFile.buffer);
    return imageFilename;
}

// Create audio with compression and image storage
router.post('/create', uploadAudio.fields([
    { name: 'Audio', maxCount: 1 },
    { name: 'AudioImage', maxCount: 1 }
]), sanitizeBody , async (req, res, next) => {
    try {
        if (req.files['Audio']) {
            // Compress and save the audio file
            const compressedFile = await compressAndSaveAudio(req.files['Audio'][0], './public/images/audio');
            req.compressedAudioFile = compressedFile;

        }
        // Save the audio image if provided
        if (req.files['AudioImage']) {
            const audioImageFilename = saveAudioImage(req.files['AudioImage'][0], './public/images/audio');
            req.audioImageFile = audioImageFilename;
        }

        audioControllers.CreateAudio(req, res, next);
    } catch (error) {
        console.error('Error during audio creation:', error);
        next(error);
    }
});

// Update audio with compression and image storage
router.patch('/update/:id', uploadAudio.fields([
    { name: 'Audio', maxCount: 1 },
    { name: 'AudioImage', maxCount: 1 }
]), sanitizeBody , async (req, res, next) => {
    try {
        if (req.files?.['Audio']) {
            const compressedFile = await compressAndSaveAudio(req.files['Audio'][0], './public/images/audio');
            req.compressedAudioFile = compressedFile;
        }

        // Save the audio image if provided
        if (req.files?.['AudioImage']) {
            const audioImageFilename = saveAudioImage(req.files['AudioImage'][0], './public/images/audio');
            req.audioImageFile = audioImageFilename;
        }

        audioControllers.UpdateAudio(req, res, next);
    } catch (error) {
        console.error('Error during audio update:', error);
        next(error);
    }
});

// Read audio
router.post('/read', sanitizeBody , audioControllers.ReadAudio);

// Delete audio
router.delete('/delete/:id', sanitizeBody ,  audioControllers.DeleteAudio);

module.exports = router;