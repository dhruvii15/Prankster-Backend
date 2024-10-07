const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const GALLERY = require('../models/gallery');

exports.CreateAudio = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.files.Audio || !req.body.AudioName || !req.files.AudioImage || !req.body.AudioPremium) {
            throw new Error('Audio, AudioName, AudioImage, and AudioPremium are required.');
        }

        const audioFilename = req.files.Audio.map((el) => el.filename);
        const audioImageFilename = req.files.AudioImage.map((el) => el.filename);

        req.body.Audio = `http://localhost:5001/images/audio/${audioFilename}`;
        req.body.AudioImage = `http://localhost:5001/images/audio/${audioImageFilename}`;

        const dataCreate = await AUDIO.create(req.body);

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

exports.FoundAudio = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.CharacterId && !req.body.CategoryId) {
            throw new Error('CharacterId & Category value are required.');
        }
        
        var data
        
        switch (req.body.CategoryId) {
            case '1':
                data = await AUDIO.find({ CharacterId: req.body.CharacterId }).select('-_id -__v -CharacterId');

                if (!data || data.length === 0) {
                    throw new Error('Audio Not Found');
                }
                break;
            case '2':
                data = await VIDEO.find({ CharacterId: req.body.CharacterId }).select('-_id -__v -CharacterId');

                if (!data || data.length === 0) {
                    throw new Error('Video Not Found');
                }
                break;
            case '3':
                data = await GALLERY.find({ CharacterId: req.body.CharacterId }).select('-_id -__v -CharacterId');

                if (!data || data.length === 0) {
                    throw new Error('Gallery Image Not Found');
                }
                break;
            default:
                throw new Error('Invalid Category')
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


exports.ReadAudio = async function (req, res, next) {
    try {
        const audioData = await AUDIO.find();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: audioData,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.UpdateAudio = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (req.files) {
            if (req.files.Audio) {
                const audioFilename = req.files.Audio.map((el) => el.filename);
                req.body.Audio = `http://localhost:5001/images/audio/${audioFilename}`;
            }
            if (req.files.AudioImage) {
                const audioImageFilename = req.files.AudioImage.map((el) => el.filename);
                req.body.AudioImage = `http://localhost:5001/images/audio/${audioImageFilename}`;

            }
        }

        const dataUpdate = await AUDIO.findByIdAndUpdate(req.params.id, req.body, { new: true });
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


exports.DeleteAudio = async function (req, res, next) {
    try {
        await AUDIO.findByIdAndDelete(req.params.id);
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