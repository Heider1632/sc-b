const mongoose = require("mongoose");

const Lesson = mongoose.model(
  "Lesson",
  new mongoose.Schema({
    type: String,
    learningStyle: moongose.Schema.Types.ObjectId,
    resources: [ mongoose.Schema.Types.ObjectId ],
  })
);

module.exports = Lesson;