
const { ObjectID } = require("mongodb");

const mongoose = require("mongoose");

ObjectID.prototype.valueOf = function() {
  return this.toString();
};

const Structure = mongoose.model(
  "Structure",
  new mongoose.Schema({
    type: {
      type: String,
      enum: ["introduction", "definition", "description", "example", "activity", "evaluation"],
      default: "introduction"
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson"
    }
  }, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  })
);

module.exports = Structure;