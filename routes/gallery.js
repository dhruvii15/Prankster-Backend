const express = require('express');
const router = express.Router();
const galleryControllers = require('../Controllers/gallery');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sanitizeBody = require('../middlewares/sanitizeBody');

// Define storage for the gallery file (in memory)
const storageGallery = multer.memoryStorage();
const uploadGallery = multer({ storage: storageGallery });

// Function to save gallery image
function saveGalleryImage(file, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    const outputPath = path.join(destinationPath, filename);

    // Ensure destination directory exists
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    // Save the image
    fs.writeFileSync(outputPath, file.buffer);
    return filename;
}

// Create gallery
router.post('/create', uploadGallery.fields([
    { name: 'Gallery', maxCount: 1 },
    { name: 'GalleryImage', maxCount: 1 }
]), sanitizeBody, async (req, res, next) => {
    try {
        if (req.files && req.files['GalleryImage'] && req.files['GalleryImage'][0]) {
            const galleryImageFile = req.files['GalleryImage'][0];
            const filename = saveGalleryImage(galleryImageFile, './public/images/gallery');
            req.files['GalleryImage'][0].filename = filename;
        }

        galleryControllers.CreateGallery(req, res, next);
    } catch (error) {
        console.error('Error during gallery creation:', error);
        next(error);
    }
});

// Update gallery
router.patch('/update/:id', uploadGallery.fields([
    { name: 'Gallery', maxCount: 1 },
    { name: 'GalleryImage', maxCount: 1 }
]), sanitizeBody, async (req, res, next) => {
    try {
        if (req.files?.['GalleryImage']) {
            const galleryImageFile = req.files['GalleryImage'][0];
            const filename = saveGalleryImage(galleryImageFile, './public/images/gallery');
            req.files['GalleryImage'][0].filename = filename;
        }

        galleryControllers.UpdateGallery(req, res, next);
    } catch (error) {
        console.error('Error during gallery update:', error);
        next(error);
    }
});

// Read gallery
router.post('/read', sanitizeBody, galleryControllers.ReadGallery);

// Delete gallery
router.delete('/delete/:id', sanitizeBody, galleryControllers.DeleteGallery);

module.exports = router;