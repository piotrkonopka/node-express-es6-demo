![Node.js](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/200px-Node.js_logo.svg.png) ![Express.js](https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png)

# ES6 Express.js demonstration application

The project consists of progressive phases.

Task 1: Local authentication with Passport.js and JSON Web Tokens - done  
Task 2: Profile edit page, uploading avatar's image, deleting account - done  
Task 3: Recaptcha verification on sign up - done  
Task 4: Password reset feature with Nodemailer support  
...  

# Getting started

To get the server running locally:

- Clone this repo
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials))
- Get Google recaptcha API keys ([reCAPTCHA](https://www.google.com/recaptcha))
- `mongod` to start daemon process for the MongoDB system
- `npm run-script dev` for a dev server. Navigate to `http://localhost:3000/`. The app will automatically reload if you change any of the source files.

# Code Overview

## Dependencies

- [express] (https://github.com/expressjs/express) - The heart of this app, fast & furious way to handle routing, and all other backend stuff 
- [express-jwt] (https://github.com/auth0/express-jwt) - Middleware for JWT validation
- [express-recaptcha] (https://github.com/pdupavillon/express-recaptcha) - Google recaptcha middleware for express
- [passport] (https://github.com/jaredhanson/passport) - Authentication middleware
- [mongoose] (https://github.com/Automattic/mongoose) - For asynchronous work with MongoDB
- [mongoose-unique-validator] (https://github.com/blakehaswell/mongoose-unique-validator) - Mongoose plugin for handling validations in fields within a Mongoose schema
- [multer] (https://github.com/expressjs/multer) - Middleware for handling `multipart/form-data` and uploaded files.
- [nodemon] (https://github.com/remy/nodemon) - Node.js watcher for automatic application's restarts
- [node-sass-middleware] (https://github.com/sass/node-sass-middleware) - Middleware for SASS
- [pug] (https://github.com/pugjs/pug) - Template engine for building views
- [bootstrap] (https://github.com/twbs/bootstrap) - Base for custom frontend styling

## Application Structure

- `bin/` - This folder contains the server startup script
- `config/` - Base configuration for application, passport & authentication middleware
- `models/` - Mongoose schemas and methods for map a MongoDB collections
- `public/` - The frontend stuff, styles, scripts and uploaded images
- `routes/` - Routes
- `views/` - Pug templates
- `app.js` - The entry point to the application and server error handling

## Additional remarks

To get reCAPTCHA to work, you need to sign up for an API key pair for your site. 
The key pair consists of a site key and secret key. 
Then create a file `config/recaptcha.js` with the following content:  
`
module.exports = { 
    SITE_KEY: 'YOUR_SITE_KEY', 
    SECRET_KEY: 'YOUR_SECRET_KEY' 
};
`