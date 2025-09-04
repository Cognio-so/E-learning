const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
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
    verbosity: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    stockImage: {
        type: Boolean,
        required: true,
    },
    customInstruction: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    results: {
        type: Array,
        required: true,
    },
    presentationUrl: {
        type: String,
        default: null,
    },
    downloadUrl: {
        type: String,
        default: null,
    },
    slideCount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        default: 'pending',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Slide = mongoose.model('Slide', slideSchema);
module.exports = Slide;