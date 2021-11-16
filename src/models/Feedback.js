const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    name: String,
}, { timestamp: true });
  

module.exports = mongoose.model("Feedback", FeedbackSchema);