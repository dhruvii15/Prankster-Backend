var express = require('express');
var router = express.Router();
const userControllers = require('../Controllers/users')
const coverControllers = require('../Controllers/cover')
const audioControllers = require('../Controllers/audio')
const multer = require('multer')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/cover');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, '');  // Remove all spaces
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});


const upload = multer({ storage: storage })

const UserStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/user');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, '');  // Remove all spaces
    cb(null, file.fieldname + '-' + uniqueSuffix + sanitizedOriginalName);
  }
});

const UserUpload = multer({ storage: UserStorage })


// Cover page  ===============================
router.post('/cover/create', upload.array('CoverURL', 5), coverControllers.Create);

router.post('/cover/emoji', upload.none() , coverControllers.Emoji);

router.post('/cover/realistic', upload.none() , coverControllers.Realistic);

router.post('/cover/read', coverControllers.Read);

router.patch('/cover/update/:id', upload.single('CoverURL'), coverControllers.Update);

router.delete('/cover/delete/:id', coverControllers.Delete);


router.post('/cover/TagName/read', coverControllers.ReadTagName);




// Category ==============================
router.post('/category/all', upload.none(), audioControllers.FoundAudio);


//user upload ================================
router.post('/users/upload' , UserUpload.single('File'), userControllers.Upload);

router.post('/users/read', userControllers.UserRead);

router.delete('/users/delete/:id', userControllers.UserDelete);


// Spin ===========================
router.post('/spin', upload.none(), userControllers.Spin);


// Snap
// router.post('/track-install', userControllers.Snap);


module.exports = router;


