const express = require('express');

const { createContent, fetchAllContent, getContentById, updateContent, deleteContent, fetchContentByStudent } = require('../controller/contentController');
const { protectRoute, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Teacher routes
router.post('/create', protectRoute, requireTeacher, createContent);
router.get('/all', protectRoute, requireTeacher, fetchAllContent);
router.put('/:id', protectRoute, requireTeacher, updateContent);
router.delete('/:id', protectRoute, requireTeacher, deleteContent);

// Student routes
router.get('/student', protectRoute, requireStudent, fetchContentByStudent);

// Shared routes
router.get('/:id', protectRoute, getContentById);

module.exports = router;