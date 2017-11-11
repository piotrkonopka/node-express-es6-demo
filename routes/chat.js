const router = require('express').Router(),
    auth = require('../config/auth');

router.get('/', auth.required, (req, res, next) => {
    return res.render('chat');
});

module.exports = router;