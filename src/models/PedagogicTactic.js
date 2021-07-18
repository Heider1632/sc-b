const mongoose = require("mongoose");

const PedagogicTactic = mongoose.model(
  "pedagogicTactic",
  new mongoose.Schema({
    name: String,
  })
);

module.exports = PedagogicTactic;