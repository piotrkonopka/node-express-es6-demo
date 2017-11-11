const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    sassMiddleware = require('node-sass-middleware'),
    session = require('express-session'),
    cors = require('cors'),
    secret = require('./config').secret,
    jwtExpiration = require('./config').jwtExpirationDays,
    dbUrl = require('./config').dbUrl,
    mongoose = require('mongoose'); 

const app = express();

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));  
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/socket.io-client', express.static(__dirname + '/node_modules/socket.io-client/dist/'));
app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/lib/'));

app.use(session({
    secret: secret,
    cookie: {maxAge: jwtExpiration * 1000},
    resave: true,
    saveUninitialized: true
}));

mongoose.connect(dbUrl, {
    useMongoClient: true
});
mongoose.set('debug', true);

require('./models/user');
require('./config/passport');

app.use('/', require('./routes/users'));
app.use('/chat', require('./routes/chat'));

app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    switch(err.name) {
        case 'ValidationError':
            return res.status(400).json(err);
            
        case 'UnauthorizedError':
            return res.redirect('/login');
            
        default: 
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.status(err.status || 500);
            return res.render('error');
    }
});

module.exports = app;
