const db = require("../models");
const mongoose = require("mongoose");

exports.one = async (req, res) => {

    const history = await db.historyLesson.findOne({
        student: new mongoose.Types.ObjectId(req.query.student),
        course: new mongoose.Types.ObjectId(req.query.course),
        lesson: new mongoose.Types.ObjectId(req.query.lesson),
        structure: new mongoose.Types.ObjectId(req.query.structure),
    });

    if(!history){
        res.status(404).send({ message: "History not found" });
    } else {
        res.status(200).send(history);
    }

}

exports.all = async (req, res) => {

    const histories = await db.historyLesson.find({
        student: new mongoose.Types.ObjectId(req.query.student),
        course: new mongoose.Types.ObjectId(req.query.course),
        lesson: new mongoose.Types.ObjectId(req.query.lesson),
    });

    if(!histories){
        res.status(404).send({ message: "History not found" });
    } else {
        res.status(200).send(histories);
    }
}

exports.create = (req, res) => {
    const history = new db.historyLesson({
        student: req.body.student,
        course: req.body.course,
        lesson: req.body.lesson,
        structure: req.body.structure,
        isBlock: req.body.isBlock,
        index: req.body.index
    });

    history.save((err, history) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send(history);
    });
}

exports.update = (req, res) => {

    db.historyLesson.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.body.id) }, { $set: { "isBlock": req.body.isBlock }})
    .exec((err, history) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send(history);
    });
}

exports.delete = (req, res) => {
    db.historyLesson.findAndDelete({ _id: new mongoose.Types.ObjectId(req.body.id) })
    .exec( (err, _) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "History deleted successful "});
    })
}