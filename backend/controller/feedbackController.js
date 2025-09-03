const Feedback = require('../models/feedbackModel');
const Progress = require('../models/progressModel');
const { catchAsync } = require('../lib/utils');

// Submit feedback for a resource
const submitFeedback = catchAsync(async (req, res) => {
  const { userId, resourceId, resourceType, lessonId, rating, difficulty, helpfulness, engagement, comment, tags, isAnonymous } = req.body;

  // Validate required fields
  if (!userId || !resourceId || !resourceType || !rating || !difficulty || !helpfulness || !engagement) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: userId, resourceId, resourceType, rating, difficulty, helpfulness, engagement'
    });
  }

  // Check if user has completed the resource (only for actual resources, not lessons)
  if (resourceType !== 'lesson') {
    const progress = await Progress.findOne({ userId, resourceId });
    if (!progress || progress.progress < 100) {
      return res.status(400).json({
        status: 'error',
        message: 'You can only provide feedback for completed resources'
      });
    }
  }

  // Check if feedback already exists
  const existingFeedback = await Feedback.findOne({ userId, resourceId });
  if (existingFeedback) {
    // Update existing feedback
    existingFeedback.rating = rating;
    existingFeedback.difficulty = difficulty;
    existingFeedback.helpfulness = helpfulness;
    existingFeedback.engagement = engagement;
    existingFeedback.comment = comment;
    existingFeedback.tags = tags;
    existingFeedback.isAnonymous = isAnonymous;
    existingFeedback.updatedAt = Date.now();

    await existingFeedback.save();

    return res.status(200).json({
      status: 'success',
      message: 'Feedback updated successfully',
      data: existingFeedback
    });
  }

  // Create new feedback
  const feedback = await Feedback.create({
    userId,
    resourceId,
    resourceType,
    lessonId,
    rating,
    difficulty,
    helpfulness,
    engagement,
    comment,
    tags,
    isAnonymous
  });

  res.status(201).json({
    status: 'success',
    message: 'Feedback submitted successfully',
    data: feedback
  });
});

// Get feedback for a specific resource
const getResourceFeedback = catchAsync(async (req, res) => {
  const { resourceId } = req.params;

  const feedback = await Feedback.find({ resourceId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 });

  // Calculate aggregated stats
  const totalFeedback = feedback.length;
  const averageRating = totalFeedback > 0 
    ? Math.round(feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback * 10) / 10
    : 0;

  const ratingDistribution = {
    1: feedback.filter(f => f.rating === 1).length,
    2: feedback.filter(f => f.rating === 2).length,
    3: feedback.filter(f => f.rating === 3).length,
    4: feedback.filter(f => f.rating === 4).length,
    5: feedback.filter(f => f.rating === 5).length
  };

  const difficultyDistribution = {
    very_easy: feedback.filter(f => f.difficulty === 'very_easy').length,
    easy: feedback.filter(f => f.difficulty === 'easy').length,
    moderate: feedback.filter(f => f.difficulty === 'moderate').length,
    hard: feedback.filter(f => f.difficulty === 'hard').length,
    very_hard: feedback.filter(f => f.difficulty === 'very_hard').length
  };

  const helpfulnessDistribution = {
    not_helpful: feedback.filter(f => f.helpfulness === 'not_helpful').length,
    somewhat_helpful: feedback.filter(f => f.helpfulness === 'somewhat_helpful').length,
    helpful: feedback.filter(f => f.helpfulness === 'helpful').length,
    very_helpful: feedback.filter(f => f.helpfulness === 'very_helpful').length,
    extremely_helpful: feedback.filter(f => f.helpfulness === 'extremely_helpful').length
  };

  const engagementDistribution = {
    boring: feedback.filter(f => f.engagement === 'boring').length,
    somewhat_interesting: feedback.filter(f => f.engagement === 'somewhat_interesting').length,
    interesting: feedback.filter(f => f.engagement === 'interesting').length,
    very_interesting: feedback.filter(f => f.engagement === 'very_interesting').length,
    exciting: feedback.filter(f => f.engagement === 'exciting').length
  };

  const tagFrequency = {};
  feedback.forEach(f => {
    f.tags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  res.status(200).json({
    status: 'success',
    data: {
      feedback,
      stats: {
        totalFeedback,
        averageRating,
        ratingDistribution,
        difficultyDistribution,
        helpfulnessDistribution,
        engagementDistribution,
        tagFrequency
      }
    }
  });
});

// Get user's feedback history
const getUserFeedback = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const feedback = await Feedback.find({ userId })
    .populate('resourceId', 'title subject resourceType')
    .populate('lessonId', 'title subject')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: feedback
  });
});

// Update feedback
const updateFeedback = catchAsync(async (req, res) => {
  const { feedbackId } = req.params;
  const updateData = req.body;

  const feedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!feedback) {
    return res.status(404).json({
      status: 'error',
      message: 'Feedback not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Feedback updated successfully',
    data: feedback
  });
});

// Delete feedback
const deleteFeedback = catchAsync(async (req, res) => {
  const { feedbackId } = req.params;

  const feedback = await Feedback.findByIdAndDelete(feedbackId);

  if (!feedback) {
    return res.status(404).json({
      status: 'error',
      message: 'Feedback not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Feedback deleted successfully'
  });
});

module.exports = {
  submitFeedback,
  getResourceFeedback,
  getUserFeedback,
  updateFeedback,
  deleteFeedback
};
