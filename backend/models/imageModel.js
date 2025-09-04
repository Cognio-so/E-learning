const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    topic: {
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
    visualLevel: {
        type: String,
        required: true,
    },
    visualType: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        default: null,
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

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;