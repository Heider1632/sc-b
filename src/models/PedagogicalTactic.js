const mongoose = require("mongoose");

const PedagogicalTactic = mongoose.model(
  "pedagogicalTactic",
  new mongoose.Schema({
    name: String,
  })
);

module.exports = PedagogicalTactic;