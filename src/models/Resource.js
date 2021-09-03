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
    estimatedTime: {
      type: Date,
      default: Date.now()
    },
    pedagogicalStrategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PedagogicalStrategy"
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson"
    }
  })
);

module.exports = Resource;