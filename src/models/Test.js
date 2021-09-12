const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
    question: {
        type: String
    },
    options: [
        {
            label: { type: String },
            prefix: { type: String },
        }
    ]
    
});

module.exports = mongoose.model("Test", TestSchema);