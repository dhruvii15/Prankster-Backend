const express = require('express');
const router = express.Router();
const userControllers = require('../Controllers/users');
const coverControllers = require('../Controllers/cover');
const prankControllers = require('../Controllers/prank');
const audioControllers = require('../Controllers/audio');
const adminControllers = require('../Controllers/admin');
const notificationControllers = require('../Controllers/notification');
const multer = require('multer');
const fs = require('fs').promises;
const sanitizeBody = require('../middlewares/sanitizeBody');
const crypto = require('crypto');
const path = require('path');


// Define storage for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './public/images/cover';
        fs.mkdir(uploadPath, { recursive: true })
            .then(() => cb(null, uploadPath))
            .catch(err => cb(err, uploadPath));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ================================= Cover page ===============================
router.post('/cover/create', upload.array('CoverURL', 5), sanitizeBody, (req, res, next) => {
    if (req.files) {
        req.files = req.files.map(file => file.filename);
    }
    coverControllers.Create(req, res, next);
});

router.post('/cover/changes', upload.none(), sanitizeBody, coverControllers.Emoji2);

router.post('/cover/emoji', upload.none(), sanitizeBody, coverControllers.Emoji);

router.post('/cover/realistic', upload.none(), sanitizeBody, coverControllers.Realistic);

router.post('/cover/read', sanitizeBody, coverControllers.Read);

router.patch('/cover/update/:id', upload.single('CoverURL'), sanitizeBody, (req, res, next) => {
    if (req.file) {
        req.files = [req.file.filename];
    }
    coverControllers.Update(req, res, next);
});

router.delete('/cover/delete/:id', sanitizeBody, coverControllers.Delete);

router.post('/cover/TagName/read', sanitizeBody, coverControllers.ReadTagName);

// =============================== Category ==============================
router.post('/category/all', upload.none(), sanitizeBody, audioControllers.FoundAudio);

router.post('/category/all/changes', upload.none(), sanitizeBody, audioControllers.FoundAudio2);


// =============================== user upload ================================
router.post('/users/read', sanitizeBody, userControllers.UserRead);

router.delete('/users/delete/:id', sanitizeBody, userControllers.UserDelete);

// ==================================== Spin ======================================
router.post('/spin', upload.none(), sanitizeBody, userControllers.Spin);

router.post('/spin/changes', upload.none(), sanitizeBody, userControllers.Spin2);


// ========================================= Share =============================================
router.get('/public/images/cover/:id/:imageName', sanitizeBody, prankControllers.Share);

router.get('/public/images/user/:id/:imageName', sanitizeBody, prankControllers.UserShare);

const playStoreURL = 'https://play.google.com/store/apps/details?id=com.prank.android';
const appStoreURL = 'https://apps.apple.com/us/app/prankster-digital-funny-pranks/id6739135275';

router.get('/download', (req, res) => {
    const userAgent = req.headers['user-agent'];

    if (/android/i.test(userAgent)) {
        res.redirect(playStoreURL);
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        res.redirect(appStoreURL);
    } else {
        res.redirect(playStoreURL);
    }
});

router.get('/snap/ads', (req, res) => {
    const userAgent = req.headers['user-agent'];
    const scid = req.query.ScCid;

    console.log(scid);
    const androidPackageName = "com.prank.android";
    const iosAppId = "6739135275";
    const hashedIpAddress = crypto.createHash('sha256').update(req.ip).digest('hex');
    const hashedUserAgent = crypto.createHash('sha256').update(userAgent).digest('hex');
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzMzOTAwNzM2LCJzdWIiOiJjMmQyMzI5OC0wYTIzLTRmZTItOTVhZi0zZjJlMDFhMjc0MmZ-UFJPRFVDVElPTn40MWE2NjEzOS0xMmRjLTQ3ODctOGFmNC1hZWIxZDk2M2VjMWEifQ.Jk9OE8MWQBznASscGif9A-hOcoVo6bE2GEcJZaERRTo';
    let app_id = '';

    if (/android/i.test(userAgent)) {
        res.redirect(`https://play.google.com/store/apps/details?id=com.prank.android&referrer=utm_source=snapchat&sc_id=${scid}`);
        app_id = androidPackageName;
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        res.redirect(`https://apps.apple.com/us/app/prankster-digital-funny-pranks/id6739135275?utm_source=snapchat?click_id=${scid}`);
        app_id = iosAppId;
    } else {
        res.redirect(`https://play.google.com/store/apps/details?id=com.prank.android&referrer=utm_source=snapchat&sc_id=${scid}`);
        app_id = androidPackageName;
    }

    // Define the event data
    const eventData = {
        "app_id": app_id,
        "snap_app_id": "ae721b65-7e0a-44a4-a03b-2e85af04f0cf",
        "event_conversion_type": "MOBILE_APP",
        "event_type": "AD_CLICK",
        "event_tag": "online",
        "hashed_ip_address": hashedIpAddress,
        "user_agent": hashedUserAgent,
        "timestamp": new Date().toISOString(),
        "click_id": scid
    };

    // Send the event data to Snap Ads Conversion API
    fetch('https://tr.snapchat.com/v2/conversion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify(eventData),
    })
        .then(response => response.json())
        .then(data => console.log('Conversion Event Sent:', data))
        .catch(error => console.error('Error sending conversion event:', error));
});


// ========================================= Notification =============================================
router.post('/notification/create', sanitizeBody, notificationControllers.Create);

router.post('/notification/read', sanitizeBody, notificationControllers.Read);

router.patch('/notification/update/:id', sanitizeBody, notificationControllers.Update);

router.delete('/notification/delete/:id', sanitizeBody, notificationControllers.Delete);

// ========================================= Safe-Unsafe =============================================
router.post('/safe/:id', sanitizeBody, userControllers.Safe);

router.post('/unsafe/:id', sanitizeBody, userControllers.UnSafe);

// ========================================= Social Downloader =============================================
router.post('/social', sanitizeBody, upload.none(), userControllers.Social);

// ===========================

module.exports = router;