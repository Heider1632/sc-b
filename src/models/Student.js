const mongoose = require("mongoose");

const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    performance: mongoose.Schema.Types.ObjectId,
    learningStyle: mongoose.Schema.Types.ObjectId,
    course: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],
  })
);

module.exports = Student;