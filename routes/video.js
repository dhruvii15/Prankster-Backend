var express = require('express');
var router = express.Router();
const videoControllers = require('../Controllers/video')
const multer = require('multer')


// Define storage for the audio file
const storageVideo = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/video'); // Destination for audio files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});


// Set up Multer for multiple file uploads
const uploadVideo = multer({ storage: storageVideo });

// Video
router.post('/create', uploadVideo.fields([
    { name: 'Video', maxCount: 1 },
    { name: 'VideoImage', maxCount: 1 }
]), videoControllers.CreateVideo);


router.post('/read', videoControllers.ReadVideo);

router.patch('/update/:id', uploadVideo.fields([
    { name: 'Video', maxCount: 1 },
    { name: 'VideoImage', maxCount: 1 }
]), videoControllers.UpdateVideo);

router.delete('/delete/:id', videoControllers.DeleteVideo);


module.exports = router;