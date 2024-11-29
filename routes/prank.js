var express = require('express');
var router = express.Router();
const prankControllers = require('../Controllers/prank');
const multer = require('multer');

// Define storage for the audio file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/user'); // Destination for audio files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
        cb(null, file.fieldname + '-' + uniqueSuffix + sanitizedOriginalName);
    }
});

// Set up Multer for multiple file uploads
const upload = multer({ storage: storage });

/* POST create service. */
router.post('/create', upload.fields([
    { name: 'CoverImage', maxCount: 1 },
    { name: 'File', maxCount: 1 }
]), prankControllers.Create);


router.post('/open-link', upload.none() , prankControllers.Open);

router.post('/update', upload.none() , prankControllers.Update);


module.exports = router;
