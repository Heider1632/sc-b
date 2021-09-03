const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    name: String,
    
    
}, { timestamp: true });
  

module.exports = mongoose.model("Question", QuestionSchema);