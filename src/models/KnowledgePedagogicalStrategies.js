const mongoose = require("mongoose");

const KnowledgePedagogicalStrategies = mongoose.model(
  "KnowledgePedagogicalStrategies",
  new mongoose.Schema({
      pedagogicTactic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pedagogicTactic"
      },
      learningStyleDimensions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "learningStyleDimension"
      }]
  })
);

module.exports = KnowledgePedagogicalStrategies;