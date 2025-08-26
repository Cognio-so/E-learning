const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectDB = require('./lib/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoute = require('./routes/authRoute');
const contentRoute = require('./routes/contentRoute');
const assessmentRoute = require('./routes/assessmentRoute');
const mediaRoute = require('./routes/mediaRoute');
const lessonRoutes = require('./routes/lessonRoute');
const progressRoute = require('./routes/progressRoute');
const chatRoutes = require("./routes/chatRoute");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ,'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
}));

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoute);
app.use('/api/content', contentRoute);
app.use('/api/assessment', assessmentRoute);
app.use('/api/media', mediaRoute);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoute);
app.use('/api/chat', chatRoutes);

app.use('/', (req, res) => {
    res.send("Hello World");    
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