const GALLERY = require('../models/gallery')

exports.CreateGallery = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.GalleryName || !req.files.GalleryImage || !req.body.GalleryPremium) {
            throw new Error('Gallery, GalleryName, GalleryImage, and GalleryPremium are required.');
        }

        const galleryImageFilename = req.files.GalleryImage.map((el) => el.filename);

        req.body.GalleryImage = `http://localhost:5001/images/gallery/${galleryImageFilename}`;

        const dataCreate = await GALLERY.create(req.body);

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



exports.ReadGallery = async function (req, res, next) {
    try {
        const GalleryData = await GALLERY.find();

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


exports.UpdateGallery = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (req.files) {
            if (req.files.GalleryImage) {
                const GalleryImageFilename = req.files.GalleryImage.map((el) => el.filename);
                req.body.GalleryImage = `http://localhost:5001/images/gallery/${GalleryImageFilename}`;
            }
        }

        const dataUpdate = await GALLERY.findByIdAndUpdate(req.params.id, req.body, { new: true });
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


exports.DeleteGallery = async function (req, res, next) {
    try {
        await GALLERY.findByIdAndDelete(req.params.id);
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