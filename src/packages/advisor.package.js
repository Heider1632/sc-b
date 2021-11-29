let instance = null;
const db = require("../models");
class AdvisorPakage {

    constructor() {
        if (instance) return instance;
        instance = this;
        return instance;
    }
     
    static getInstance() {
        return instance || new AdvisorPackage();
    }

    async getCourse(course_id){
        return await db.course.findById(course_id);
    }

    async getLessons(course_id){
        return await db.course.findById(course_id).lessons;
    }

    getFeedback(assessment_id){
        return db.feedback.findById(assessment_id);   
    }

}

const advisorPackage = new AdvisorPakage();


module.exports = advisorPackage;