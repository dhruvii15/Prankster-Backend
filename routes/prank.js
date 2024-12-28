const express = require('express');
const router = express.Router();
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const prankControllers = require('../Controllers/prank');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');


// If this file is being run as a worker thread
if (!isMainThread) {
    // Worker thread code
    const handleCompression = async ({ type, file, destinationPath }) => {
        try {
            let result;
            switch (type) {
                case 'image':
                    result = await compressImage(file, destinationPath);
                    break;
                case 'audio':
                    result = await compressAudio(file, destinationPath);
                    break;
                case 'video':
                    result = await compressVideo(file, destinationPath);
                    break;
                default:
                    throw new Error('Invalid file type');
            }
            return { success: true, filename: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Worker thread listening for messages
    parentPort.on('message', async (data) => {
        const result = await handleCompression(data);
        parentPort.postMessage(result);
    });

    // Worker thread compression functions

    async function compressImage(file, destinationPath) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + '.jpg';
        const fullPath = path.join(destinationPath, filename);

        await sharp(file.buffer)
            .jpeg({ quality: 95 }) // Adjust quality as needed (0-100)
            .resize(1200, 1200, { // Adjust max dimensions as needed
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFile(fullPath);

        return filename;
    }

    // Function to process audio files with fluent-ffmpeg
    async function compressAudio(file, destinationPath) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let originalFilename = file.fieldname + '-' + uniqueSuffix + '.mp3'; // Original file name
        let compressedFilename = file.fieldname + '-' + uniqueSuffix + '-compressed.mp3'; // Compressed file name
        const originalFilePath = path.join(destinationPath, originalFilename); // Temporary file path for uploaded audio
        const compressedFilePath = path.join(destinationPath, compressedFilename); // Path for compressed audio file

        // Check if the destination directory exists, create it if it doesn't
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }

        // Save the uploaded audio to a temporary file
        fs.writeFileSync(originalFilePath, file.buffer);

        return new Promise((resolve, reject) => {
            // Use the temporary file path for compression, and output to a new compressed file
            ffmpeg(originalFilePath)
                .output(compressedFilePath) // Output the compressed file to a new path
                .audioCodec('libmp3lame') // Compress audio with mp3 codec
                .audioBitrate('128k') // Set audio bitrate
                .on('end', () => {
                    console.log(`Audio compression completed: ${compressedFilename}`);
                    // Delete the original temporary file after compression
                    fs.unlinkSync(originalFilePath);
                    resolve(compressedFilename);
                })
                .on('error', (err) => {
                    console.error('Error during audio compression:', err);
                    // Delete the original temporary file in case of error
                    fs.unlinkSync(originalFilePath);
                    reject(err);
                })
                .run();
        });
    }

    // Function to process video files with fluent-ffmpeg
    async function compressVideo(file, destinationPath) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let originalFilename = file.fieldname + '-' + uniqueSuffix + '.mp4'; // Original file name
        let compressedFilename = file.fieldname + '-' + uniqueSuffix + '-compressed.mp4'; // New file name for compressed video
        const originalFilePath = path.join(destinationPath, originalFilename); // Temporary file path for uploaded video
        const compressedFilePath = path.join(destinationPath, compressedFilename); // Path for the compressed video

        // Check if the destination directory exists, create it if it doesn't
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }

        // Save the uploaded video to a temporary file
        fs.writeFileSync(originalFilePath, file.buffer);

        return new Promise((resolve, reject) => {
            // Use the temporary file path for compression, and output to a new compressed file
            ffmpeg(originalFilePath)
                .output(compressedFilePath) // Output the compressed file to a new path
                .videoCodec('libx264') // Compress video with x264 codec
                .audioCodec('aac') // Audio codec
                .outputOptions('-preset fast') // Set encoding preset for faster processing
                .on('end', () => {
                    console.log(`Video compression completed: ${compressedFilename}`);
                    // Delete the original temporary file after compression
                    fs.unlinkSync(originalFilePath);
                    resolve(compressedFilename);
                })
                .on('error', (err) => {
                    console.error('Error during video compression:', err);
                    // Delete the original temporary file in case of error
                    fs.unlinkSync(originalFilePath);
                    reject(err);
                })
                .run();
        });
    }
} else {
    // Main thread code
    const storage = multer.memoryStorage();
    const upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            if (file.fieldname === 'CoverImage' && !file.mimetype.startsWith('image/')) {
                return cb(new Error('Cover image must be an image file'), false);
            }

            if (file.fieldname === 'File') {
                if (!file.mimetype.match(/^(image|audio|video)\//)) {
                    return cb(new Error('File must be an image, audio, or video file'), false);
                }
            }

            cb(null, true);
        },
        limits: {
            fileSize: 50 * 1024 * 1024
        }
    });

    // Function to process file using worker thread
    function processFileWithWorker(file, type, destinationPath) {
        return new Promise((resolve, reject) => {
            // Create a new worker instance using the current file
            const worker = new Worker(__filename);

            worker.on('message', (result) => {
                if (result.success) {
                    resolve(result.filename);
                } else {
                    reject(new Error(result.error));
                }
            });

            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });

            worker.postMessage({ type, file, destinationPath });
        });
    }

    router.post('/create', upload.fields([
        { name: 'CoverImage', maxCount: 1 },
        { name: 'File', maxCount: 1 }
    ]), async (req, res, next) => {
        try {
            const uploadDir = './public/images/user';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Process files in parallel using Promise.all
            const processPromises = [];

            if (req.files?.CoverImage) {
                const coverImageFile = req.files['CoverImage'][0];
                processPromises.push(
                    processFileWithWorker(coverImageFile, 'image', uploadDir)
                        .then(filename => {
                            req.files['CoverImage'][0].filename = filename;
                        })
                );
            }

            if (req.files?.File) {
                const file = req.files['File'][0];
                const fileType = file.mimetype.startsWith('image/') ? 'image' :
                    file.mimetype.startsWith('audio/') ? 'audio' :
                        'video';

                processPromises.push(
                    processFileWithWorker(file, fileType, uploadDir)
                        .then(filename => {
                            req.files['File'][0].filename = filename;
                        })
                );
            }

            // Wait for all file processing to complete
            await Promise.all(processPromises);

            // Call the controller
            prankControllers.Create(req, res, next);
        } catch (error) {
            next(error);
        }
    });

    router.post('/open-link', upload.none(), prankControllers.Open);
    router.post('/update', upload.none(), prankControllers.Update);
}

// Export the router only if we're in the main thread
if (isMainThread) {
    module.exports = router;
}