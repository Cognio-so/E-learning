const mongoose = require('mongoose');

const webSearchSchema = new mongoose.Schema({
    searchTopic: {
        type: String,
        required: true,
    },
    contentType: {
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
    comprehensionLevel: {
        type: String,
        required: true,
    },
    gradeLevel: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    searchResults: {
        type: String, // Changed from Array to String to store actual content
        default: '',
    },
    status: {
        type: String,
        default: 'completed',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const WebSearch = mongoose.model('WebSearch', webSearchSchema);
module.exports = WebSearch;