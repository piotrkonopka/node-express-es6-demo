module.exports = {
    secret: 'azxazxazx',
    returnError: (res, type, message = 'can\'t be blank') => {
        res.status(422).json({errors: {[type]: message}});
    },
    logout: (req, res) => {
        req.logout();
        req.session.destroy();
        res.redirect('/login');
    },
    dbUrl: 'mongodb://localhost/demo',
    jwtExpirationDays: 1
};
