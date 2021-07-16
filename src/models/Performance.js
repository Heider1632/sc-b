const mongoose = require("mongoose");

const Performance = mongoose.model(
  "Performance",
  new mongoose.Schema({
    name: {
      type: String,
      enum : [ 'poor','low', 'medium', 'high'],
      default: 'poor'
    }
  })
);

module.exports = Performance;