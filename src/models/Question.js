const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    name: String,
    response: String,
    knowledgeComponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KnowledgeComponent"
    },
    options: [
        {
            label: { type: String },
        }
    ],
    feedbacks: [
        {
            name: { type: String },
        }
    ]
}, { timestamp: true });
  

module.exports = mongoose.model("Question", QuestionSchema);