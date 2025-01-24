const express = require('express');
const router = express.Router();
const audioControllers = require('../Controllers/audio');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sanitizeBody = require('../middlewares/sanitizeBody');

// Define storage for the audio file (in memory)
const storageAudio = multer.memoryStorage();
const uploadAudio = multer({ storage: storageAudio });

// Function to save the audio file
function saveAudio(file, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const audioFilename = file.fieldname + '-' + uniqueSuffix + '.mp3';
    const audioFilePath = path.join(destinationPath, audioFilename);

    // Ensure destination directory exists
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    // Save the uploaded audio
    fs.writeFileSync(audioFilePath, file.buffer);
    return audioFilename;
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

// Create audio with image storage
router.post('/create', uploadAudio.fields([
    { name: 'Audio', maxCount: 1 },
    { name: 'AudioImage', maxCount: 1 }
]), sanitizeBody, async (req, res, next) => {
    try {
        // Save the audio file if provided
        if (req.files['Audio']) {
            const audioFilename = saveAudio(req.files['Audio'][0], './public/images/audio');
            req.audioFile = audioFilename;
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

// Update audio with image storage
router.patch('/update/:id', uploadAudio.fields([
    { name: 'Audio', maxCount: 1 },
    { name: 'AudioImage', maxCount: 1 }
]), sanitizeBody, async (req, res, next) => {
    try {
        // Save the audio file if provided
        if (req.files?.['Audio']) {
            const audioFilename = saveAudio(req.files['Audio'][0], './public/images/audio');
            req.audioFile = audioFilename;
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
router.post('/read', sanitizeBody, audioControllers.ReadAudio);

// Delete audio
router.delete('/delete/:id', sanitizeBody, audioControllers.DeleteAudio);


module.exports = router;