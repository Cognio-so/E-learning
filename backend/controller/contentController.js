const Content = require('../models/contentModel');
const User = require('../models/userModel');

const createContent = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const { 
            subject, topic, grade, emotionalFlags, adaptiveLevel, 
            includeAssessment, multimediaSuggestions, generateSlides, instructionalDepth, 
            contentVersion, contentType, objectives, language, generatedContent
        } = req.body;

        // Check for required fields based on the model
        if(!subject || !topic || !contentType || !generatedContent) {
            return res.status(400).json({ 
                message: "Missing required fields: subject, topic, contentType, and generatedContent are required" 
            });
        }

        const user = await User.findById(req.user.id);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure teacher can only create content for their own grade
        if (grade && grade !== user.grade) {
            return res.status(403).json({ 
                message: "You can only create content for your assigned grade" 
            });
        }

        const content = await Content.create({
            subject,
            topic,
            grade: user.grade, // Always use teacher's grade
            emotionalFlags: emotionalFlags || '',
            adaptiveLevel: adaptiveLevel || false,
            includeAssessment: includeAssessment || false,
            multimediaSuggestions: multimediaSuggestions || false,
            generateSlides: generateSlides || false,
            instructionalDepth: instructionalDepth || 'standard',
            contentVersion: contentVersion || 'standard',
            contentType,
            objectives: objectives || '',
            language: language || 'English',
            generatedContent,
            createdBy: user._id,
        });

        res.status(201).json({ message: "Content created successfully", content });
    } catch (error) {
        console.error("Content generation error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const fetchAllContent = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {   
            return res.status(401).json({ message: "Unauthorized" });
        }
        const content = await Content.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        if(!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        res.status(200).json({ content });
    } catch (error) {
        console.error("Error fetching content:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const getContentById = async (req, res) => {  
    try {
        const { id } = req.params;
        const content = await Content.findById(id);
        if(!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        res.status(200).json({ content });
    } catch (error) {
        console.error("Error fetching content:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const updateContent = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const { 
            subject, topic, grade, emotionalFlags, adaptiveLevel, 
            includeAssessment, multimediaSuggestions, generateSlides, instructionalDepth, 
            contentVersion, contentType, objectives, language, generatedContent
        } = req.body;
        
        // Check for required fields
        if(!subject || !topic || !contentType || !generatedContent) {
            return res.status(400).json({ 
                message: "Missing required fields: subject, topic, contentType, and generatedContent are required" 
            });
        }
        
        const user = await User.findById(req.user.id);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure teacher can only update content for their own grade
        if (grade && grade !== user.grade) {
            return res.status(403).json({ 
                message: "You can only update content for your assigned grade" 
            });
        }
        
        const content = await Content.findByIdAndUpdate(id, {
            subject,
            topic,
            grade: user.grade, // Always use teacher's grade
            emotionalFlags: emotionalFlags || '',
            adaptiveLevel: adaptiveLevel || false,
            includeAssessment: includeAssessment || false,
            multimediaSuggestions: multimediaSuggestions || false,
            generateSlides: generateSlides || false,
            instructionalDepth: instructionalDepth || 'standard',
            contentVersion: contentVersion || 'standard',
            contentType,
            objectives: objectives || '',
            language: language || 'English',
            generatedContent,
        }, { new: true });
        
        if(!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        res.status(200).json({ message: "Content updated successfully", content });
    } catch (error) {
        console.error("Error updating content:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const deleteContent = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const content = await Content.findByIdAndDelete(id);
        if(!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        res.status(200).json({ message: "Content deleted successfully" });
    } catch (error) {
        console.error("Error deleting content:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const fetchContentByStudent = async (req, res) => {
    try {
        const { grade, subjects } = req.user;
        
        if (!grade || !subjects || subjects.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student grade and subjects are required' 
            });
        }

        const content = await Content.find({
            grade: grade,
            subject: { $in: subjects }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: content
        });

    } catch (error) {
        console.error('Error fetching content by student:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

module.exports = { createContent, fetchAllContent, getContentById, updateContent, deleteContent, fetchContentByStudent };