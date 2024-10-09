// var express = require('express');
// var router = express.Router();
// const userControllers = require('../Controllers/users')
// const spinControllers = require('../Controllers/spin')
// const multer = require('multer');

// // Define storage for the audio file
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/images'); // Destination for audio files
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
//         cb(null, file.fieldname + '-' + uniqueSuffix + sanitizedOriginalName);
//     }
// });

// // Set up Multer for multiple file uploads
// const upload = multer({ storage: storage });

// /* GET service listing. */
// router.post('', userControllers.secure, upload.none(), spinControllers.Spin);

// router.post('/count', userControllers.secure, upload.none(), spinControllers.Count);

// module.exports = router;