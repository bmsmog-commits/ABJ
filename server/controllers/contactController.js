const Contact = require('../models/Contact');
const asyncHandler = require('express-async-handler');
const sendContactEmail = require('../utils/contactMailer');

const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please provide name, email, subject and message');
  }

  const contact = await Contact.create({ name, email, phone, subject, message });

  if (process.env.CONTACT_NOTIFICATION_EMAIL) {
    await sendContactEmail({ name, email, subject, message });
  }

  res.status(201).json({ message: 'Message received', contactId: contact._id });
});

module.exports = { submitContactMessage };
