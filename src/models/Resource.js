const mongoose = require("mongoose");

const Resource = mongoose.model(
  "Resource",
  new mongoose.Schema({
    name: String,
    description: String, 
    type: String,
    url: String,
    rating: Number,
    estimatedTime: Date,
    strategyPedagogic: moongose.Schema.Types.ObjectId,
    id_lesson: moongose.Schema.Types.ObjectId
  })
);

module.exports = Resource;