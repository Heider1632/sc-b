const mongoose = require("mongoose");

const HistoryCaseSchema = new mongoose.Schema({
    student: {
        type: mongoose.Types.ObjectId,
        ref: "Student"
    },
    trace: {
        type: mongoose.Types.ObjectId,
        ref: "Trace"
    },
    was: {
        type: String,
        default: "success"
    },
    note: {
        type: Number
    },
    questions: [mongoose.Schema.Types.Mixed]
}, { timestamp: true });

module.exports = mongoose.model("historyCase", HistoryCaseSchema);