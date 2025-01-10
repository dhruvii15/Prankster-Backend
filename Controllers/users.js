const ADMIN = require('../models/admin')
const USERAUDIO = require('../models/userAudio');
const USERVIDEO = require('../models/userVideo');
const USERGALLERY = require('../models/userGallery');
const USERCOVER = require('../models/userCover');
const COVER = require('../models/cover');
const IMAGE = require('../models/gallery')
const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');

// User Upload

exports.UserRead = async function (req, res, next) {
    try {
        let data
        switch (req.body.TypeId) {
            case '1':  // USERAUDIO
                data = await USERAUDIO.find();
                break;
            case '2':  // USERVIDEO
                data = await USERVIDEO.find();
                break;
            case '3':  // USERGALLERY
                data = await USERGALLERY.find();
                break;
            case '4':  // USERCOVER
                data = await USERCOVER.find();
                break;
            default:
                throw new Error('Invalid TypeId');
        }

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: data,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.UserDelete = async function (req, res, next) {
    try {
        switch (req.query.TypeId) {
            case '1':  // USERAUDIO
                await USERAUDIO.findByIdAndDelete(req.params.id);
                break;
            case '2':  // USERVIDEO
                await USERVIDEO.findByIdAndDelete(req.params.id);
                break;
            case '3':  // USERGALLERY
                await USERGALLERY.findByIdAndDelete(req.params.id);
                break;
            case '4':  // USERCOVER
                await USERCOVER.findByIdAndDelete(req.params.id);
                break;
            default:
                throw new Error('Invalid TypeId');
        }
        res.status(204).json({
            status: 1,
            message: 'Data Deleted Successfully',
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


// spin
exports.Spin = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.TypeId) {
            throw new Error('TypeId value is required');
        }

        const TypeId = req.body.TypeId;

        let query = {};
        if (TypeId === '1') {
            query = { Type: 'audio' };
        } else if (TypeId === '2') {
            query = { Type: 'video' };
        } else if (TypeId === '3') {
            query = { Type: 'gallery' };
        } else {
            throw new Error('Better Luck Next Time');
        }

        const Data = await ADMIN.find(query).select('-_id -__v -ItemId');

        if (Data.length > 0) {
            const randomData = Data[Math.floor(Math.random() * Data.length)];

            // Ensure all fields exist, defaulting to an empty string if missing
            const sanitizedData = {
                Link: randomData.Link || "",
                CoverImage: randomData.CoverImage || "",
                File: randomData.File || "",
                Type: randomData.Type || "",
                Name: randomData.Name || "",
                ShareURL: randomData.ShareURL || "",
                Image: randomData.Image || "",
            };

            return res.status(200).json({
                status: 1,
                message: 'Data Found Successfully',
                data: sanitizedData,
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


// safe
exports.Safe = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        const { type } = req.body;

        // Determine the collection based on type
        let collection;
        switch (type) {
            case "1":
                collection = AUDIO; 
                await ADMIN.findByIdAndUpdate(req.params.id, {AudioSafe : true}, { new: true })
                break;
            case "2":
                collection = VIDEO; 
                await ADMIN.findByIdAndUpdate(req.params.id, {VideoSafe : true}, { new: true })
                break;
            case "3":
                collection = IMAGE; 
                await ADMIN.findByIdAndUpdate(req.params.id, {ImageSafe : true}, { new: true })
                break;
            case "4":
                collection = COVER; // Replace with your actual Cover model
                 await ADMIN.findByIdAndUpdate(req.params.id, {CoverSafe : true}, { new: true })
                break;
            default:
                throw new Error('Invalid type provided.');
        }

        const unsafeData = await collection.find({ Unsafe: true });

        if (unsafeData.length > 0) {
            await collection.updateMany({ Unsafe: true }, { $set: { Hide: true } });

            return res.status(200).json({
                status: 1,
                message: 'Unsafe items updated successfully, Hide and Unsafe set to false.',
            });
        } else {
            return res.status(200).json({
                status: 1,
                message: 'No unsafe data found.',
            });
        }

    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.UnSafe = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        const { type } = req.body;

        // Determine the collection based on type
        let collection;
        switch (type) {
            case "1":
                collection = AUDIO; 
                await ADMIN.findByIdAndUpdate(req.params.id, {AudioSafe : false}, { new: true })
                break;
            case "2":
                collection = VIDEO; 
                await ADMIN.findByIdAndUpdate(req.params.id, {VideoSafe : false}, { new: true })
                break;
            case "3":
                collection = IMAGE; 
                await ADMIN.findByIdAndUpdate(req.params.id, {ImageSafe : false}, { new: true })
                break;
            case "4":
                collection = COVER; // Replace with your actual Cover model
                await ADMIN.findByIdAndUpdate(req.params.id, {CoverSafe : false}, { new: true })
                break;
            default:
                throw new Error('Invalid type provided.');
        }

        const unsafeData = await collection.find({ Unsafe: true });

        if (unsafeData.length > 0) {
            await collection.updateMany({ Unsafe: true }, { $set: { Hide: false } });

            return res.status(200).json({
                status: 1,
                message: 'Items updated successfully.',
            });
        } else {
            return res.status(200).json({
                status: 1,
                message: 'No unsafe data found.',
            });
        }

    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};




