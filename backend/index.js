const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectDB = require('./lib/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoute = require('./routes/authRoute');
const contentRoute = require('./routes/contentRoute');
const assessmentRoute = require('./routes/assessmentRoute');
const mediaRoute = require('./routes/mediaRoute');
const lessonRoutes = require('./routes/lessonRoute');
const progressRoute = require('./routes/progressRoute');
const chatRoutes = require("./routes/chatRoute");

const app = express();

// Security and performance middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://e-learning-seven-zeta.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
    optionsSuccessStatus: 200
}));

const PORT = process.env.PORT || 5001;

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoute);
app.use('/api/content', contentRoute);
app.use('/api/assessment', assessmentRoute);
app.use('/api/media', mediaRoute);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoute);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/', (req, res) => {
    res.send("Hello World");    
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({ 
        success: false, 
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Failed to connect to the database. Server is not starting.");
        process.exit(1);
    }
};

startServer();

module.exports = app;