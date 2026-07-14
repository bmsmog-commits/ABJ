const nodemailer = require('nodemailer');

const sendAuthEmail = async ({ to, subject, text, html }) => {
  console.log("SMTP CHECK:");
  console.log("HOST:", process.env.SMTP_HOST);
  console.log("PORT:", process.env.SMTP_PORT);
  console.log("USER:", process.env.SMTP_USER);
  console.log("SECURE:", process.env.SMTP_SECURE);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP environment variables are missing");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();

  console.log("SMTP connection successful");

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  console.log("EMAIL SENT SUCCESSFULLY TO:", to);
};

module.exports = sendAuthEmail;