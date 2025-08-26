const Lesson = require('../models/lessonModel');
const Content = require('../models/contentModel');
const Assessment = require('../models/assessmentModel');
const Image = require('../models/imageModel');
const Comic = require('../models/comicModel');
const Slide = require('../models/slideModel');
const WebSearch = require('../models/webSearchModel');

// Add this helper function at the top of the file
const normalizeDifficulty = (difficulty) => {
  const difficultyMap = {
    'Easy': 'beginner',
    'Medium': 'intermediate', 
    'Hard': 'advanced',
    'easy': 'beginner',
    'medium': 'intermediate',
    'hard': 'advanced',
    'beginner': 'beginner',
    'intermediate': 'intermediate',
    'advanced': 'advanced'
  };
  return difficultyMap[difficulty] || 'intermediate';
};

// Create lesson with different types
const createLesson = async (req, res) => {
    try {
        const { 
            title, description, subject, grade, lessonType, 
            contentIds, assessmentIds, imageIds, comicIds, slideIds, webSearchIds,
            objectives, duration, difficulty, tags, status
        } = req.body;
        
        // Validate required fields
        if (!title || !description || !subject || !grade) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, subject, and grade are required'
            });
        }

        // Normalize difficulty value
        const normalizedDifficulty = normalizeDifficulty(difficulty);

        // Validate that at least one resource is provided
        const hasResources = (contentIds && contentIds.length > 0) ||
                           (assessmentIds && assessmentIds.length > 0) ||
                           (imageIds && imageIds.length > 0) ||
                           (comicIds && comicIds.length > 0) ||
                           (slideIds && slideIds.length > 0) ||
                           (webSearchIds && webSearchIds.length > 0);

        if (!hasResources) {
            return res.status(400).json({
                success: false,
                message: 'At least one resource (content, assessment, image, etc.) must be added to the lesson'
            });
        }

        // Validate resources exist in database
        if (contentIds && contentIds.length > 0) {
            const contentExists = await Content.countDocuments({ _id: { $in: contentIds } });
            if (contentExists !== contentIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more content resources not found'
                });
            }
        }

        if (assessmentIds && assessmentIds.length > 0) {
            const assessmentExists = await Assessment.countDocuments({ _id: { $in: assessmentIds } });
            if (assessmentExists !== assessmentIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more assessment resources not found'
                });
            }
        }

        const lesson = new Lesson({
            title,
            description,
            subject,
            grade,
            lessonType: lessonType || 'mixed',
            contentIds: contentIds || [],
            assessmentIds: assessmentIds || [],
            imageIds: imageIds || [],
            comicIds: comicIds || [],
            slideIds: slideIds || [],
            webSearchIds: webSearchIds || [],
            objectives: objectives || '',
            duration: duration || 60,
            difficulty: normalizedDifficulty,
            tags: tags || [],
            status: status || 'active',
            createdBy: req.user._id
        });

        await lesson.save();
        
        // Populate the lesson with resources
        const populatedLesson = await Lesson.findById(lesson._id)
            .populate('contentIds')
            .populate('assessmentIds')
            .populate('imageIds')
            .populate('comicIds')
            .populate('slideIds')
            .populate('webSearchIds');
        
        res.status(201).json({
            success: true,
            message: 'Lesson created successfully with resources',
            lesson: populatedLesson
        });
    } catch (error) {
        console.error('Create lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create lesson',
            error: error.message
        });
    }
};

// Create assessment-based lesson
const createAssessmentLesson = async (req, res) => {
    try {
        const { title, description, subject, grade, assessmentIds, objectives, duration } = req.body;
        
        if (!title || !description || !subject || !grade || !assessmentIds) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, subject, grade, and assessmentIds are required'
            });
        }

        const lesson = new Lesson({
            title,
            description,
            subject,
            grade,
            lessonType: 'assessment',
            assessmentIds,
            objectives: objectives || '',
            duration: duration || 60,
            createdBy: req.user._id
        });

        await lesson.save();
        
        const populatedLesson = await Lesson.findById(lesson._id)
            .populate('assessmentIds');
        
        res.status(201).json({
            success: true,
            message: 'Assessment lesson created successfully',
            lesson: populatedLesson
        });
    } catch (error) {
        console.error('Create assessment lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create assessment lesson',
            error: error.message
        });
    }
};

// Create content-based lesson
const createContentLesson = async (req, res) => {
    try {
        const { title, description, subject, grade, contentIds, objectives, duration } = req.body;
        
        if (!title || !description || !subject || !grade || !contentIds) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, subject, grade, and contentIds are required'
            });
        }

        const lesson = new Lesson({
            title,
            description,
            subject,
            grade,
            lessonType: 'content',
            contentIds,
            objectives: objectives || '',
            duration: duration || 60,
            createdBy: req.user._id
        });

        await lesson.save();
        
        const populatedLesson = await Lesson.findById(lesson._id)
            .populate('contentIds');
        
        res.status(201).json({
            success: true,
            message: 'Content lesson created successfully',
            lesson: populatedLesson
        });
    } catch (error) {
        console.error('Create content lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create content lesson',
            error: error.message
        });
    }
};

// Create media-based lesson
const createMediaLesson = async (req, res) => {
    try {
        const { title, description, subject, grade, imageIds, comicIds, slideIds, webSearchIds, objectives, duration } = req.body;
        
        if (!title || !description || !subject || !grade) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, subject, and grade are required'
            });
        }

        const lesson = new Lesson({
            title,
            description,
            subject,
            grade,
            lessonType: 'media',
            imageIds: imageIds || [],
            comicIds: comicIds || [],
            slideIds: slideIds || [],
            webSearchIds: webSearchIds || [],
            objectives: objectives || '',
            duration: duration || 60,
            createdBy: req.user._id
        });

        await lesson.save();
        
        const populatedLesson = await Lesson.findById(lesson._id)
            .populate('imageIds')
            .populate('comicIds')
            .populate('slideIds')
            .populate('webSearchIds');
        
        res.status(201).json({
            success: true,
            message: 'Media lesson created successfully',
            lesson: populatedLesson
        });
    } catch (error) {
        console.error('Create media lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create media lesson',
            error: error.message
        });
    }
};

// Add resource to lesson
const addResourceToLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { resourceType, resourceId } = req.body;
        
        if (!resourceType || !resourceId) {
            return res.status(400).json({
                success: false,
                message: 'Resource type and resource ID are required'
            });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Check if teacher owns the lesson
        if (lesson.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to modify this lesson'
            });
        }

        // Add resource based on type
        const updateField = `${resourceType}Ids`;
        if (!lesson[updateField]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource type'
            });
        }

        // Check if resource already exists
        if (lesson[updateField].includes(resourceId)) {
            return res.status(400).json({
                success: false,
                message: 'Resource already exists in lesson'
            });
        }

        lesson[updateField].push(resourceId);
        await lesson.save();
        
        const populatedLesson = await Lesson.findById(lessonId)
            .populate('contentIds')
            .populate('assessmentIds')
            .populate('imageIds')
            .populate('comicIds')
            .populate('slideIds')
            .populate('webSearchIds');

        res.status(200).json({
            success: true,
            message: 'Resource added to lesson successfully',
            lesson: populatedLesson
        });
    } catch (error) {
        console.error('Add resource to lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add resource to lesson',
            error: error.message
        });
    }
};

// Remove resource from lesson
const removeResourceFromLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { resourceType, resourceId } = req.body;
        
        if (!resourceType || !resourceId) {
            return res.status(400).json({
                success: false,
                message: 'Resource type and resource ID are required'
            });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Check if teacher owns the lesson
        if (lesson.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to modify this lesson'
            });
        }

        // Remove resource based on type
        const updateField = `${resourceType}Ids`;
        if (!lesson[updateField]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource type'
            });
        }

        lesson[updateField] = lesson[updateField].filter(id => id.toString() !== resourceId);
        await lesson.save();
        
        const populatedLesson = await Lesson.findById(lessonId)
            .populate('contentIds')
            .populate('assessmentIds')
            .populate('imageIds')
            .populate('comicIds')
            .populate('slideIds')
            .populate('webSearchIds');

        res.status(200).json({
            success: true,
            message: 'Resource removed from lesson successfully',
            lesson: populatedLesson
        });
    } catch (error) {
        console.error('Remove resource from lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove resource from lesson',
            error: error.message
        });
    }
};

// Existing functions with updated population
const fetchAllLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find({ createdBy: req.user._id })
            .populate('contentIds')
            .populate('assessmentIds')
            .populate('imageIds')
            .populate('comicIds')
            .populate('slideIds')
            .populate('webSearchIds')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            lessons
        });
    } catch (error) {
        console.error('Fetch lessons error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lessons',
            error: error.message
        });
    }
};

const getLessonsByStudent = async (req, res) => {
    try {
        // Get student's grade from the authenticated user
        const studentGrade = req.user.grade;
        
        // Filter lessons by student's grade and only show active lessons
        const lessons = await Lesson.find({
            status: 'active',
            grade: studentGrade
        })
        .populate('contentIds')
        .populate('assessmentIds')
        .populate('imageIds')
        .populate('comicIds')
        .populate('slideIds')
        .populate('webSearchIds')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            lessons
        });
    } catch (error) {
        console.error('Fetch student lessons error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lessons',
            error: error.message
        });
    }
};

const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
            .populate('contentIds')
            .populate('assessmentIds')
            .populate('imageIds')
            .populate('comicIds')
            .populate('slideIds')
            .populate('webSearchIds');

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        res.status(200).json({
            success: true,
            lesson
        });
    } catch (error) {
        console.error('Get lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get lesson',
            error: error.message
        });
    }
};

const updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        .populate('contentIds')
        .populate('assessmentIds')
        .populate('imageIds')
        .populate('comicIds')
        .populate('slideIds')
        .populate('webSearchIds');

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lesson updated successfully',
            lesson
        });
    } catch (error) {
        console.error('Update lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lesson',
            error: error.message
        });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        console.error('Delete lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete lesson',
            error: error.message
        });
    }
};

module.exports = {
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
};
