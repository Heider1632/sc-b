const mongoose = require("mongoose");

const Course = mongoose.model(
  "Course",
  new mongoose.Schema({
    name: String,
    description: String, 
    hasObjetiveCouse: String,
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
      }
    ],
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
      }
    ],
  })
);

module.exports = Course;