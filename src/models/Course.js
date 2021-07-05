const mongoose = require("mongoose");

const Course = mongoose.model(
  "Course",
  new mongoose.Schema({
    name: String,
    description: String, 
    hasObjetiveCouse: String,
    student: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
      }
    ],
    lesson: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
      }
    ],
  })
);

module.exports = Course;