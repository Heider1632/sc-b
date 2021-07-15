const db = require("../models");

//every time the user has a success login the metacore package is called
class MetacorePackage  {

    constructor(){
        this.cbr = crb;
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

    update(_id, lessonAssements, logs){
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
    getPlan(id_student, id_course){
        //conditional to active cbr (if)
        //else false
    }
}

exports.module = MetacorePackage(crb);
