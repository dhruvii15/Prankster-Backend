var express = require('express');
var router = express.Router();
const categoryControllers = require('../Controllers/category')
const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/category'); // Destination for category images
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, ''); // Remove all spaces
        cb(null, file.fieldname + '-' + uniqueSuffix + sanitizedOriginalName);
    }
});


const upload = multer({ storage: storage });


// CATEGORY
router.post('/create', upload.single('CategoryImage'), categoryControllers.Create);

router.post('', upload.none() , categoryControllers.Found);

router.post('/read', categoryControllers.Read);

router.patch('/update/:id', upload.single('CategoryImage'), categoryControllers.Update);

router.delete('/delete/:id', categoryControllers.Delete);




module.exports = router;