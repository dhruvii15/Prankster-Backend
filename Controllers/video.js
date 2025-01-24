const USERVIDEO = require('../models/userVideo');
const VIDEO = require('../models/video')

const USERVIDEO2 = require('../models2/userVideo');
const VIDEO2 = require('../models2/video')

exports.CreateVideo = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.VideoName || !req.body.VideoPremium) {
            throw new Error('VideoName and VideoPremium value are required.');
        }
        req.body.viewCount = 0

        if (req.files && req.files.Video) {
            const videoFilename = req.videoFile;
            req.body.Video = `https://pslink.world/api/public/images/video/${videoFilename}`;
        } else if (typeof req.body.Video === 'string') {
            req.body.Video = req.body.Video;
        } else {
            throw new Error('Video is required.');
        }

        // Get the highest existing ItemId
        const highestItem = await VIDEO2.findOne().sort('-ItemId').exec();
        const nextId = highestItem ? highestItem.ItemId + 1 : 1;

        // Assign the new ID to req.body.ItemId
        req.body.ItemId = nextId;

        const dataCreate = await VIDEO2.create(req.body);

        if (req.body.role) {
            await USERVIDEO2.findByIdAndDelete(req.body.role);
        }

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
      
      const VideoData = await VIDEO2.find();

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
                const VideoFilename = req.videoFile;
                req.body.Video = `https://pslink.world/api/public/images/video/${VideoFilename}`;
            }
        }

        const dataUpdate = await VIDEO2.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        await VIDEO2.findByIdAndDelete(req.params.id);
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