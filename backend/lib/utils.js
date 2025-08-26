const jwt = require("jsonwebtoken");

const generateToken = (userId, role, email) => {
    const payload = { 
        sub: userId,        // 'sub' for middleware compatibility
        role, 
        email,
        iss: 'ED_TECH'      // issuer for middleware verification
    };
    
    // 15-minute access token (reasonable balance of security and UX)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '15m' 
    });
    
    // 7-day refresh token
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '7d' 
    });

    return { accessToken, refreshToken };
}

const setCookies = (res, accessToken, refreshToken) => {
    // Access token cookie (15 minutes)
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax', // Changed from 'none' to 'lax' for better compatibility
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
    });

    // Refresh token cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax', // Changed from 'none' to 'lax' for better compatibility
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
}

const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

module.exports = {
    generateToken,
    setCookies,
    catchAsync
}