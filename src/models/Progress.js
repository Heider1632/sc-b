const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    isActive: { type: Boolean, default: true }
}, { timestamp: true });

module.exports = mongoose.model("Progress", ProgressSchema);