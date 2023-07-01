const nodemailer = require('nodemailer')

// Nodemailer Instance
var client = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "bc7d81caaa344b",
      pass: "5ed7c606777e44"
    }
  });

  client.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

module.exports = client

