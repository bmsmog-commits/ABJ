const asyncHandler = require('express-async-handler');
const HelpRequest = require('../models/HelpRequest');
const Donation = require('../models/Donation');
const Contact = require('../models/Contact');

const getAllHelpRequests = asyncHandler(async (req, res) => {
  const requests = await HelpRequest.find().sort({ createdAt: -1 });
  res.json(requests);
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const request = await HelpRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Help request not found');
  }

  request.status = req.body.status || request.status;
  request.notes = req.body.notes || request.notes;

  const updatedRequest = await request.save();
  res.json(updatedRequest);
});

const getAllDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find().sort({ createdAt: -1 });
  res.json(donations);
});

const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

module.exports = {
  getAllHelpRequests,
  updateRequestStatus,
  getAllDonations,
  getAllContacts,
};
