const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema({
    context: {
        id_student: { type: mongoose.Schema.Types.ObjectId, index: true },
        id_course: mongoose.Schema.Types.ObjectId,
        lessons: [
            {
                id_lesson: mongoose.Schema.Types.ObjectId
            }
        ]     
    },
    solution: {
        id_student: mongoose.Schema.Types.ObjectId,
        lessons: [
            {
                id_lesson: mongoose.Schema.Types.ObjectId,
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
    
}, { timestamp: true });

CaseSchema.statics.getStundentCases = function (){
    return this.aggregate([])
}
  

module.exports = mongoose.model("Case", CaseSchema);