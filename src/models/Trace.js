const mongoose = require("mongoose");

const Trace = mongoose.model(
  "Trace",
  new mongoose.Schema({
    id_student: mongoose.Schema.Types.ObjectId,
    id_course: mongoose.Schema.Types.ObjectId,
    lessonAssements: [
        {
            id_lesson: mongoose.Schema.Types.ObjectId,
            assessment: Number,
            time_use: Number,
            like: Boolean,
        }
    ],
    logs: [
      {
        name: String
      }
    ]
  },
  { timestamps: true }
  )
);

module.exports = Trace;