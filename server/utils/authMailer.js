const nodemailer = require('nodemailer');

const sendAuthEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('SMTP CHECK:');
    console.log('HOST:', process.env.SMTP_HOST);
    console.log('PORT:', process.env.SMTP_PORT);
    console.log('USER:', process.env.SMTP_USER);

    await transporter.verify();

    console.log('SMTP CONNECTION SUCCESSFUL');

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    console.log('EMAIL SENT SUCCESSFULLY:', info.messageId);

  } catch (error) {
    console.error('EMAIL SEND ERROR:', error);
    throw error;
  }
};

module.exports = sendAuthEmail;