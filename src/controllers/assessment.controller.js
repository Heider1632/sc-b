const db = require("../models");
const mongoose = require('mongoose');
const _ = require("lodash");

exports.all = async (req, res) => {
    const interviews = await db.interview.find();
    res.send(assessments);
}

exports.student = async (req, res) => {
    const assessments = await db.trace.find({
        student: new mongoose.Types.ObjectId(req.query.student),
        course: new mongoose.Types.ObjectId(req.query.course),
        lesson: new mongoose.Types.ObjectId(req.query.lesson),
    });

    if(!assessments){
        res.status(404).send({ message: "Assessment not found" });
    } else {
        res.send(assessments);
    }
}

function checkNotRepeat(questions, current) {
    let isValid = questions.indexOf(current);
    return isValid !== -1;
}

exports.one = async (req, res) => {

    var assessment = await db.interview.findOne({ lesson: req.query.lesson }).populate('questions')
    assessment.questions = _.shuffle(assessment.questions);

    assessment.questions = assessment.questions.filter((q, index) => {
        if(index < 5){
            return q;
        }
    })
    
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



