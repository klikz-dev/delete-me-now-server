require("dotenv").config();

const nodemailer = require("nodemailer");

exports.email = async (req, res) => {
  const email = req.body.email;
  const subject = req.body.subject;
  const html = req.body.html;
  const credentials = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  };

  try {
    const transporter = nodemailer.createTransport(credentials);

    const contacts = {
      from: process.env.MAIL_USER,
      to: email,
      subject: subject,
      html: html,
    };

    const result = await transporter.sendMail(contacts);
    if (!result.error) {
      res.send({ success: "success" });
    } else {
      res.status(500).send(result.error);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
