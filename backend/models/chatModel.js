const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isImageResponse: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true // This creates the index
    },
    title: {
        type: String,
        default: 'New Chat Session'
    },
    messages: [messageSchema],
    uploadedFiles: [{
        filename: String,
        originalName: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    studentData: {
        grade: String,
        subjects: [String],
        progress: mongoose.Schema.Types.Mixed,
        achievements: [mongoose.Schema.Types.Mixed],
        learningStats: mongoose.Schema.Types.Mixed
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Only create the userId index, remove the duplicate sessionId index
chatSessionSchema.index({ userId: 1, lastActivity: -1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
