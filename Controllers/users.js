const USER = require('../models/users')
const USERAUDIO = require('../models/userAudio');
const USERVIDEO = require('../models/userVideo');
const USERGALLERY = require('../models/userGallery');
const USERCOVER = require('../models/userCover');


exports.Read = async function (req, res, next) {
    try {
        const UserData = await USER.find().select('-_id -__v');

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: UserData,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.Upload = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        // Check for whitespace in field names
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        let data;
        req.body.File = `http://localhost:5000/images/user/${req.file.filename}`;

        // Determine the model and data creation based on TypeId
        switch (req.body.TypeId) {
            case '1':  // USERAUDIO
                data = await USERAUDIO.create({ Audio: req.body.File, AudioName: req.body.Name });
                break;
            case '2':  // USERVIDEO
                data = await USERVIDEO.create({ Video: req.body.File, VideoName: req.body.Name });
                break;
            case '3':  // USERGALLERY
                data = await USERGALLERY.create({ GalleryImage: req.body.File, GalleryName: req.body.Name });
                break;
            case '4':  // USERCOVER
                data = await USERCOVER.create({ CoverURL: req.body.File });
                break;
            default:
                throw new Error('Invalid TypeId');
        }

        const responseData = data.toObject();
        delete responseData._id;
        delete responseData.__v;

        // Respond with success
        res.status(200).json({
            status: 1,
            message: 'Upload Successfully',
            data: responseData
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.UserGallery = async function (req, res, next) {
    try {
        const GalleryData = await USERGALLERY.find();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: GalleryData,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};