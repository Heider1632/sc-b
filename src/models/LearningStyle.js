const mongoose = require("mongoose");

const learningStyle = mongoose.model(
  "learningStyle",
  new mongoose.Schema({
    name: String,
    learningStyleDimension: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "learningStyleDimension"
        }
    ]
  })
);

module.exports = learningStyle;