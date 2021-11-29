const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    name: String,
    response: String,
    options: [
        {
            label: { type: String },
        }
    ]
}, { timestamp: true });
  

module.exports = mongoose.model("Question", QuestionSchema);