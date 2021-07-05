const mongoose = require("mongoose");

const Performance = mongoose.model(
  "Performance",
  new mongoose.Schema({
    name: String,
  })
);

module.exports = Performance;