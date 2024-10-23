var express = require('express');
var router = express.Router();
const userControllers = require('../Controllers/users');
const prankControllers = require('../Controllers/prank');
const multer = require('multer');

// Define storage for the audio file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/prank'); // Destination for audio files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

// Set up Multer for multiple file uploads
const upload = multer({ storage: storage });

/* POST create service. */
router.post('/create', userControllers.secure, upload.fields([
    { name: 'CoverImage', maxCount: 1 },
    { name: 'File', maxCount: 1 },
    { name: 'Image', maxCount: 1 }
]), prankControllers.Create);


router.post('', userControllers.secure , prankControllers.Read);

router.post('/open-link', upload.none() , prankControllers.Open);


module.exports = router;
