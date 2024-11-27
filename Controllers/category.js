const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const GALLERY = require('../models/gallery');
const CATEGORY = require('../models/category')

exports.Create = async function (req, res, next) {
    try {
        const filename = req.file.filename.replace(/\s+/g, ''); // Remove all spaces

        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.CategoryImage && !req.body.CategoryName) {
            throw new Error('CategoryImage & CategoryName values are required');
        }

        let TypeArray = [];
        if (req.body.Type) {
            try {
                TypeArray = JSON.parse(req.body.Type); // Parse into an array
                if (!Array.isArray(TypeArray)) {
                    throw new Error('Type must be a valid array.');
                }
            } catch (err) {
                throw new Error('Type must be a valid JSON array.');
            }
        }

        req.body.CategoryImage = `https://pslink.world/api/public/images/category/${filename}`;

        // Get the highest existing CategoryId
        const highestCategory = await CATEGORY.findOne().sort('-CategoryId').exec();
        let nextId = highestCategory ? highestCategory.CategoryId + 1 : 1;

        // Array to store created data
        const createdDataArray = [];

        // Create multiple entries for each type in TypeArray
        for (const type of TypeArray) {
            const newEntry = {
                ...req.body,
                Type: type, // Assign the current type value
                CategoryId: nextId, // Increment CategoryId for each entry
            };

            const createdData = await CATEGORY.create(newEntry);
            createdDataArray.push(createdData);

            nextId++; // Increment the ID for the next entry
        }

        res.status(201).json({
            status: 1,
            message: 'Data Created Successfully',
            data: createdDataArray,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.Found = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.TypeId) {
            throw new Error('TypeId values are required');
        }

        const TypeId = req.body.TypeId;
        let categoryType;
    

        // Set the category type based on TypeId
        switch (TypeId) {
            case "1":
                categoryType = 'audio';
                break;
            case "2":
                categoryType = 'video';
                break;
            case "3":
                categoryType = 'gallery';
                break;
            default:
                return res.status(400).json({
                    status: 0,
                    message: 'Invalid TypeId provided',
                });
        }
        

        // Find the category data based on the selected type
        const categoryData = await CATEGORY.find({ Type: categoryType }).select('-_id -__v  -Type');

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: categoryData,
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
        const categoryData = await CATEGORY.find();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: categoryData,
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

        const TypeArray = JSON.parse(req.body.Type);
        req.body.Type = TypeArray[TypeArray.length - 1];
        if (req.file) {
            const filename = req.file.filename.replace(/\s+/g, '');  // Remove all spaces
            // req.body.CoverURL = `https://lolcards.link/api/public/images/cover/${filename}`;
            req.body.CategoryImage = `https://pslink.world/api/public/images/category/${filename}`;
        }

        const dataUpdate = await CATEGORY.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        // Find and delete the category by ID
        const Category = await CATEGORY.findByIdAndDelete(req.params.id);

        if (!Category) {
            throw new Error('Category Not Found');
        }

        switch (Category.Type) {
            case 'audio':
                deleteResult = await AUDIO.deleteMany({ CategoryId: Category.CategoryId });
                break;
            case 'video':
                deleteResult = await VIDEO.deleteMany({ CategoryId: Category.CategoryId });
                break;
            case 'gallery':
                deleteResult = await GALLERY.deleteMany({ CategoryId: Category.CategoryId });
                break;
            default:
                throw new Error('Invalid Type');
        }

        res.status(204).json({
            status: 1,
            message: 'Data Deleted Successfully',
        });
    } catch (error) {
        // Send error response
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

