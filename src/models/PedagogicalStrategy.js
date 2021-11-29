const mongoose = require("mongoose");

const PedagogicalStrategy = mongoose.model(
  "PedagogicalStrategy",
  new mongoose.Schema({
    learningTheory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "learningTheory"
    },
    pedagogicalTactic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pedagogicalTactic"
    },
    learningStyleDimensions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "learningStyleDimension"
    }],
  })
);

module.exports = PedagogicalStrategy;