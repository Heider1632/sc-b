const mongoose = require("mongoose");

const Lesson = mongoose.model(
  "Lesson",
  new mongoose.Schema({
    cod: String,
    type: String,
    resource: mongoose.Schema.Types.ObjectId,
  })
);

module.exports = Lesson;