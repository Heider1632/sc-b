const mongoose = require("mongoose");

const Resource = mongoose.model(
  "Resource",
  new mongoose.Schema({
    title: String,
    language: {
      type: String,
      default: "Español"
    },
    description: String,
    keywords: [{ type: String }],
    version: {
      type: Number,
      default: 1
    },
    authors: [{ type: String }],
    entity: {
      type: String,
      default: "Universidad de Córdoba"
    },
    date: { type: Date, default: Date.now },
    format: {
      type: String,
      enum: ["image", "video", "document", "url", "embed"]
    },
    size: String,
    location: {
      type: String,
      default: "Colombia"
    },
    requirements: [{ type: String }],
    targetPopulation: {
      type: String,
      default: "Programa de enfermería"
    },
    learningContext: {
      type: String,
      defaul: "Curso Materno Infantil"
    },
    copyright: {
      type: String,
      default: "Licencia Creative Commons - BY-NC-SA"
    },
    url: String,
    estimatedTime: {
      type: Number
    },
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