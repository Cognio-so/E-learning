const express = require("express");
const { 
    getChatSessions, 
    getChatSession, 
    saveChatSession, 
    deleteChatSession, 
    updateChatTitle 
} = require("../controller/chatController");
const { protectRoute } = require("../middleware/authMiddleware");   


const router = express.Router();


// Get all chat sessions for a user
router.get("/sessions/:userId",protectRoute ,  getChatSessions);

// Get a specific chat session
router.get("/session/:sessionId",protectRoute ,  getChatSession);

// Save or update chat session
router.post("/session",protectRoute ,  saveChatSession);

// Update chat session title
router.patch("/session/:sessionId/title",protectRoute ,  updateChatTitle);

// Delete chat session (soft delete)
router.delete("/session/:sessionId",protectRoute ,  deleteChatSession);

module.exports = router;
