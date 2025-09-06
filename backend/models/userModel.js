const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
    grade: {
        type: String,
        required: true,
        enum: ['KG1', 'KG2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    },
    subjects: {
        type: [String],
        default: []
    },
    profilePicture: {
        type: String,
        default: null
    },
    lastActive: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    lastVerificationResent: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;