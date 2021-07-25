
const { ObjectID } = require("mongodb");

const mongoose = require("mongoose");

ObjectID.prototype.valueOf = function() {
  return this.toString();
};

const Lesson = mongoose.model(
  "Lesson",
  new mongoose.Schema({
    title: String,
    type: {
      type: String,
      enum: ["introduction", "definition", "example", "activity", "evaluation"],
      default: "introduction"
    },
    hasObjectiveLesson: String,
    learningStyleDimensions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "learningStyleDimension" 
    }],
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource"
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  }, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  })
);

module.exports = Lesson;