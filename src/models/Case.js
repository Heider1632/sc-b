const mongoose = require("mongoose");

const Case = mongoose.model(
  "Case",
  new mongoose.Schema({
    context: {
        id_student: { type: moongose.Schema.Types.ObjectId, index: true },
        id_course: moongose.Schema.Types.ObjectId,
        lessons: [
            {
                id_lesson: moongose.Schema.Types.ObjectId
            }
        ]     
    },
    solution: {
        id_student: moongose.Schema.Types.ObjectId,
        lessons: [
            {
                id_lesson: moongose.Schema.Types.ObjectId,
                time_use: Number
            }
        ]
    },
    euclideanWeight: Number,
    results: {
        use: Number,
        success: Number,
        errors: Number
    }
    
  }, { timestamp: true } )
);

module.exports = Case;