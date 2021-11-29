const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
    title: String,
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: "Lesson"
    },
    questions: [{
        type: mongoose.Schema.ObjectId,
        ref: "Question"
    }],
    feedbacks: [{
        type: mongoose.Schema.ObjectId,
        ref: "Feedback" 
    }]
    
}, { timestamp: true });
  

module.exports = mongoose.model("Interview", InterviewSchema);