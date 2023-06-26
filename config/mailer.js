const nodemailer = require('nodemailer')

// Nodemailer Instance
const client = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILID,
        pass: process.env.MAILPASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

client.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

module.exports = client

