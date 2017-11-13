const mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken'),
    jwtExpiration = require('../config').jwtExpirationDays,
    secret = require('../config').secret;

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, 'can\'t be blank'],
        match: [/^[a-zA-Z0-9]{3,20}$/, 'is invalid'],
        index: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, 'can\'t be blank'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'is invalid'],
        index: true
    },
    bio: String,
    image: String,
    hash: String,
    salt: String,
    resethash: String
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

class UserClass {
    validPassword(password) {
        let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
        return this.hash === hash;
    }

    setPassword(password) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    }
    
    generateJWT() {
        let today = new Date();
        let exp = new Date(today);
        exp.setDate(today.getDate() + jwtExpiration);

        return jwt.sign({
            id: this._id,
            username: this.username,
            exp: parseInt(exp.getTime() / 1000)
        }, secret);
    }

    toAuthJSON() {
        return {
            username: this.username,
            email: this.email,
            token: this.generateJWT(),
            bio: this.bio,
            image: this.image
        };
    }
    
    toPublicJSON() {
        return {
            username: this.username,
            email: this.email,
            bio: this.bio,
            image: this.image
        };
    }
}

UserSchema.loadClass(UserClass);
mongoose.model('User', UserSchema);