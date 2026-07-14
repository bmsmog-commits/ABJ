const nodemailer = require('nodemailer');

const sendAuthEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[AUTH EMAIL] To: ${to}`);
    console.log(`[AUTH EMAIL] Subject: ${subject}`);
    console.log(`[AUTH EMAIL] Text: ${text}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@abjfoundation.org',
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendAuthEmail;
