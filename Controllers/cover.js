const COVER = require('../models/cover')
const USER = require('../models/users')

exports.Create = async function (req, res, next) {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            throw new Error('At least one CoverURL image is required.');
        }

        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.Category) {
            throw new Error('Category value is required.');
        }

        let savedItems = [];
        const highestItem = await COVER.findOne().sort('-ItemId').exec();
        let nextId = highestItem ? highestItem.ItemId + 1 : 1;

        // Process each file and save it to the database
        for (let i = 0; i < files.length; i++) {
            const filename = files[i].filename.replace(/\s+/g, '');

            const newCover = {
                Category: req.body.Category,
                CoverURL: `https://pslink.world/api/public/images/cover/${filename}`,
                CoverPremium : req.body.CoverPremium,
                ItemId: nextId++, // Increment ItemId for each new image
            };

            // Save each entry to the database
            const dataCreate = await COVER.create(newCover);
            savedItems.push(dataCreate); // Collect saved entries
        }

        res.status(201).json({
            status: 1,
            message: 'Data Created Successfully',
            data: savedItems, // Return all saved items
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.Emoji = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.page) {
            throw new Error('page value are required')
        }

        const { page } = req.body;
        const limit = 10;

        // if (!page || isNaN(page) || page < 1) {
        //     page = 1;
        // }

        const user = await USER.findById(req.User).select('FavouriteCover');
        if (!user) {
            throw new Error('User not found');
        }
        const favoriteList = user.FavouriteCover;

        const emojiData = await COVER.find({ Category: "emoji" , Hide: false })
            .select('-_id -Category -__v')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Add favorite status to each item
        const dataWithFavoriteStatus = emojiData.map(item => ({
            ...item.toObject(),
            isFavorite: favoriteList.includes(item.ItemId)
        }));
        // const count = await COVER.countDocuments();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            // count: emojiData.length,          // Number of items in the current page
            // totalCount: count,             // Total number of items
            // page: parseInt(page),          // Current page
            // totalPages: Math.ceil(count / limit), // Total number of pages
            data: dataWithFavoriteStatus
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.Realistic = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.page) {
            throw new Error('page value are required')
        }

        const { page } = req.body;
        const limit = 10;

        const user = await USER.findById(req.User).select('FavouriteCover');
        if (!user) {
            throw new Error('User not found');
        }
        const favoriteList = user.FavouriteCover;

        const realisticData = await COVER.find({ Category: "realistic" , Hide: false })
            .select('-_id -Category -__v')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Add favorite status to each item
        const dataWithFavoriteStatus = realisticData.map(item => ({
            ...item.toObject(),
            isFavorite: favoriteList.includes(item.ItemId)
        }));

        // const count = await COVER.countDocuments();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: dataWithFavoriteStatus,
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
        const coverData = await COVER.find();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: coverData,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.Update = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (req.file) {
            const filename = req.file.filename.replace(/\s+/g, '');  // Remove all spaces
            // req.body.CoverURL = `https://lolcards.link/api/public/images/cover/${filename}`;
            req.body.CoverURL = `https://pslink.world/api/public/images/cover/${filename}`;
        }

        const dataUpdate = await COVER.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

exports.Delete = async function (req, res, next) {
    try {
        await COVER.findByIdAndDelete(req.params.id);
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