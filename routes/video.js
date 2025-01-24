const express = require('express');
const router = express.Router();
const videoControllers = require('../Controllers/video');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sanitizeBody = require('../middlewares/sanitizeBody');
const ffmpeg = require('fluent-ffmpeg');

const storageVideo = multer.memoryStorage();
const uploadVideo = multer({ storage: storageVideo });

// Function to generate unique filename
function generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    return `${timestamp}-${path.basename(originalName, extension)}${extension}`;
}

// Function to compress the video using FFmpeg
function compressVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions('-crf', '28')
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

// Create video
router.post('/create', uploadVideo.fields([{ name: 'Video', maxCount: 1 }]), sanitizeBody, async (req, res, next) => {
    try {
        if (req.files['Video']) {
            const originalVideoFilename = req.files['Video'][0].originalname;
            const uniqueVideoFilename = generateUniqueFilename(originalVideoFilename);
            const videoStoragePath = './public/images/video/';
            const videoFilePath = path.join(videoStoragePath, uniqueVideoFilename);

            // Ensure storage directory exists
            if (!fs.existsSync(videoStoragePath)) {
                fs.mkdirSync(videoStoragePath, { recursive: true });
            }

            // Save the original video file
            fs.writeFileSync(videoFilePath, req.files['Video'][0].buffer);

            // Temporary name for compressed video
            const tempCompressedVideoPath = path.join(videoStoragePath, 'temp-compressed.mp4');

            // Compress the video and save it with a temporary name
            await compressVideo(videoFilePath, tempCompressedVideoPath);

            // Check the size of the compressed video
            const compressedSize = checkFileSize(tempCompressedVideoPath);
            if (compressedSize > 15) {
                // Delete files if too large
                fs.unlinkSync(tempCompressedVideoPath);
                fs.unlinkSync(videoFilePath);
                return res.status(400).json({ message: 'Video size exceeds the 15 MB limit after compression , please select another file' });
            }

            // Replace original video with compressed version
            fs.renameSync(tempCompressedVideoPath, videoFilePath);

            req.videoFile = uniqueVideoFilename;
        }

        videoControllers.CreateVideo(req, res, next);
    } catch (error) {
        console.error('Error during video creation:', error);
        next(error);
    }
});

// Update video (similar logic)
router.patch('/update/:id', uploadVideo.fields([{ name: 'Video', maxCount: 1 }]), sanitizeBody, async (req, res, next) => {
    try {
        if (req.files?.['Video']) {
            const originalVideoFilename = req.files['Video'][0].originalname;
            const uniqueVideoFilename = generateUniqueFilename(originalVideoFilename);
            const videoStoragePath = './public/images/video/';
            const videoFilePath = path.join(videoStoragePath, uniqueVideoFilename);

            // Ensure storage directory exists
            if (!fs.existsSync(videoStoragePath)) {
                fs.mkdirSync(videoStoragePath, { recursive: true });
            }

            // Save the original video file
            fs.writeFileSync(videoFilePath, req.files['Video'][0].buffer);

            // Temporary name for compressed video
            const tempCompressedVideoPath = path.join(videoStoragePath, 'temp-compressed.mp4');

            // Compress the video and save it with a temporary name
            await compressVideo(videoFilePath, tempCompressedVideoPath);

            // Check the size of the compressed video
            const compressedSize = checkFileSize(tempCompressedVideoPath);
            if (compressedSize > 15) {
                // Delete files if too large
                fs.unlinkSync(tempCompressedVideoPath);
                fs.unlinkSync(videoFilePath);
                return res.status(400).json({ message: 'Video size exceeds the 15 MB limit after compression , please select another file' });
            }

            // Replace original video with compressed version
            fs.renameSync(tempCompressedVideoPath, videoFilePath);

            req.videoFile = uniqueVideoFilename;
        }

        videoControllers.UpdateVideo(req, res, next);
    } catch (error) {
        console.error('Error during video update:', error);
        next(error);
    }
});

// Read video
router.post('/read', sanitizeBody, videoControllers.ReadVideo);

// Delete video
router.delete('/delete/:id', sanitizeBody, videoControllers.DeleteVideo);

module.exports = router;