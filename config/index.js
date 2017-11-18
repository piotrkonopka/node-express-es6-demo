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
    validatePassword: (password) => {
        let regExp = /^[a-zA-Z0-9.!]{5,20}$/;
        return password.match(regExp) !== null;
    },
    jwtExpirationDays: 1
};
