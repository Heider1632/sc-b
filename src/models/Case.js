const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema({
    context: {
        id_student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", index: true },
        id_course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        id_lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
        structure: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Structure"
            }
        ]     
    },
    solution: {
        id_student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        resources: [
            {
                resource: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Resource"
                },
                rating: {
                    type: Number,
                    default: 3,
                },
                time_use: {
                    type: Number,
                    default: 0,
                }
            }
        ]
    },
    euclideanWeight: Number,
    results: {
        uses: Number,
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