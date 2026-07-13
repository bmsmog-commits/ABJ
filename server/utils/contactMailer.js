const nodemailer = require('nodemailer');

const sendContactEmail = async ({ name, email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@abjfoundation.org',
    to: process.env.CONTACT_NOTIFICATION_EMAIL,
    subject: `New contact message: ${subject}`,
    text: `New message from ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject}</p><p>${message}</p>`,
  });
};

module.exports = sendContactEmail;
