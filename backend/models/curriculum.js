const mongoose = require("mongoose");

const curriculumSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false }, // for new records
    curriculum_name: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    file_id: { type: String, required: true },
    ocrfile_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  { 
    timestamps: true,
    collection: 'curriculum' // Explicitly specify the collection name
  }
);

const Curriculum = mongoose.model("Curriculum", curriculumSchema);

module.exports = Curriculum;
