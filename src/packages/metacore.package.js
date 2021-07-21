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
        db.trace.find({ id_ustuden: id_student, id_course: id_course }).exec( (res, data ) => {
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
        db.trace.findOneAndUpdate(_id, {  $set : {
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

    setSession(id_student, date, online){
        db.session.create({
            id_student: id_student,
            last_login: date,
            online: online
        }).exec((err,res) => {
            if(err) throw err;
            return true;
        })
    }

    updateSession(_id, online){
        db.session.findOneAndUpdate(_id, { $set: {
            online: online
        }}).exec((err,res) => {
            if(err) throw err;
            return true;
        })
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
    async getPlan(id_student, id_course, lessons){

        let cbrService = new CbrService(this);
        
        cbrService.performance(id_student, id_course, lessons);

        console.log("here start");
        //conditional to active cbr (if)
        //else false
    }
}

module.exports = MetacorePackage;

