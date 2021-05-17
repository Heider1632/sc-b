const mongoose = require("mongoose");

const Resource = mongoose.model(
  "Resource",
  new mongoose.Schema({
    name: String,
    description: String, 
    type: String,
    uri: String
  })
);

module.exports = Resource;