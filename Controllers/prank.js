const PRANK = require('../models/prank');
const crypto = require('crypto');


function generateUniqueName(baseWord, length = 8) {
    const randomPart = crypto.randomBytes(length).toString('hex').slice(0, length);
    return `${baseWord}-${randomPart}`;
}

async function isUrlUnique(url) {
    const count = await PRANK.countDocuments({ Link: url });
    return count === 0;
}

async function createUniqueUrl(baseWord) {
    let isUnique = false;
    let url;
    while (!isUnique) {
        const uniqueName = generateUniqueName(baseWord);
        url = `http://localhost:5001/${uniqueName}`;
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

        if (!req.files.CoverImage || !req.files.File || !req.body.Type || !req.body.Name) {
            throw new Error('CoverImage, File, Type, and Name are required.');
        }

        req.body.UserId = req.User;

        const CoverImageFilename = req.files.CoverImage.map((el) => el.filename);
        const FileFilename = req.files.File.map((el) => el.filename);

        req.body.CoverImage = `http://localhost:5001/images/prank/${CoverImageFilename}`;
        req.body.File = `http://localhost:5001/images/prank/${FileFilename}`;

        // Generate and add unique URL
        const baseWord = "prank"; // You can change this or make it dynamic
        req.body.Link = await createUniqueUrl(baseWord);

        let dataCreate = await PRANK.create(req.body);

        const responseData = {
            Link: dataCreate.Link,
            CoverImage: dataCreate.CoverImage,
            File: dataCreate.File,
            Type: dataCreate.Type,
            Name: dataCreate.Name
        };


        res.status(201).json({
            status: 1,
            message: 'Prank Create Successfully',
            data: responseData
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
        const prankData = await PRANK.find({ UserId: req.User }).select('-_id -__v -UserId');

        res.status(201).json({
            status: 1,
            message: 'Prank Data Found Successfully',
            data: prankData
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

        if (!req.body.Link) {
            throw new Error('Link value are required.');
        }

        const prankData = await PRANK.findOne({ Link: req.body.Link }).select('-_id -__v');

        const newView = prankData.View + 1;
        const updatedData = await PRANK.findOneAndUpdate(
            { Link: req.body.Link },
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


