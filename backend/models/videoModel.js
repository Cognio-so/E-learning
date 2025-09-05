const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: true
    },
    voiceId: {
        type: String,
        required: true
    },
    talkingPhotoId: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Video', videoSchema);
