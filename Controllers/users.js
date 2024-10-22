const USER = require('../models/users')
const jwt = require('jsonwebtoken');
const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const GALLERY = require('../models/gallery');
const COVER = require('../models/cover');


exports.secure = async function (req, res, next) {
    try {
        let token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            throw new Error('Please send a Bearer token');
        }

        token = token.split(' ')[1];
        var decoded = jwt.verify(token, 'Prankster');

        let userCheck = await USER.findById(decoded.id);

        req.User = decoded.id

        if (!userCheck) {
            throw new Error("User not found");
        }

        next();
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
}


exports.Register = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.Premium) {
            throw new Error('Premium value are required')
        }

        let dataCreate = await USER.create(req.body)

        var token = jwt.sign({ id: dataCreate._id }, 'Prankster')

        res.status(201).json({
            status: 1,
            message: 'Registered Successfully',
            token  // Prefixing "Bearer" to the token
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

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
// Favourite =============
exports.Favourite = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.ItemId || !req.body.Favourite || !req.body.CategoryId) {
            throw new Error('ItemId, Favourite, and CategoryId values are required');
        }

        const userId = req.User;
        const { Favourite, ItemId, CategoryId } = req.body;

        if (!userId) {
            throw new Error('Invalid user ID');
        }

        let favoriteField;
        switch (CategoryId) {
            case "1":
                favoriteField = "FavouriteAudio";
                break;
            case "2":
                favoriteField = "FavouriteVideo";
                break;
            case "3":
                favoriteField = "FavouriteGallery";
                break;
            case "4":
                favoriteField = "FavouriteCover";
                break;
            default:
                throw new Error('Invalid CategoryId. Must be 1 for Audio, 2 for Video, 3 for Gallery, or 4 for Cover');
        }

        const user = await USER.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Check if the item is already in the favorite list
        const isItemInArray = user[favoriteField].includes(ItemId);

        if (Favourite === "true") {
            if (!isItemInArray) {
                await USER.findByIdAndUpdate(
                    userId,
                    { $push: { [favoriteField]: ItemId } },
                    { new: true, runValidators: true }
                );
            }
        } else if (Favourite === "false") {
            await USER.findByIdAndUpdate(
                userId,
                { $pull: { [favoriteField]: ItemId } },
                { new: true, runValidators: true }
            );
        } else {
            throw new Error('Invalid Favourite value. Must be "true" or "false".');
        }

        res.status(200).json({
            status: 1,
            message: Favourite === "true"
                ? 'Item added to Favourites Successfully'
                : 'Item removed from Favourites Successfully'
        });

    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.FavouriteRead = async function (req, res, next) {
    try {

        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.CategoryId) {
            throw new Error('CategoryId value are required')
        }

        const user = await USER.findById(req.User).select('FavouriteAudio FavouriteVideo FavouriteGallery FavouriteCover');
        if (!user) {
            throw new Error('User not found');
        }

        var favourite;

        switch (req.body.CategoryId) {
            case "1":
                favourite = await AUDIO.find({ ItemId: { $in: user.FavouriteAudio } }).select('-_id -__v');
                fileField = 'Audio';
                nameField = 'AudioName';
                imageField = 'AudioImage';
                premiumField = 'AudioPremium';
                if (!favourite || favourite.length === 0) {
                    throw new Error('Favourite audio not found')
                }
                break;
            case "2":
                favourite = await VIDEO.find({ ItemId: { $in: user.FavouriteVideo } }).select('-_id -__v');
                fileField = 'Video';
                nameField = 'VideoName';
                imageField = 'VideoImage';
                premiumField = 'VideoPremium';
                if (!favourite || favourite.length === 0) {
                    throw new Error('Favourite video not found')
                }
                break;
            case "3":
                favourite = await GALLERY.find({ ItemId: { $in: user.FavouriteGallery } }).select('-_id -__v');
                fileField = 'Gallery';
                nameField = 'GalleryName';
                imageField = 'GalleryImage';
                premiumField = 'GalleryPremium';
                if (!favourite || favourite.length === 0) {
                    throw new Error('Favourite gallery not found')
                }
                break;
            case "4":
                favourite = await COVER.find({ ItemId: { $in: user.FavouriteCover } }).select('-_id -__v');
                fileField = 'Cover';
                nameField = 'CoverName';
                imageField = 'CoverURL';
                premiumField = 'CoverPremium';
                if (!favourite || favourite.length === 0) {
                    throw new Error('Favourite cover not found')
                }
                break;
            default:
                throw new Error('Invalid CategoryId. Must be 1 for Audio, 2 for Video, 3 for Gallery , or 4 for Cover');
        }

        const dataStatus = favourite.map(item => ({
            File: item[fileField],
            Name: item[nameField],
            Image: item[imageField],
            Premium: item[premiumField],
            ItemId: item.ItemId,
            CharacterId: item.CharacterId
        }));

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: dataStatus
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


// Premium Update
exports.Update = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (req.body.Premium === undefined) {
            throw new Error('Premium value is required');
        }

        // if (typeof req.body.Premium !== 'boolean') {
        //     throw new Error('Premium value must be a boolean');
        // }

        await USER.findByIdAndUpdate(req.User, req.body, { new: true });

        res.status(200).json({
            status: 1,
            message: 'Premium Update Successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};
