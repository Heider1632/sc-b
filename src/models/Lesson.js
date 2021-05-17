const mongoose = require("mongoose");

const Lesson = mongoose.model(
  "Lesson",
  new mongoose.Schema({
    cod: String,
    type: String,
    course: mongoose.Schema.Types.ObjectId,
    structure: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource"
      }
    ]
    
  })
);

module.exports = Lesson;