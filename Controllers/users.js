const ADMIN = require('../models/admin')
const SPINNER = require('../models/spinner')
const PRANK = require('../models/prank')
const USERAUDIO = require('../models/userAudio');
const USERVIDEO = require('../models/userVideo');
const USERGALLERY = require('../models/userGallery');
const USERCOVER = require('../models/userCover');
const COVER = require('../models/cover');
const IMAGE = require('../models/gallery')
const AUDIO = require('../models/audio');
const crypto = require('crypto');
const VIDEO = require('../models/video');


const ADMIN2 = require('../models2/admin')
const SPINNER2 = require('../models2/spinner')
const PRANK2 = require('../models2/prank')
const USERAUDIO2 = require('../models2/userAudio');
const USERVIDEO2 = require('../models2/userVideo');
const USERGALLERY2 = require('../models2/userGallery');
const USERCOVER2 = require('../models2/userCover');
const COVER2 = require('../models2/cover');
const IMAGE2 = require('../models2/gallery')
const AUDIO2 = require('../models2/audio');
const VIDEO2 = require('../models2/video');

// User Upload

exports.UserRead = async function (req, res, next) {
    try {
        let data
        switch (req.body.TypeId) {
            case '1':  // USERAUDIO
                data = await USERAUDIO2.find();
                break;
            case '2':  // USERVIDEO
                data = await USERVIDEO2.find();
                break;
            case '3':  // USERGALLERY
                data = await USERGALLERY2.find();
                break;
            case '4':  // USERCOVER
                data = await USERCOVER2.find();
                break;
            default:
                throw new Error('Invalid TypeId');
        }

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: data,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.UserDelete = async function (req, res, next) {
    try {
        switch (req.query.TypeId) {
            case '1':  // USERAUDIO
                await USERAUDIO2.findByIdAndDelete(req.params.id);
                break;
            case '2':  // USERVIDEO
                await USERVIDEO2.findByIdAndDelete(req.params.id);
                break;
            case '3':  // USERGALLERY
                await USERGALLERY2.findByIdAndDelete(req.params.id);
                break;
            case '4':  // USERCOVER
                await USERCOVER2.findByIdAndDelete(req.params.id);
                break;
            default:
                throw new Error('Invalid TypeId');
        }
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



// SPINNER Spin Prank
function generateUniqueName(baseWord, length = 15) {
    const randomPart = crypto.randomBytes(length).toString('hex').slice(0, length);
    return `${baseWord}${randomPart}$${randomPart}$$${randomPart}`;
}

// Check if the URL is unique across both PRANK and SPINNER collections
async function isUrlUnique(url) {
    const prankCount = await PRANK2.countDocuments({ Link: url });
    const spinnerCount = await SPINNER2.countDocuments({ Link: url });
    return prankCount === 0 && spinnerCount === 0;
}

// Generate a unique URL by appending the unique name to a base URL
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

exports.Spin2 = async function (req, res) {
    try {
        if (Object.keys(req.body).some(key => /\s/.test(key))) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.typeid) throw new Error('typeid is required.');

        const covers = await COVER2.find();
        if (!covers.length) throw new Error("No covers found in the database.");

        const nextId = ((await SPINNER2.findOne().sort('-ItemId'))?.ItemId || 0) + 1;

        const randomCover = covers[Math.floor(Math.random() * covers.length)];
        req.body = {
            ...req.body,
            ItemId: nextId,
            CoverImage: randomCover.CoverURL,
            Name: randomCover.CoverName,
            ShareURL: `https://pslink.world/api/public/images/cover/${randomCover.ItemId}/${randomCover.CoverURL.split('/').pop()}`,
        };

        const types = {
            '1': { data: await AUDIO2.find(), type: "audio" },
            '2': { data: await VIDEO2.find(), type: "video" },
            '3': { data: await IMAGE2.find(), type: "gallery" },
        };

        const typeInfo = types[req.body.typeid];
        if (!typeInfo) throw new Error('Invalid TypeId.');

        const randomItem = typeInfo.data[Math.floor(Math.random() * typeInfo.data.length)];
        req.body = {
            ...req.body,
            File: randomItem.Audio || randomItem.Video || randomItem.GalleryImage,
            Image: randomItem.AudioImage || "",
            Type: typeInfo.type,
        };

        req.body.Link = await createUniqueUrl(req.body.Name.replace(/\s+/g, ''));
        const dataCreate = await SPINNER2.create(req.body);

        res.status(201).json({
            status: 1,
            message: 'Prank Created Successfully',
            data: (({ ItemId, Link, CoverImage, File, Image, Type, Name, ShareURL }) => ({
                ItemId, Link, CoverImage, File, Image, Type, Name, ShareURL,
            }))(dataCreate),
        });
    } catch (error) {
        res.status(400).json({ status: 0, message: error.message });
    }
};


exports.Spin = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.TypeId) {
            throw new Error('TypeId value is required');
        }

        const TypeId = req.body.TypeId;

        let query = {};
        if (TypeId === '1') {
            query = { Type: 'audio' };
        } else if (TypeId === '2') {
            query = { Type: 'video' };
        } else if (TypeId === '3') {
            query = { Type: 'gallery' };
        } else {
            throw new Error('Better Luck Next Time');
        }

        const Data = await ADMIN.find(query).select('-_id -__v -ItemId');

        if (Data.length > 0) {
            const randomData = Data[Math.floor(Math.random() * Data.length)];

            // Ensure all fields exist, defaulting to an empty string if missing
            const sanitizedData = {
                Link: randomData.Link || "",
                CoverImage: randomData.CoverImage || "",
                File: randomData.File || "",
                Type: randomData.Type || "",
                Name: randomData.Name || "",
                ShareURL: randomData.ShareURL || "",
                Image: randomData.Image || "",
            };

            return res.status(200).json({
                status: 1,
                message: 'Data Found Successfully',
                data: sanitizedData,
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

// safe
exports.Safe = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        const { type } = req.body;

        // Determine the collection based on type
        let collection;
        switch (type) {
            case "1":
                collection = AUDIO2;
                await ADMIN2.findByIdAndUpdate(req.params.id, { AudioSafe: true }, { new: true })
                break;
            case "2":
                collection = VIDEO2;
                await ADMIN2.findByIdAndUpdate(req.params.id, { VideoSafe: true }, { new: true })
                break;
            case "3":
                collection = IMAGE2;
                await ADMIN2.findByIdAndUpdate(req.params.id, { ImageSafe: true }, { new: true })
                break;
            case "4":
                collection = COVER2; // Replace with your actual Cover model
                await ADMIN2.findByIdAndUpdate(req.params.id, { CoverSafe: true }, { new: true })
                break;
            default:
                throw new Error('Invalid type provided.');
        }

        const unsafeData = await collection.find({ Unsafe: true });

        if (unsafeData.length > 0) {
            await collection.updateMany({ Unsafe: true }, { $set: { Hide: true } });

            return res.status(200).json({
                status: 1,
                message: 'Unsafe items updated successfully, Hide and Unsafe set to false.',
            });
        } else {
            return res.status(200).json({
                status: 1,
                message: 'No unsafe data found.',
            });
        }

    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.UnSafe = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };

        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        const { type } = req.body;

        // Determine the collection based on type
        let collection;
        switch (type) {
            case "1":
                collection = AUDIO2;
                await ADMIN2.findByIdAndUpdate(req.params.id, { AudioSafe: false }, { new: true })
                break;
            case "2":
                collection = VIDEO2;
                await ADMIN2.findByIdAndUpdate(req.params.id, { VideoSafe: false }, { new: true })
                break;
            case "3":
                collection = IMAGE2;
                await ADMIN2.findByIdAndUpdate(req.params.id, { ImageSafe: false }, { new: true })
                break;
            case "4":
                collection = COVER2; // Replace with your actual Cover model
                await ADMIN2.findByIdAndUpdate(req.params.id, { CoverSafe: false }, { new: true })
                break;
            default:
                throw new Error('Invalid type provided.');
        }

        const unsafeData = await collection.find({ Unsafe: true });

        if (unsafeData.length > 0) {
            await collection.updateMany({ Unsafe: true }, { $set: { Hide: false } });

            return res.status(200).json({
                status: 1,
                message: 'Items updated successfully.',
            });
        } else {
            return res.status(200).json({
                status: 1,
                message: 'No unsafe data found.',
            });
        }

    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


// Downloader Social
// ================================================================================


// Main Social function
exports.Social = async function (req, res, next) {
    const fetch = (await import('node-fetch')).default;
    try {
        if (Object.keys(req.body).some(key => /\s/.test(key))) {
            throw new Error('Field names must not contain whitespace.');
        }
        const url = req.body.url;
        const cookies = req.query.cookies || 'your_instagram_cookies_here';
        // const cookies = 'datr=OuTeZsdj8SK67Rhoqr8SYcNR; ig_did=D06039D8-7E13-43F2-AACB-55B27E54926A; ig_nrcb=1; ps_l=1; ps_n=1; mid=Z01FHQALAAGoUNLjhYI54SMjSjfM; ds_user_id=14819990979; csrftoken=ibrmwu4okbsD852zWBjqJ486H9AcHmjR; sessionid=14819990979%3AJhca6bsCLbTR6B%3A7%3AAYfUREoXqAgqfq5uyMAXMAOfx3sHH25FlQar1pLTCQ; wd=160x868; dpr=2; rur="LDC\05414819990979\0541769256902:01f79b73a63403a61d63fd878644a6090cdef9b046aeefa623309d6a0c94da9a228e572e"';

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Determine the platform based on the URL
        if (isInstagramUrl(url)) {
            const result = await handleInstagramUrl(url, cookies);
            return res.json(result);
        } else if (isSnapchatUrl(url)) {
            const result = await handleSnapchatUrl(url);
            return res.json(result);
        } else {
            return res.status(400).json({ error: 'Unsupported URL type' });
        }
    } catch (error) {
        res.status(500).json({
            status: 0,
            error: error.message || 'Failed to fetch media'
        });
    }
};

// Check if the URL is for Instagram
function isInstagramUrl(url) {
    return url.includes('instagram.com');
}

// Check if the URL is for Snapchat
function isSnapchatUrl(url) {
    return url.includes('snapchat.com');
}

// Handle Instagram URL
async function handleInstagramUrl(instagramUrl, cookies) {
    const { type, mediaId } = parseInstagramUrl(instagramUrl);

    const apiUrl = `https://www.instagram.com/${type}/${mediaId}/?__a=1&__d=dis`;

    const response = await fetch(apiUrl, {
        headers: getHeaders(cookies),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`Instagram API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const media = data.graphql.shortcode_media;
    
    // Get first media URL
    const firstMediaUrl = media.edge_sidecar_to_children 
        ? media.edge_sidecar_to_children.edges[0].node.is_video 
            ? media.edge_sidecar_to_children.edges[0].node.video_url 
            : media.edge_sidecar_to_children.edges[0].node.display_url
        : (media.is_video ? media.video_url : media.display_url);

    return {
        status: 1,
        message: 'Instagram URL Found Successfully',
        data: firstMediaUrl
    };
}

// async function handleInstagramUrl(instagramUrl, cookies) {
//     const { type, mediaId } = parseInstagramUrl(instagramUrl);

//     const apiUrl = `https://www.instagram.com/${type}/${mediaId}/?__a=1&__d=dis`;

//     const response = await fetch(apiUrl, {
//         headers: getHeaders(cookies),
//         credentials: 'include'
//     });

//     if (!response.ok) {
//         throw new Error(`Instagram API responded with status: ${response.status}`);
//     }

//     const data = await response.json();

//     // const media = data.graphql.shortcode_media;
    
//     // // Get first media URL
//     // const firstMediaUrl = media.edge_sidecar_to_children 
//     //     ? media.edge_sidecar_to_children.edges[0].node.is_video 
//     //         ? media.edge_sidecar_to_children.edges[0].node.video_url 
//     //         : media.edge_sidecar_to_children.edges[0].node.display_url
//     //     : (media.is_video ? media.video_url : media.display_url);

//     if (!data || !data.items || data.items.length === 0) {
//         throw new Error('Unable to extract media from Instagram response');
//     }

//     let mediaUrl, responseType;

//     if (type === 'reel') {
//         mediaUrl = data.items[0].video_versions[0].url;
//         responseType = 'reel';
//     } else if (type === 'p') {
//         mediaUrl = data.items[0].image_versions2.candidates[0].url;
//         responseType = 'post';
//     } else {
//         throw new Error('Unsupported media type');
//     }

//     return {
//         status: 1,
//         message: `Instagram ${responseType} URL Found Successfully`,
//         // type: responseType,
//         data: mediaUrl
//     };
// }

// Handle Snapchat URL


async function handleSnapchatUrl(snapchatUrl) {
    const apiUrl = 'https://downloader-api.sikderithub.com/snap.php';
    
    const response = await fetch(`${apiUrl}?video=${encodeURIComponent(snapchatUrl)}`);
    
    if (!response.ok) {
        throw new Error(`Snapchat API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
        status: 0,
        // mediaType: 'snapchat',
        message: 'Snapchat URL Found Successfully',
        data: data.data.formats[0].url 
    };
}

// Helper function to parse Instagram URL (implement as needed)
function parseInstagramUrl(instagramUrl) {
    const regex = /\/(p|reel|tv)\/([^/?#&]+)/;
    const match = instagramUrl.match(regex);

    if (!match) {
        throw new Error('Invalid Instagram URL');
    }

    return {
        type: match[1],
        mediaId: match[2]
    };
}

// Helper function to generate headers for Instagram API
function getHeaders(cookies) {
    return {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
}




