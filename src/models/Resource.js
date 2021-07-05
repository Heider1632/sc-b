const mongoose = require("mongoose");

const Resource = mongoose.model(
  "Resource",
  new mongoose.Schema({
    name: String,
    description: String, 
    type: String,
    url: String,
    rating: Number,
    estimatedTime: Date
  })
);

module.exports = Resource;