const mongoose = require("mongoose");

const KnowledgeResource = mongoose.model(
  "KnowledgeResource",
  new mongoose.Schema({
    pedagogicTactic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pedagogicTactic"
    },
    structure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Structure"
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource"
    }
  })
);

module.exports = KnowledgeResource;