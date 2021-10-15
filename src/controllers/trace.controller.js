const db = require("../models");
const mongoose = require("mongoose");

exports.all = (req, res) => {
    const traces = db.trace.find({});
    res.send(traces);
}

exports.one = async (req, res) => {

    const trace = await db.trace.findOne({ _id : new mongoose.Types.ObjectId(req.query.id) });

    if(!trace){
        res.status(500).send({ message: "trace not found" });
    }

    res.status(200).send(trace);
} 

exports.create = (req, res) => {
    const trace = new db.trace({
        student: req.body.student,
        course: req.body.student,
        lesson: req.body.lesson,
        assessments: req.body.assessments,
        logs: req.body.logs
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
    
    db.trace.findByIdAndUpdate(new mongoose.Types.ObjectId(req.body.id), { $set: { "assessments" : req.body.assessments, "logs" : req.body.logs }})
    .exec((err, trace) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Trace update successful" });
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