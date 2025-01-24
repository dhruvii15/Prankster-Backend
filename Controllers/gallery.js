const GALLERY = require('../models/gallery')
const USERGALLERY = require('../models/userGallery')

const GALLERY2 = require('../models2/gallery')
const USERGALLERY2 = require('../models2/userGallery')

exports.CreateGallery = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.GalleryName || !req.body.GalleryPremium) {
            throw new Error('GalleryName, GalleryImage, and GalleryPremium are required.');
        }

        req.body.viewCount = 0

        if (req.files && req.files.GalleryImage) {
            const galleryImageFilename = req.files.GalleryImage.map((el) => el.filename);
            req.body.GalleryImage = `https://pslink.world/api/public/images/gallery/${galleryImageFilename}`;
        } else if (typeof req.body.GalleryImage === 'string') {
            req.body.GalleryImage = req.body.GalleryImage; // Use the string directly
        } else {
            throw new Error('GalleryImage is required.');
        }

        // Get the highest existing ItemId
        const highestItem = await GALLERY2.findOne().sort('-ItemId').exec();
        const nextId = highestItem ? highestItem.ItemId + 1 : 1;

        // Assign the new ID to req.body.ItemId
        req.body.ItemId = nextId;

        const dataCreate = await GALLERY2.create(req.body);

        if (req.body.role) {
            await USERGALLERY2.findByIdAndDelete(req.body.role);
        }

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
      
      const GalleryData = await GALLERY2.find();

      const processedGalleryData = GalleryData.map(item => ({
        ...item.toObject(),
        CategoryName: categoryMap[item.CategoryId] 
      }));
      
      res.status(200).json({
        status: 1,
        message: 'Data Found Successfully',
        data: processedGalleryData,
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
                req.body.GalleryImage = `https://pslink.world/api/public/images/gallery/${GalleryImageFilename}`;
            }
        }

        const dataUpdate = await GALLERY2.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        await GALLERY2.findByIdAndDelete(req.params.id);
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