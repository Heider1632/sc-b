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
    }]
  },
  { timestamps: true }
  )
);

module.exports = Trace;