const mongoose = require('mongoose');


const comicSchema = new mongoose.Schema({
    instruction: {
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
    language: {
        type: String,
        required: true,
    },
    comicType: {
        type: String,
        required: true,
    },
    imageUrls: {
        type: [String], // Array of Cloudinary URLs
        default: []
    },
    status: {
        type: String,
        default: 'completed'
    }
}, { timestamps: true });

const Comic = mongoose.model('Comic', comicSchema);
module.exports = Comic;