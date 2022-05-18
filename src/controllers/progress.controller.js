const db = require("../models");
const mongoose = require("mongoose");

exports.one = async (req, res) => {

    const progress = await db.progress.findOne({
        student: new mongoose.Types.ObjectId(req.query.student),
        course: new mongoose.Types.ObjectId(req.query.course),
        lesson: new mongoose.Types.ObjectId(req.query.lesson)
    });

    if(!progress){
        res.status(404).send({ message: "Progress not found" });
    } else {
        res.status(200).send(progress);
    }

} 

exports.all = async (req, res) => {
    const progress = await db.progress.find({
        student: new mongoose.Types.ObjectId(req.query.student),
        course: new mongoose.Types.ObjectId(req.query.course),
    });

    if(!progress){
        res.status(404).send({ message: "Progress not found" });
    } else {
        res.status(200).send(progress);
    }
}

exports.status = async (req, res) => {

    const progress = await db.progress.find({
        student: new mongoose.Types.ObjectId(req.query.student),
    }).populate("lesson");

    if(!progress){
        res.status(404).send({ message: "Progress not found" });
    } else {
        res.status(200).send(progress);
    }
}


exports.create = (req, res) => {
    const progress = new db.progress({
        student: req.body.student,
        course: req.body.course,
        lesson: req.body.lesson,
        isActive: req.body.isActive,
        complete: req.body.complete
    });

    progress.save((err, progress) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send(progress);
    });
}

exports.update = (req, res) => {
    db.progress.findOneAndUpdate({ lesson: req.body.id }, { $set: { ...req.body }})
    .exec((err, lesson) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Progress update successful" });
    });
}

exports.delete = (req, res) => {
    db.progress.findAndDelete({ id: req.body.id })
    .exec( (err, lesson) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Progress deleted successful "});
    })
}