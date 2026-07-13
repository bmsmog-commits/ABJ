const asyncHandler = require('express-async-handler');
const HelpRequest = require('../models/HelpRequest');

const createHelpRequest = asyncHandler(async (req, res) => {
  const { name, email, phone, country, category, description } = req.body;

  if (!name || !email || !category || !description) {
    res.status(400);
    throw new Error('Please provide name, email, category and description');
  }

  const helpRequest = await HelpRequest.create({
    user: req.user._id,
    name,
    email,
    phone,
    country,
    category,
    description,
  });

  res.status(201).json(helpRequest);
});

const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await HelpRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(requests);
});

const getRequestById = asyncHandler(async (req, res) => {
  const request = await HelpRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Help request not found');
  }

  if (request.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this request');
  }

  res.json(request);
});

module.exports = { createHelpRequest, getMyRequests, getRequestById };
