const express = require('express');
const router = express.Router();
const videoControllers = require('../Controllers/video');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sanitizeBody = require('../middlewares/sanitizeBody');

// Define storage for the video file (in memory)
const storageVideo = multer.memoryStorage();

// Set up Multer for video uploads
const uploadVideo = multer({ storage: storageVideo });

// Function to save the video file
function saveVideo(file, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const videoFilename = file.fieldname + '-' + uniqueSuffix + '.mp4';
    const videoFilePath = path.join(destinationPath, videoFilename);

    // Ensure destination directory exists
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    // Save the uploaded video
    fs.writeFileSync(videoFilePath, file.buffer);
    return videoFilename;
}

// Create video
router.post('/create', uploadVideo.fields([{ name: 'Video', maxCount: 1 }]), sanitizeBody, async (req, res, next) => {
    try {
        if (req.files['Video']) {
            const videoFile = saveVideo(req.files['Video'][0], './public/images/video');
            req.videoFile = videoFile;
        }

        videoControllers.CreateVideo(req, res, next);
    } catch (error) {
        console.error('Error during video creation:', error);
        next(error);
    }
});

// Update video
router.patch('/update/:id', uploadVideo.fields([{ name: 'Video', maxCount: 1 }]), sanitizeBody, async (req, res, next) => {
    try {
        if (req.files?.['Video']) {
            const videoFile = saveVideo(req.files['Video'][0], './public/images/video');
            req.videoFile = videoFile;
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