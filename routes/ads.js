var express = require('express');
var router = express.Router();
const sanitizeBody = require('../middlewares/sanitizeBody');
const adsControllers = require('../Controllers/ads')

/* GET service listing. */
router.post('/create', sanitizeBody ,adsControllers.Create);

router.post('/read', sanitizeBody , adsControllers.Read);

router.post('', sanitizeBody , adsControllers.Found);

router.patch('/update/:id', sanitizeBody , adsControllers.Update);

router.delete('/delete/:id', sanitizeBody , adsControllers.Delete);


module.exports = router;