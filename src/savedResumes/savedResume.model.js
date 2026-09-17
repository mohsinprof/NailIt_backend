const mongoose = require('mongoose');

/**
 * Saved Resumes Feature - isolated model.
 * Stores full PDF binary in MongoDB (max 3MB enforced by this feature's multer).
 * Deleting this file removes the feature's data layer completely.
 */
const savedResumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        default: "application/pdf",
    },
    size: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
        enum: ["upload", "fresh", "tailored"],
        default: "upload",
    },
    data: {
        type: Buffer,
        required: true,
    },
}, { timestamps: true });

const savedResumeModel = mongoose.model("SavedResume", savedResumeSchema);

module.exports = savedResumeModel;
