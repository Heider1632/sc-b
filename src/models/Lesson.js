const mongoose = require("mongoose");

const Lesson = mongoose.model(
  "Lesson",
  new mongoose.Schema({
    title: String,
    type: {
      type: String,
      enum: ["introduction", "definition", "example", "activity", "evaluation"],
      default: "introduction"
    },
    hasObjectiveLesson: String,
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource"
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  })
);

module.exports = Lesson;