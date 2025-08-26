const express = require('express');
const { 
  getUserProgress, 
  getResourceProgress, 
  startLearning, 
  updateProgress, 
  completeResource, 
  submitAssessment, 
  getLearningStats,
  getProgressAnalytics,
  getAchievements,
  getTeacherReports
} = require('../controller/progressController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// Start learning
router.post('/start', protectRoute, startLearning);

// Get learning statistics
router.get('/stats/:userId', protectRoute, getLearningStats);

// Get detailed progress analytics
router.get('/analytics/:userId', protectRoute, getProgressAnalytics);

// Get achievements
router.get('/achievements/:userId', protectRoute, getAchievements);

// Get teacher reports for all students
router.get('/teacher/:teacherId', protectRoute, getTeacherReports);

// Get user progress
router.get('/user/:userId', protectRoute, getUserProgress);

// Get progress for specific resource
router.get('/resource/:userId/:resourceId', protectRoute, getResourceProgress);

// Update progress
router.patch('/:userId/:resourceId', protectRoute, updateProgress);

// Complete resource
router.post('/:userId/:resourceId/complete', protectRoute, completeResource);

// Submit assessment
router.post('/:userId/:resourceId/assessment', protectRoute, submitAssessment);

module.exports = router;
