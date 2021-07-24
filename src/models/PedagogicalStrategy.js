const mongoose = require("mongoose");

const PedagogicalStrategy = mongoose.model(
  "PedagogicalStrategy",
  new mongoose.Schema({
    learningTheory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "learningTheory"
    },
    pedagogicTactic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pedagogicTactic"
    }
  })
);

module.exports = PedagogicalStrategy;