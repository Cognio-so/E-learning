const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  resourceType: {
    type: String,
    enum: ['assessment', 'content', 'image', 'comic', 'slide', 'video', 'websearch', 'webSearch'],
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  score: {
    type: Number, // for assessments
    min: 0,
    max: 100
  },
  answers: [{
    questionId: String,
    answer: String,
    isCorrect: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique progress per user per resource
progressSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

// Update timestamp on save
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Progress', progressSchema);
