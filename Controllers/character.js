const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const GALLERY = require('../models/gallery');
const CHARACTER = require('../models/character')

exports.Create = async function (req, res, next) {
    try {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            throw new Error('Please use HTTPS protocol')
        }
        const filename = req.file.filename.replace(/\s+/g, '');  // Remove all spaces

        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.CharacterImage && !req.body.CharacterName) {
            throw new Error('CharacterImage & CharacterName values are required');
        }

        req.body.CharacterImage = `https://pslink.world/api/public/images/characters/${filename}`;

        // Get the highest existing CharacterId
        const highestCharacter = await CHARACTER.findOne().sort('-CharacterId').exec();
        const nextId = highestCharacter ? highestCharacter.CharacterId + 1 : 1;

        // Assign the new ID to req.body.CharacterId
        req.body.CharacterId = nextId;

        const dataCreate = await CHARACTER.create(req.body);
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


exports.Found = async function (req, res, next) {
    try {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            throw new Error('Please use HTTPS protocol')
        }
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.CategoryId) {
            throw new Error('CategoryId values are required');
        }

        const CategoryId = req.body.CategoryId;
        let categoryType;
    

        // Set the category type based on CategoryId
        switch (CategoryId) {
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
                    message: 'Invalid CategoryId provided',
                });
        }
        

        // Find the character data based on the selected category
        const characterData = await CHARACTER.find({ Category: categoryType }).select('-_id -__v  -Category');

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: characterData,
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
        if (req.headers['x-forwarded-proto'] !== 'https') {
            throw new Error('Please use HTTPS protocol')
        }
        const characterData = await CHARACTER.find();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: characterData,
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
        if (req.headers['x-forwarded-proto'] !== 'https') {
            throw new Error('Please use HTTPS protocol')
        }
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (req.file) {
            const filename = req.file.filename.replace(/\s+/g, '');  // Remove all spaces
            // req.body.CoverURL = `https://lolcards.link/api/public/images/cover/${filename}`;
            req.body.CharacterImage = `https://pslink.world/api/public/images/characters/${filename}`;
        }

        const dataUpdate = await CHARACTER.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        if (req.headers['x-forwarded-proto'] !== 'https') {
            throw new Error('Please use HTTPS protocol')
        }
        // Find and delete the character by ID
        const Character = await CHARACTER.findByIdAndDelete(req.params.id);

        if (!Character) {
            throw new Error('Character Not Found');
        }

        let deleteResult;

        switch (Character.Category) {
            case 'audio':
                deleteResult = await AUDIO.deleteMany({ CharacterId: Character.CharacterId });

                if (deleteResult.deletedCount === 0) {
                    throw new Error('No Audio Found to Delete');
                }
                break;
            case 'video':
                deleteResult = await VIDEO.deleteMany({ CharacterId: Character.CharacterId });

                if (deleteResult.deletedCount === 0) {
                    throw new Error('No Video Found to Delete');
                }
                break;
            case 'gallery':
                deleteResult = await GALLERY.deleteMany({ CharacterId: Character.CharacterId });

                if (deleteResult.deletedCount === 0) {
                    throw new Error('No Gallery Images Found to Delete');
                }
                break;
            default:
                throw new Error('Invalid Category');
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

