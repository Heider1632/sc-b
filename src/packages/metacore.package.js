const db = require("../models");
const cbrService = require("../services/cbr.service");
const CbrService = require("../services/cbr.service");

//every time the user has a success login the metacore package is called
let instance = null;
class MetacorePackage  {

    constructor() {
        if (instance) return instance;
        instance = this;
        return instance;
    }
     
    static getInstance() {
        return instance || new MetacorePackage();
    }

    // BasicElement
    getTrace(id_student, id_course){
        db.trace.find({ id_student: id_student, id_course: id_course }).exec( (res, data ) => {
            if(err) throw err;
            return data;
        });
    }

    setTrace(id_student, id_course, lessonAssements, logs){
        db.trace.create({
            id_student: id_student,
            id_course: id_course,
            lessonAssements: lessonAssements,
            logs: logs
        }).exec((err, res) => {
            if(err) throw err;
            return true;
        });
    }

    updateTrace(_id, lessonAssements, logs){
        db.trace.findOneAndUpdate({ _id : _id }, {  $set : {
            lessonAssements: lessonAssements,
            logs: logs
        } }, { new: true }).exec((err, res) => {
            if(err) throw err;
            return true;
        });
    }

    getSession(id_student){
        db.session.find({id_student: id_student}).exec((err, res) => {
            if(erro) throw err;
            return res;
        });
    }

    getProfile(id_student){
        db.profile.find({ id_student: id_student }).exec((err, res) => {
            if(err) throw err;
            return res;
        });
    }

    setProfile(id_student, id_learningStyle){
        db.profile.create({
            id_student: id_student,
            learningStyle: id_learningStyle
        }).exec((err, res) => {
            if(err) throw err;
            return res;
        });
    }

    getError(id_trace){
        db.trace.findOne(id_trace).exec((err, res) => {
            if(err) throw err;
            return res.logs;
        });
    }

    setError(id_trace, logs){
        db.trace.findOneAndUpdate(id_trace, {  $set : {
            logs: logs
        } }, { new: true }).exec((err, res) => {
            if(err) throw err;
            return true;
        });
    }

    //call planner
    async getPlan(id_student, id_course, id_lesson, structure, resources){
        let selectedCase;
        let cbrService = new CbrService(this);
        let selectedPerformance = await cbrService.performance(id_student);

        //marcar los casos si son exitosos
        if(selectedPerformance.length > 0) {
            console.log("se encontro un caso del estudiante")
            selectedCase = await cbrService.recovery(selectedPerformance);
        } else {
            let coincident = await cbrService.coincident(id_student, id_lesson, structure);
            if(coincident.length > 0){
                console.log("se encontro un caso de otro estudiante con aprendizaje similar")
                selectedCase = await cbrService.recovery(coincident);
            } else {
                console.log("se creo el caso debido a que en el sistema no hay informacion de casos relacionados")
                selectedCase = await cbrService.create(id_student, id_course, id_lesson, structure, resources);
            }
        }
        if(selectedCase){
            let plan = await cbrService.adapt(selectedCase);
            
            return plan;
        }
    }

    async review(id_case, success, error){
        let cbrService = new CbrService(this);
        let reviewCase = await cbrService.reviewCase(id_case, success, error);
        return reviewCase;
    }

    async saveCase(id_student, id_course, id_lesson, structure, resources){

        let newCase = {};
        
        newCase.context = {
            id_student: id_student,
            id_course: id_course,
            id_lesson: id_lesson,
            structure: structure
        };

        newCase.solution = {
            id_student: id_student,
            resources: resources
        };

        newCase.euclideanWight = 0;
        newCase.results = {
            uses : 0,
            success : 0,
            errors : 0,
        };

        const caseUser = await db.case.create(newCase);
        return caseUser;

    }
}

module.exports = MetacorePackage;

