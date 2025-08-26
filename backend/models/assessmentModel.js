const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
    title: {
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
    duration: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    topic: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,  // Changed from [String] to String
        required: true,
    },
    learningObjectives: {
        type: String,
        required: true,
    },
    numQuestions: {
        type: Number,
        required: true,
    },
    questionTypes: {
        type: Object,  // Changed from [String] to Object to match frontend
        required: true,
    },
    anxietyTriggers: {
        type: String,
    },
    customPrompt: {
        type: String,
    },
    language: {
        type: String,
        required: true,
    },
    // Add fields for generated content
    questions: {
        type: Array,
        default: [],
    },
    solutions: {
        type: Array,
        default: [],
    },
    rawContent: {
        type: String,
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive'],
        default: 'draft',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Add students field for assignment functionality
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    
}, { timestamps: true });

const Assessment = mongoose.model("Assessment", assessmentSchema);

module.exports = Assessment;