const mongoose = require("mongoose");

const KnowledgePedagogicalStrategy = mongoose.model(
  "KnowledgePedagogicalStrategy",
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

module.exports = KnowledgePedagogicalStrategy;