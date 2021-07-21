const mongoose = require("mongoose");

const Resource = mongoose.model(
  "Resource",
  new mongoose.Schema({
    description: String,
    format: {
      type: String,
      enum: ["image", "video", "document", "url"]
    },
    url: String,
    rating: {
      type: Number,
      default: 3
    },
    estimatedTime: {
      type: Date,
      default: Date.now()
    },
    strategyPedagogic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StrategyPedagogic"
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson"
    }
  })
);

module.exports = Resource;