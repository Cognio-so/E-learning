const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const {
  submitFeedback,
  getResourceFeedback,
  getUserFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controller/feedbackController');

// Submit feedback
router.post('/submit', protectRoute, submitFeedback);

// Get feedback for a specific resource
router.get('/resource/:resourceId', getResourceFeedback);

// Get user's feedback history
router.get('/user/:userId', protectRoute, getUserFeedback);

// Update feedback
router.put('/:feedbackId', protectRoute, updateFeedback);

// Delete feedback
router.delete('/:feedbackId', protectRoute, deleteFeedback);

module.exports = router;
