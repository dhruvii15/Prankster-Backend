var express = require('express');
var router = express.Router();
const adsControllers = require('../Controllers/ads')

/* GET service listing. */
router.post('/create', adsControllers.Create);

router.post('/read', adsControllers.Read);

router.post('', adsControllers.Found);

router.patch('/update/:id', adsControllers.Update);

router.delete('/delete/:id', adsControllers.Delete);


module.exports = router;