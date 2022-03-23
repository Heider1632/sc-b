const db = require("../models");
const mongoose = require('mongoose');

exports.all = async (req, res) => {
    const interviews = await db.interview.find();
    res.send(assessments);
}

exports.one = async (req, res) => {

    const assessment = await db.interview.findOne({ lesson: req.query.lesson }).populate('questions');

    if(!assessment){
        res.status(500).send({ message: "Assessment not found" });
    } else {
        res.send(assessment);
    }
}

exports.create = (req, res) => {
    const interview = new db.assessment({
        title: req.body.title,
        questions: req.body.questions,
        feedbacks: req.body.feedbacks
    });

    interview.save((err, course) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        res.send({ message: "Assessment created successful" });
    });
}


exports.update = (req, res) => {
    db.interview.findOneAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, course) => {
        if(err){
            res.status(500).send({ messsage: err });
        }
        res.send({ message: "Assessment update successful" });
    });
}

exports.delete = (req, res) => {
    db.interview.findOneAndDelete({ id: req.body.id })
    .exec( (err, course) => {
        if(err){
            res.status(500).send({ message: err });
        }
        res.send({ message: "Course deleted successful "});
    })
}



