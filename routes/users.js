var express = require('express');
var router = express.Router();
const userControllers = require('../Controllers/users')
const coverControllers = require('../Controllers/cover')
const multer = require('multer')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/cover');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, '');  // Remove all spaces
    cb(null, file.fieldname + '-' + uniqueSuffix + sanitizedOriginalName);
  }
});


const upload = multer({ storage: storage })

/* GET user listing. */
router.post('/register' , userControllers.Register);

// Cover page 
router.post('/cover/create', upload.single('CoverURL'), coverControllers.Create);

router.post('/cover/emoji', upload.none() , userControllers.secure , coverControllers.Emoji);

router.post('/cover/realistic', upload.none() ,userControllers.secure , coverControllers.Realistic);

module.exports = router;


