const express = require('express');
const router = express.Router();
const AdminControllers = require('../Controllers/admin');
const multer = require('multer');

// Define storage for the audio file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/adminPrank'); // Destination for audio files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
        cb(null, file.fieldname + '-' + uniqueSuffix + sanitizedOriginalName);
    }
});

// Set up Multer for multiple file uploads
const upload = multer({ storage: storage });

/* Admin Routes */
router.post('/signup', AdminControllers.AdminSignup);
router.post('/login', AdminControllers.AdminLogin);

router.get('/logout', (req, res) => {
    // Clear session or token (depends on your authentication method)
    req.session.destroy(); // Example for session-based authentication
    res.json({ message: 'Logged out successfully' });
});

router.get('/read', AdminControllers.AdminRead);
router.patch('/update/:id', AdminControllers.AdminUpdate);
router.patch('/Forgetpass', AdminControllers.Forgetpass);



// Admin Spin Prank
router.post('/spin/create', upload.fields([
    { name: 'CoverImage', maxCount: 1 },
    { name: 'File', maxCount: 1 },
    { name: 'Image', maxCount: 1 }
]), AdminControllers.Create);

router.post('/spin/read', AdminControllers.SpinRead);

router.patch('/spin/update/:id', upload.fields([
    { name: 'CoverImage', maxCount: 1 },
    { name: 'File', maxCount: 1 },
    { name: 'Image', maxCount: 1 }
]), AdminControllers.SpinUpdate);

router.delete('/spin/delete/:id', AdminControllers.SpinDelete);

module.exports = router;
