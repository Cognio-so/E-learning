const User = require('../models/userModel');
const Curriculum = require('../models/curriculum');
const { v4: uuidv4 } = require("uuid"); // to generate unique userId
const bcrypt = require("bcryptjs");


const addUser = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { name, email, password, grade, role } = req.body;
        
        // Validate role
        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be student, teacher, or admin" });
        }

        // Validate required fields
        if (!name || !email || !password || !grade) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            grade, 
            role,
            isVerified: true 
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error adding user", error: error });
    }
}

const getAllUser = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const users = await User.find({ role: { $ne: "admin" } });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error });
    }
}

const updateUserRole = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { userId, role } = req.body;
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user role", error: error });
    }
}

const deleteUser = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { userId } = req.body;
        const user = await User.findByIdAndDelete(userId);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error });
    }
}



const addCurriculum = async (req, res) => {
  try {
    const newCurriculum = new Curriculum({
      userId: uuidv4(), // ✅ custom unique ID for new docs
      curriculum_name: req.body.curriculum_name,
      subject: req.body.subject,
      grade: req.body.grade,
      file_id: req.body.file_id,
      ocrfile_id: req.body.ocrfile_id,
      url: req.body.url,
    });

    const saved = await newCurriculum.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error adding curriculum", error: err });
  }
};

const getCurriculums = async (req, res) => {
    try {
      console.log('Fetching curriculums from database...');
      const data = await Curriculum.find();
      console.log(`Found ${data.length} curriculums in database`);
  
      // Normalize response to match frontend expectations
      const normalized = data.map((doc, index) => {
        // Handle cases where _id might be undefined or null
        let docId;
        if (doc._id) {
          docId = doc._id.toString();
        } else if (doc.id) {
          docId = doc.id.toString();
        } else {
          // Generate a unique ID using index and timestamp to avoid duplicate keys
          docId = `curriculum_${index}_${Date.now()}`;
        }
        
        return {
          id: docId,
          _id: docId,
          curriculum_name: doc.curriculum_name || '',
          subject: doc.subject || '',
          grade: doc.grade || '',
          file_id: doc.file_id || '',
          ocrfile_id: doc.ocrfile_id || '',
          url: doc.url || '',
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        };
      });
  
      console.log(`Returning ${normalized.length} normalized curriculums`);
      res.status(200).json(normalized);
    } catch (err) {
      console.error('Error fetching curriculums:', err);
      res.status(500).json({ message: "Error fetching curriculums", error: err });
    }
  };

const getCurriculumById = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        
        // Check if it's a valid MongoDB ObjectId
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        
        let curriculum;
        if (isValidObjectId) {
            curriculum = await Curriculum.findById(id);
        } else {
            // If not a valid ObjectId, return 404
            return res.status(404).json({ message: "Curriculum not found" });
        }
        
        if (!curriculum) {
            return res.status(404).json({ message: "Curriculum not found" });
        }
        
        // Normalize the response
        const normalized = {
            id: curriculum._id.toString(),
            _id: curriculum._id.toString(),
            curriculum_name: curriculum.curriculum_name || '',
            subject: curriculum.subject || '',
            grade: curriculum.grade || '',
            file_id: curriculum.file_id || '',
            ocrfile_id: curriculum.ocrfile_id || '',
            url: curriculum.url || '',
            createdAt: curriculum.createdAt,
            updatedAt: curriculum.updatedAt
        };
        
        res.status(200).json(normalized);
    }
    catch (error) {
        console.error('Error fetching curriculum by ID:', error);
        res.status(500).json({ message: "Error fetching curriculum", error: error.message });
    }
}

const deleteCurriculum = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const curriculum = await Curriculum.findByIdAndDelete(id);
        res.status(200).json(curriculum);
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting curriculum", error: error });
    }
}

const updateCurriculum = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const { curriculum_name, subject, grade, file_id, ocrfile_id, url } = req.body;
        const curriculum = await Curriculum.findByIdAndUpdate(id, { curriculum_name, subject, grade, file_id, ocrfile_id, url }, { new: true });
        res.status(200).json(curriculum);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating curriculum", error: error });
    }
}




module.exports = {
    addUser,
    getAllUser,
    updateUserRole,
    deleteUser,
    addCurriculum,
    getCurriculums,
    deleteCurriculum,
    updateCurriculum,
    getCurriculumById
}