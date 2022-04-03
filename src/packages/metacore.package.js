const db = require("../models");
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

    async validate(id_student, id_course, id_lesson){
        let cbrService = new CbrService(this);
        return await cbrService.validate(id_student, id_course, id_lesson);
    }

    async getCase(id){
        let cbrService = new CbrService(this);

        let caseSelected = await db.case.findOne(id);
        
        if(caseSelected){
            let plan = await cbrService.adapt(caseSelected);
            return plan;
        }
    }

    //call planner
    async getPlan(id_student, id_course, id_lesson, structure, resources, c){
        let selectedCase;
        let cbrService = new CbrService(this);

        let coincident = await cbrService.coincident(id_student, id_course, id_lesson, structure);

        if(c != null){
            selectedCase = c;
        } else if(coincident.length > 0){
            selectedCase = await cbrService.recovery(coincident);
        } else {
            selectedCase = await cbrService.create(id_student, id_course, id_lesson, structure, resources);
        }

        if(selectedCase){
            let plan = await cbrService.adapt(selectedCase);
            return plan;
        }
    }

    async review(id_case, success, error, time){
        let cbrService = new CbrService(this);
        let reviewCase = await cbrService.reviewCase(id_case, success, error, time);
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

        newCase.euclideanWeight = 0;
        newCase.results = {
            uses : 0,
            success : 0,
            errors : 0,
        };

        const caseUser = await db.case.create(newCase);
        return caseUser;

    }

    async updateCase(id_case, resources){

        const caseUser = await db.case.findByIdAndUpdate(id_case, {
            $set: { "solution.resources" : resources }
        });
        
        return caseUser;
    }

    async history(c, student, was, note){
        return await db.historyCase.create({
            student: student,
            case: c,
            was: was,
            note: note
        });
    }

}

module.exports = MetacorePackage;

