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
    learningStyleDimensions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "learningStyleDimension"
    }],
    pedagogicalStrategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PedagogicalStrategy"
    },
    structure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Structure"
    }
  })
);

module.exports = Resource;