const router = require('express').Router(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    path = require('path'),
    multer = require('multer'),
    storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './public/images/uploads');
        },
        filename: (req, file, callback) => {
            callback(null, `${req.payload.username}.jpg`);
        }
    }),
    upload = multer({
            storage: storage,
            limits: {
                fileSize: 10240
            },
            fileFilter: (req, file, callback) => {
                if(file.mimetype !== 'image/jpeg') {
                    return callback(null, false);
                }
                
                callback(null, true);
            }
        }),
    returnError = require('../config').returnError,
    logout = require('../config').logout,
    auth = require('../config/auth');


router.get('/', (req, res, next) => {
    return res.redirect('/login');
});

router.get('/login', (req, res, next) => {
    return res.render('login');
});

router.get('/signup', (req, res, next) => {
    return res.render('signup');
});

router.get('/profile', auth.required, (req, res, next) => {
    return res.render('profile');
});

router.get('/profile/edit', auth.required, (req, res, next) => {
    return res.render('profile-edit');
});

router.get('/user', auth.required, (req, res, next) => {
    User.findById(req.payload.id).then((user) => {
        if (!user) {
            return res.sendStatus(401);
        }

        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});

router.put('/user', auth.required, upload.single('avatar'), (req, res, next) => {
    User.findById(req.payload.id).then((user) => {
        if (!user) {
            return res.sendStatus(401);
        }

        if (typeof req.body.username !== 'undefined') {
            user.username = req.body.username;
        }
        if (typeof req.body.email !== 'undefined') {
            user.email = req.body.email;
        }
        if (typeof req.body.bio !== 'undefined') {
            user.bio = req.body.bio;
        }
        if (typeof req.file !== 'undefined') {
            user.image = req.file.filename;
        }
        if (typeof req.body.password !== 'undefined') {
            user.setPassword(req.body.password);
        }

        return user.save().then(() => {
            return res.json({user: user.toAuthJSON()});
        });
    }).catch(next);
});

router.post('/user/login', upload.fields([
                {name: 'email'},
                {name: 'password'}
            ]), (req, res, next) => {
    if (!req.body.email) {
        return returnError(res, 'email');
    }

    if (!req.body.password) {
        return returnError(res, 'password');
    }

    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (user) {
            user.token = user.generateJWT();
            return res.json({user: user.toAuthJSON()});
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

router.post('/user/signup', upload.fields([
                {name: 'email'},
                {name: 'password'},
                {name: 'username'}
            ]),(req, res, next) => {
    if (!req.body.username) {
        return returnError(res, 'username');
    }
    
    if (!req.body.email) {
        return returnError(res, 'email');
    }

    if (!req.body.password) {
        return returnError(res, 'password');
    }

    let user = new User();

    user.username = req.body.username;
    user.email = req.body.email;
    user.setPassword(req.body.password);

    return user.save().then(() => {
        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});

router.get('/login-help', (req, res, next) => {
    return res.render('login-help');
});

router.post('/user/reset/password', upload.fields([{name: 'email'}]), (req, res, next) => {
    if (!req.body.email) {
        return returnError(res, 'email');
    }

    return res.json({messages: {success: 'email was sent'}});
});

router.post('/user/del', auth.required, (req, res, next) => {
    User.findById(req.payload.id).then((user) => {
        user.remove().then(() => {
            logout(req, res);
        }).catch(next);
    });
});

router.post('/logout', auth.required, (req, res, next) => {
    logout(req, res);
});

module.exports = router;
