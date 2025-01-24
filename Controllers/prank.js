const PRANK = require('../models/prank');
const SPINNER = require('../models/spinner');
const USERAUDIO = require('../models/userAudio');
const USERVIDEO = require('../models/userVideo');
const USERGALLERY = require('../models/userGallery');
const USERCOVER = require('../models/userCover');

const PRANK2 = require('../models2/prank');
const SPINNER2 = require('../models2/spinner');
const USERAUDIO2 = require('../models2/userAudio');
const USERVIDEO2 = require('../models2/userVideo');
const USERGALLERY2 = require('../models2/userGallery');
const USERCOVER2 = require('../models2/userCover');

var path = require('path');
const { Worker } = require('worker_threads');

class BackgroundWorker {
    static runWorker(workerScript, workerData) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(`
                const { parentPort, workerData } = require('worker_threads');
                const mongoose = require('mongoose');
                const crypto = require('crypto');

                mongoose.connect('mongodb+srv://prankster:prankster%402024@cluster0.ea1xm.mongodb.net/Prankster', { useNewUrlParser: true, useUnifiedTopology: true }).catch(console.error);

                const prankSchema = new mongoose.Schema({ Link: String });
                const adminSchema = new mongoose.Schema({ Link: String });
                const PRANK = mongoose.model('Prank', prankSchema);
                const ADMIN = mongoose.model('Admin', adminSchema);

                ${workerScript}

                parentPort.on('message', async (data) => {
                    try {
                        const result = await processData(data);
                        await mongoose.disconnect();
                        parentPort.postMessage({ success: true, data: result });
                    } catch (error) {
                        await mongoose.disconnect();
                        parentPort.postMessage({ success: false, error: error.message });
                    }
                });
            `, { eval: true });

            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => code !== 0 && reject(new Error(`Worker stopped with exit code ${code}`)));

            worker.postMessage({ ...workerData, mongoUri: 'mongodb+srv://prankster:prankster%402024@cluster0.ea1xm.mongodb.net/Prankster' });
        });
    }

    static async isUrlUnique(url) {
        return (await this.runWorker(`
            async function processData({ url }) {
                return (await PRANK.countDocuments({ Link: url }) + await ADMIN.countDocuments({ Link: url })) === 0;
            }
        `, { url })).data;
    }

    static async createUniqueUrl(baseWord) {
        return (await this.runWorker(`
            async function processData({ baseWord }) {
                let url, isUnique;
                do {
                    const randomPart = crypto.randomBytes(15).toString('hex').slice(0, 15);
                    url = \`https://pslink.world/\${baseWord}\${randomPart}\${randomPart}\${randomPart}\`;
                    isUnique = (await PRANK.countDocuments({ Link: url }) + await ADMIN.countDocuments({ Link: url })) === 0;
                } while (!isUnique);
                return url;
            }
        `, { baseWord })).data;
    }

    static async updateViewCount(type, fileUrl) {
        return (await this.runWorker(`
            async function processData({ type, fileUrl }) {
                const schemas = {
                    audio: new mongoose.Schema({ Audio: String, viewCount: Number }),
                    video: new mongoose.Schema({ Video: String, viewCount: Number }),
                    gallery: new mongoose.Schema({ GalleryImage: String, viewCount: Number }),
                    cover: new mongoose.Schema({ CoverURL: String, viewCount: Number })
                };
                const models = Object.fromEntries(Object.entries(schemas).map(([key, schema]) => [key, mongoose.model(key.charAt(0).toUpperCase() + key.slice(1), schema)]));
                await models.cover.findOneAndUpdate({ CoverURL: fileUrl }, { $inc: { viewCount: 1 } });
                if (type in models) await models[type].findOneAndUpdate({ [type === 'gallery' ? 'GalleryImage' : type.charAt(0).toUpperCase() + type.slice(1)]: fileUrl }, { $inc: { viewCount: 1 } });
                return true;
            }
        `, { type, fileUrl })).data;
    }
}

// Modified Create function
exports.Create = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.Type) {
            throw new Error('Type is required.');
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

        // Generate unique URL in background
        const baseWord = req.body.Name.replace(/\s+/g, '');
        const uniqueUrl = await BackgroundWorker.createUniqueUrl(baseWord);
        req.body.Link = uniqueUrl;

        // Create the prank record
        let dataCreate = await PRANK.create(req.body);

        // Update view counts in background
        BackgroundWorker.updateViewCount(req.body.Type, req.body.File)
            .catch(error => {
                console.error('Error updating view counts:', error);
            });

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

class BackgroundWorker2 {
    static runWorker(workerScript, workerData) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(`
                const { parentPort, workerData } = require('worker_threads');
                const mongoose = require('mongoose');
                const crypto = require('crypto');

                mongoose.connect('mongodb+srv://dhruvii14:dhruviplexus14@cluster0.yuotaba.mongodb.net/Prankster', { useNewUrlParser: true, useUnifiedTopology: true }).catch(console.error);

                const prankSchema = new mongoose.Schema({ Link: String });
                const spinnerSchema = new mongoose.Schema({ Link: String });
                const PRANK = mongoose.model('Prank', prankSchema);
                const SPINNER = mongoose.model('spinner', spinnerSchema);

                ${workerScript}

                parentPort.on('message', async (data) => {
                    try {
                        const result = await processData(data);
                        await mongoose.disconnect();
                        parentPort.postMessage({ success: true, data: result });
                    } catch (error) {
                        await mongoose.disconnect();
                        parentPort.postMessage({ success: false, error: error.message });
                    }
                });
            `, { eval: true });

            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => code !== 0 && reject(new Error(`Worker stopped with exit code ${code}`)));

            worker.postMessage({ ...workerData, mongoUri: 'mongodb+srv://dhruvii14:dhruviplexus14@cluster0.yuotaba.mongodb.net/Prankster' });
        });
    }

    static async isUrlUnique(url) {
        return (await this.runWorker(`
            async function processData({ url }) {
                return (await PRANK.countDocuments({ Link: url }) + await SPINNER.countDocuments({ Link: url })) === 0;
            }
        `, { url })).data;
    }

    static async createUniqueUrl(baseWord) {
        return (await this.runWorker(`
            async function processData({ baseWord }) {
                let url, isUnique;
                do {
                    const randomPart = crypto.randomBytes(15).toString('hex').slice(0, 15);
                    url = \`https://pslink.world/\${baseWord}\${randomPart}\${randomPart}\${randomPart}\`;
                    isUnique = (await PRANK.countDocuments({ Link: url }) + await SPINNER.countDocuments({ Link: url })) === 0;
                } while (!isUnique);
                return url;
            }
        `, { baseWord })).data;
    }

    static async updateViewCount(type, fileUrl) {
        return (await this.runWorker(`
            async function processData({ type, fileUrl }) {
                const schemas = {
                    audio: new mongoose.Schema({ Audio: String, viewCount: Number }),
                    video: new mongoose.Schema({ Video: String, viewCount: Number }),
                    gallery: new mongoose.Schema({ GalleryImage: String, viewCount: Number }),
                    cover: new mongoose.Schema({ CoverURL: String, viewCount: Number })
                };
                const models = Object.fromEntries(Object.entries(schemas).map(([key, schema]) => [key, mongoose.model(key.charAt(0).toUpperCase() + key.slice(1), schema)]));
                await models.cover.findOneAndUpdate({ CoverURL: fileUrl }, { $inc: { viewCount: 1 } });
                if (type in models) await models[type].findOneAndUpdate({ [type === 'gallery' ? 'GalleryImage' : type.charAt(0).toUpperCase() + type.slice(1)]: fileUrl }, { $inc: { viewCount: 1 } });
                return true;
            }
        `, { type, fileUrl })).data;
    }
}

// Modified Create function
exports.Create2 = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.Type) {
            throw new Error('Type is required.');
        }

        const generateName = async (Model, prefix, field) => {
            const lastEntry = await Model.findOne().sort({ _id: -1 }).select(field);
            const match = lastEntry && lastEntry[field]?.match(new RegExp(`${prefix} (\\d+)`));
            const nextNumber = match ? parseInt(match[1], 10) + 1 : 1;
            return `${prefix} ${nextNumber}`;
        };

        const highestItem = await PRANK2.findOne().sort('-ItemId').exec();
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
                const cover = await USERCOVER2.create({
                    CoverURL: req.body.FileUser,
                    CoverName: await generateName(USERCOVER2, 'User Cover', 'CoverName')
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
                        data = await USERAUDIO2.create({
                            Audio: req.body.FileUser,
                            AudioName: await generateName(USERAUDIO2, 'User Audio', 'AudioName')
                        });
                        break;
                    case 'video':
                        data = await USERVIDEO2.create({
                            Video: req.body.FileUser,
                            VideoName: await generateName(USERVIDEO2, 'User Video', 'VideoName')
                        });
                        break;
                    case 'gallery':
                        data = await USERGALLERY2.create({
                            GalleryImage: req.body.FileUser,
                            GalleryName: await generateName(USERGALLERY2, 'User Gallery', 'GalleryName')
                        });
                        break;
                    default:
                        throw new Error('Invalid Type');
                }

            } else if (typeof req.body.File === 'string') {
                req.body.File = req.body.File;
            }
        }

        // Handle Image
        req.body.Image = req.body.ImageURL;

        // Generate unique URL in background
        const baseWord = req.body.Name.replace(/\s+/g, '');
        const uniqueUrl = await BackgroundWorker2.createUniqueUrl(baseWord);
        req.body.Link = uniqueUrl;

        // Create the prank record
        let dataCreate = await PRANK2.create(req.body);

        // Update view counts in background
        BackgroundWorker2.updateViewCount(req.body.Type, req.body.File)
            .catch(error => {
                console.error('Error updating view counts:', error);
            });

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

        const prankData = await PRANK.findOne({ Link: PrankLink }).select('-_id -__v');
        const spinnerData = await SPINNER.findOne({ Link: PrankLink }).select('-_id -__v');

        if (!prankData && !spinnerData) {
            throw new Error('No data found for the provided prankName.');
        }

        // Respond with the appropriate data
        res.status(201).json({
            status: 1,
            message: 'Prank Data Found Successfully',
            data: prankData || spinnerData
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

exports.Update2 = async function (req, res, next) {
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

        const update = await PRANK2.findByIdAndUpdate(req.body.Id, req.body, { new: true });

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