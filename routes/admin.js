const express = require('express');
const router = express.Router();
const AdminControllers = require('../Controllers/admin');
const sanitizeBody = require('../middlewares/sanitizeBody');



/* Admin Routes */
router.post('/signup', sanitizeBody, AdminControllers.AdminSignup);

router.post('/login', sanitizeBody, AdminControllers.AdminLogin);

router.get('/logout', sanitizeBody, (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

router.get('/read', sanitizeBody, AdminControllers.AdminRead);

router.patch('/update/:id', sanitizeBody, AdminControllers.AdminUpdate);

router.patch('/Forgetpass', sanitizeBody, AdminControllers.Forgetpass);



module.exports = router;