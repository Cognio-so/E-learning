const Assessment = require("../models/assessmentModel");
const User = require("../models/userModel");

const createAssessment = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {
            return res.status(401).json({ message: "Unauthorized - Teacher role required" });
        }
        
        const { 
            title, subject, grade, duration, description, topic, difficulty, 
            learningObjectives, numQuestions, questionTypes, anxietyTriggers, 
            customPrompt, language, questions, solutions, rawContent, status
        } = req.body;

        // Check for required fields based on the model
        if(!title || !subject || !grade || !duration || !topic || !difficulty || !learningObjectives || !numQuestions || !questionTypes || !language) {
            return res.status(400).json({ 
                message: "Missing required fields: title, subject, grade, duration, topic, difficulty, learningObjectives, numQuestions, questionTypes, and language are required" 
            });
        }

        const user = await User.findById(req.user.id);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const assessment = await Assessment.create({
            title,
            subject,
            topic,
            grade,
            duration,
            description,
            difficulty,
            learningObjectives,
            numQuestions,
            questionTypes,
            anxietyTriggers,
            customPrompt,
            language,
            questions: questions || [],
            solutions: solutions || [],
            rawContent: rawContent || '',
            status: status || 'draft',
            createdBy: user._id,
        });

        res.status(201).json({ message: "Assessment created successfully", assessment });
    } catch (error) {
        console.error("Assessment creation error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const fetchAllAssessments = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {
            return res.status(401).json({ message: "Unauthorized - Teacher role required" });
        }
        
        console.log('Fetching assessments for user:', req.user.id, 'Role:', req.user.role);
        
        const assessments = await Assessment.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        
        console.log('Found assessments:', assessments.length);
        
        // Always return assessments array, even if empty
        res.status(200).json({ assessments: assessments || [] });
    } catch (error) {
        console.error("Error fetching assessments:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const assessment = await Assessment.findById(id);
        if(!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        res.status(200).json({ assessment });
    } catch (error) {
        console.error("Error fetching assessment:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const updateAssessment = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {
            return res.status(401).json({ message: "Unauthorized - Teacher role required" });
        }
        const { id } = req.params;
        const { 
            title, subject, grade, duration, description, topic, difficulty, 
            learningObjectives, numQuestions, questionTypes, anxietyTriggers, 
            customPrompt, language, questions, solutions, rawContent, status 
        } = req.body;
        
        const assessment = await Assessment.findByIdAndUpdate(id, { 
            title, subject, grade, duration, description, topic, difficulty, 
            learningObjectives, numQuestions, questionTypes, anxietyTriggers, 
            customPrompt, language, questions, solutions, rawContent, status 
        }, { new: true });
        
        if(!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        res.status(200).json({ message: "Assessment updated successfully", assessment });
    } catch (error) {
        console.error("Error updating assessment:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const deleteAssessment = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {   
            return res.status(401).json({ message: "Unauthorized - Teacher role required" });
        }
        const { id } = req.params;
        const assessment = await Assessment.findByIdAndDelete(id);
        if(!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        res.status(200).json({ message: "Assessment deleted successfully" });
    } catch (error) {
        console.error("Error deleting assessment:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const getAllAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find();
        res.status(200).json({ assessments });
    } catch (error) {
        console.error("Error fetching all assessments:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}


const assignAssessment = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {
            return res.status(401).json({ message: "Unauthorized - Teacher role required" });
        }
        const { studentId, assessmentId } = req.body;
        const student = await User.findById(studentId);
        if(!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        const assessment = await Assessment.findById(assessmentId);
        if(!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        
        // Fix: Use proper MongoDB update syntax
        const updatedAssessment = await Assessment.findByIdAndUpdate(
            assessmentId,
            { $addToSet: { students: studentId } },
            { new: true }
        );
        
        if(!updatedAssessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        res.status(201).json({ message: "Assessment assigned successfully", assignedAssessment: updatedAssessment });
    } catch (error) {
        console.error("Error assigning assessment:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const assignAssessmentToStudents = async (req, res) => {
    try {
        if(req.user.role !== "teacher") {
            return res.status(401).json({ message: "Unauthorized - Teacher role required" });
        }
        
        const { assessmentId } = req.body;
        const assessment = await Assessment.findById(assessmentId);
        if(!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        const students = await User.find({ role: "student" });
        if(!students || students.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }
        
        // Fix: Use proper MongoDB update syntax
        const updatedAssessment = await Assessment.findByIdAndUpdate(
            assessmentId,
            { $addToSet: { students: { $each: students.map(student => student._id) } } },
            { new: true }
        );
        
        if(!updatedAssessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        
        res.status(200).json({ 
            message: "Assessment assigned to students successfully", 
            assignedAssessments: updatedAssessment 
        });
    } catch (error) {
        console.error("Error assigning assessment to students:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}



const removeAssignedAssessment = async (req, res) => {
    try {
        const { id, studentId } = req.body;
        const assessment = await Assessment.findByIdAndUpdate(id, { $pull: { students: studentId } }, { new: true });
        if(!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        res.status(200).json({ message: "Assessment deleted successfully" });
    } catch (error) {
        console.error("Error deleting assigned assessment:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}


module.exports = { 
    createAssessment,
    fetchAllAssessments,
    getAssessmentById,
    updateAssessment,
    deleteAssessment,
    assignAssessment,
    getAllAssessments,
    removeAssignedAssessment,
    assignAssessmentToStudents,
};