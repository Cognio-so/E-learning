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
        expiresIn: '2m' 
    });
    
    // 7-day refresh token
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '5d' 
    });

    return { accessToken, refreshToken };
}

const setCookies = (res, accessToken, refreshToken) => {
    // Access token cookie (15 minutes)
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 60 * 1000, // 2 minutes
        path: '/',
    });

    // Refresh token cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
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