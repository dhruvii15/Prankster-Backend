const { CHARACTER, AUDIO } = require('../models/audio')

// ============= Characters ===========
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

        if (!req.body.CharacterImage && !req.body.CharacterName) {
            throw new Error('CharacterImage & CharacterName value are required')
        }

        req.body.CharacterImage = `http://localhost:5001/images/audio/characters/${filename}`;

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
        const characterData = await CHARACTER.find().select('-_id -__v');

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
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (req.file) {
            const filename = req.file.filename.replace(/\s+/g, '');  // Remove all spaces
            // req.body.CoverURL = `https://lolcards.link/api/public/images/cover/${filename}`;
            req.body.CharacterImage = `http://localhost:5001/images/audio/characters/${filename}`;
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
        await CHARACTER.findByIdAndDelete(req.params.id);
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


// ============= Audio ===========
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

        req.body.Audio = `http://localhost:5001/images/audio/audio/${audioFilename}`;
        req.body.AudioImage = `http://localhost:5001/images/audio/audio/${audioImageFilename}`;

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

        if (!req.body.CharacterName) {
            throw new Error('CharacterName value are required.');
        }

        const audioData = await AUDIO.find({CharacterName: req.body.CharacterName}).select('-_id -__v -CharacterName');
        
        if (!audioData || audioData.length === 0) {
            throw new Error('Audio Not Found');
        }
        
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
                req.body.Audio = `http://localhost:5001/images/audio/audio/${audioFilename}`;
            }
            if (req.files.AudioImage) {
                const audioImageFilename = req.files.AudioImage.map((el) => el.filename);
                req.body.AudioImage = `http://localhost:5001/images/audio/audio/${audioImageFilename}`;

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