const COVER = require('../models/cover');
const USERCOVER = require('../models/userCover');

exports.Create = async function (req, res, next) {
    try {
        const files = req.files;
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

        if (files && files.length > 0) {
            // Process uploaded files
            for (let i = 0; i < files.length; i++) {
                const isFile = typeof files[i] === 'object' && files[i].filename; // Check if it's a file
                const filename = isFile ? files[i].filename.replace(/\s+/g, '') : null;

                const newCover = {
                    Category: req.body.Category,
                    CoverURL: `https://pslink.world/api/public/images/cover/${filename}`,
                    CoverPremium: req.body.CoverPremium,
                    Hide: req.body.Hide,
                    ItemId: nextId++, // Increment ItemId for each new image
                };

                // Save each entry to the database
                const dataCreate = await COVER.create(newCover);
                savedItems.push(dataCreate); // Collect saved entries
            }
        } else if (req.body.CoverURL) {
            // Handle case where only CoverURL string is provided
            const newCover = {
                Category: req.body.Category,
                CoverURL: req.body.CoverURL, // Use CoverURL from request body
                CoverPremium: req.body.CoverPremium,
                Hide: req.body.Hide,
                ItemId: nextId, // Use the next ItemId
            };

            // Save the entry to the database
            const dataCreate = await COVER.create(newCover);
            savedItems.push(dataCreate); // Collect the saved entry
        } else {
            throw new Error('At least one CoverURL image or a CoverURL string is required.');
        }

        if (req.body.role) {
            await USERCOVER.findByIdAndDelete(req.body.role);
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

        // Get all emoji documents
        const allEmoji = await COVER.find({ Category: "emoji", Hide: false })
            .select('-_id -Category -__v')
            .exec();

        // Shuffle the array
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const shuffledEmoji = shuffleArray([...allEmoji]);

        // Get the requested page
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedEmoji = shuffledEmoji.slice(startIndex, endIndex);

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            // count: paginatedEmoji.length,
            // totalCount: allEmoji.length,
            // page: parseInt(page),
            // totalPages: Math.ceil(allEmoji.length / limit),
            data: paginatedEmoji
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

        // Get all Realistic documents
        const allRealistic = await COVER.find({ Category: "realistic", Hide: false })
            .select('-_id -Category -__v')
            .exec();

        // Shuffle the array
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const shuffledRealistic = shuffleArray([...allRealistic]);

        // Get the requested page
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRealistic = shuffledRealistic.slice(startIndex, endIndex);

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: paginatedRealistic
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