
//every time the user has a success login the metacore package is called
const db  = require('../models');
let instance = null;
class AssessmentPackage {
    constructor() {
        if (instance) return instance;
        instance = this;
        return instance;
    }
     
    static getInstance() {
        return instance || new AssessmentPackage();
    }

    async setEvaluation(id){
        return await db.assessment.findById(id);
    }

    async getEvaluation(){
        return await db.assessment.create(assessments);
    }    
    
}

const assessmentPackage = new AssessmentPackage();
 
module.exports = assessmentPackage;