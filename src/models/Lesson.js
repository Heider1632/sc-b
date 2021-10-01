
const { ObjectID } = require("mongodb");

const mongoose = require("mongoose");

ObjectID.prototype.valueOf = function() {
  return this.toString();
};

const Lesson = mongoose.model(
  "Lesson",
  new mongoose.Schema({
    title: String,
    hasObjectiveLesson: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    learningStyleDimensions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "learningStyleDimension" 
    }],
    structure: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Structure" 
    }]
  }, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  })
);

module.exports = Lesson;