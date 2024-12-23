const ADMIN = require('../models/admin')
const USERAUDIO = require('../models/userAudio');
const USERVIDEO = require('../models/userVideo');
const USERGALLERY = require('../models/userGallery');
const USERCOVER = require('../models/userCover');

// User Upload

exports.UserRead = async function (req, res, next) {
    try {
        let data
        switch (req.body.TypeId) {
            case '1':  // USERAUDIO
                data = await USERAUDIO.find();
                break;
            case '2':  // USERVIDEO
                data = await USERVIDEO.find();
                break;
            case '3':  // USERGALLERY
                data = await USERGALLERY.find();
                break;
            case '4':  // USERCOVER
                data = await USERCOVER.find();
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
                await USERAUDIO.findByIdAndDelete(req.params.id);
                break;
            case '2':  // USERVIDEO
                await USERVIDEO.findByIdAndDelete(req.params.id);
                break;
            case '3':  // USERGALLERY
                await USERGALLERY.findByIdAndDelete(req.params.id);
                break;
            case '4':  // USERCOVER
                await USERCOVER.findByIdAndDelete(req.params.id);
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


// spin
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
            throw new Error('Better Luck Next Time')
        }

        const Data = await ADMIN.find(query).select('-_id -__v -ItemId');

        // If there is data, pick a random one
        if (Data.length > 0) {
            var randomData = Data[Math.floor(Math.random() * Data.length)];
        } else {
            throw new Error('No data found')
        }

        return res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: randomData,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


// Snap
// exports.Snap = async function (req, res, next) {
//     // Get user identifiers
//     const userIp = (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || null)?.split(',')[0]?.trim();
//     const userAgent = req.headers['user-agent'] || null;
//     const deviceId = req.body.device_id || 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6';
//     const snapAppId = '97ad68aa-a2bf-4a7d-b07a-f2a39f03caa6';
//     const appId = req.body.appId || 'com.lol.android';
//     const eventType = 'APP_INSTALL';
//     const eventConversionType = 'MOBILE_APP';

//     // Validate required identifiers
//     if (!userIp || !userAgent) {
//         return res.status(400).json({
//             success: false,
//             message: 'IP address and User-Agent are required for Snap Conversion API'
//         });
//     }

//     // Hash IP address using SHA256
//     const hashedIp = crypto.createHash('sha256')
//         .update(userIp.toLowerCase().trim())
//         .digest('hex');

//     // Construct Snapchat payload with required fields
//     const snapPixelData = {
//         snap_app_id: snapAppId,
//         event_type: eventType,
//         event_conversion_type: eventConversionType,
//         timestamp: new Date().toISOString(),
//         app_id: appId,
//         device_id: deviceId,
//         user_agent: userAgent,
//         hashed_ip_address: hashedIp, // Changed from hashed_ip to hashed_ip_address
//         http_user_agent: userAgent,  // Added explicit http_user_agent field
//     };

//     // Optional: Add debug logging
//     // console.log('Sending data to Snap:', JSON.stringify(snapPixelData, null, 2));

//     try {
//         const response = await axios.post('https://tr.snapchat.com/v2/conversion', snapPixelData, {
//             headers: {
//                 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzI4OTk0MDg2LCJzdWIiOiJjMmQyMzI5OC0wYTIzLTRmZTItOTVhZi0zZjJlMDFhMjc0MmZ-UFJPRFVDVElPTn5mNjZjMWI2Yy03ZGY0LTRiMGYtYmRjMy05NTg3ZTgyMTg3MjkifQ.3hNCt4lxU_pnOliF3rxieAI1LT35d-D7BcQqEGPOjbY',
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (response.status === 200) {
//             console.log('Snap API Response:', response.data);
//             res.status(200).json({
//                 success: true,
//                 message: 'Event tracked successfully with Snap Pixel.',
//                 data: response.data
//             });
//         } else {
//             throw new Error('Non-200 response received');
//         }
//     } catch (error) {
//         console.error('Error tracking event:', error.response ? error.response.data : error.message);
//         res.status(500).json({
//             success: false,
//             message: 'Error tracking event.',
//             error: error.response ? error.response.data : error.message
//         });
//     }
// };

