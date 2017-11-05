const router = require('express').Router(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    path = require('path'),
    crypto = require('crypto'),
    
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
    auth = require('../config/auth'),
    mailer = require('../config/mailer'),
    
    Recaptcha = require('express-recaptcha'),
    SITE_KEY = require('../config/recaptcha').SITE_KEY,
    SECRET_KEY = require('../config/recaptcha').SECRET_KEY,
    recaptcha = new Recaptcha(SITE_KEY, SECRET_KEY);

router.get('/', (req, res, next) => {
    return res.redirect('/login');
});

router.get('/login', (req, res, next) => {
    return res.render('login');
});

router.get('/signup', recaptcha.middleware.render, (req, res, next) => {
    return res.render('signup', { captcha:res.recaptcha });
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

router.post('/user/signup', 
            upload.fields([
                {name: 'email'},
                {name: 'password'},
                {name: 'username'},
                {name: 'g-recaptcha-response'}
            ]),
            recaptcha.middleware.verify,
            (req, res, next) => {
    if (!req.body.username) {
        return returnError(res, 'username');
    }
    
    if (!req.body.email) {
        return returnError(res, 'email');
    }

    if (!req.body.password) {
        return returnError(res, 'password');
    }
    
    if (req.recaptcha.error) {
        return returnError(res, 'recaptcha', req.recaptcha.error);
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
    
    User.findOne({email: req.body.email}).then((user) => {
        if(user) {
            let hash = crypto.randomBytes(16).toString('hex');
            user.resethash = hash;
            
            return user.save().then(() => {
                let email = mailer.sendEmail({
                    host: req.headers.host,
                    email: req.body.email, 
                    username: user.username,
                    hash
                });
                
                email.then((info) => {
                    return res.json({messages: {success: 'email was sent'}});
                }).catch((err) => {
                    return returnError(res, 'email', 'can\'t be send');
                });
                
            });
            
        } else {
            return returnError(res, 'email', 'not found');
        }
    });
});

router.get('/user/reset/password/:hash/:username', (req, res, next) => {
    if (!req.params.hash) {
        return res.redirect('/');
    }
    
    if (!req.params.username) {
        return res.redirect('/');
    }
    
    User.findOne({resethash: req.params.hash, username: req.params.username}).then((user) => {
        if(user) {
            return res.render('reset-password');
            
        } else {
            return res.redirect('/login');
        }
    });
});

router.put('/user/reset/password/:hash/:username', upload.fields([{name: 'password'}]), (req, res, next) => {
    if (!req.params.hash) {
        return returnError(res, 'error', 'the operation is not authorized');
    }
    
    if (!req.params.username) {
        return returnError(res, 'error', 'the operation is not authorized');
    }
    
    if (!req.body.password) {
        return returnError(res, 'password');
    } 
    
    User.findOne({resethash: req.params.hash, username: req.params.username}).then((user) => {
        if(user) {
            user.resethash = undefined;
            user.setPassword(req.body.password);
                    
            return user.save().then(() => {
                return res.json({messages: {success: 'password was successfully changed'}});
            });
            
        } else {
            return returnError(res, 'error', 'the user does not exist');
        }
    });
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
