const mongoose = require("mongoose");

const HistoryCaseSchema = new mongoose.Schema({
    student: {
        type: mongoose.Types.ObjectId,
        ref: "Student"
    },
    case: {
        type: mongoose.Types.ObjectId,
        ref: "Case"
    },
    was: {
        type: String,
        default: "success"
    },
    note: {
        type: Number
    }
}, { timestamp: true });

module.exports = mongoose.model("historyCase", HistoryCaseSchema);