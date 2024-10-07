var express = require('express');
var router = express.Router();
const galleryControllers = require('../Controllers/gallery')
const multer = require('multer')


// Define storage for the audio file
const storageGallery = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/gallery'); // Destination for audio files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
        cb(null, file.fieldname + '-' + uniqueSuffix + sanitizedOriginalName);
    }
});


// Set up Multer for multiple file uploads
const uploadGallery = multer({ storage: storageGallery });

// Gallery
router.post('/create', uploadGallery.fields([
    { name: 'Gallery', maxCount: 1 },
    { name: 'GalleryImage', maxCount: 1 }
]), galleryControllers.CreateGallery);


router.post('/read', galleryControllers.ReadGallery);

router.patch('/update/:id', uploadGallery.fields([
    { name: 'Gallery', maxCount: 1 },
    { name: 'GalleryImage', maxCount: 1 }
]), galleryControllers.UpdateGallery);

router.delete('/delete/:id', galleryControllers.DeleteGallery);


module.exports = router;