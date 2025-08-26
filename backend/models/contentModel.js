const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    grade: {
        type: String,
        required: true,
    },
    emotionalFlags: {
        type: String,
        default: '',
    },
    adaptiveLevel: {
        type: Boolean,
        default: false,
    },
    includeAssessment: {
        type: Boolean,
        default: false,
    },
    multimediaSuggestions: {
        type: Boolean,
        default: false,
    },
    generateSlides: {
        type: Boolean,
        default: false,
    },
    instructionalDepth: {
        type: String,
        default: 'standard',
    },
    contentVersion: {
        type: String,
        default: 'standard',
    },
    contentType: {
        type: String,
        required: true,
    },
    objectives: {
        type: String,
        default: '',
    },
    language: {
        type: String,
        default: 'English',
    },
    generatedContent: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;