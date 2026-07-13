const express = require('express');
const router = express.Router();
const {
  createHelpRequest,
  getMyRequests,
  getRequestById,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createHelpRequest);
router.get('/mine', protect, getMyRequests);
router.get('/:id', protect, getRequestById);

module.exports = router;
