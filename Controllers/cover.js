const COVER = require('../models/cover')

exports.Create = async function (req, res, next) {
    try {
        const filename = req.file.filename.replace(/\s+/g, '');  // Remove all spaces
        // req.body.CoverURL = `https://lolcards.link/api/public/images/cover/${filename}`;

        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.CoverURL && !req.body.Category) {
            throw new Error('CoverURL & Category value are required')
        }

        req.body.CoverURL = `http://localhost:5001/images/cover/${filename}`;

        const dataCreate = await COVER.create(req.body);
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

        const emojiData = await COVER.find({ Category: "emoji" })
            .select('-_id -Category -__v')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // const count = await COVER.countDocuments();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            // count: emojiData.length,          // Number of items in the current page
            // totalCount: count,             // Total number of items
            // page: parseInt(page),          // Current page
            // totalPages: Math.ceil(count / limit), // Total number of pages
            data: emojiData
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

        const realisticData = await COVER.find({ Category: "realistic" })
            .select('-_id -Category -__v')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

            // const count = await COVER.countDocuments();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: realisticData,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};