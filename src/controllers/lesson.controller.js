const db = require("../models");

const Lesson = db.Lesson;
const Course = db.Course;

exports.all = (req, res) => {
    const lessons = Lesson.findAll();
    res.send({ lessons });
}

exports.one = (req, res) => {
    const lesson = Lesson.findOne(req.query.id);

    if(!lesson){
        res.status(500).send({ message: "Lesson not found" });
    }

    res.send({ lesson })
} 

exports.create = (req, res) => {
    const lesson = new Lesson({
        cod: str_random(20),
        type: req.body.type,
        resource: req.body.resource
    });

    lesson.save((err, lesson) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        Course.findAndUpdate({ id: req.body.course }, { $push: { lesson: lesson._id } })
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
    Lesson.findAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, lesson) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Lesson update successful" });
    });
}

exports.delete = (req, res) => {
    Lesson.findAndDelete({ id: req.body.id })
    .exec( (err, lesson) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Lesson deleted successful "});
    })
}