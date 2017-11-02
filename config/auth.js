const jwt = require('express-jwt'),
  secret = require('../config').secret;

let getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
    return req.headers.authorization.split(' ')[1];
  } else if(req.query.token) {
        return req.query.token;
    } else if(req.params.token) {
        return req.params.token;
    }

  return null;
};

let auth = {
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getToken
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getToken
  })
};

module.exports = auth;
