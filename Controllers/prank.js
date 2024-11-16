const PRANK = require('../models/prank');
const crypto = require('crypto');


function generateUniqueName(baseWord, length = 15) {
    const randomPart = crypto.randomBytes(length).toString('hex').slice(0, length);
    return `${baseWord}&&${randomPart}$${randomPart}$$${randomPart}&$${randomPart}&${randomPart}&${randomPart}$${randomPart}$$${randomPart}&$${randomPart}&${randomPart}`;
}

async function isUrlUnique(url) {
    const prankCount = await PRANK.countDocuments({ Link: url });
    const adminCount = await ADMIN.countDocuments({ Link: url });
    return prankCount === 0 && adminCount === 0;
  }

async function createUniqueUrl(baseWord) {
    let isUnique = false;
    let url;
    while (!isUnique) {
        const uniqueName = generateUniqueName(baseWord);
        url = `https://pslink.world/${uniqueName}`;
        isUnique = await isUrlUnique(url);
    }
    return url;
}

exports.Create = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.Type) {
            throw new Error('Type are required.');
        }
        // Handle CoverImage
        if (req.files && req.files.CoverImage) {
            const CoverImageFilename = req.files.CoverImage.map((el) => el.filename);
            req.body.CoverImage = `https://pslink.world/api/public/images/prank/${CoverImageFilename}`;
        } else if (typeof req.body.CoverImage === 'string') {
            req.body.CoverImage = req.body.CoverImage; // Use the string directly
        } else {
            throw new Error('CoverImage is required.');
        }

        // Handle File
        if (req.files && req.files.File) {
            const FileFilename = req.files.File.map((el) => el.filename);
            req.body.File = `https://pslink.world/api/public/images/prank/${FileFilename}`;
        } else if (typeof req.body.File === 'string') {
            req.body.File = req.body.File; // Use the string directly
        } else {
            throw new Error('File is required.');
        }
        
        // Generate and add unique URL
        const baseWord = "prank"; // You can change this or make it dynamic
        req.body.Link = await createUniqueUrl(baseWord);

        let dataCreate = await PRANK.create(req.body);

        const responseData = {
            id: dataCreate._id,
            Link: dataCreate.Link,
            CoverImage: dataCreate.CoverImage,
            File: dataCreate.File,
            Type: dataCreate.Type,
            Name: dataCreate.Name,
            Image: dataCreate.Image
        };

        res.status(201).json({
            status: 1,
            message: 'Prank Created Successfully',
            data: responseData
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};



exports.Open = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.prankName) {
            throw new Error('prankName value are required.');
        }
        
        const PrankLink  = `https://pslink.world/${req.body.prankName}`

        console.log(PrankLink);

        const prankData = await PRANK.findOne({ Link: PrankLink }).select('-_id -__v');

        const newView = prankData.View + 1;
        const updatedData = await PRANK.findOneAndUpdate(
            { Link: PrankLink },
            { View: newView },
            { new: true } // return the updated document
        ).select('-_id -__v');

        res.status(201).json({
            status: 1,
            message: 'Prank Data Found Successfully',
            data: updatedData
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

        if (!req.body.Id || !req.body.Name) {
            throw new Error('Id & Name are required.');
        }

        const update = await PRANK.findByIdAndUpdate(req.body.Id, req.body, { new: true });

        if (!update) {
            throw new Error('Id is wrong');
        }
        res.status(200).json({
            status: 1,
            message: 'Data Updated Successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

