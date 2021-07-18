const mongoose = require("mongoose");

const StrategyPedagogic = mongoose.model(
  "strategyPedagogic",
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

module.exports = StrategyPedagogic;