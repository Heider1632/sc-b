const mongoose = require("mongoose");

const LearningTheory = mongoose.model(
  "learningTheory",
  new mongoose.Schema({
    name: String,
  })
);

module.exports = LearningTheory;