const express = require('express');
const { 
    createWebSearch, 
    fetchWebSearch, 
    getWebSearchById, 
    deleteWebSearch,
    createImage, 
    fetchImage, 
    getImageById, 
    deleteImage,
    createComic, 
    fetchComic, 
    getComicById, 
    deleteComic,
    createSlide, 
    fetchSlide, 
    getSlideById, 
    deleteSlide,
    createVideo, // Add video functions
    fetchVideo,
    getVideoById,
    deleteVideo,
    fetchMediaByStudent,
    upload,
    uploadComicImage
} = require('../controller/MediaTookKitController');
const { protectRoute, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Teacher routes
router.post('/web-search', protectRoute, requireTeacher, createWebSearch);
router.delete('/web-search/:id', protectRoute, requireTeacher, deleteWebSearch);
router.post('/image', protectRoute, requireTeacher, upload.single('image'), createImage);
router.post('/upload-comic-image', protectRoute, requireTeacher, upload.single('image'), uploadComicImage);
router.delete('/image/:id', protectRoute, requireTeacher, deleteImage);
router.post('/comic', protectRoute, requireTeacher, createComic);
router.delete('/comic/:id', protectRoute, requireTeacher, deleteComic);
router.post('/slide', protectRoute, requireTeacher, createSlide);
router.delete('/slide/:id', protectRoute, requireTeacher, deleteSlide);
router.post('/video', protectRoute, requireTeacher, createVideo); // Add video routes
router.delete('/video/:id', protectRoute, requireTeacher, deleteVideo);

// Student routes
router.get('/student', protectRoute, requireStudent, fetchMediaByStudent);

// Shared routes
router.get('/web-search', protectRoute, fetchWebSearch);
router.get('/web-search/:id', protectRoute, getWebSearchById);
router.get('/image', protectRoute, fetchImage);
router.get('/image/:id', protectRoute, getImageById);
router.get('/comic', protectRoute, fetchComic);
router.get('/comic/:id', protectRoute, getComicById);
router.get('/slide', protectRoute, fetchSlide);
router.get('/slide/:id', protectRoute, getSlideById);
router.get('/video', protectRoute, fetchVideo); // Add video routes
router.get('/video/:id', protectRoute, getVideoById);

module.exports = router;