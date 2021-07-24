const mongoose = require("mongoose");

const Trace = mongoose.model(
  "Trace",
  new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    lessonAssements: [{
      lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
      assessment: Number,
      time_use: Number,
      like: Boolean,
    }],
    logs: [{
      name: String
    }]
  },
  { timestamps: true }
  )
);

module.exports = Trace;