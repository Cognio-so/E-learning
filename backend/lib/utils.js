const jwt = require("jsonwebtoken");

const generateToken = (userId, role, email) => {
    const payload = { 
        sub: userId,
        role, 
        email,
        iss: 'ED_TECH'
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '15m' 
    });
    
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '7d' 
    });

    return { accessToken, refreshToken };
}

const setCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Cross-domain cookie options for Vercel
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Must be true for HTTPS and cross-domain
        sameSite: 'none', // Must be 'none' for cross-domain
        path: '/',
        // Set domain to allow cross-subdomain sharing
        domain: isProduction ? '.vercel.app' : undefined,
    };

    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
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