const mongoose = require("mongoose");

const KnowledgeResource = mongoose.model(
  "KnowledgeResource",
  new mongoose.Schema({
    pedagogicTactic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pedagogicTactic"
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "resource"
    }
  })
);

module.exports = KnowledgeResource;