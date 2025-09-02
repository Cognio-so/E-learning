const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protectRoute = async (req, res, next) => {
    try {
        // Prioritize cookies over Authorization header
        let token = req.cookies.accessToken;
        
        // Fallback to Authorization header if cookies not found
        if (!token) {
            token = req.headers.authorization?.replace('Bearer ', '');
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No access token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.sub) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid access token' 
            });
        }

        const user = await User.findById(decoded.sub).select('-password -refreshToken');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: 'Please verify your email' 
            });
        }

        req.user = user;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Access token expired' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid access token' 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: 'Authentication error' 
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Insufficient permissions' 
            });
        }

        next();
    };
};

const requireStudent = requireRole(['student']);
const requireTeacher = requireRole(['teacher']);

module.exports = {
    protectRoute,
    requireRole,
    requireStudent,
    requireTeacher,
};