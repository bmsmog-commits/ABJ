const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendAuthEmail = require('../utils/authMailer');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, country } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    country,
    emailVerified: false,
    verificationToken,
  });

  const verificationUrl = `${process.env.FRONTEND_URL || 'https://abjfoundation.ngo'}/verify-email/${verificationToken}`;

  await sendAuthEmail({
    to: user.email,
    subject: 'Verify your ABJ Foundation account',
    text: `Hi ${user.name},\n\nPlease verify your account by visiting: ${verificationUrl}`,
    html: `<p>Hi ${user.name},</p><p>Please verify your account by clicking the link below:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });

  res.status(201).json({
    message: 'Account created successfully. Please check your email to verify your account.',
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.emailVerified) {
    res.status(403);
    throw new Error('Please verify your email before logging in.');
  }

  if (await user.matchPassword(password)) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      country: user.country,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification link.');
  }

  user.emailVerified = true;
  user.verificationToken = null;
  await user.save();

  res.json({ message: 'Email verified successfully.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found with that email.');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || 'https://abjfoundation.ngo'}/reset-password/${resetToken}`;

  await sendAuthEmail({
    to: user.email,
    subject: 'Reset your ABJ Foundation password',
    text: `Hi ${user.name},\n\nUse the link below to reset your password: ${resetUrl}`,
    html: `<p>Hi ${user.name},</p><p>Use the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  res.json({ message: 'Password reset instructions have been sent to your email.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Please provide a new password.');
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset link.');
  }

  user.password = password;
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();

  res.json({ message: 'Password reset successful. You can now login.' });
});

const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    country: req.user.country,
    role: req.user.role,
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  user.country = req.body.country || user.country;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    country: updatedUser.country,
    role: updatedUser.role,
  });
});

module.exports = {
  registerUser,
  authUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
};