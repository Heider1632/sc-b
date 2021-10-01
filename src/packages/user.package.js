let instance = null;
const db = require("../models");
class UserPackage {
    constructor() {
        if (instance) return instance;
        instance = this;
        return instance;
    }
     
    static getInstance() {
        return instance || new UserPackage();
    }

    async getStudent(student_id) {
        return await db.student.findById(student_id);
    }

    async getLearningStyleDimensions(student_id){
        return await db.student.findById(student_id).populate('learningStyleDimensions').learningStyleDimensions;
    }

    async getTraceKnowledge(student_id){
        return await db.trace.find({ student: student_id });
    }

}


module.exports = UserPackage;