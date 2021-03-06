const db = require("../models");
const mongoose = require("mongoose");

exports.all = (req, res) => {
    const traces = db.trace.find({ complete: false });
    res.send(traces);
}

exports.one = async (req, res) => {

    const trace = await db.trace.findOne({ _id : new mongoose.Types.ObjectId(req.query.id) });

    if(!trace){
        res.status(500).send({ message: "trace not found" });
    }

    res.status(200).send(trace);
}

exports.total = async (req, res) => {
    const traces = await db.trace.find({ student: new mongoose.Types.ObjectId(req.query.student) });

    var sum = 0;

    if(traces.length > 0){
        for(var i = 0; i < traces.length; i++){
            for(var j = 0; j < traces[i].resources.length; j++){
                if(traces[i].assessments[j] && traces[i].assessments[j].time_use){
                    sum += traces[i].assessments[j].time_use;
                }
            }
        }
    }

    res.status(200).send({ total: sum });
}

exports.create = (req, res) => {
    const trace = new db.trace({
        student: req.body.student,
        course: req.body.course,
        lesson: req.body.lesson,
        resources: req.body.resources,
        assessments: req.body.assessments,
        logs: req.body.logs,
        case: req.body.case,
        index: req.body.index
    });

    trace.save((err, trace) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send(trace);
    });
}

exports.update = (req, res) => {
    
    db.trace.findByIdAndUpdate(new mongoose.Types.ObjectId(req.body.id), { $set: { "resources" : req.body.resources, "assessments" : req.body.assessments, "logs" : req.body.logs, "confirm": req.body.confirm, "index" : req.body.index, "case": req.body.case }}, { new: true })
    .exec((err, trace) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        console.log(trace);

        res.status(200).send(trace);
    });
}

exports.updateConfirm = (req, res) => {
    
    db.trace.findByIdAndUpdate(new mongoose.Types.ObjectId(req.body.id), { $set: { confirm: req.body.confirm }}, { new: true })
    .exec((err, trace) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        console.log(trace);

        res.status(200).send(trace);
    });
}

exports.updateEvaluation = (req, res) => {
    
    db.trace.findByIdAndUpdate(new mongoose.Types.ObjectId(req.body.id), { $set: { evaluation: req.body.evaluation }}, { new: true })
    .exec((err, trace) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        console.log(trace);
        
        res.status(200).send(trace);
    });
}

exports.updateFeedback = (req, res) => {
    
    db.trace.findByIdAndUpdate(new mongoose.Types.ObjectId(req.body.id), { $set: { feedback: req.body.feedback }}, { new: true })
    .exec((err, trace) => {
        if(err){
            res.status(500).send({ messsage: err });
        }
        res.status(200).send(trace);
    });
}

exports.updateComplete = (req, res) => {
    
    db.trace.findByIdAndUpdate(new mongoose.Types.ObjectId(req.body.id), { $set: { complete: req.body.complete }}, { new: true })
    .exec((err, trace) => {
        if(err){
            res.status(500).send({ messsage: err });
        }
        res.status(200).send(trace);
    });
}



exports.delete = (req, res) => {
    db.trace.findAndDelete({ id: req.body.id })
    .exec( (err, lesson) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Trace deleted successful "});
    })
}