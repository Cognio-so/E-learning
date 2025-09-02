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
    
    // Common cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    };

    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, 
    });

    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
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