const mongoose = require("mongoose");

const Trace = mongoose.model(
  "Trace",
  new mongoose.Schema({
    id_student: moongose.Schema.Types.ObjectId,
    id_course: moongose.Schema.Types.ObjectId,
    lessonAssements: [
        {
            id_lesson: moongose.Schema.Types.ObjectId,
            assessment: Number,
            time_use: Number,
            like: Boolean,
        }
    ],
    errors: [
      {
        name: String
      }
    ]
  },
  { timestamps: true }
  )
);

module.exports = Trace;