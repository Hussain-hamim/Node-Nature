/* eslint-disable no-undef */
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // activate in gmail 'less secure app' option
  });

  // 2) define the email options
  const mailOptions = {
    from: 'Hussain Hamim <hussain@dev.com>',
    to: options.email,
    subject: options.subject, // subject of the email
    text: options.message, // body of the email
    // html: // html version of the email
  };

  // 3) actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
