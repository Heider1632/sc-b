const db = require("../models");
const mongoose = require("mongoose");

exports.all = (req, res) => {
    const lessons = db.lesson.find({});
    res.send(lessons);
}

exports.one = async (req, res) => {

    const lesson = await db.lesson.findOne({ _id : new mongoose.Types.ObjectId(req.query.id) }).populate('structure', '_id type', null, { sort: { 'order': 1 }}).sort('order');

    if(!lesson){
        res.status(500).send({ message: "Lesson not found" });
    } else {
        res.status(200).send(lesson);
    }

}

exports.course = async (req, res) => {

    const lessons = await db.lesson.find({ course : new mongoose.Types.ObjectId(req.query.id) }).populate('structure').sort('order');

    if(!lessons){
        res.status(500).send({ message: "Lessons not found" });
    } else {
        res.status(200).send(lessons);
    }

}

exports.create = (req, res) => {
    const lesson = new db.lesson({
        cod: str_random(20),
        type: req.body.type,
        stucture: req.body.structure
    });

    lesson.save((err, lesson) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        db.course.findOneAndUpdate({ id: req.body.course }, { $push: { lesson: lesson._id } })
        .exec( (err, course) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            res.send({ message: "Lesson created successful" });
        })
    });
}

exports.update = (req, res) => {
    db.lesson.findOneAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, lesson) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Lesson update successful" });
    });
}

exports.delete = (req, res) => {
    db.lesson.findAndDelete({ id: req.body.id })
    .exec( (err, lesson) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Lesson deleted successful "});
    })
}