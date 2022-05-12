const mongoose = require("mongoose");

const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    name: String,
    lastname: String,
    performance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Perfomance"
    },
    learningStyleDimensions: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: "learningStyleDimension"
    }],
    course: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    semester: {
      type: String
    },
    program: {
      type: String
    },
    institution: {
      type: String
    }
  })
);

module.exports = Student;