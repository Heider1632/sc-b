const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema({
    context: {
        id_student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", index: true },
        id_course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
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

CaseSchema.statics.getStudentCases = (id_student, lessons) => {
    return this.aggregate([
        { $match: { "context.lessons" : { $in : lessons } } },
        { $match: { "context.id_student" : id_student } },
    ])
}
  

module.exports = mongoose.model("Case", CaseSchema);