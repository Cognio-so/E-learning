const express = require('express');
const { addUser, getAllUser, updateUserRole, deleteUser, addCurriculum, getCurriculums, deleteCurriculum, updateCurriculum, getCurriculumById } = require('../controller/adminController');
const router = express.Router();

const { protectRoute, requireAdmin } = require('../middleware/authMiddleware');

router.post('/add-user', protectRoute, requireAdmin, addUser);
router.get('/users', protectRoute, requireAdmin, getAllUser); 
router.post('/update-role', protectRoute, requireAdmin, updateUserRole); 
router.post('/delete-user', protectRoute, requireAdmin, deleteUser);
router.post('/add-curriculum', protectRoute, requireAdmin, addCurriculum);
router.get('/curriculums', protectRoute, requireAdmin, getCurriculums);
router.get('/curriculum/:id', protectRoute, requireAdmin, getCurriculumById);
router.delete('/curriculum/:id', protectRoute, requireAdmin, deleteCurriculum); 
router.put('/curriculum/:id', protectRoute, requireAdmin, updateCurriculum); 

module.exports = router;