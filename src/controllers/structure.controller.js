const db = require("../models");
const mongoose = require('mongoose');

exports.all = async (req, res) => {
    const structures = await db.structure.find({});
    res.send(structures);
}

exports.one = async (req, res) => {
    const structure = await db.structure.findOne({ _id: req.query.id });
    if(!structure){
        res.status(500).send({ message: "Course not found" });
    } else {
        res.send(structure);
    }
}

exports.lesson = async (req, res) => {
    const structure = await db.structure.find({ lesson: mongoose.Types.ObjectId(req.params.id) });
    if(!structure){
        res.status(500).send({ message: "Structure not found" });
    } else {
        res.send(structure);
    }

}

exports.create = (req, res) => {
    const structure = db.structure.create({
        name: req.body.name,
        description: req.body.description,
        hasObjetiveCouse: req.body.hasObjetiveCouse
    });

    course.save((err, course) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send({ message: "Course created successful" });
    });
}


exports.update = (req, res) => {
    db.structure.findOneAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, course) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Structure update successful" });
    });
}

exports.delete = (req, res) => {
    db.structure.findOneAndDelete({ id: req.body.id })
    .exec( (err, course) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Structure deleted successful "});
    })
}



