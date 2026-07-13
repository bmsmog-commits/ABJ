const express = require('express');
const router = express.Router();
const {
  getAllHelpRequests,
  updateRequestStatus,
  getAllDonations,
  getAllContacts,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/requests', getAllHelpRequests);
router.put('/requests/:id/status', updateRequestStatus);
router.get('/donations', getAllDonations);
router.get('/contacts', getAllContacts);

module.exports = router;
