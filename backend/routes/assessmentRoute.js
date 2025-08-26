const express = require('express');
const {
     createAssessment, 
     fetchAllAssessments, 
     getAssessmentById, 
     updateAssessment, 
     deleteAssessment, 
     assignAssessment, 
     removeAssignedAssessment,
     getAllAssessments,
     assignAssessmentToStudents
} = require('../controller/assessmentController');
const { protectRoute, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Teacher routes
router.post('/create', protectRoute, requireTeacher, createAssessment);
router.get('/all', protectRoute, requireTeacher, fetchAllAssessments);
router.put('/:id', protectRoute, requireTeacher, updateAssessment);
router.delete('/:id', protectRoute, requireTeacher, deleteAssessment);
router.post('/assign', protectRoute, requireTeacher, assignAssessment);
router.post('/assign-to-students', protectRoute, requireTeacher, assignAssessmentToStudents);
router.delete('/assigned', protectRoute, requireTeacher, removeAssignedAssessment);

// Student routes
router.get('/student', protectRoute, requireStudent, getAllAssessments);

// Shared routes
router.get('/:id', protectRoute, getAssessmentById);

module.exports = router;