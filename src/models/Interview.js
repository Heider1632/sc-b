const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: "Lesson"
    },
    questions: [{
        type: mongoose.Schema.ObjectId,
        ref: "Question"
    }],
    feedback: String
}, { timestamp: true });
  

module.exports = mongoose.model("Interview", InterviewSchema);