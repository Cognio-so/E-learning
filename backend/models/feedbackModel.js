const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  resourceType: {
    type: String,
    enum: ['assessment', 'content', 'image', 'comic', 'slide', 'video', 'websearch', 'webSearch', 'lesson'],
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['very_easy', 'easy', 'moderate', 'hard', 'very_hard'],
    required: true
  },
  helpfulness: {
    type: String,
    enum: ['not_helpful', 'somewhat_helpful', 'helpful', 'very_helpful', 'extremely_helpful'],
    required: true
  },
  engagement: {
    type: String,
    enum: ['boring', 'somewhat_interesting', 'interesting', 'very_interesting', 'exciting'],
    required: true
  },
  comment: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  tags: [{
    type: String,
    enum: ['clear_explanation', 'good_examples', 'needs_improvement', 'too_fast', 'too_slow', 'confusing', 'engaging', 'practical', 'theoretical']
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique feedback per user per resource
feedbackSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

// Update timestamp on save
feedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);