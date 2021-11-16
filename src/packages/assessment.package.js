
//every time the user has a success login the metacore package is called
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

    setEvaluation(){

    }

    generateAnswers(){

    }

    getEvaluation(){

    }    
    
}

const assessmentPackage = new AssessmentPackage();
 
module.exports = assessmentPackage;