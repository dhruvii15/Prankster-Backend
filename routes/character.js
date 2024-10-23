var express = require('express');
var router = express.Router();
const userControllers = require('../Controllers/users')
const characterControllers = require('../Controllers/character')
const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/characters'); // Destination for character images
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
        cb(null, file.fieldname + '-' + uniqueSuffix );
    }
});


const upload = multer({ storage: storage });


// CHARACTER
router.post('/create', upload.single('CharacterImage'), characterControllers.Create);

router.post('', upload.none() ,userControllers.secure, characterControllers.Found);

router.post('/read', characterControllers.Read);

router.patch('/update/:id', upload.single('CharacterImage'), characterControllers.Update);

router.delete('/delete/:id', characterControllers.Delete);




module.exports = router;