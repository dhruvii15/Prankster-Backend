const express = require('express');
const router = express.Router();
const audioControllers = require('../Controllers/audio');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sanitizeBody = require('../middlewares/sanitizeBody');
const ffmpeg = require('fluent-ffmpeg');

const storageAudio = multer.memoryStorage();
const uploadAudio = multer({ storage: storageAudio });

// Function to generate unique filename
function generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    return `${timestamp}-${path.basename(originalName, extension)}${extension}`;
}

// Function to compress the audio using FFmpeg
function compressAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .audioCodec('libmp3lame')
            .audioBitrate('128k')
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}

// Function to check the file size (in MB)
function checkFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    return fileSizeInMB;
}

// Function to save the audio image
function saveAudioImage(imageFile, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const imageFilename = imageFile.fieldname + '-' + uniqueSuffix + path.extname(imageFile.originalname);
    const imageFilePath = path.join(destinationPath, imageFilename);

    // Ensure destination directory exists
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    // Save the image to the specified path
    fs.writeFileSync(imageFilePath, imageFile.buffer);
    return imageFilename;
}

// Create audio with image storage and compression
router.post('/create', uploadAudio.fields([
    { name: 'Audio', maxCount: 1 },
    { name: 'AudioImage', maxCount: 1 }
]), sanitizeBody, async (req, res, next) => {
    try {
        if (req.files['Audio']) {
            const originalAudioFilename = req.files['Audio'][0].originalname;
            const uniqueAudioFilename = generateUniqueFilename(originalAudioFilename);
            const audioStoragePath = './public/images/audio/';
            const audioFilePath = path.join(audioStoragePath, uniqueAudioFilename);

            // Ensure storage directory exists
            if (!fs.existsSync(audioStoragePath)) {
                fs.mkdirSync(audioStoragePath, { recursive: true });
            }

            // Save the original audio file
            fs.writeFileSync(audioFilePath, req.files['Audio'][0].buffer);

            // Temporary name for compressed audio
            const tempCompressedAudioPath = path.join(audioStoragePath, 'temp-compressed.mp3');

            // Compress the audio and save it with a temporary name
            await compressAudio(audioFilePath, tempCompressedAudioPath);

            // Check the size of the compressed audio
            const compressedSize = checkFileSize(tempCompressedAudioPath);
            if (compressedSize > 3) {
                // Delete files if too large
                fs.unlinkSync(tempCompressedAudioPath);
                fs.unlinkSync(audioFilePath);
                return res.status(400).json({ message: 'Audio size exceeds the 3 MB limit after compression , please select another file' });
            }

            // Replace original audio with compressed version
            fs.renameSync(tempCompressedAudioPath, audioFilePath);

            req.audioFile = uniqueAudioFilename;
        }

        // Save the audio image if provided
        if (req.files['AudioImage']) {
            const audioImageFilename = saveAudioImage(req.files['AudioImage'][0], './public/images/audio/');
            req.audioImageFile = audioImageFilename;
        }

        audioControllers.CreateAudio(req, res, next);
    } catch (error) {
        console.error('Error during audio creation:', error);
        next(error);
    }
});

// Update audio route (similar logic)
router.patch('/update/:id', uploadAudio.fields([
    { name: 'Audio', maxCount: 1 },
    { name: 'AudioImage', maxCount: 1 }
]), sanitizeBody, async (req, res, next) => {
    try {
        if (req.files?.['Audio']) {
            const originalAudioFilename = req.files['Audio'][0].originalname;
            const uniqueAudioFilename = generateUniqueFilename(originalAudioFilename);
            const audioStoragePath = './public/images/audio/';
            const audioFilePath = path.join(audioStoragePath, uniqueAudioFilename);

            // Ensure storage directory exists
            if (!fs.existsSync(audioStoragePath)) {
                fs.mkdirSync(audioStoragePath, { recursive: true });
            }

            // Save the original audio file
            fs.writeFileSync(audioFilePath, req.files['Audio'][0].buffer);

            // Temporary name for compressed audio
            const tempCompressedAudioPath = path.join(audioStoragePath, 'temp-compressed.mp3');

            // Compress the audio and save it with a temporary name
            await compressAudio(audioFilePath, tempCompressedAudioPath);

            // Check the size of the compressed audio
            const compressedSize = checkFileSize(tempCompressedAudioPath);
            if (compressedSize > 3) {
                // Delete files if too large
                fs.unlinkSync(tempCompressedAudioPath);
                fs.unlinkSync(audioFilePath);
                return res.status(400).json({ message: 'Audio size exceeds the 3 MB limit after compression , please select another file' });
            }

            // Replace original audio with compressed version
            fs.renameSync(tempCompressedAudioPath, audioFilePath);

            req.audioFile = uniqueAudioFilename;
        }

        // Save the audio image if provided
        if (req.files?.['AudioImage']) {
            const audioImageFilename = saveAudioImage(req.files['AudioImage'][0], './public/images/audio/');
            req.audioImageFile = audioImageFilename;
        }

        audioControllers.UpdateAudio(req, res, next);
    } catch (error) {
        console.error('Error during audio update:', error);
        next(error);
    }
});

// Read audio
router.post('/read', sanitizeBody, audioControllers.ReadAudio);

// Delete audio
router.delete('/delete/:id', sanitizeBody, audioControllers.DeleteAudio);

module.exports = router;