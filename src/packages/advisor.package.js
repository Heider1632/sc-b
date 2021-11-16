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

    getFeedback(answer_id){
        
    }

}

const advisorPackage = new AdvisorPakage();


module.exports = advisorPackage;