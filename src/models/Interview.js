const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
    title: String,
    questions: [{
        type: mongoose.Schema.ObjectId,
        ref: "Question"
    }],
    feedback: [{
        type: mongoose.Schema.ObjectId,
        ref: "Feedback" 
    }]
    
}, { timestamp: true });
  

module.exports = mongoose.model("Interview", InterviewSchema);