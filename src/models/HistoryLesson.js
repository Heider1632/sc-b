const mongoose = require("mongoose");

const HistoryLessonSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    structure: { type: mongoose.Schema.Types.ObjectId, ref: "Structure" },
    isBlock: { type: Boolean, default: true },
    index: { type: Number }
}, { timestamp: true });

module.exports = mongoose.model("historyLesson", HistoryLessonSchema);