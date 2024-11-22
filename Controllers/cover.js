const COVER = require('../models/cover');
const USERCOVER = require('../models/userCover');

exports.Create = async function (req, res, next) {
    try {
        console.log(req.body);

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

        // Parse TagName into an array if it is a JSON string
        let TagNameArray = [];
        if (req.body.TagName) {
            try {
                TagNameArray = JSON.parse(req.body.TagName); // Parse into an array
                if (!Array.isArray(TagNameArray)) {
                    throw new Error('TagName must be a valid array.');
                }
            } catch (err) {
                throw new Error('TagName must be a valid JSON array.');
            }
        }

        if (files && files.length > 0) {
            // Process uploaded files
            for (let i = 0; i < files.length; i++) {
                const isFile = typeof files[i] === 'object' && files[i].filename; // Check if it's a file
                const filename = isFile ? files[i].filename.replace(/\s+/g, '') : null;

                const newCover = {
                    Category: req.body.Category,
                    CoverURL: `https://pslink.world/api/public/images/cover/${filename}`,
                    CoverPremium: req.body.CoverPremium,
                    TagName: TagNameArray, // Save parsed array
                    CoverName: req.body.CoverName,
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
                CoverName: req.body.CoverName,
                TagName: TagNameArray, // Save parsed array
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

        const page = parseInt(req.body.page, 10) || 1;
        if (page < 1) {
            throw new Error('Invalid page number');
        }
        const limit = 2;

        // if (!page || isNaN(page) || page < 1) {
        //     page = 1;
        // }

        const emojiData = await COVER.find({ Category: "emoji", Hide: false })
            .sort({ viewCount: -1, ItemId: 1 })
            .select('-_id -Category -__v -Hide')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();


        const updatedEmojiData = emojiData.map(item => {
            const { viewCount, ...rest } = item.toObject();
            return {
                ...rest,
                CoverName: rest.CoverName || "",
                TagName: rest.TagName || ""
            };
        });

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            // count: emojiData.length,          // Number of items in the current page
            // totalCount: count,             // Total number of items
            // page: parseInt(page),          // Current page
            // totalPages: Math.ceil(count / limit), // Total number of pages
            data: updatedEmojiData
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

        const page = parseInt(req.body.page, 10) || 1;
        if (page < 1) {
            throw new Error('Invalid page number');
        }
        const limit = 2;

        const realisticData = await COVER.find({ Category: "realistic", Hide: false }).sort({ viewCount: -1, ItemId: 1 })
            .select('-_id -Category -__v -Hide')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const updatedRealisticData = realisticData.map(item => {
            const { viewCount, ...rest } = item.toObject();
            return {
                ...rest,
                CoverName: rest.CoverName || "",
                TagName: rest.TagName || ""
            };
        });

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: updatedRealisticData,
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

        let TagNameArray = [];
        if (req.body.TagName) {
            try {
                TagNameArray = JSON.parse(req.body.TagName); // Parse into an array
                if (!Array.isArray(TagNameArray)) {
                    throw new Error('TagName must be a valid array.');
                }
            } catch (err) {
                throw new Error('TagName must be a valid JSON array.');
            }

            req.body.TagName = TagNameArray;
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



exports.ReadTagName = async function (req, res, next) {
    try {
        // Find all documents from COVER collection
        const Data = await COVER.find();
        // Flatten the subcategories from each document and remove duplicates within the same document
        let TagName = Data.flatMap(item => {
            // Remove duplicates within each item's TagName
            return [...new Set(item.TagName)];
        });

        // Remove duplicates across the entire dataset
        TagName = [...new Set(TagName)];

        // Return the result in the response
        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: TagName,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};
