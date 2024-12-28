const PRANK = require('../models/prank');
const ADMIN = require('../models/admin');
const COVER = require('../models/cover');
const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const GALLERY = require('../models/gallery');
const USERAUDIO = require('../models/userAudio');
const USERVIDEO = require('../models/userVideo');
const USERGALLERY = require('../models/userGallery');
const USERCOVER = require('../models/userCover');
const crypto = require('crypto');
var path = require('path');


function generateUniqueName(baseWord, length = 15) {
    const randomPart = crypto.randomBytes(length).toString('hex').slice(0, length);
    return `${baseWord}${randomPart}$${randomPart}$$${randomPart}`;
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

        const generateName = async (Model, prefix, field) => {
            const lastEntry = await Model.findOne().sort({ _id: -1 }).select(field);
            const match = lastEntry && lastEntry[field]?.match(new RegExp(`${prefix} (\\d+)`));
            const nextNumber = match ? parseInt(match[1], 10) + 1 : 1;
            return `${prefix} ${nextNumber}`;
        };

        const highestItem = await PRANK.findOne().sort('-ItemId').exec();
        const nextId = highestItem ? highestItem.ItemId + 1 : 1;

        // Assign the new ID to req.body.ItemId
        req.body.ItemId = nextId;

        // Handle CoverImage
        if (req.body.CoverImageURL && req.body.CoverImageURL.trim() !== '') {
            const urlParts = req.body.CoverImageURL.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const newCoverImageURL = `https://pslink.world/api/public/images/cover/${nextId}/${fileName}`;
            req.body.ShareURL = newCoverImageURL;
            req.body.CoverImage = req.body.CoverImageURL;
        } else {
            if (req.files && req.files.CoverImage) {
                const CoverImageFilename = req.files.CoverImage.map((el) => el.filename);
                req.body.CoverImage = `https://pslink.world/api/public/images/user/${CoverImageFilename}`;
                req.body.FileUser = `https://pslink.world/api/public/images/user/${CoverImageFilename}`;
                const newCoverImageURL = `https://pslink.world/api/public/images/user/${nextId}/${CoverImageFilename}`;
                req.body.ShareURL = newCoverImageURL;
                const cover = await USERCOVER.create({
                    CoverURL: req.body.FileUser,
                    CoverName: await generateName(USERCOVER, 'User Cover', 'CoverName')
                });

            } else if (typeof req.body.CoverImage === 'string') {
                req.body.CoverImage = req.body.CoverImage; // Use the string directly
            }
        }

        // Handle File
        if (req.body.FileURL && req.body.FileURL.trim() !== '') {
            req.body.File = req.body.FileURL;
        } else {
            if (req.files && req.files.File) {
                const FileFilename = req.files.File.map((el) => el.filename);
                req.body.File = `https://pslink.world/api/public/images/user/${FileFilename}`;
                let data
                req.body.FileUser = `https://pslink.world/api/public/images/user/${FileFilename}`;
                switch (req.body.Type) {
                    case 'audio':
                        data = await USERAUDIO.create({
                            Audio: req.body.FileUser,
                            AudioName: await generateName(USERAUDIO, 'User Audio', 'AudioName')
                        });
                        break;
                    case 'video':
                        data = await USERVIDEO.create({
                            Video: req.body.FileUser,
                            VideoName: await generateName(USERVIDEO, 'User Video', 'VideoName')
                        });
                        break;
                    case 'gallery':
                        data = await USERGALLERY.create({
                            GalleryImage: req.body.FileUser,
                            GalleryName: await generateName(USERGALLERY, 'User Gallery', 'GalleryName')
                        });
                        break;
                    default:
                        throw new Error('Invalid Type');
                }
                console.log(data);

            } else if (typeof req.body.File === 'string') {
                req.body.File = req.body.File; // Use the string directly
            }
        }

        // Handle Image
        req.body.Image = req.body.ImageURL;

        // Generate and add unique URL
        const baseWord = req.body.Name.replace(/\s+/g, ''); // You can change this or make it dynamic
        req.body.Link = await createUniqueUrl(baseWord);
        let dataCreate = await PRANK.create(req.body);

        await COVER.findOneAndUpdate({ CoverURL: req.body.CoverImage }, { $inc: { viewCount: 1 } }, { new: true });


        switch (req.body.Type) {
            case 'audio':
                await AUDIO.findOneAndUpdate({ Audio: req.body.File }, { $inc: { viewCount: 1 } }, { new: true });
                break;
            case 'video':
                await VIDEO.findOneAndUpdate({ Video: req.body.File }, { $inc: { viewCount: 1 } }, { new: true });
                break;
            case 'gallery':
                await GALLERY.findOneAndUpdate({ GalleryImage: req.body.File }, { $inc: { viewCount: 1 } }, { new: true });
                break;
            default:
                throw new Error('Invalid Type');
        }


        const responseData = {
            id: dataCreate._id,
            Link: dataCreate.Link,
            CoverImage: dataCreate.CoverImage,
            ShareURL: dataCreate.ShareURL,
            File: dataCreate.File,
            Type: dataCreate.Type,
            Name: dataCreate.Name,
            Image: dataCreate.Image || ""
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
            throw new Error('prankName value is required.');
        }

        // Construct the PrankLink
        const PrankLink = `https://pslink.world/${req.body.prankName}`;
        console.log(PrankLink);

        const prankData = await PRANK.findOne({ Link: PrankLink }).select('-_id -__v');
        const adminData = await ADMIN.findOne({ Link: PrankLink }).select('-_id -__v');

        if (!prankData && !adminData) {
            throw new Error('No data found for the provided prankName.');
        }

        // Respond with the appropriate data
        res.status(201).json({
            status: 1,
            message: 'Prank Data Found Successfully',
            data: prankData || adminData
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


// ======================== Share =======================
const imagePath = '/home/plexustechnology/pslink.world/api/public/images/cover/';
const imagePathUser = '/home/plexustechnology/pslink.world/api/public/images/user/';
function isBrowser(userAgent) {
    const browserPatterns = [
        'Mozilla',
        'Chrome',
        'Safari',
        'Firefox',
        'Edge',
        'Opera'
    ];

    return browserPatterns.some(pattern =>
        userAgent && userAgent.includes(pattern)
    );
}


exports.Share = async function (req, res, next) {
    try {
        const userAgent = req.headers['user-agent'];
        const imageName = req.params.imageName;
        const id = req.params.id;

        const prankData = await PRANK.findOne({ ItemId: id }).select('Link');

        // // If request is from a browser, redirect to lolcards.link
        if (isBrowser(userAgent)) {
            return res.redirect(prankData.Link);
        }

        // For non-browser requests (Instagram, Facebook, etc), serve the file
        res.sendFile(path.join(imagePath, imageName));
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.UserShare = async function (req, res, next) {
    try {
        const userAgent = req.headers['user-agent'];
        const imageName = req.params.imageName;
        const id = req.params.id;

        const prankData = await PRANK.findOne({ ItemId: id }).select('Link');

        // // If request is from a browser, redirect to lolcards.link
        if (isBrowser(userAgent)) {
            return res.redirect(prankData.Link);
        }

        // For non-browser requests (Instagram, Facebook, etc), serve the file
        res.sendFile(path.join(imagePathUser, imageName));
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};