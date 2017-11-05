const nodemailer = require('nodemailer'),
    htmlToText = require('nodemailer-html-to-text').htmlToText,
    password = require('../config/email-config').password;

let smtpConfig = {
    host: 'smtp.wp.pl',
    port: 465,
    tls: {
      rejectUnauthorized: false
    },
    secure: true,
    auth: {
        user: 'tmailer',
        pass: password
    }
};

let transporter = nodemailer.createTransport(smtpConfig);
transporter.use('compile', htmlToText());

let mailOptions = {
    from: '"Admin" <tmailer@wp.pl>',
    subject: 'Reset your password',
    html: `<h3>Reset your password</h3>
        
        <p>Don’t worry, it happens to the best of us. 
        We received your request to reset your password and we can help!</p>
        
        <p>This is an automated email so don’t reply.</p>
        
        <p>You can reset your password by clicking this link: </p>`
};

let sendEmail = (options) => {
    let url = `http://${options.host}/user/reset/password/${options.hash}/${options.username}`;
    
    mailOptions.to = options.email;
    mailOptions.html += `<p><a href="${url}">Set a new password</a></p>`;
    
    return transporter.sendMail(mailOptions);
};


module.exports = {
    sendEmail
};