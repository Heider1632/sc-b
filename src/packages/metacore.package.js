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

    //call cbr
    async getPlan(id_student, id_course, id_lesson, structure, resources){
        //conditional to active cbr (if)
        //else false
        let selectedCase;
        let cbrService = new CbrService(this);
        let selectedPerformance = await cbrService.performance(id_student);
        if(selectedPerformance.length > 0) {
            console.log("performance")
            selectedCase = await cbrService.recovery(selectedPerformance);
        } else {
            let coincident = await cbrService.coincident(id_student, id_lesson, structure);
            if(coincident.length > 0){
                console.log("coincident")
                selectedCase = await cbrService.recovery(coincident);
            } else {
                console.log("create")
                selectedCase = await cbrService.create(id_student, id_course, id_lesson, structure, resources)
            }
        }
        if(selectedCase){
            let plan = await cbrService.adapt(selectedCase);
            return plan;
        }
    }
}

module.exports = MetacorePackage;

