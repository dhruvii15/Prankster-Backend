var express = require('express');
var router = express.Router();
const sanitizeBody = require('../middlewares/sanitizeBody');
const adsControllers = require('../Controllers/ads')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage })

/* GET service listing. */
router.post('/create', sanitizeBody ,adsControllers.Create);

router.post('/read', sanitizeBody , adsControllers.Read);

router.post('', sanitizeBody , upload.none(), adsControllers.Found);

router.post('/changes', sanitizeBody , upload.none(), adsControllers.Found2);

router.patch('/update/:id', sanitizeBody , adsControllers.Update);

router.delete('/delete/:id', sanitizeBody , adsControllers.Delete);


module.exports = router;