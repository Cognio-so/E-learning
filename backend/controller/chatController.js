const ChatSession = require('../models/chatModel');
const User = require('../models/userModel');

// Get all chat sessions for a user
const getChatSessions = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (req.user._id.toString() !== userId && req.user.role !== 'teacher') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const chatSessions = await ChatSession.find({ 
            userId, 
            isActive: true 
        })
        .sort({ lastActivity: -1 })
        .select('sessionId title messages lastActivity createdAt')
        .limit(50);

        // Add message count and preview for each session
        const sessionsWithPreview = chatSessions.map(session => {
            const lastMessage = session.messages[session.messages.length - 1];
            return {
                _id: session._id,
                sessionId: session.sessionId,
                title: session.title,
                messageCount: session.messages.length,
                lastMessage: lastMessage ? {
                    content: lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : ''),
                    role: lastMessage.role,
                    timestamp: lastMessage.timestamp
                } : null,
                lastActivity: session.lastActivity,
                createdAt: session.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            data: sessionsWithPreview
        });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching chat sessions',
            error: error.message
        });
    }
};

// Get a specific chat session
const getChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const chatSession = await ChatSession.findOne({ 
            sessionId,
            isActive: true 
        }).populate('userId', 'name email grade');

        if (!chatSession) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        // Check if user has access to this session
        if (req.user._id.toString() !== chatSession.userId._id.toString() && req.user.role !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        return res.status(200).json({
            success: true,
            data: chatSession
        });
    } catch (error) {
        console.error('Error fetching chat session:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching chat session',
            error: error.message
        });
    }
};

// Create or update chat session
const saveChatSession = async (req, res) => {
    try {
        const { sessionId, messages, uploadedFiles, studentData, title } = req.body;
        const userId = req.user._id;

        let chatSession = await ChatSession.findOne({ sessionId });

        if (chatSession) {
            // Update existing session
            chatSession.messages = messages;
            chatSession.uploadedFiles = uploadedFiles || chatSession.uploadedFiles;
            chatSession.studentData = studentData || chatSession.studentData;
            chatSession.title = title || chatSession.title;
            chatSession.lastActivity = new Date();
        } else {
            // Create new session
            chatSession = new ChatSession({
                userId,
                sessionId,
                title: title || 'New Chat Session',
                messages,
                uploadedFiles: uploadedFiles || [],
                studentData: studentData || {},
                lastActivity: new Date()
            });
        }

        await chatSession.save();

        return res.status(200).json({
            success: true,
            message: 'Chat session saved successfully',
            data: {
                sessionId: chatSession.sessionId,
                title: chatSession.title
            }
        });
    } catch (error) {
        console.error('Error saving chat session:', error);
        return res.status(500).json({
            success: false,
            message: 'Error saving chat session',
            error: error.message
        });
    }
};

// Delete chat session
const deleteChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const chatSession = await ChatSession.findOne({ 
            sessionId,
            userId: userId.toString()
        });

        if (!chatSession) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        chatSession.isActive = false;
        await chatSession.save();

        return res.status(200).json({
            success: true,
            message: 'Chat session deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting chat session:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting chat session',
            error: error.message
        });
    }
};

// Update chat session title
const updateChatTitle = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { title } = req.body;
        const userId = req.user._id;

        const chatSession = await ChatSession.findOneAndUpdate(
            { 
                sessionId,
                userId: userId.toString(),
                isActive: true
            },
            { 
                title,
                lastActivity: new Date()
            },
            { new: true }
        );

        if (!chatSession) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Chat title updated successfully',
            data: { title: chatSession.title }
        });
    } catch (error) {
        console.error('Error updating chat title:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating chat title',
            error: error.message
        });
    }
};

module.exports = {
    getChatSessions,
    getChatSession,
    saveChatSession,
    deleteChatSession,
    updateChatTitle
};