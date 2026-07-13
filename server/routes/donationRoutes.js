const express = require('express');
const router = express.Router();
const {
  createDonation,
  getMyDonations,
  getDonationById,
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createDonation);
router.get('/mine', protect, getMyDonations);
router.get('/:id', protect, getDonationById);

module.exports = router;
