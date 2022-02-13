const mongoose = require("mongoose");

const historyCaseSchema = new mongoose.Schema({
    student: {
        type: mongoose.Types.ObjectId,
        ref: "Student"
    },
    case: {
        type: mongoose.Types.ObjectId,
        ref: "Case"
    } 
}, { timestamp: true });

module.exports = mongoose.model("historyCase", historyCaseSchema);