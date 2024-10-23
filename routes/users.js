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

/* GET user listing. */
router.post('/register' , upload.none(), userControllers.Register);

router.post('/users' , upload.none(), userControllers.Read);

// Premium Update
router.post('/premium', userControllers.secure, upload.none(), userControllers.Update);


// Cover page 
router.post('/cover/create', upload.array('CoverURL', 5), coverControllers.Create);

router.post('/cover/emoji', upload.none() , userControllers.secure , coverControllers.Emoji);

router.post('/cover/realistic', upload.none() ,userControllers.secure , coverControllers.Realistic);

router.post('/cover/read', coverControllers.Read);

router.patch('/cover/update/:id', upload.single('CoverURL'), coverControllers.Update);

router.delete('/cover/delete/:id', coverControllers.Delete);


// Character
router.post('/character/all', userControllers.secure, upload.none(), audioControllers.FoundAudio);

// Favourite
router.post('/favourite', userControllers.secure, upload.none(), userControllers.Favourite);

router.post('/favourite/all', userControllers.secure, upload.none(), userControllers.FavouriteRead);


module.exports = router;


