const express = require("express");
const { register, login, logout, verifyEmail, refreshToken, getCurrentUser, getAllStudents, deleteStudent, updateProfile } = require("../controller/authController");
const { protectRoute, requireTeacher } = require("../middleware/authMiddleware");
const { upload, uploadBufferToCloudinary } = require("../lib/cloudinary");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify/:code", verifyEmail);
router.post("/refresh", refreshToken);
router.get("/user", protectRoute, getCurrentUser);
router.put("/profile", protectRoute, updateProfile);
router.post("/upload-profile-picture", protectRoute, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const profilePictureUrl = await uploadBufferToCloudinary(req.file, 'profile-pictures');
        
        return res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePicture: profilePictureUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture',
            error: error.message
        });
    }
});
router.get("/all", protectRoute, requireTeacher, getAllStudents);
router.delete("/student/:id", protectRoute, requireTeacher, deleteStudent);

module.exports = router;