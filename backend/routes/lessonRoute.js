


const express = require('express');
const { 
    createLesson, 
    createAssessmentLesson, 
    createContentLesson, 
    createMediaLesson,
    addResourceToLesson,
    removeResourceFromLesson,
    fetchAllLessons, 
    getLessonById, 
    updateLesson, 
    deleteLesson, 
    getLessonsByStudent 
} = require('../controller/lessonController');
const { protectRoute, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Teacher routes
router.post('/create', protectRoute, requireTeacher, createLesson);
router.post('/create-assessment', protectRoute, requireTeacher, createAssessmentLesson);
router.post('/create-content', protectRoute, requireTeacher, createContentLesson);
router.post('/create-media', protectRoute, requireTeacher, createMediaLesson);
router.post('/:lessonId/add-resource', protectRoute, requireTeacher, addResourceToLesson);
router.delete('/:lessonId/remove-resource', protectRoute, requireTeacher, removeResourceFromLesson);
router.get('/all', protectRoute, requireTeacher, fetchAllLessons);
router.put('/:id', protectRoute, requireTeacher, updateLesson);
router.delete('/:id', protectRoute, requireTeacher, deleteLesson);

// Student routes
router.get('/student', protectRoute, requireStudent, getLessonsByStudent);

// Shared routes
router.get('/:id', protectRoute, getLessonById);

module.exports = router;