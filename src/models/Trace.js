const mongoose = require("mongoose");

const Trace = mongoose.model(
  "Trace",
  new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
    assessments: [{
      time_use: Number,
      like: Number,
    }],
    logs: [{
      name: String
    }],
    case: {  type: mongoose.Schema.Types.ObjectId, ref: "Case" },
    evaluation: {
      type: Boolean,
      default: false

    }
  },
  { timestamps: true }
  )
);

module.exports = Trace;