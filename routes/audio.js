var express = require('express');
var router = express.Router();
const audioControllers = require('../Controllers/audio')
const multer = require('multer')


// Define storage for the audio file
const storageAudio = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/audio'); // Destination for audio files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
        cb(null, file.fieldname + '-' + uniqueSuffix + sanitizedOriginalName); //+ sanitizedOriginalName
    }
});


// Set up Multer for multiple file uploads
const uploadAudio = multer({ storage: storageAudio });

// Audio
router.post('/create', uploadAudio.fields([
    { name: 'Audio', maxCount: 1 },
    { name: 'AudioImage', maxCount: 1 }
]), audioControllers.CreateAudio);


router.post('/read', audioControllers.ReadAudio);

router.patch('/update/:id', uploadAudio.fields([
    { name: 'Audio', maxCount: 1 },
    { name: 'AudioImage', maxCount: 1 }
]), audioControllers.UpdateAudio);

router.delete('/delete/:id', audioControllers.DeleteAudio);


module.exports = router;