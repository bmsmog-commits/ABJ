const asyncHandler = require('express-async-handler');
const Donation = require('../models/Donation');
const { createPaymentSession } = require('../utils/paymentGateway');

const createDonation = asyncHandler(async (req, res) => {
  const { name, email, amount, currency, gateway } = req.body;

  if (!name || !email || !amount) {
    res.status(400);
    throw new Error('Please provide name, email, and amount');
  }

  const paymentUrl = await createPaymentSession({ name, email, amount, currency, gateway });

  const donation = await Donation.create({
    user: req.user ? req.user._id : undefined,
    name,
    email,
    amount,
    currency: currency || 'USD',
    gateway: gateway || 'stripe',
    paymentUrl,
    status: 'pending',
  });

  res.status(201).json(donation);
});

const getMyDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(donations);
});

const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }
  if (donation.user && donation.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this donation');
  }
  res.json(donation);
});

module.exports = { createDonation, getMyDonations, getDonationById };
