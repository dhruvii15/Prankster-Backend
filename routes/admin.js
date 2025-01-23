const express = require('express');
const router = express.Router();
const AdminControllers = require('../Controllers/admin');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const sanitizeBody = require('../middlewares/sanitizeBody');

// Use memory storage for processing before saving
const storage = multer.memoryStorage();

// Function to compress and save image
async function compressAndSaveImage(file, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + '.jpg';
    const fullPath = path.join(destinationPath, filename);

    await sharp(file.buffer)
        .jpeg({ quality: 95 })
        .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .toFile(fullPath);

    return filename;
}

// Function to compress and save audio
async function compressAndSaveAudio(file, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalFilename = file.fieldname + '-' + uniqueSuffix + '.mp3';
    const compressedFilename = file.fieldname + '-' + uniqueSuffix + '-compressed.mp3';
    const originalFilePath = path.join(destinationPath, originalFilename);
    const compressedFilePath = path.join(destinationPath, compressedFilename);

    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    fs.writeFileSync(originalFilePath, file.buffer);

    return new Promise((resolve, reject) => {
        ffmpeg(originalFilePath)
            .output(compressedFilePath)
            .audioCodec('libmp3lame')
            .audioBitrate('128k')
            .on('end', () => {
                fs.unlinkSync(originalFilePath);
                resolve(compressedFilename);
            })
            .on('error', (err) => {
                fs.unlinkSync(originalFilePath);
                reject(err);
            })
            .run();
    });
}

// Function to compress and save video
async function compressAndSaveVideo(file, destinationPath) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalFilename = file.fieldname + '-' + uniqueSuffix + '.mp4';
    const compressedFilename = file.fieldname + '-' + uniqueSuffix + '-compressed.mp4';
    const originalFilePath = path.join(destinationPath, originalFilename);
    const compressedFilePath = path.join(destinationPath, compressedFilename);

    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    fs.writeFileSync(originalFilePath, file.buffer);

    return new Promise((resolve, reject) => {
        ffmpeg(originalFilePath)
            .output(compressedFilePath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions('-preset fast')
            .on('end', () => {
                fs.unlinkSync(originalFilePath);
                resolve(compressedFilename);
            })
            .on('error', (err) => {
                fs.unlinkSync(originalFilePath);
                reject(err);
            })
            .run();
    });
}

// Set up multer with file validation
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'CoverImage' || file.fieldname === 'Image') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Cover image and Image must be image files'), false);
            }
        } else if (file.fieldname === 'File') {
            if (!file.mimetype.match(/^(image|audio|video)\//)) {
                return cb(new Error('File must be an image, audio, or video file'), false);
            }
        }
        cb(null, true);
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

/* Admin Routes */
router.post('/signup', sanitizeBody , AdminControllers.AdminSignup);
router.post('/login', sanitizeBody , AdminControllers.AdminLogin);
router.get('/logout', sanitizeBody , (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});
router.get('/read', sanitizeBody , AdminControllers.AdminRead);
router.patch('/update/:id', sanitizeBody , AdminControllers.AdminUpdate);
router.patch('/Forgetpass', sanitizeBody , AdminControllers.Forgetpass);

// Admin Spin Prank routes with file handling
router.post('/spin/create', sanitizeBody , upload.fields([
    { name: 'CoverImage', maxCount: 1 },
    { name: 'File', maxCount: 1 },
    { name: 'Image', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const uploadDir = './public/images/adminPrank';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Process CoverImage
        if (req.files && req.files['CoverImage']) {
            const coverImageFile = req.files['CoverImage'][0];
            try {
                const filename = await compressAndSaveImage(coverImageFile, uploadDir);
                req.files['CoverImage'][0].filename = filename;
            } catch (err) {
                return res.status(400).json({ error: 'Error processing cover image' });
            }
        }

        // Process File (image/audio/video)
        if (req.files && req.files['File']) {
            const file = req.files['File'][0];
            try {
                let filename;
                if (file.mimetype.startsWith('image/')) {
                    filename = await compressAndSaveImage(file, uploadDir);
                } else if (file.mimetype.startsWith('audio/')) {
                    filename = await compressAndSaveAudio(file, uploadDir);
                } else if (file.mimetype.startsWith('video/')) {
                    filename = await compressAndSaveVideo(file, uploadDir);
                }
                req.files['File'][0].filename = filename;
            } catch (err) {
                return res.status(400).json({ error: 'Error processing file' });
            }
        }

        // Process Image
        if (req.files && req.files['Image']) {
            const imageFile = req.files['Image'][0];
            try {
                const filename = await compressAndSaveImage(imageFile, uploadDir);
                req.files['Image'][0].filename = filename;
            } catch (err) {
                return res.status(400).json({ error: 'Error processing image' });
            }
        }

        // Continue to controller
        AdminControllers.Create(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post('/spin/read', sanitizeBody , AdminControllers.SpinRead);

// Update route with file handling
router.patch('/spin/update/:id', sanitizeBody , upload.fields([
    { name: 'CoverImage', maxCount: 1 },
    { name: 'File', maxCount: 1 },
    { name: 'Image', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const uploadDir = './public/images/adminPrank';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Process new files if uploaded
        if (req.files) {
            // Process CoverImage
            if (req.files['CoverImage']) {
                const coverImageFile = req.files['CoverImage'][0];
                try {
                    const filename = await compressAndSaveImage(coverImageFile, uploadDir);
                    req.files['CoverImage'][0].filename = filename;
                } catch (err) {
                    return res.status(400).json({ error: 'Error processing cover image' });
                }
            }

            // Process File
            if (req.files['File']) {
                const file = req.files['File'][0];
                try {
                    let filename;
                    if (file.mimetype.startsWith('image/')) {
                        filename = await compressAndSaveImage(file, uploadDir);
                    } else if (file.mimetype.startsWith('audio/')) {
                        filename = await compressAndSaveAudio(file, uploadDir);
                    } else if (file.mimetype.startsWith('video/')) {
                        filename = await compressAndSaveVideo(file, uploadDir);
                    }
                    req.files['File'][0].filename = filename;
                } catch (err) {
                    return res.status(400).json({ error: 'Error processing file' });
                }
            }

            // Process Image
            if (req.files['Image']) {
                const imageFile = req.files['Image'][0];
                try {
                    const filename = await compressAndSaveImage(imageFile, uploadDir);
                    req.files['Image'][0].filename = filename;
                } catch (err) {
                    return res.status(400).json({ error: 'Error processing image' });
                }
            }
        }

        AdminControllers.SpinUpdate(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.delete('/spin/delete/:id', sanitizeBody , AdminControllers.SpinDelete);

module.exports = router;