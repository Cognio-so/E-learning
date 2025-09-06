const jwt = require("jsonwebtoken");

const generateToken = (userId, role, email) => {
    const payload = { 
        sub: userId,
        role, 
        email,
        iss: 'ED_TECH'
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '1d' 
    });
    
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '7d' 
    });

    return { accessToken, refreshToken };
}

const setCookies = (res, accessToken, refreshToken) => {
    const cookieOptions = {
        httpOnly: true, 
        secure: true, 
        sameSite: 'none', // Required for cross-domain cookies
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined, // Set if you have a common domain
    };

    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day to match token expiry
    });

    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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