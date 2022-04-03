const db = require("../models");
const mongoose = require("mongoose");

exports.all = async (req, res) => {
    const students = await db.student.find({});
    res.send(students);
}

exports.one = async (req, res) => {

    const student = await db.student.findOne({ _id: new mongoose.Types.ObjectId(req.query.id) })
    .populate('learningStyleDimensions');

    if(!student){
        res.status(500).send({ message: "Student not found" });
    } else {
        res.send(student);
    }
}

exports.attempts = async (req, res) => {

    console.log(req.query);
    
    const attempts = await db.trace.countDocuments({ 
        student: new mongoose.Types.ObjectId(req.query.student), 
        course: new mongoose.Types.ObjectId(req.query.course), 
        lesson: new mongoose.Types.ObjectId(req.query.lesson)
    });

    console.log(attempts);

    res.status(200).send({ count: attempts });
}

exports.course = async (req, res) => {
    const students = await db.student.find({ course: new mongoose.Types.ObjectId(req.query.course) })
    res.send(students);
} 

exports.create = (req, res) => {
    const student = new db.student({
        performance: req.body.performance,
        learningStyle: req.body.learningStyle,
    });

    student.save((err, student) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if(req.body.course){
            db.student.findAndUpdate({ id: student._id }, { $push: { course: req.body.course } })
            .exec( (err, student) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                res.send({ message: "Student created successful" });
            })
        }

        res.send({ message: "Student created successful" });
    });
}

exports.update = (req, res) => {
    db.student.findAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, student) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Student update successful" });
    });
}

exports.delete = (req, res) => {
    db.student.findAndDelete({ id: req.body.id })
    .exec( (err, student) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Student deleted successful "});
    })
}