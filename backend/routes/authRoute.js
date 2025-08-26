const express = require("express");
const { register, login, logout, verifyEmail, refreshToken, getCurrentUser, getAllStudents, deleteStudent } = require("../controller/authController");
const { protectRoute, requireTeacher } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify/:code", verifyEmail);
router.post("/refresh", refreshToken);
router.get("/user", protectRoute, getCurrentUser);
router.get("/all", protectRoute, requireTeacher, getAllStudents);
router.delete("/student/:id", protectRoute, requireTeacher, deleteStudent);

module.exports = router;