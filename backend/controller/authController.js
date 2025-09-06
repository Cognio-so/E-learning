const { generateToken, setCookies } = require("../lib/utils");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../email/email");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { name, email, password, grade } = req.body;

    try {
        if (!name || !email || !password || !grade) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            grade,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        await newUser.save();
        await sendVerificationEmail(email, verificationToken);

        return res.status(201).json({
            success: true,
            message: 'Signup successful. Please verify your email.',
            userId: newUser._id,
            user: null
        });
    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    const { code } = req.params;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully. Please login to continue.',
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying email',
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: 'Please verify your email before logging in' });
        }

        // Check if user has completed their profile (grade is required)
        if (!user.grade) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please complete your profile by setting your grade before logging in',
                requiresProfileCompletion: true
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateToken(user._id, user.role, user.email);
        
        user.refreshToken = refreshToken;
        await user.save();
        
        // Debug logging
        console.log(' Setting cookies:', {
            accessTokenLength: accessToken.length,
            refreshTokenLength: refreshToken.length,
            userRole: user.role
        });
        
        setCookies(res, accessToken, refreshToken);
        
        // Debug: Check if cookies were set
        console.log('🍪 Response cookies:', res.getHeaders()['set-cookie']);

        return res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            accessToken, // Include token in response
            user: {
                ...user._doc,
                password: undefined,
                refreshToken: undefined,
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const logout = async (req, res) => {
    try {
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
        }
        
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        // Find user with this refresh token
        const user = await User.findOne({ 
            _id: decoded.sub,
            refreshToken: refreshToken 
        });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateToken(user._id, user.role, user.email);
        
        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save();
        
        setCookies(res, accessToken, newRefreshToken);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Token refreshed', 
            user: {
                ...user._doc,
                password: undefined,
                refreshToken: undefined,
            }
        });
        
    } catch (error) {
        console.error('Refresh Token Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, user: {
            ...user._doc,
            password: undefined,
            refreshToken: undefined,
        } });
    } catch (error) {
        console.error('Get User Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}


const getAllStudents = async (req, res) => {
    try {
        // Get teacher's grade from req.user (set by auth middleware)
        const teacherGrade = req.user.grade;
        
        if (!teacherGrade) {
            return res.status(400).json({ 
                success: false, 
                message: 'Teacher grade not found. Please complete your profile.' 
            });
        }

        // Filter students by the same grade as the teacher
        const students = await User.find({ 
            role: 'student',
            grade: teacherGrade 
        });
        
        // Return empty array instead of 404 when no students found
        // This allows the frontend to handle the empty state gracefully
        return res.status(200).json({ 
            success: true, 
            students: students.map(student => ({
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                grade: student.grade,
                isVerified: student.isVerified,
                createdAt: student.createdAt,
                lastActive: student.lastActive,
            })),
            message: students.length === 0 ? `No students found in Grade ${teacherGrade === 'K' ? 'Kindergarten' : teacherGrade}` : null
        });
    } catch (error) {
        console.error('Get All Students Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteStudent = async (req, res) => {
    try {
        if(req.user.role !== 'teacher') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const { id } = req.params;
        const student = await User.findByIdAndDelete(id);
        if(!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        return res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete Student Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateStudentProfile = async (req, res) => {
    try {
        const { grade } = req.body;
        
        if (!grade) {
            return res.status(400).json({
                success: false,
                message: 'Grade is required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { grade },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                grade: user.grade,
                subjects: user.subjects,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                lastActive: user.lastActive,
            }
        });
    } catch (error) {
        console.error('Update student profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword, profilePicture } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updateData = {};

        // Update name if provided
        if (name && name.trim() !== '') {
            updateData.name = name.trim();
        }

        // Update email if provided and different
        if (email && email !== user.email) {
            // Check if email already exists
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
            updateData.email = email;
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to change password'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Update profile picture if provided
        if (profilePicture) {
            updateData.profilePicture = profilePicture;
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                grade: updatedUser.grade,
                subjects: updatedUser.subjects,
                profilePicture: updatedUser.profilePicture,
                isVerified: updatedUser.isVerified,
                createdAt: updatedUser.createdAt,
                lastActive: updatedUser.lastActive,
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};


module.exports = {
    register,
    verifyEmail,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    getAllStudents,
    deleteStudent,
    updateStudentProfile,
    updateProfile,
}