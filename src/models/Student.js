const mongoose = require("mongoose");

const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    performance: moongose.Schema.Types.ObjectId,
    learningStyle: moongose.Schema.Types.ObjectId,
    course: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],
  })
);

module.exports = Student;