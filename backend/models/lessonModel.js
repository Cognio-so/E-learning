


const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    grade: {
        type: String,
        required: true,
    },
    // Add lesson type
    lessonType: {
        type: String,
        enum: ['assessment', 'content', 'media', 'mixed', 'custom'],
        default: 'mixed',
    },
    // Resource references
    contentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    }],
    assessmentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
    }],
    imageIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }],
    comicIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comic'
    }],
    slideIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slide'
    }],
    webSearchIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebSearch'
    }],
    // Lesson metadata
    objectives: {
        type: String,
        default: '',
    },
    duration: {
        type: Number, // in minutes
        default: 60,
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate',
    },
    tags: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive'],
        default: 'active',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;