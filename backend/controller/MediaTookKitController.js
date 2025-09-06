const WebSearch = require('../models/webSearchModel');
const Image = require('../models/imageModel');
const Comic = require('../models/comicModel');
const Slide = require('../models/slideModel');
const Video = require('../models/videoModel'); // Add video model
const { uploadBufferToCloudinary } = require('../lib/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file) => {
    return await uploadBufferToCloudinary(file, 'ed-teach-images');
};

// Helper function to upload comic image to Cloudinary
const uploadComicImageToCloudinary = async (file) => {
    return await uploadBufferToCloudinary(file, 'ed-teach-comics');
};

// New endpoint for comic image uploads
const uploadComicImage = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const imageUrl = await uploadComicImageToCloudinary(req.file);
        
        res.status(201).json({ imageUrl });
    } catch (error) {
        console.error('Upload comic image error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createWebSearch = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        const { searchTopic, contentType, subject, grade, comprehensionLevel, gradeLevel, language, searchResults } = req.body;
        
        if (!searchTopic || !contentType || !subject || !grade || !comprehensionLevel || !gradeLevel || !language) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const webSearch = await WebSearch.create({ 
            searchTopic, 
            contentType, 
            subject, 
            grade, 
            comprehensionLevel, 
            gradeLevel, 
            language, 
            searchResults: searchResults || '',
            createdBy: req.user.id
        });

        res.status(201).json(webSearch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const fetchWebSearch = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized - Teacher role required" });
        }
        
        const webSearches = await WebSearch.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        if(!webSearches) {
            return res.status(404).json({ message: "No web searches found" });
        }
        res.status(200).json(webSearches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getWebSearchById = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        const webSearch = await WebSearch.findById(id);
        if(!webSearch) {
            return res.status(404).json({ message: "Web search not found" });
        }
        res.status(200).json(webSearch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteWebSearch = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if(req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        const webSearch = await WebSearch.findByIdAndDelete(id);
        if(!webSearch) {
            return res.status(404).json({ message: "Web search not found" });
        }
        res.status(200).json({ message: "Web search deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const createImage = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const { topic, subject, grade, visualLevel, visualType, language, imageUrl, status } = req.body;
        
        if (!topic || !subject || !grade || !visualLevel || !visualType || !language) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let finalImageUrl = imageUrl;

        // If a file was uploaded, upload to Cloudinary first
        if (req.file) {
            try {
                finalImageUrl = await uploadToCloudinary(req.file);
            } catch (uploadError) {
                return res.status(500).json({ message: uploadError.message });
            }
        }

        const image = await Image.create({ 
            topic, 
            subject, 
            grade, 
            visualLevel, 
            visualType, 
            language, 
            imageUrl: finalImageUrl,
            status: status || 'completed',
            results: [], // Initialize empty results array
            createdBy: req.user.id
        });

        res.status(201).json(image);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const fetchImage = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized - Teacher role required" });
        }
        
        const images = await Image.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        if(!images) {
            return res.status(404).json({ message: "No images found" });
        }
        res.status(200).json(images);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getImageById = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        const image = await Image.findById(id);
        if(!image) {
            return res.status(404).json({ message: "Image not found" });
        }
        res.status(200).json(image);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteImage = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const image = await Image.findByIdAndDelete(id);
        if(!image) {
            return res.status(404).json({ message: "Image not found" });
        }
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const createComic = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const { instruction, subject, grade, language, comicType, imageUrls } = req.body;
        if (!instruction || !subject || !grade || !language || !comicType) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const comic = await Comic.create({ 
            instruction, 
            subject, 
            grade, 
            language, 
            comicType,
            imageUrls: imageUrls || [], // Add the image URLs from Cloudinary
            createdBy: req.user.id
        });
        res.status(201).json(comic);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const fetchComic = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized - Teacher role required" });
        }
        
        const comics = await Comic.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        if(!comics) {
            return res.status(404).json({ message: "No comics found" });
        }
        res.status(200).json(comics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getComicById = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        const comic = await Comic.findById(id);
        if(!comic) {
            return res.status(404).json({ message: "Comic not found" });
        }
        res.status(200).json(comic);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteComic = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const comic = await Comic.findByIdAndDelete(id);
        if(!comic) {
            return res.status(404).json({ message: "Comic not found" });
        }
        res.status(200).json({ message: "Comic deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const createSlide = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        const { title, subject, grade, verbosity, topic, stockImage, customInstruction, language, results, presentationUrl, downloadUrl, slideCount, status } = req.body;
        
        if (!title || !subject || !grade || !verbosity || !topic || stockImage === undefined || !customInstruction || !language) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const slide = await Slide.create({ 
            title, 
            subject, 
            grade, 
            verbosity, 
            topic, 
            stockImage, 
            customInstruction, 
            language, 
            results: results || [],
            presentationUrl: presentationUrl || null,
            downloadUrl: downloadUrl || null,
            slideCount: slideCount || 0,
            status: status || 'pending',
            createdBy: req.user.id
        });

        res.status(201).json(slide);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const fetchSlide = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized - Teacher role required" });
        }
        
        const slides = await Slide.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        if (!slides) {
            return res.status(404).json({ message: "No slides found" });
        }
        res.status(200).json(slides);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getSlideById = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        const slide = await Slide.findById(id);
        if (!slide) {
            return res.status(404).json({ message: "Slide not found" });
        }
        res.status(200).json(slide);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteSlide = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const slide = await Slide.findByIdAndDelete(id);
        if(!slide) {
            return res.status(404).json({ message: "Slide not found" });
        }   
        res.status(200).json({ message: "Slide deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Video CRUD operations
const createVideo = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        const { videoUrl, voiceId, talkingPhotoId } = req.body;
        
        if (!videoUrl || !voiceId || !talkingPhotoId) {
            return res.status(400).json({ message: "Video URL, voice ID, and talking photo ID are required" });
        }

        const video = await Video.create({ 
            videoUrl, 
            voiceId, 
            talkingPhotoId, 
            createdBy: req.user.id
        });

        res.status(201).json(video);
    } catch (error) {
        console.error('Create video error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const fetchVideo = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized - Teacher role required" });
        }
        
        const videos = await Video.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(videos);
    } catch (error) {
        console.error('Fetch video error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getVideoById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        res.status(200).json(video);
    } catch (error) {
        console.error('Get video by ID error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteVideo = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const video = await Video.findByIdAndDelete(id);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        res.status(200).json({ message: "Video deleted successfully" });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update fetchMediaByStudent to include videos
const fetchMediaByStudent = async (req, res) => {
    try {
        const { grade, subjects } = req.user;
        const { type } = req.query; // 'image', 'comic', 'slide', 'web-search', 'video'
        
        if (!grade || !subjects || subjects.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student grade and subjects are required' 
            });
        }

        let results = {};

        // Fetch images
        if (!type || type === 'image') {
            const images = await Image.find({
                grade: grade,
                subject: { $in: subjects }
            }).sort({ createdAt: -1 });
            results.images = images;
        }

        // Fetch comics
        if (!type || type === 'comic') {
            const comics = await Comic.find({
                grade: grade,
                subject: { $in: subjects }
            }).sort({ createdAt: -1 });
            results.comics = comics;
        }

        // Fetch slides
        if (!type || type === 'slide') {
            const slides = await Slide.find({
                grade: grade,
                subject: { $in: subjects }
            }).sort({ createdAt: -1 });
            results.slides = slides;
        }

        // Fetch videos
        if (!type || type === 'video') {
            const videos = await Video.find({
                grade: grade,
                subject: { $in: subjects }
            }).sort({ createdAt: -1 });
            results.videos = videos;
        }

        // Fetch web searches
        if (!type || type === 'web-search') {
            const webSearches = await WebSearch.find({
                grade: grade,
                subject: { $in: subjects }
            }).sort({ createdAt: -1 });
            results.webSearches = webSearches;
        }

        res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error fetching media by student:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

module.exports = {
    createWebSearch,
    fetchWebSearch,
    getWebSearchById,
    deleteWebSearch,
    createImage,
    fetchImage,
    getImageById,
    deleteImage,
    createComic,
    fetchComic,
    getComicById,
    deleteComic,
    createSlide,
    fetchSlide,
    getSlideById,
    deleteSlide,
    createVideo,
    fetchVideo,
    getVideoById,
    deleteVideo,
    fetchMediaByStudent,
    upload,
    uploadComicImage
};