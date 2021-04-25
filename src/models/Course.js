const mongoose = require("mongoose");

const Course = mongoose.model(
  "Course",
  new mongoose.Schema({
    name: String,
    hasObjetiveCouse: String,
    course: mongoose.Schema.Types.ObjectId,
  })
);

module.exports = Course;