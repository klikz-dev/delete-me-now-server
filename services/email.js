require("dotenv").config();

const nodemailer = require("nodemailer");

const credentials = {
  host: process.env.MAIL_SERVER,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
};

const transporter = nodemailer.createTransport(credentials);

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

exports.transporter = transporter;
