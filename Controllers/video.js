const VIDEO = require('../models/video')

exports.CreateVideo = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.files.Video || !req.body.VideoName || !req.files.VideoImage || !req.body.VideoPremium) {
            throw new Error('Video, VideoName, VideoImage, and VideoPremium are required.');
        }

        const videoFilename = req.files.Video.map((el) => el.filename);
        const videoImageFilename = req.files.VideoImage.map((el) => el.filename);

        req.body.Video = `http://localhost:5001/images/video/${videoFilename}`;
        req.body.VideoImage = `http://localhost:5001/images/video/${videoImageFilename}`;

         // Get the highest existing ItemId
         const highestItem = await VIDEO.findOne().sort('-ItemId').exec();
         const nextId = highestItem ? highestItem.ItemId + 1 : 1;
 
         // Assign the new ID to req.body.ItemId
         req.body.ItemId = nextId; 

        const dataCreate = await VIDEO.create(req.body);

        res.status(201).json({
            status: 1,
            message: 'Data Created Successfully',
            data: dataCreate,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};



exports.ReadVideo = async function (req, res, next) {
    try {
        const VideoData = await VIDEO.find();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: VideoData,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.UpdateVideo = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (req.files) {
            if (req.files.Video) {
                const VideoFilename = req.files.Video.map((el) => el.filename);
                req.body.Video = `http://localhost:5001/images/video/${VideoFilename}`;
            }
            if (req.files.VideoImage) {
                const VideoImageFilename = req.files.VideoImage.map((el) => el.filename);
                req.body.VideoImage = `http://localhost:5001/images/video/${VideoImageFilename}`;

            }
        }

        const dataUpdate = await VIDEO.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            status: 1,
            message: 'Data Updated Successfully',
            data: dataUpdate,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.DeleteVideo = async function (req, res, next) {
    try {
        await VIDEO.findByIdAndDelete(req.params.id);
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