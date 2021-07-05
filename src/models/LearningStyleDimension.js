const mongoose = require("mongoose");

const learningStyleDimension = mongoose.model(
  "learningStyleDimension",
  new mongoose.Schema({
    name: String,
  })
);

module.exports = learningStyleDimension;